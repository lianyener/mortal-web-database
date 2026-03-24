/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { useQueryStates, parseAsString } from 'nuqs';
import { useSidebarStore } from '@/store/useSidebarStore';
import { useItemDetail } from '@/hooks/queries/useItemDetail';
import { useTranslations } from 'next-intl';
import { ParsedText } from '@/components/shared/ParsedText';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

// 定義 JSON 內部資料結構的簡單型別，替換掉 any
interface StateItem {
  script?: string[];
  [key: string]: unknown;
}

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

  // 4. 初始化 i18n 翻譯 Hook
  const t = useTranslations();

  // 5. 處理物件自動降級到 ._ 的 Helper Function，並支援傳入參數
  const getTranslation = (baseKey: string, params?: Record<string, string>): string => {
    // 如果有 baseKey._ (例如 Flag.A00001.1._)，優先回傳
    if (t.has(`${baseKey}._`)) return t(`${baseKey}._` as any, params) as string;
    // 否則回傳 baseKey 本身
    if (t.has(baseKey as any)) return t(baseKey as any, params) as string;
    return baseKey; // 找不到翻譯時回傳原本的 key
  };

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
        className="w-full sm:max-w-md md:max-w-lg overflow-y-auto"
        // 防止點擊側邊欄外部（主畫面連結）時觸發自動關閉，讓它可以無縫更新內容
        onInteractOutside={(e) => e.preventDefault()}
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
                  {/* 狀態列表 (針對 Flag 類別等擁有 data 陣列的結構) */}
                  {data.data && Array.isArray(data.data) && (
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center justify-between">
                        <span>狀態列表</span>
                        {data.init !== undefined && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                            預設狀態: {data.init}
                          </span>
                        )}
                      </h4>
                      <div className="flex flex-col gap-3">
                    {data.data.map((item: StateItem, index: number) => (
                          <div key={index} className="p-3 bg-background rounded-md border shadow-sm">
                            <div className="font-bold text-sm text-foreground flex items-center gap-2">
                              <span className="inline-block bg-muted text-muted-foreground px-1.5 py-0.5 rounded text-xs shrink-0">
                                State {index}
                              </span>
                              {/* 使用文字解析器來支援 [%...%] 與 [*...*] 標籤 */}
                              <div className="leading-relaxed">
                                <ParsedText text={getTranslation(`${category}.${id}.${index}`)} translate={getTranslation} />
                              </div>
                            </div>
                            <div className="text-sm text-muted-foreground mt-2 leading-relaxed">
                              {/* Desc 也是一樣，放入 ParsedText 進行遞迴解析 */}
                              <ParsedText text={getTranslation(`${category}.${id}.${index}.Desc`)} translate={getTranslation} />
                            </div>
                            {item.script && item.script.length > 0 && (
                              <div className="mt-3 text-xs">
                                <span className="font-semibold text-foreground/80">修改此狀態的劇本：</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {item.script.map((s: string) => (
                                    <span key={s} className="bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded">
                                      {s}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 原始 JSON 備用顯示 */}
                  <details className="mt-4">
                    <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                      檢視原始 JSON 資料
                    </summary>
                    <pre className="whitespace-pre-wrap break-words font-mono text-xs mt-2 p-2 bg-muted rounded border">
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