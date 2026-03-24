/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useQueryStates, parseAsString } from 'nuqs';
import { useItemDetail } from '@/hooks/queries/useItemDetail';
import { useTranslations } from 'next-intl';
import { ParsedText } from '@/components/shared/ParsedText';
import { useSidebarStore } from '@/store/useSidebarStore';

function ScriptContent() {
    // 1. 掛載狀態，防止 Hydration 報錯
    const [mounted, setMounted] = useState(false);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => setMounted(true), []);

    // 全域展開/收合用的控制狀態
    const [treeActionId, setTreeActionId] = useState(0);
    const [isGlobalExpand, setIsGlobalExpand] = useState(true);

    // 2. 為了和 position 統一，使用 ?id=... 作為查詢參數
    const [query, setQuery] = useQueryStates({
        id: parseAsString.withDefault('ch1_1'),
    });

    // 3. 抓取劇本資料
    const { data, isLoading, isError } = useItemDetail('script', query.id);

    // 4. i18n 解析邏輯 (與 Sidebar 共用相同邏輯)
    const t = useTranslations();
    const getTranslation = (baseKey: string, params?: Record<string, string>): string => {
        if (t.has(`${baseKey}._`)) return t(`${baseKey}._` as any, params) as string;
        if (t.has(baseKey as any)) return t(baseKey as any, params) as string;
        return baseKey;
    };

    // 5. 處理整包 script.json 或單一檔案的資料取得
    const targetScript = data?.[query.id] || data;
    const contentArray = targetScript?.content || [];

    // 取得側邊欄開啟狀態，用來動態縮放主畫面寬度
    const isOpen = useSidebarStore(state => state.isOpen);

    if (!mounted) return null;

    return (
        <main className={`min-h-screen bg-background text-foreground pb-20 transition-[padding] duration-300 ease-in-out ${isOpen ? 'lg:pr-[512px]' : ''}`}>
            {/* 頂部固定導覽列 */}
            <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b px-6 py-4 mb-8 shadow-sm">
                <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h1 className="text-xl font-bold text-primary">劇本閱讀器</h1>
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-muted-foreground whitespace-nowrap">測試 ID:</label>
                        <input
                            type="text"
                            value={query.id}
                            onChange={(e) => setQuery({ id: e.target.value })}
                            className="px-3 py-1.5 text-sm border rounded bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary w-full sm:w-48"
                            placeholder="例如 act1, ch0_1..."
                        />
                    </div>
                </div>
            </div>

            {/* 主要閱讀區塊 */}
            <div className="max-w-5xl mx-auto px-6 space-y-6">
                {isLoading && <div className="text-center text-muted-foreground py-10 tracking-widest animate-pulse">載入劇本中...</div>}
                {isError && <div className="text-center text-destructive py-10 bg-destructive/10 rounded-md">無法載入劇本資料。</div>}

                {targetScript ? (
                    <div className="flex flex-col gap-8">
                        {/* 1. 基本資訊面板 */}
                        <div className="p-5 border rounded-xl shadow-sm bg-card">
                            <div className="space-y-4">
                                <div>
                                    <div className="text-xs text-muted-foreground mb-1">{getTranslation('Web.Id')}</div>
                                    <div className="font-mono text-sm text-foreground">
                                        {query.id}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs text-muted-foreground mb-1">{getTranslation('Web.Name')}</div>
                                    <div className="font-semibold text-lg text-foreground">
                                        <ParsedText text={getTranslation(`Script.Name.${query.id}`)} translate={getTranslation} />
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs text-muted-foreground mb-1">{getTranslation('Web.Desc')}</div>
                                    <div className="text-sm leading-relaxed">
                                        <ParsedText text={getTranslation(`Script.Desc.${query.id}`)} translate={getTranslation} />
                                    </div>
                                </div>
                                {targetScript.remark && (Array.isArray(targetScript.remark) ? targetScript.remark.length > 0 : true) && (
                                    <div>
                                        <div className="text-xs text-muted-foreground mb-1">{getTranslation('Web.Remark')}</div>
                                        <div className="text-sm text-amber-700 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/30 p-3 rounded-md border border-amber-200 dark:border-amber-900/50">
                                            {Array.isArray(targetScript.remark)
                                                ? targetScript.remark.map((r: string, i: number) => <div key={i}><ParsedText text={getTranslation(r)} translate={getTranslation} /></div>)
                                                : <ParsedText text={getTranslation(targetScript.remark)} translate={getTranslation} />}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 2. 劇本內容區塊 */}
                        {contentArray.length > 0 && (
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center justify-between border-b border-border/50 pb-2">
                                    <h2 className="text-lg font-bold">{getTranslation('Web.Content')}</h2>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => { setIsGlobalExpand(true); setTreeActionId(v => v + 1); }} className="text-xs bg-muted hover:bg-muted/80 text-foreground px-2 py-1 rounded border shadow-sm transition-colors">
                                            {getTranslation('Web.ExpandAll')}
                                        </button>
                                        <button onClick={() => { setIsGlobalExpand(false); setTreeActionId(v => v + 1); }} className="text-xs bg-muted hover:bg-muted/80 text-foreground px-2 py-1 rounded border shadow-sm transition-colors">
                                            {getTranslation('Web.CollapseAll')}
                                        </button>
                                    </div>
                                </div>
                                <div className="bg-card border rounded-xl p-4 sm:p-6 shadow-sm overflow-x-auto">
                                    <div className="flex flex-col gap-1 min-w-max sm:min-w-0">
                                        {contentArray.map((node: any, idx: number) => (
                                            <ScriptNode
                                                key={idx} node={node}
                                                getTranslation={getTranslation}
                                                treeActionId={treeActionId} isGlobalExpand={isGlobalExpand}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 3. 關聯項目 */}
                        {(targetScript.rel || targetScript.backRel) && (
                            <div className="flex flex-col gap-4 mt-2">
                                <h2 className="text-lg font-bold border-b border-border/50 pb-2">{getTranslation('Web.Relations')}</h2>
                                <div className="flex flex-col md:flex-row gap-4 items-start">
                                    <RelationBlock title={getTranslation('Web.Rel')} data={targetScript.rel} getTranslation={getTranslation} />
                                    <RelationBlock title={getTranslation('Web.BackRel')} data={targetScript.backRel} getTranslation={getTranslation} />
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    targetScript && <div className="text-center text-muted-foreground py-10">此劇本沒有內容或找不到對應的 ID。</div>
                )}
            </div>
        </main>
    );
}

// 關聯區塊渲染組件
function RelationBlock({ title, data, getTranslation }: { title: string, data: any, getTranslation: any }) {
    if (!data || Object.keys(data).length === 0) return null;
    // 檢查各階段是否真的有內容
    const hasContent = Object.values(data).some((types: any) => types && Object.keys(types).length > 0);
    if (!hasContent) return null;

    return (
        <div className="bg-card border rounded-xl p-4 shadow-sm flex-1 w-full">
            <h3 className="text-md font-bold text-primary mb-3 border-b pb-2">{title}</h3>
            <div className="space-y-3 text-sm">
                {Object.entries(data).map(([phase, types]: [string, any]) => {
                    if (!types || Object.keys(types).length === 0) return null;
                    return (
                        <div key={phase} className="flex flex-col sm:flex-row gap-2 sm:gap-4 border-b border-border/40 pb-2 last:border-0 last:pb-0">
                            <span className="font-semibold text-muted-foreground w-12 shrink-0 capitalize">{phase}</span>
                            <div className="flex flex-col gap-2">
                                {Object.entries(types).map(([type, ids]: [string, any]) => (
                                    <div key={type} className="flex flex-wrap items-center gap-1.5">
                                        <span className="text-[11px] bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded font-mono">
                                            {type}
                                        </span>
                                        {/* 這裡我們巧妙利用 ParsedText 丟入 [*Label.Type, ID*] 來觸發解析器自動產生點擊跳轉連結 */}
                                        {Array.isArray(ids) ? ids.map((id: string) => (
                                            <ParsedText key={id} text={`[*Label.${type},${id}*]`} translate={getTranslation} />
                                        )) : null}
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

export default function ScriptPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-muted-foreground tracking-widest animate-pulse">準備中...</div>}>
            <ScriptContent />
        </Suspense>
    );
}

// 遞迴處理你的 Effect 與 Branch 結構
function ScriptNode({ node, getTranslation, treeActionId, isGlobalExpand }: { node: any, getTranslation: any, treeActionId: number, isGlobalExpand: boolean }) {
    if (!node) return null;

    if (node.form === 'effect') {
        return (
            <div className="py-1.5 px-3 text-foreground/90 text-[15px] border-primary/20 hover:bg-muted/30 transition-colors">
                <ParsedText text={getTranslation(node.text)} translate={getTranslation} />
            </div>
        );
    }

    if (node.form === 'branch') {
        return (
            <div className="my-1">
                <div className="font-bold text-primary text-[15px] flex items-center gap-2 py-1.5 px-2">
                    <ParsedText text={getTranslation(node.text)} translate={getTranslation} />
                </div>

                <div className="flex flex-col gap-2 mt-1 pl-1">
                    {node.branches?.map((branch: any) => (
                        <BranchOption
                            key={branch.index} branch={branch} getTranslation={getTranslation}
                            treeActionId={treeActionId} isGlobalExpand={isGlobalExpand}
                        />
                    ))}
                </div>
            </div>
        );
    }

    return <div className="p-3 text-xs font-mono bg-destructive/10 text-destructive rounded border">未知節點: {JSON.stringify(node)}</div>;
}

// 單獨抽出 Branch 裡面的選項，以便讓每個選項都能獨立收合
function BranchOption({ branch, getTranslation, treeActionId, isGlobalExpand }: { branch: any, getTranslation: any, treeActionId: number, isGlobalExpand: boolean }) {
    const [isExpanded, setIsExpanded] = useState(isGlobalExpand);

    // 監聽全域展開/收合訊號
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (treeActionId > 0) setIsExpanded(isGlobalExpand);
    }, [treeActionId, isGlobalExpand]);

    return (
        <div className="flex flex-col">
            <div
                className="font-semibold text-amber-600 text-sm py-1 px-2 flex flex-wrap items-center gap-2 cursor-pointer hover:bg-muted/50 rounded-md transition-colors select-none"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <span className="text-muted-foreground w-4 text-center text-xs shrink-0">{isExpanded ? '▼' : '▶'}</span>
                <span className="text-muted-foreground shrink-0 font-mono">{branch.index}.</span>
                <div className="flex-1"><ParsedText text={getTranslation(branch.text)} translate={getTranslation} /></div>
                {branch.condition && (
                    <span className="text-[11px] bg-destructive/10 text-destructive border border-destructive/20 px-1.5 py-0.5 rounded flex items-center font-mono">
                        <span className="mr-1">🔒</span><ParsedText text={getTranslation(branch.condition)} translate={getTranslation} />
                    </span>
                )}
            </div>
            {isExpanded && (
                <div className="pl-4 ml-4 border-l-[1.5px] border-border/60 flex flex-col gap-1 mt-1 mb-2">
                    {branch.content?.map((subNode: any, idx: number) => (
                        <ScriptNode key={idx} node={subNode} getTranslation={getTranslation} treeActionId={treeActionId} isGlobalExpand={isGlobalExpand} />
                    ))}
                </div>
            )}
        </div>
    );
}