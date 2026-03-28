/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { useQueryStates, parseAsString } from 'nuqs';
import { useSidebarStore } from '@/store/useSidebarStore';
import { useItemDetail } from '@/hooks/queries/useItemDetail';
import { ParsedText } from '@/components/shared/ParsedText';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

export function GlobalSidebar() {
  // 0. 避免 Hydration Mismatch 的掛載狀態
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // 1. 設定 URL Query 參數的讀寫與型別
  const [query, setQuery] = useQueryStates(
    {
      sidebar: parseAsString, // 對應 ?sidebar=...
      sidebarId: parseAsString, // 避免與主頁面的 id 衝突，改為 ?sidebarId=...
    },
    {
      // 使用 push 可以在網址列產生一筆新的歷史紀錄
      // 這樣使用者按瀏覽器的「上一頁」就會是關閉側邊欄，而不是跳離網站
      history: 'push',
    }
  );

  // 2. 取得 Zustand Store 狀態
  const { isOpen, category, id, openSidebar, closeSidebar } = useSidebarStore();
  
  // 3. 透過 React Query 抓取資料
  const { data, isLoading, isError } = useItemDetail(category, id);

  // 4. 統一使用共用的翻譯 Hook
  const { t, getTranslation } = useAppTranslation();

  // 3. Sync 1: URL -> Zustand (處理初始載入與瀏覽器上一頁/下一頁)
  useEffect(() => {
    if (!mounted) return; // 確保在 Client 端完整掛載後才執行同步

    if (query.sidebar && query.sidebarId) {
      // 若 URL 有參數，但 Zustand 狀態未開啟或不一致，則覆寫 Zustand
      if (query.sidebar !== category || query.sidebarId !== id || !isOpen) {
        openSidebar(query.sidebar, query.sidebarId);
      }
    } else if (isOpen) {
      // 若 URL 沒有參數但側邊欄開啟著，代表可能是按了上一頁，關閉側邊欄
      closeSidebar();
    }
    // 刻意不將 Zustand 狀態放入 dependencies，此 Effect 僅由 URL 變化驅動
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.sidebar, query.sidebarId, mounted]);

  // 4. Sync 2: Zustand -> URL (處理使用者點擊標籤觸發 Store 更新)
  useEffect(() => {
    if (!mounted) return;
    
    // 【修正】防止初始載入時，Zustand 的預設關閉狀態把 URL 參數洗掉
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
    // 此 Effect 僅由 Zustand 變化驅動
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, category, id, mounted]);

  // 5. 處理 Sheet 關閉事件 (例如點擊遮罩或 X 按鈕)
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      closeSidebar(); // 關閉 Store 會觸發 Sync 2，自動清空 URL 參數
    }
  };

  // 避免 Server-Side Rendering 時報錯 (Hydration Mismatch)
  if (!mounted) return null;

  // 加入 modal={false} 屬性，取消滾動條鎖定，防止關閉時跳回網頁頂端
  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange} modal={false}>
      <SheetContent 
        className="w-full sm:max-w-md md:max-w-lg lg:max-w-xl overflow-y-auto"
        // 在桌面版 (>= 768px) 防止點擊外部關閉，允許無縫更新
        // 在手機版 (< 768px) 恢復預設行為，點擊外部區域時自動關閉側邊欄
        onInteractOutside={(e) => {
          if (typeof window !== 'undefined' && window.innerWidth >= 768) {
            e.preventDefault();
          }
        }}
      >
        <SheetHeader>
          <SheetTitle className="text-xl font-bold">
            {category} 資訊
          </SheetTitle>
          <SheetDescription>
            內部 ID: {id}
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6">
          {category && id ? (
            <div className="p-4 bg-muted/50 rounded-md border text-sm">
              {isLoading && <p className="text-muted-foreground">載入中...</p>}
              {isError && <p className="text-destructive">無法載入資料，請確認 /data/{category.toLowerCase()}/{id}.json 是否存在。</p>}
              {data && (
                <div className="space-y-6">
                  {/* 根據 Category 決定如何渲染內容 */}
                  <SidebarContentRenderer 
                    category={category} 
                    id={id} 
                    data={data} 
                    getTranslation={getTranslation} 
                    t={t} 
                  />

                  {/* 原始 JSON 備用顯示 */}
                  <details className="mt-4">
                    <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                      檢視原始 JSON 資料
                    </summary>
                    <pre className="whitespace-pre-wrap wrap-break-word font-mono text-xs mt-2 p-2 bg-muted rounded border">
                      {JSON.stringify(data, null, 2)}
                    </pre>
                  </details>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ==========================================
// 以下為側邊欄的各種「渲染策略 (Renderers)」
// ==========================================

function SidebarContentRenderer({ category, id, data, getTranslation, t }: any) {
  // 彈性尋找合適的標題 (處理有些叫 Name, 有些叫 Title 的狀況)
  const getFlexibleText = (suffixes: string[]) => {
    for (const suffix of suffixes) {
      const key = `${category}.${suffix}.${id}`;
      if (t.has(key as any) || t.has(`${key}._` as any)) {
        return getTranslation(key);
      }
    }
    return null;
  };

  const name = getFlexibleText(['Name', 'name', 'Title', 'title']);
  const desc = getFlexibleText(['Desc', 'desc', 'Description', 'description']);

  // 這裡使用 switch 來實作未來可無限擴充的各類別面板
  switch (category) {
    case 'Flag':
      return <FlagRenderer category={category} id={id} data={data} getTranslation={getTranslation} name={name} desc={desc} />;
    // 未來可以繼續新增 case 'Character':, case 'Item': 等等...
    default:
      // 如果沒有特別指定，就套用通用的渲染器
      return <DefaultRenderer category={category} id={id} data={data} getTranslation={getTranslation} name={name} desc={desc} />;
  }
}

// 通用型面板 (Default Renderer)
function DefaultRenderer({ data, getTranslation, name, desc }: any) {
  return (
    <div className="flex flex-col gap-5">
      {/* 1. 基本資訊區塊 */}
      {(name || desc) && (
        <div className="space-y-3 bg-card p-4 rounded-lg border shadow-sm">
          {name && (
            <div>
              <div className="text-xs text-muted-foreground mb-1">名稱</div>
              <div className="font-bold text-lg"><ParsedText text={name} translate={getTranslation} /></div>
            </div>
          )}
          {desc && (
            <div>
              <div className="text-xs text-muted-foreground mb-1">描述</div>
              <div className="text-sm leading-relaxed"><ParsedText text={desc} translate={getTranslation} /></div>
            </div>
          )}
        </div>
      )}

      {/* 2. 關聯區塊 (如果有 rel 或 backRel) */}
      <SidebarRelations data={data} getTranslation={getTranslation} />
    </div>
  );
}

// Flag 專用面板 (Flag Renderer)
function FlagRenderer({ category, id, data, getTranslation, name, desc }: any) {
  // 自動判斷 Script 陣列內的 ID 應該屬於哪個類別 (Combat / Battle / Script)
  const determineScriptLabel = (s: string) => {
    if (s.startsWith('CL_')) return `[*Label.Combat,${s}*]`;
    if (s.startsWith('BL_')) return `[*Label.Battle,${s}*]`;
    return `[*Label.Script,${s}*]`;
  };

  return (
    <div className="flex flex-col gap-6">
      {/* 1. 基本資訊區塊 (Name, Desc) */}
      {(name || desc) && (
        <div className="space-y-3 bg-card p-4 rounded-lg border shadow-sm">
          {name && (
            <div>
              <div className="text-xs text-muted-foreground mb-1">名稱</div>
              <div className="font-bold text-lg"><ParsedText text={name} translate={getTranslation} /></div>
            </div>
          )}
          {desc && (
            <div>
              <div className="text-xs text-muted-foreground mb-1">描述</div>
              <div className="text-sm leading-relaxed"><ParsedText text={desc} translate={getTranslation} /></div>
            </div>
          )}
        </div>
      )}
      
      {/* 2. Flag 專屬的 Data 列表 (包含 init, values, scripts) */}
      {data.data && Array.isArray(data.data) && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h4 className="font-bold text-base">相關設定 (Data)</h4>
            {data.init !== undefined && (
              <span className="text-xs bg-primary/10 text-primary font-mono px-2 py-1 rounded">
                {/* 加上型別防呆，避免 json 中 init 填成陣列或物件而引發 React 崩潰 */}
                預設 init: {typeof data.init === 'object' ? JSON.stringify(data.init) : String(data.init)}
              </span>
            )}
          </div>
          
          <div className="flex flex-col gap-4">
            {data.data.map((item: any, index: number) => {
              const stateName = getTranslation(`${category}.${id}.${index}`);
              const stateDesc = getTranslation(`${category}.${id}.${index}.Desc`);
              const hasName = stateName !== `${category}.${id}.${index}`;
              const hasDesc = stateDesc !== `${category}.${id}.${index}.Desc`;

              return (
                <div key={index} className="p-4 bg-background rounded-xl border shadow-sm hover:border-primary/40 transition-colors">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="inline-block bg-muted text-muted-foreground px-2 py-0.5 rounded text-xs font-mono shrink-0">
                      Data {index}
                    </span>
                    {hasName && (
                      <div className="font-bold text-[15px] text-foreground flex-1">
                        <ParsedText text={stateName} translate={getTranslation} />
                      </div>
                    )}
                  </div>
                  
                  {hasDesc && (
                    <div className="text-[13px] text-muted-foreground leading-relaxed pl-2 border-l-2 border-primary/30 mb-4">
                      <ParsedText text={stateDesc} translate={getTranslation} />
                    </div>
                  )}

                  {/* 數值區塊 (Value) */}
                  {item.value && Object.keys(item.value).length > 0 && (
                    <div className="mb-4 space-y-1.5 bg-muted/20 p-2 rounded-lg border border-border/50">
                      <div className="text-xs font-semibold text-muted-foreground mb-1">對應數值 (Value)</div>
                      {Object.entries(item.value).map(([valKey, valContent]: [string, any]) => (
                        <div key={valKey} className="flex text-[13px] gap-2 items-start">
                          <span className="font-mono text-[11px] bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded shrink-0">{valKey}</span>
                          <div className="flex-1"><ParsedText text={String(valContent)} translate={getTranslation} /></div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {item.script && Array.isArray(item.script) && item.script.length > 0 && (
                    <div className="pt-3 border-t border-border/50 text-[13px]">
                      <div className="font-semibold text-muted-foreground mb-1.5">觸發/相關項目 (Script)</div>
                      <div className="flex flex-wrap gap-1.5">
                        {item.script.map((s: string) => (
                          <ParsedText key={s} text={determineScriptLabel(s)} translate={getTranslation} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. 關聯區塊 (rel, backRel) 放最下面 */}
      <SidebarRelations data={data} getTranslation={getTranslation} />
    </div>
  );
}

// 側邊欄專用的關聯區塊統整器
function SidebarRelations({ data, getTranslation }: { data: any, getTranslation: any }) {
  if (!data.rel && !data.backRel) return null;
  return (
    <div className="space-y-4">
      {data.rel && Object.entries(data.rel).map(([phase, types]) => (
        <SidebarRelationCard key={`rel-${phase}`} mainType="Rel" phase={phase} types={types} getTranslation={getTranslation} />
      ))}
      {data.backRel && Object.entries(data.backRel).map(([phase, types]) => (
        <SidebarRelationCard key={`backRel-${phase}`} mainType="BackRel" phase={phase} types={types} getTranslation={getTranslation} />
      ))}
    </div>
  );
}

// 側邊欄專用的單一階段關聯卡片
function SidebarRelationCard({ mainType, phase, types, getTranslation }: { mainType: string, phase: string, types: any, getTranslation: any }) {
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
                    {/* 同樣加入 [&_button]: 覆寫樣式 */}
                    <div className="flex-1 min-w-0 [&_button]:block [&_button]:w-full [&_button]:text-left [&_button]:truncate" title={id}>
                      <ParsedText text={`[*Label.${type},${id}*]`} translate={getTranslation} />
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