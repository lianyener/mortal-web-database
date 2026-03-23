/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useQueryStates, parseAsString } from 'nuqs';
import { useItemDetail } from '@/hooks/queries/useItemDetail';
import { useTranslations } from 'next-intl';
import { ParsedText } from '@/components/shared/ParsedText';

function HomeContent() {
  // 1. 掛載狀態，防止 Hydration 報錯
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  // 2. 使用 nuqs 讀取 ?script=... 參數，預設使用你資料庫中的 "act1"
  const [query, setQuery] = useQueryStates({
    script: parseAsString.withDefault('ch1_1'),
  });

  // 3. 抓取劇本資料
  const { data, isLoading, isError } = useItemDetail('script', query.script);

  // 4. i18n 解析邏輯 (與 Sidebar 共用相同邏輯)
  const t = useTranslations();
  const getTranslation = (baseKey: string, params?: Record<string, string>): string => {
    if (t.has(`${baseKey}._`)) return t(`${baseKey}._` as any, params) as string;
    if (t.has(baseKey as any)) return t(baseKey as any, params) as string;
    return baseKey; 
  };

  // 5. 處理整包 script.json 或單一檔案的資料取得
  // 如果 data 本身就是整個腳本集合，取 data[query.script]，否則直接用 data
  const targetScript = data?.[query.script] || data;
  // 你的結構統一放在 content 陣列內
  const contentArray = targetScript?.content || [];

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-background text-foreground pb-20">
      {/* 頂部固定導覽列 */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b px-6 py-4 mb-8 shadow-sm">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-xl font-bold text-primary">劇本閱讀器</h1>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-muted-foreground whitespace-nowrap">測試 ID:</label>
            <input 
              type="text" 
              value={query.script}
              onChange={(e) => setQuery({ script: e.target.value })}
              className="px-3 py-1.5 text-sm border rounded bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary w-full sm:w-48"
              placeholder="例如 act1, ch0_1..."
            />
          </div>
        </div>
      </div>

      {/* 主要閱讀區塊 */}
      <div className="max-w-3xl mx-auto px-6 space-y-6">
        {isLoading && <div className="text-center text-muted-foreground py-10 tracking-widest animate-pulse">載入劇本中...</div>}
        {isError && <div className="text-center text-destructive py-10 bg-destructive/10 rounded-md">無法載入劇本資料。</div>}
        
        {targetScript && contentArray.length > 0 ? (
          <div className="flex flex-col gap-4">
            {contentArray.map((node: any, idx: number) => (
              <ScriptNode key={idx} node={node} getTranslation={getTranslation} />
            ))}
          </div>
        ) : (
          targetScript && <div className="text-center text-muted-foreground py-10">此劇本沒有內容或找不到對應的 ID。</div>
        )}
      </div>
    </main>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-muted-foreground tracking-widest animate-pulse">準備中...</div>}>
      <HomeContent />
    </Suspense>
  );
}

// 遞迴處理你的 Effect 與 Branch 結構
function ScriptNode({ node, getTranslation }: { node: any, getTranslation: any }) {
  if (!node) return null;

  // 1. 處理單純的事件 / 效果 (Effect)
  if (node.form === 'effect') {
    return (
      <div className="py-2 px-4 leading-relaxed text-foreground/90 text-[15px] border-l-2 border-primary/30 bg-muted/10 rounded-r-lg">
        <ParsedText text={getTranslation(node.text)} translate={getTranslation} />
      </div>
    );
  }

  // 2. 處理分支 (Branch)
  if (node.form === 'branch') {
    return (
      <div className="my-2 border border-border/60 rounded-xl shadow-sm bg-card overflow-hidden">
        {/* 分支標題 (例如 Switch, Option, Dice) */}
        <div className="bg-muted/40 px-4 py-2 border-b border-border/40 font-bold text-primary text-sm flex items-center gap-2">
          <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[11px] tracking-widest uppercase">
            {node.type}
          </span>
          <ParsedText text={getTranslation(node.text)} translate={getTranslation} />
        </div>
        
        {/* 分支選項內容 */}
        <div className="p-3 flex flex-col gap-3">
          {node.branches?.map((branch: any) => (
            <div key={branch.index} className="border border-border/50 rounded-lg p-3 bg-background relative overflow-hidden group">
              {/* 選項標題 */}
              <div className="font-semibold text-amber-600 mb-2 text-sm pb-2 border-b border-border/30 flex flex-wrap items-center gap-2">
                <span className="text-muted-foreground shrink-0">選項 {branch.index}:</span>
                <div className="flex-1"><ParsedText text={getTranslation(branch.text)} translate={getTranslation} /></div>
                
                {/* 顯示條件 (如果有的話) */}
                {branch.condition && (
                  <span className="text-[11px] bg-destructive/10 text-destructive border border-destructive/20 px-1.5 py-0.5 rounded flex items-center font-mono">
                    <span className="mr-1">🔒</span>
                    <ParsedText text={getTranslation(branch.condition)} translate={getTranslation} />
                  </span>
                )}
              </div>
              
              {/* 選項底下的子節點 (遞迴渲染 ScriptNode) */}
              <div className="pl-1 sm:pl-2 space-y-2 mt-2 border-l-2 border-muted">
                {branch.content?.map((subNode: any, idx: number) => (
                  <ScriptNode key={idx} node={subNode} getTranslation={getTranslation} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return <div className="p-3 text-xs font-mono bg-destructive/10 text-destructive rounded border">未知節點: {JSON.stringify(node)}</div>;
}