/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useQueryStates, parseAsString } from 'nuqs';
import { ChevronDown, ChevronRight, Lock, Minus, CircleArrowRight, CircleFadingPlus, UnfoldVertical, FoldVertical } from 'lucide-react';
import { useItemDetail } from '@/hooks/queries/useItemDetail';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import { ParsedText } from '@/components/shared/ParsedText';
import { useSidebarStore } from '@/store/useSidebarStore';
import { Button } from '@/components/ui/button';
import { TopNavbar } from '@/components/layout/TopNavbar';

function ScriptContent() {
    // 1. 掛載狀態，防止 Hydration 報錯
    const [mounted, setMounted] = useState(false);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => setMounted(true), []);

    // 全域展開/收合用的控制狀態
    const [treeActionId, setTreeActionId] = useState(0);
    const [isGlobalExpand, setIsGlobalExpand] = useState(true);

    // 2. 為了和 position 統一，使用 ?id=... 作為查詢參數
    const [query] = useQueryStates({
        id: parseAsString.withDefault('ch1_1'),
    });

    // 3. 抓取劇本資料
    const { data, isLoading, isError } = useItemDetail('script', query.id);

    // 4. i18n 解析邏輯 (提取 getPlainText 來處理網頁 UI 標籤)
    const { getTranslation, getPlainText } = useAppTranslation();

    // 5. 處理整包 script.json 或單一檔案的資料取得
    const targetScript = data?.[query.id] || data;
    const contentArray = targetScript?.content || [];

    // 取得側邊欄開啟狀態，用來動態縮放主畫面寬度
    const isOpen = useSidebarStore(state => state.isOpen);

    if (!mounted) return null;

    return (
        <main className={`min-h-screen bg-background text-foreground pb-20 transition-[padding] duration-300 ease-in-out ${isOpen ? 'md:pr-[512px] lg:pr-[576px]' : ''}`}>
            {/* 頂部固定導覽列 */}
            <TopNavbar />

            {/* 主要閱讀區塊 */}
            <div className="max-w-5xl mx-auto px-6 space-y-6">
                {isLoading && <div className="text-center text-muted-foreground py-10 tracking-widest animate-pulse">Loading...</div>}
                {isError && <div className="text-center text-destructive py-10 bg-destructive/10 rounded-md">Loading Failed.</div>}

                {targetScript ? (
                    <div className="flex flex-col gap-8">
                        {/* 1. 基本資訊面板 */}
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center border-b border-border/50 pb-2">
                                <h2 className="text-lg font-bold">{getPlainText('Web.ScriptData')}</h2>
                            </div>
                            <div className="p-5 border rounded-xl shadow-sm bg-card">
                                <div className="space-y-4">
                                    <div>
                                        <div className="text-xs text-muted-foreground mb-1">{getPlainText('Web.Id')}</div>
                                        <div className="text-sm text-foreground">
                                            {query.id}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-muted-foreground mb-1">{getPlainText('Web.Name')}</div>
                                        <div className="font-semibold text-lg text-foreground">
                                            <ParsedText text={getTranslation(`Script.Name.${query.id}`)} translate={getTranslation} />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-muted-foreground mb-1">{getPlainText('Web.Desc')}</div>
                                        <div className="text-sm leading-relaxed">
                                            <ParsedText text={getTranslation(`Script.Desc.${query.id}`)} translate={getTranslation} />
                                        </div>
                                    </div>
                                    {targetScript.remark && (Array.isArray(targetScript.remark) ? targetScript.remark.length > 0 : true) && (
                                        <div>
                                            <div className="text-xs text-muted-foreground mb-1">{getPlainText('Web.Remark')}</div>
                                            <div className="px-2.5 py-1.5 text-sm text-amber-700 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/30 rounded-md border border-amber-200 dark:border-amber-900/50">
                                                {Array.isArray(targetScript.remark)
                                                    ? targetScript.remark.map((r: string, i: number) => <div key={i}><ParsedText text={getTranslation(r)} translate={getTranslation} /></div>)
                                                    : <ParsedText text={getTranslation(targetScript.remark)} translate={getTranslation} />}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* 2. 劇本內容區塊 */}
                        {contentArray.length > 0 && (
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center justify-between border-b border-border/50 pb-2">
                                    <h2 className="text-lg font-bold">{getPlainText('Web.Content')}</h2>
                                    <div className="flex items-center gap-2">
                                        <Button variant="outline" size="sm" onClick={() => { setIsGlobalExpand(true); setTreeActionId(v => v + 1); }} className="h-8 px-2.5 text-xs">
                                            <UnfoldVertical className="mr-1.5 size-3.5 text-muted-foreground" />
                                            {getPlainText('Web.ExpandAll')}
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={() => { setIsGlobalExpand(false); setTreeActionId(v => v + 1); }} className="h-8 px-2.5 text-xs">
                                            <FoldVertical className="mr-1.5 size-3.5 text-muted-foreground" />
                                            {getPlainText('Web.CollapseAll')}
                                        </Button>
                                    </div>
                                </div>
                                <div className="bg-card border rounded-xl p-4 sm:p-6 shadow-sm overflow-x-auto font-(family-name:--font-script)">
                                    <div className="flex flex-col min-w-max sm:min-w-0">
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
                                <h2 className="text-lg font-bold border-b border-border/50 pb-2">
                                    {getPlainText('Web.Relations')}
                                </h2>
                                <div className="flex flex-col gap-4">
                                    {targetScript.rel && Object.entries(targetScript.rel).map(([phase, types]) => (
                                        <RelationCard key={`rel-${phase}`} mainType="Rel" phase={phase} types={types} getTranslation={getTranslation} />
                                    ))}
                                    {targetScript.backRel && Object.entries(targetScript.backRel).map(([phase, types]) => (
                                        <RelationCard key={`backRel-${phase}`} mainType="BackRel" phase={phase} types={types} getTranslation={getTranslation} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    targetScript && <div className="text-center text-muted-foreground py-10">{getPlainText('Web.ScriptNotFound')}</div>
                )}
            </div>
        </main>
    );
}

// 關聯區塊渲染組件 (改為直式卡片，並依據 Phase 拆分)
function RelationCard({ mainType, phase, types, getTranslation }: { mainType: string, phase: string, types: any, getTranslation: any }) {
    const { getPlainText } = useAppTranslation();
    if (!types || Object.keys(types).length === 0) return null;
    // 檢查該階段是否真的有內容
    const hasContent = Object.values(types).some((ids: any) => Array.isArray(ids) && ids.length > 0);
    if (!hasContent) return null;

    // 組合標題 Key，例如 Web.Rel.Pre 或 Web.BackRel.Post
    const phaseKey = phase.charAt(0).toUpperCase() + phase.slice(1);
    const titleKey = `Web.${mainType}.${phaseKey}`;
    // 如果沒有翻譯，提供一個好看的預設值
    const title = getPlainText(titleKey) !== titleKey ? getPlainText(titleKey) : `${mainType} - ${phaseKey}`;

    return (
        <div className="bg-card border rounded-xl p-4 sm:p-5 shadow-sm w-full">
            <h3 className="text-md font-bold text-primary mb-4 border-b border-border/50 pb-2">
                {title}
            </h3>
            <div className="flex flex-col gap-3 text-sm">
                {Object.entries(types).map(([type, ids]: [string, any]) => {
                    if (!Array.isArray(ids) || ids.length === 0) return null;

                    // 將翻譯解析為純文字，確保不帶有多餘的標籤
                    const typeLabel = getPlainText(`Web.${type}`) !== `Web.${type}` ? getPlainText(`Web.${type}`) : type;

                    return (
                        <div key={type} className="flex flex-col sm:flex-row gap-2 sm:gap-4 border-b border-border/40 pb-3 last:border-0 last:pb-0">
                            <span className="font-semibold text-muted-foreground w-24 shrink-0 mt-0.5">{typeLabel}</span>
                            {/* 使用 Grid 網格系統強制對齊，解決長短不一造成的凌亂感 */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 flex-1">
                                {ids.map((id: string) => (
                                    <div key={id} className="flex items-start overflow-hidden">
                                        {/* 利用 [&_[role=button]]:強制覆寫內部按鈕樣式，讓它變成佔滿全寬的區塊並截斷，且不影響其他地方的設定 */}
                                        <div className="flex-1 min-w-0 **:[[role=button]]:block **:[[role=button]]:w-full **:[[role=button]]:text-left **:[[role=button]]:truncate" title={id}>
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
        // 將文字以 ' / ' 切開，並使用 flex-wrap 排版
        // whitespace-nowrap 確保單一項目即使很長也不會被從中間斷行
        const textStr = typeof node.text === 'string' ? node.text : '';
        const effectItems = textStr.split(' / ');

        return (
            <div className="flex items-start gap-2 px-3 py-1 text-foreground text-sm/loose rounded-md hover:bg-muted/80 transition-colors">
                <CircleArrowRight className="size-4 shrink-0 text-muted-foreground/50 mt-[5px]" />
                <div className="flex flex-wrap items-center gap-y-1 gap-x-2 flex-1">
                    {effectItems.map((item: string, idx: number) => (
                        <div key={idx} className="flex items-center whitespace-nowrap">
                            <ParsedText text={getTranslation(item)} translate={getTranslation} />
                            {idx < effectItems.length - 1 && <span className="text-muted-foreground/30 ml-2">/</span>}
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (node.form === 'branch') {
        return (
            <div>
                <div className="flex items-center px-2 py-0.5 gap-1 font-bold text-primary text-sm/loose rounded-md hover:bg-muted/80 transition-colors">
                    <ParsedText text={getTranslation(node.text)} translate={getTranslation} />
                </div>

                <div className="flex flex-col pl-1 mx-2">
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
    const { getPlainText } = useAppTranslation();

    // 監聽全域展開/收合訊號
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (treeActionId > 0) setIsExpanded(isGlobalExpand);
    }, [treeActionId, isGlobalExpand]);

    // 判斷是否為單一 Effect 內容，如果是則直接在標題右側同行顯示
    const isSingleEffectContent = branch.content?.length === 1 && branch.content[0].form === 'effect';
    const effectItems = isSingleEffectContent && typeof branch.content[0].text === 'string' ? branch.content[0].text.split(' / ') : [];

    // 取得 effects 陣列 (後端已去重，直接使用)
    const effectsList = Array.isArray(branch.effects) ? branch.effects : [];

    return (
        <div className="flex flex-col">
            <div
                className={`flex items-start px-3 py-1 -mx-0.5 gap-1 font-semibold text-sm/loose rounded-md transition-colors ${isSingleEffectContent ? 'hover:bg-muted/80' : 'cursor-pointer hover:bg-muted/80'}`}
                onClick={() => {
                    // 若使用者正在反白複製劇本文字，則不觸發展開/收合
                    if (typeof window !== 'undefined' && window.getSelection()?.toString().length) return;
                    
                    if (!isSingleEffectContent) setIsExpanded(!isExpanded);
                }}
            >
                {/* 左側固定區塊 (圖示 + 序號) */}
                {/* 固定寬度讓數字靠右對齊，確保右側彈性區塊的起跑線一致 */}
                <div className="flex items-center gap-1 shrink-0 w-10.5">
                    <span className="shrink-0 flex items-center justify-center w-4 text-muted-foreground">
                        {isSingleEffectContent ? <Minus className="size-4" /> : (isExpanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />)}
                    </span>
                    <span className="shrink-0 flex-1 text-right text-muted-foreground">{branch.index}.</span>
                </div>

                {/* 右側彈性內容區塊，允許內部折行，折行時會產生整齊的縮排 */}
                <div className="flex flex-wrap items-center -ml-3.5 gap-x-0.5 gap-y-1 flex-1 min-w-0">
                    <div className="wrap-break-word ml-3.5 mr-1"><ParsedText text={getTranslation(branch.text)} translate={getTranslation} /></div>
                    
                    {branch.condition && (
                        <span className="flex items-center pl-1 gap-0.5 leading-5 text-muted-foreground rounded border">
                            <Lock className="size-3.5 shrink-0 text-muted-foreground/70" />
                            <span><ParsedText text={getTranslation(branch.condition)} translate={getTranslation} /></span>
                        </span>
                    )}

                    {/* 收合狀態下，在最右側顯示可能影響的類別 Icon (即使沒有 Icon 也保留佔位符與刪節號提示) */}
                    {!isSingleEffectContent && !isExpanded && (
                        <div
                            className="flex items-center min-w-[40px] opacity-60 text-sm select-none pl-1 hover:opacity-90 transition-opacity"
                            title={effectsList.length > 0 ? effectsList.map((e: string) => getPlainText(`Web.${e}`)).join(', ') : ''}
                        >
                            <CircleFadingPlus className="size-4 shrink-0 text-muted-foreground/70 mr-1.5" />
                            <div className="truncate tracking-widest">
                                {effectsList.map((eff: any) => {
                                    const icon = getTranslation(`LabelIcon.${eff}`);
                                    return icon !== `LabelIcon.${eff}` ? icon : '';
                                }).filter(Boolean).join(' ')}
                            </div>
                            <span className="ml-0.5 text-muted-foreground/60 font-bold tracking-tighter">...</span>
                        </div>
                    )}

                    {/* 若為單一 Effect，直接接在右側顯示，並還原字體粗細 (font-normal) */}
                    {isSingleEffectContent && (
                        <div className="flex items-start gap-1.5 ml-1 text-foreground font-normal">
                            {/* 因為右側也可能折行，設定 items-start 讓圖示對齊文字頂端 */}
                            <CircleArrowRight className="size-4 shrink-0 text-muted-foreground/50 mt-[5px]" />
                            <div className="flex flex-wrap items-center gap-y-1 gap-x-2 flex-1 min-w-0">
                                {effectItems.map((item: string, idx: number) => (
                                    <div key={idx} className="flex items-center whitespace-nowrap">
                                        <ParsedText text={getTranslation(item)} translate={getTranslation} />
                                        {idx < effectItems.length - 1 && <span className="text-muted-foreground/30 ml-2 select-none">/</span>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {!isSingleEffectContent && isExpanded && (
                <div className="flex flex-col pl-4 ml-4 mb-2 border-l-2 border-border/80">
                    {branch.content?.map((subNode: any, idx: number) => (
                        <ScriptNode key={idx} node={subNode} getTranslation={getTranslation} treeActionId={treeActionId} isGlobalExpand={isGlobalExpand} />
                    ))}
                </div>
            )}
        </div>
    );
}