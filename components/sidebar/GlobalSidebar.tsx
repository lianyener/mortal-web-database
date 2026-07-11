/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { useQueryStates, parseAsString } from 'nuqs';
import { ExternalLink, X } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useSidebarStore } from '@/store/useSidebarStore';
import { useItemDetail } from '@/hooks/queries/useItemDetail';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import { ParsedText } from '@/components/shared/ParsedText';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

export function GlobalSidebar() {
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  // 設定URL Query參數
  const [query, setQuery] = useQueryStates(
    { sidebar: parseAsString, sidebarId: parseAsString },
    {
      // 讓使用者「上一頁」是影響側邊欄
      history: 'push'
    }
  );

  // Zustand Store狀態
  const { isOpen, category, id, openSidebar, closeSidebar } = useSidebarStore();

  // 透過useItemDetail取得資料
  const { data, isLoading, isError } = useItemDetail(category, id);

  // 共通i18n解析邏輯
  const { translateTerm, translateTermWithParam } = useAppTranslation();

  // URL->Zustand (處理初始載入與瀏覽器上一頁/下一頁)
  useEffect(() => {
    // 確保在Client端完整掛載後才執行同步
    if (!mounted) return;

    // 判斷複寫或關閉側邊欄
    if (query.sidebar && query.sidebarId) {
      if (query.sidebar !== category || query.sidebarId !== id || !isOpen) {
        openSidebar(query.sidebar, query.sidebarId);
      }
    } else if (isOpen) {
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
        className='w-full sm:max-w-md md:max-w-lg lg:max-w-xl bg-muted p-0 gap-0 flex flex-col [&>button]:hidden shadow-2xl'
        // 在桌面版 (>= 768px) 防止點擊外部關閉，允許無縫更新
        // 在手機版 (< 768px) 恢復預設行為，點擊外部區域時自動關閉側邊欄
        onInteractOutside={(e) => {
          if (typeof window !== 'undefined' && window.innerWidth >= 768) {
            e.preventDefault();
          }
        }}
      >
        {/* 固定在頂部的 Header 區塊 */}
        <div className='shrink-0 sticky top-0 z-50 bg-muted/95 backdrop-blur-sm border-b border-border/50 px-5 sm:px-6 py-4 flex items-start justify-between gap-4 shadow-sm'>
          <SheetHeader className='text-left space-y-1 p-0'>
            <SheetTitle className='text-xl font-bold'>{translateTermWithParam('Web.ItemInfo', String(category))}</SheetTitle>
            <SheetDescription className='text-sm'>
              {category}: {id}
            </SheetDescription>
          </SheetHeader>

          {/* 右上角操作按鈕群組 */}
          <div className='flex items-center gap-2 shrink-0'>
            {category &&
              id &&
              [
                'mission',
                'trigger',
                'position',
                'script',
                'combat',
                'battle',
                'flag',
                'character',
                'book',
                'equip',
                'special',
                'misc',
                'free',
                'talent',
                'effect',
                'groupstat',
                'time',
                'achievement',
                'end',
                'dead'
              ].includes(String(category).toLowerCase()) && (
                <Button asChild variant='outline' size='sm' className='h-8 w-8 shadow-sm text-muted-foreground hover:bg-muted transition-colors' title={translateTerm('Web.OpenInMainPage')}>
                  <Link href={`/${category.toLowerCase()}/${id}`}>
                    <ExternalLink className='size-3.5' />
                  </Link>
                </Button>
              )}
            <Button variant='outline' size='icon' className='h-8 w-8 shadow-sm text-muted-foreground hover:bg-muted transition-colors' onClick={closeSidebar} title={translateTerm('Web.Close')}>
              <X className='size-4' />
            </Button>
          </div>
        </div>

        {/* 內部滾動區塊 */}
        <div className='flex-1 overflow-y-auto p-5 sm:p-6'>
          {category && id ? (
            <div className='text-sm'>
              {isLoading && <p className='text-muted-foreground'>{translateTermWithParam('Web.Loading', category)}</p>}
              {isError && <p className='text-destructive'>{translateTermWithParam('Web.LoadError', category)}</p>}
              {data && <SidebarContent category={category} id={id} data={data} />}
            </div>
          ) : null}
        </div>
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
  const { translateTerm, translateTermWithParam } = useAppTranslation();
  const name = translateTermWithParam(`LabelName.${category}`, id);
  const categoryAlias: { [key: string]: string } = { Talent: 'PlayerTalent', Dead: 'Library', End: 'Library', Achievement: 'Library', Effect: 'CombatSkill' };
  const desc = translateTerm(`${categoryAlias[category] ?? category}.Desc.${id}`, undefined, 0) || translateTerm(`${categoryAlias[category] ?? category}.${id}.Desc`, undefined, 0);

  return (
    <div className='flex flex-col gap-5'>
      {/* 基本資訊區塊 */}
      <div className='space-y-3 bg-background p-4 rounded-lg border shadow-sm'>
        <div>
          <div className='text-xs text-muted-foreground mb-1'>{translateTerm('Web.Id')}</div>
          <div className='font-semibold text-lg'>{id}</div>
        </div>
        {name && (
          <div>
            <div className='text-xs text-muted-foreground mb-1'>{translateTerm('Web.Name')}</div>
            <div className='font-semibold text-lg'>{name}</div>
          </div>
        )}
        {desc && (
          <div>
            <div className='text-xs text-muted-foreground mb-1'>{translateTerm('Web.Desc')}</div>
            <div className='text-sm leading-relaxed'>{desc}</div>
          </div>
        )}
      </div>

      {/* 關聯區塊 */}
      <SidebarRelation data={data} />
    </div>
  );
}

// Flag 專用面板
function FlagInfo({ id, data }: any) {
  const { translateTerm, translateParagraph, translateTermWithParam } = useAppTranslation();

  // 判斷類別(Combat/Battle/Script)取得Script標籤
  const getScriptLabel = (s: string) => {
    if (s.startsWith('CL_')) return `[*Label.Combat,${s}*]`;
    if (s.startsWith('BL_')) return `[*Label.Battle,${s}*]`;
    return `[*Label.Script,${s}*]`;
  };

  return (
    <div className='flex flex-col gap-6'>
      {/* 基本資訊區塊(增加預設值) */}
      <div className='space-y-3 bg-background p-4 rounded-lg border shadow-sm'>
        <div>
          <div className='text-xs text-muted-foreground mb-1'>{translateTerm('Web.Id')}</div>
          <div className='font-semibold text-lg'>{id}</div>
        </div>
        <div>
          <div className='text-xs text-muted-foreground mb-1'>{translateTerm('Web.Init')}</div>
          <div className='text-sm leading-relaxed'>{data.init}</div>
        </div>
      </div>

      {/* Flag專用資訊 */}
      {data.data && Array.isArray(data.data) && (
        <div className='space-y-3'>
          {/* 標題 */}
          <h4 className='font-bold text-base border-b pb-2 mb-3'>{translateTermWithParam('Web.Content', 'Flag')}</h4>

          {/* 卡片 */}
          <div className='flex flex-col gap-3'>
            {data.data.map((item: any, index: number) => {
              const subName = translateTerm(`Flag.${id}.${index}`);
              const subDesc = translateTerm(`Flag.${id}.${index}.Desc`);

              return (
                <div key={index} className='p-4 bg-background rounded-xl border shadow-sm hover:border-primary/40 transition-colors'>
                  {/* 對應場景 */}
                  <div className='pb-3 mb-3 border-b border-border/50'>
                    <div className='mb-1.5 text-xs text-muted-foreground'>{translateTerm('Web.Scenario')}</div>
                    {item.script && Array.isArray(item.script) && item.script.length > 0 ? (
                      <div className='flex flex-wrap -ml-1 gap-1'>
                        {item.script.map((s: string) => (
                          <ParsedText key={s} text={getScriptLabel(s)} />
                        ))}
                      </div>
                    ) : (
                      <div className='font-semibold'>{translateTerm('Web.DefaultScenario')}</div>
                    )}
                  </div>

                  {/* 名稱及說明 */}
                  <div className='pb-3 mb-3 border-b border-border/50'>
                    <div className='mb-1.5 text-xs text-muted-foreground'>{translateTermWithParam('Web.Info', 'Flag')}</div>
                    <div className='font-semibold text-base text-foreground'>{subName}</div>
                    {subDesc && <div className='mt-1 text-sm/relaxed text-foreground/70'>{subDesc}</div>}
                  </div>

                  {/* 設定數值區塊 */}
                  <div>
                    <div className='mb-1.5 text-xs text-muted-foreground'>{translateTerm('Web.ValueDef')}</div>
                    {item.value && Object.keys(item.value).length > 0 ? (
                      <div className='font-mixed'>
                        {Object.entries(item.value).map(([valKey, valText]: [string, any]) => (
                          <div key={valKey} className='flex my-0.5 gap-2'>
                            <span className='w-8 px-1.5 py-0.5 text-secondary-foreground text-center bg-secondary rounded border shrink-0'>{valKey}</span>
                            <div className='flex-1 my-0.5 py-0.5'>{translateParagraph(String(valText))}</div>
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
      <SidebarRelation data={data} />
    </div>
  );
}

// 關聯區塊
function SidebarRelation({ data }: { data: any }) {
  const { translateTerm } = useAppTranslation();

  if (!data.rel) return null;

  return (
    <div className='space-y-3'>
      <h4 className='font-bold text-base border-b pb-2 mb-3'>{translateTerm('Web.Relations')}</h4>
      {Object.entries(data.rel).map(([phase, types]) => (
        <DataRelation key={phase} phase={phase} types={types} />
      ))}
    </div>
  );
}

// 關聯項目元件
function DataRelation({ phase, types }: { phase: string; types: any }) {
  const { translateTerm } = useAppTranslation();

  // 檢查是否有內容
  if (!types || Object.keys(types).length === 0) return null;
  if (!Object.values(types).some((ids: any) => Array.isArray(ids) && ids.length > 0)) return null;

  return (
    <div className='bg-background border rounded-lg p-3 shadow-sm'>
      <div className='font-semibold text-primary text-base mb-3 border-b pb-1.5'>{translateTerm(`Web.Rel.${phase}`)}</div>
      <div className='flex flex-col gap-3'>
        {/* 關聯項目類別 */}
        {Object.entries(types).map(([type, ids]: [string, any]) => {
          if (!Array.isArray(ids) || ids.length === 0) return null;

          return (
            <div key={type} className='flex flex-col sm:flex-row gap-1 sm:gap-3 border-b border-border/40 pb-2 last:border-0 last:pb-0 whitespace-nowrap'>
              <span className='font-semibold text-muted-foreground w-18 shrink-0'>{translateTerm(`Web.Label.${type}`)}</span>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1.5 flex-1'>
                {ids.map((id: string) => (
                  <div key={id} className='flex items-start overflow-hidden'>
                    {/* 關聯項目，強制覆寫內部按鈕樣式 */}
                    <div className='flex-1 min-w-0 **:[[role=button]]:block **:[[role=button]]:w-full **:[[role=button]]:text-left **:[[role=button]]:truncate'>
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
