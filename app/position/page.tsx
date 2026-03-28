/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useQueryStates, parseAsString } from 'nuqs';
import { useItemDetail } from '@/hooks/queries/useItemDetail';
import { ParsedText } from '@/components/shared/ParsedText';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import Link from 'next/link';
import { useSidebarStore } from '@/store/useSidebarStore';

function PositionContent() {
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  const [query, setQuery] = useQueryStates({
    id: parseAsString.withDefault('Alchemy_Work_001'),
  });

  // 改為依照網址中的 ID，精確抓取特定的 position 小檔案
  const { data, isLoading, isError } = useItemDetail('position', query.id);

  const { getTranslation } = useAppTranslation();

  // 相容兩種結構：如果檔案直接是地點物件就用 data，如果是包在大 JSON 裡就用 data[query.id]
  const targetPosition = data?.[query.id] || data;

  // 取得側邊欄開啟狀態，用來動態縮放主畫面寬度
  const isOpen = useSidebarStore(state => state.isOpen);

  if (!mounted) return null;

  return (
    <main className={`min-h-screen bg-background text-foreground pb-20 transition-[padding] duration-300 ease-in-out ${isOpen ? 'lg:pr-[512px]' : ''}`}>
      {/* 頂部固定導覽列 */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b px-6 py-4 mb-8 shadow-sm">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-xl font-bold text-primary">地點與行為 (Position)</h1>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-muted-foreground whitespace-nowrap">測試 ID:</label>
            <input
              type="text"
              value={query.id}
              onChange={(e) => setQuery({ id: e.target.value })}
              className="px-3 py-1.5 text-sm border rounded bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary w-full sm:w-48"
              placeholder="例如 Alchemy_Work_001"
            />
          </div>
        </div>
      </div>

      {/* 主要閱讀區塊 */}
      <div className="max-w-5xl mx-auto px-6 space-y-6">
        {isLoading && <div className="text-center text-muted-foreground py-10 tracking-widest animate-pulse">載入資料中...</div>}
        {isError && <div className="text-center text-destructive py-10 bg-destructive/10 rounded-md">無法載入資料。</div>}

        {targetPosition ? (
          <div className="flex flex-col gap-6">
            {/* 1. 基本資訊面板 */}
            <div className="p-5 border rounded-xl shadow-sm bg-card">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">時期 (period)</div>
                  <div className="font-semibold text-sm">
                    <ParsedText text={getTranslation(targetPosition.period)} translate={getTranslation} />
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">位置 (position)</div>
                  <div className="font-semibold text-sm">
                    <ParsedText text={getTranslation(targetPosition.position)} translate={getTranslation} />
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">行為 (action)</div>
                  <div className="font-semibold text-sm">
                    <ParsedText text={getTranslation(targetPosition.action)} translate={getTranslation} />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. 事件列表 */}
            {targetPosition.event && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold border-b border-border/50 pb-2">觸發事件列表</h2>
                {Object.entries(targetPosition.event).map(([eventId, eventData]: [string, any]) => (
                  <div key={eventId} className="border border-border/80 rounded-lg p-4 bg-background shadow-sm hover:border-primary/30 transition-colors">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                      <div className="font-bold text-primary flex items-center gap-2">
                        <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs font-mono">
                          {eventId}
                        </span>
                        <ParsedText text={getTranslation(eventData.name)} translate={getTranslation} />
                      </div>
                      {eventData.script && (
                        <Link
                          href={`/script?id=${eventData.script}`}
                          className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 px-2 py-1 rounded font-medium transition-colors"
                        >
                          跳轉劇本: {eventData.script}
                        </Link>
                      )}
                    </div>

                    <div className="space-y-3 text-[13px] leading-relaxed">
                      {/* 條件 */}
                      {eventData.condition && eventData.condition.length > 0 && (
                        <div className="bg-muted/30 p-2 rounded border border-muted">
                          <div className="font-semibold text-muted-foreground mb-1 flex items-center gap-1"><span className="text-xs">🔒</span>觸發條件</div>
                          <div className="space-y-1 pl-1">
                            {eventData.condition.map((cond: string, i: number) => (
                              <div key={i}><ParsedText text={getTranslation(cond)} translate={getTranslation} /></div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 權重 / 機率 */}
                      {eventData.rate && eventData.rate.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-muted-foreground">出現機率/權重:</span>
                          {eventData.rate.map((rate: string, i: number) => (
                            <span key={i} className="bg-muted px-2 py-0.5 rounded text-foreground font-mono">
                              <ParsedText text={getTranslation(rate)} translate={getTranslation} />
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          !isLoading && <div className="text-center text-muted-foreground py-10">找不到指定的 Position ID 或是資料尚未備妥。</div>
        )}
      </div>
    </main>
  );
}

export default function PositionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-muted-foreground tracking-widest animate-pulse">準備中...</div>}>
      <PositionContent />
    </Suspense>
  );
}