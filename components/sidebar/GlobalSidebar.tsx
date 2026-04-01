/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { useQueryStates, parseAsString } from 'nuqs';
import { useSidebarStore } from '@/store/useSidebarStore';
import { useItemDetail } from '@/hooks/queries/useItemDetail';
import { ParsedText } from '@/components/shared/ParsedText';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';

export function GlobalSidebar() {

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // 設定URL Query參數
  const [query, setQuery] = useQueryStates(
    {
      sidebar: parseAsString,
      sidebarId: parseAsString,
    },
    {
      // 讓使用者「上一頁」是影響側邊欄
      history: 'push',
    }
  );

  // Zustand Store狀態
  const { isOpen, category, id, openSidebar, closeSidebar } = useSidebarStore();

  // 透過useItemDetail取得資料
  const { data, isLoading, isError } = useItemDetail(category, id);

  // 共通i18n解析邏輯
  const { translateTerm } = useAppTranslation();

  // URL->Zustand (處理初始載入與瀏覽器上一頁/下一頁)
  useEffect(() => {

    // 確保在Client端完整掛載後才執行同步
    if (!mounted) return;

    // 判斷複寫或關閉側邊欄
    if (query.sidebar && query.sidebarId) {
      if (query.sidebar !== category || query.sidebarId !== id || !isOpen) {
        openSidebar(query.sidebar, query.sidebarId);
      }
    }
    else if (isOpen) {
      closeSidebar();
    }

    // 不將Zustand狀態放入，僅由URL變化驅動
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.sidebar, query.sidebarId, mounted]);

  // 同步Zustand->URL (處理使用者點擊標籤)
  useEffect(() => {

    // 確保在Client端完整掛載後才執行同步
    if (!mounted) return;

    // 防止初始載入時Zustand的預設關閉狀態把URL參數洗掉
    if (!isOpen && !category && !id) return;

    if (isOpen && category && id) {
      if (query.sidebar !== category || query.sidebarId !== id) {
        setQuery({ sidebar: category, sidebarId: id });
      }
    } else if (!isOpen) {
      if (query.sidebar || query.sidebarId) {
        setQuery({ sidebar: null, sidebarId: null });
      }
    }

    // 僅由Zustand變化驅動
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, category, id, mounted]);

  // 關閉側邊欄事件
  const handleOpenChange = (open: boolean) => {
    if (!open) closeSidebar();
  };

  // 避免 Server-Side Rendering 時報錯 (Hydration Mismatch)
  if (!mounted) return null;

  // 加入 modal={false} 屬性，取消滾動條鎖定，防止關閉時跳回網頁頂端
  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange} modal={false}>
      <SheetContent
        className="w-full sm:max-w-md md:max-w-lg lg:max-w-xl overflow-y-auto bg-muted/50"

        // 在桌面版 (>= 768px) 防止點擊外部關閉，允許無縫更新
        // 在手機版 (< 768px) 恢復預設行為，點擊外部區域時自動關閉側邊欄
        onInteractOutside={(e) => {
          if (typeof window !== 'undefined' && window.innerWidth >= 768) {
            e.preventDefault();
          }
        }}
      >
        <SheetHeader>
          <SheetTitle className="text-xl font-bold">{translateTerm('Web.RefrenceInfo')}</SheetTitle>
          <SheetDescription>{`${category}: ${id}`}</SheetDescription>
        </SheetHeader>

        {category && id ? (
          <div className="-mt-8 p-4 text-sm">
            {isLoading && <p className="text-muted-foreground">{translateTerm('Web.Loading', { 0: translateTerm(`Web.${category}`) })}</p>}
            {isError && <p className="text-destructive">{translateTerm('Web.LoadError', { 0: translateTerm(`Web.${category}`) })}</p>}
            {data && (
              <SidebarContent category={category} id={id} data={data} />
            )}
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

// 側邊欄內容
function SidebarContent({ category, id, data }: any) {

  // 是否採用特殊面板
  switch (category) {
    case 'Flag':
      return <FlagInfo id={id} data={data} />;
    default:
      return <DefaultInfo category={category} id={id} data={data} />;
  }
}

// 通用面板
function DefaultInfo({ category, id, data }: any) {
  const { translateTerm } = useAppTranslation();
  const name = translateTerm(`LabelName.${category}`, { 0: id });
  const desc = translateTerm(`${category}.Desc.${id}`, undefined, 0);

  return (
    <div className="flex flex-col gap-5">

      {/* 基本資訊區塊 */}
      <div className="space-y-3 bg-card p-4 rounded-lg border shadow-sm">
        <div>
          <div className="text-xs text-muted-foreground mb-1">{translateTerm('Web.Id')}</div>
          <div className="font-semibold text-lg">{id}</div>
        </div>
        {name && (
          <div>
            <div className="text-xs text-muted-foreground mb-1">{translateTerm('Web.Name')}</div>
            <div className="font-semibold text-lg">{name}</div>
          </div>
        )}
        {desc && (
          <div>
            <div className="text-xs text-muted-foreground mb-1">{translateTerm('Web.Desc')}</div>
            <div className="text-sm leading-relaxed">{desc}</div>
          </div>
        )}
      </div>

      {/* 關聯區塊 */}
      <SidebarRelations data={data} />
    </div>
  );
}

// Flag 專用面板
function FlagInfo({ id, data }: any) {
  const { translateTerm, translateParagraph } = useAppTranslation();

  // 判斷類別(Combat/Battle/Script)取得Script標籤
  const getScriptLabel = (s: string) => {
    if (s.startsWith('CL_')) return `[*Label.Combat,${s}*]`;
    if (s.startsWith('BL_')) return `[*Label.Battle,${s}*]`;
    return `[*Label.Script,${s}*]`;
  };

  return (
    <div className="flex flex-col gap-6">

      {/* 基本資訊區塊(增加預設值) */}
      <div className="space-y-3 bg-card p-4 rounded-lg border shadow-sm">
        <div>
          <div className="text-xs text-muted-foreground mb-1">{translateTerm('Web.Id')}</div>
          <div className="font-semibold text-lg">{id}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-1">{translateTerm('Web.Init')}</div>
          <div className="text-sm leading-relaxed">{data.init}</div>
        </div>
      </div>

      {/* Flag專用資訊 */}
      {data.data && Array.isArray(data.data) && (
        <div className="space-y-4">

          {/* 標題 */}
          <h4 className="font-bold text-base border-b pb-2 mb-3">{translateTerm('Web.FlagData')}</h4>

          {/* 卡片 */}
          <div className="flex flex-col gap-3">
            {data.data.map((item: any, index: number) => {
              const subName = translateTerm(`Flag.${id}.${index}`);
              const subDesc = translateTerm(`Flag.${id}.${index}.Desc`);

              return (
                <div key={index} className="p-4 bg-background rounded-xl border shadow-sm hover:border-primary/40 transition-colors">

                  {/* 對應場景 */}
                  <div className="pb-3 mb-3 border-b border-border/50">
                    <div className="mb-1.5 text-xs text-muted-foreground">{translateTerm('Web.Scenario')}</div>
                    {item.script && Array.isArray(item.script) && item.script.length > 0 ? (
                      <div className="flex flex-wrap -ml-1 gap-1">
                        {item.script.map((s: string) => (
                          <ParsedText key={s} text={getScriptLabel(s)} />
                        ))}
                      </div>
                    ) : (
                      <div className="font-semibold">{translateTerm('Web.DefaultScenario')}</div>
                    )}
                  </div>

                  {/* 名稱及說明 */}
                  <div className="pb-3 mb-3 border-b border-border/50">
                    <div className="mb-1.5 text-xs text-muted-foreground">{translateTerm('Web.FlagInfo')}</div>
                    <div className="font-semibold text-base text-foreground">{subName}</div>
                    {subDesc && (
                      <div className="mt-1 text-sm/relaxed text-foreground/70">{subDesc}</div>
                    )}
                  </div>

                  {/* 設定數值區塊 */}
                  <div>
                    <div className="mb-1.5 text-xs text-muted-foreground">{translateTerm('Web.ValueDef')}</div>
                    {item.value && Object.keys(item.value).length > 0 ? (
                      <div className="font-(family-name:--font-script)">
                        {Object.entries(item.value).map(([valKey, valText]: [string, any]) => (
                          <div key={valKey} className="flex my-0.5 gap-2">
                            <span className="w-8 px-1.5 py-0.5 text-secondary-foreground text-center bg-secondary rounded border shrink-0">{valKey}</span>
                            <div className="flex-1 my-0.5 py-0.5">{translateParagraph(String(valText))}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div>{translateTerm('Web.NoValueDef')}</div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 關聯區塊 */}
      <SidebarRelations data={data} />
    </div>
  );
}

// 側邊欄專用的關聯區塊統整器
function SidebarRelations({ data }: { data: any }) {
  if (!data.rel && !data.backRel) return null;
  return (
    <div className="space-y-4">
      {data.rel && Object.entries(data.rel).map(([phase, types]) => (
        <SidebarRelationCard key={`rel-${phase}`} mainType="Rel" phase={phase} types={types} />
      ))}
      {data.backRel && Object.entries(data.backRel).map(([phase, types]) => (
        <SidebarRelationCard key={`backRel-${phase}`} mainType="BackRel" phase={phase} types={types} />
      ))}
    </div>
  );
}

// 側邊欄專用的單一階段關聯卡片
function SidebarRelationCard({ mainType, phase, types }: { mainType: string, phase: string, types: any }) {
  const { getPlainText } = useAppTranslation();
  if (!types || Object.keys(types).length === 0) return null;
  const hasContent = Object.values(types).some((ids: any) => Array.isArray(ids) && ids.length > 0);
  if (!hasContent) return null;

  const phaseKey = phase.charAt(0).toUpperCase() + phase.slice(1);
  const titleKey = `Web.${mainType}.${phaseKey}`;
  const title = getPlainText(titleKey) !== titleKey ? getPlainText(titleKey) : `${mainType} - ${phaseKey}`;

  return (
    <div className="bg-card border rounded-lg p-3 shadow-sm text-sm">
      <div className="font-semibold text-primary mb-3 border-b pb-1.5">
        {title}
      </div>
      <div className="flex flex-col gap-2">
        {Object.entries(types).map(([type, ids]: [string, any]) => {
          if (!Array.isArray(ids) || ids.length === 0) return null;

          const typeLabel = getPlainText(`Web.${type}`) !== `Web.${type}` ? getPlainText(`Web.${type}`) : type;

          return (
            <div key={type} className="flex flex-col sm:flex-row gap-1 sm:gap-3 border-b border-border/40 pb-2 last:border-0 last:pb-0">
              <span className="font-semibold text-muted-foreground w-20 shrink-0 mt-0.5 sm:text-right">{typeLabel}</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1.5 flex-1">
                {ids.map((id: string) => (
                  <div key={id} className="flex items-start overflow-hidden">
                    {/* 同樣加入 [&_[role=button]]: 覆寫樣式 */}
                    <div className="flex-1 min-w-0 **:[[role=button]]:block **:[[role=button]]:w-full **:[[role=button]]:text-left **:[[role=button]]:truncate" title={id}>
                      <ParsedText text={`[*Label.${type},${id}*]`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}