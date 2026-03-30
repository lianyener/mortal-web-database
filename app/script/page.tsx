/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect, Suspense, useMemo } from 'react';
import { useQueryStates, parseAsString } from 'nuqs';
import { ChevronDown, ChevronRight, Lock, Minus, CircleArrowRight, CircleFadingPlus, UnfoldVertical, FoldVertical, Search } from 'lucide-react';
import Link from 'next/link';
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
        id: parseAsString,
    });

    // 判斷目前是否為列表模式
    const isListView = !query.id;

    // 3. 直接讀取 /data/script.json，避開 useItemDetail 的預設路徑邏輯
    const [allScripts, setAllScripts] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsLoading(true);
        fetch('/data/script.json')
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch script');
                return res.json();
            })
            .then(data => {
                setAllScripts(data);
                setIsError(false);
            })
            .catch(() => setIsError(true))
            .finally(() => setIsLoading(false));
    }, []);

    // 4. i18n 解析邏輯 (提取 getPlainText 來處理網頁 UI 標籤)
    const { getTranslation, getPlainText } = useAppTranslation();

    // 5. 處理整包 script.json 或單一檔案的資料取得
    const targetScript = !isListView && query.id ? allScripts?.[query.id] : null;
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

                {/* 列表模式 */}
                {!isLoading && !isError && isListView && allScripts && (
                    <ScriptList data={allScripts} translateTerm={getTranslation} translateParagraph={getPlainText} />
                )}

                {/* 單一劇本閱讀模式 */}
                {!isLoading && !isError && !isListView && targetScript ? (
                    <div className="flex flex-col gap-8">
                        {/* 1. 基本資訊面板 */}
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-3 border-b border-border/50 pb-2">
                                <Link href="/script" className="flex items-center text-sm font-semibold text-muted-foreground hover:text-primary transition-colors bg-muted/50 hover:bg-muted px-2 py-1 rounded-md">
                                    <ChevronRight className="size-4 rotate-180 mr-0.5" />{getPlainText('Web.Return')}
                                </Link>
                                <div className="w-px h-4 bg-border/80"></div>
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
                ) : null}

                {!isLoading && !isError && !isListView && !targetScript && (
                    <div className="text-center text-muted-foreground py-10">{getPlainText('Web.ScriptNotFound')}</div>
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

// ==========================================
// 劇本列表元件 (DataTable)
// ==========================================
interface ScriptListProps {
    data: Record<string, any> | any[];
    translateTerm: (key: string, params?: Record<string, string | number | Date>) => string;
    translateParagraph: (key: string) => string;
}

function ScriptList({ data, translateTerm, translateParagraph }: ScriptListProps) {
    const [searchInput, setSearchInput] = useState('');
    const [activeSearch, setActiveSearch] = useState('');

    // 1. 【修復卡頓】使用 useMemo 將 list 緩存，避免每次打字輸入觸發渲染時都產生全新陣列，導致下方 searchableList 快取失效
    const list = useMemo(() => {
        if (!data) return [];
        return Array.isArray(data) ? data : Object.entries(data).map(([id, val]: any) => ({
            id,
            ...(typeof val === 'object' ? val : {})
        }));
    }, [data]);

    // 2. 執行搜尋：改為手動觸發，徹底消除打字時的卡頓
    const handleSearch = () => {
        setActiveSearch(searchInput);
    };

    const regexTerm = /\[\*([\w.,*{}\[\]]+)\*\]/g;
    // 3. 預先計算所有劇本的搜尋字串 (快取處理，避免每次搜尋都重新遍歷巨大的 JSON 樹)
    const searchableList = useMemo(() => {

        // 遞迴函式，用於從劇本節點中提取所有可搜尋的純文字
        const extractContent = (node: any): string => {
            if (!node) return '';
            if (typeof node === 'string') return translateParagraph(node) + ' ';

            let allText = '';

            if (node.text) {
                const text = node.text.replace(regexTerm, (_: any, content: string) => {
                    const [key, ...args] = content.split(',');
                    if (args.length > 0) {
                        const params = args.reduce((acc: Record<number, string>, arg: string, i: number) => {

                            // 嘗試翻譯變數
                            acc[i] = translateTerm(arg.trim());
                            return acc;
                        }, {} as Record<number, string>);

                        // 回傳翻譯結果
                        return translateTerm(key.trim(), params);
                    }
                    return translateTerm(key);
                });
                console.log(text);
                // allText += `${node.text}&${translateParagraph(node.text)}#`;
            }
            if (node.condition) allText += `${node.condition}&${translateParagraph(node.condition)}#`;

            if (Array.isArray(node.branches)) {
                for (const subNode of node.branches) {
                    allText += extractContent(subNode);
                }
            }
            if (Array.isArray(node.content)) {
                for (const subNode of node.content) {
                    allText += extractContent(subNode);
                }
            }
            return allText;
        };

        return list.map((item: any) => {

            const id = item.id;
            const idText = id.toLowerCase();
            const nameText = translateTerm(`Script.Name.${id}`).toLowerCase();
            const descText = translateTerm(`Script.Desc.${id}`).toLowerCase();
            const keywordText = translateTerm(`Script.Keyword.${id}`).toLowerCase();

            let contentText = '';
            if (Array.isArray(item.content)) {
                contentText = item.content.map((n: any) => extractContent(n)).join('').toLowerCase();
            }

            return {
                ...item,
                _searchString: `${idText} ${nameText} ${descText} ${keywordText} ${contentText}`
            };
        });
    }, [list, translateParagraph, translateTerm]);

    // 4. 實際過濾清單：只要比對預先算好的 _searchString 即可
    const filteredList = useMemo(() => {
        if (!activeSearch) return searchableList;
        const searchLower = activeSearch.trim().toLowerCase();

        // 支援多關鍵字以空白分隔
        const searchTerms = searchLower.split(/\s+/).filter(Boolean);

        return searchableList.filter((item: any) => {
            return searchTerms.every(term => item._searchString.includes(term));
        });
    }, [searchableList, activeSearch]);

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/50 pb-2">
                <h2 className="text-lg font-bold">{translateTerm('Web.ScriptList')}</h2>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <input
                        type="text"
                        placeholder="ID, Name, Keyword..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
                        className="px-3 py-1.5 text-sm border rounded-md bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary flex-1 sm:w-64"
                    />
                    <Button variant="secondary" size="sm" onClick={handleSearch} className="h-8 px-3">
                        <Search className="size-4 mr-1.5 opacity-70" />
                        {translateTerm('Web.Search')}
                    </Button>
                </div>
            </div>
            <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left whitespace-nowrap">
                        <thead className="bg-muted/50 text-muted-foreground border-b border-border/50">
                            <tr>
                                <th className="px-4 py-3 font-semibold w-24">{translateTerm('Web.Id')}</th>
                                <th className="px-4 py-3 font-semibold min-w-[150px]">{translateTerm('Web.Name')}</th>
                                <th className="px-4 py-3 font-semibold min-w-[200px] w-full">{translateTerm('Web.Desc')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {filteredList.map((item: any) => (
                                <tr key={item.id} className="hover:bg-muted/30 transition-colors group">
                                    <td className="px-4 py-3 font-mono text-primary">
                                        <Link href={`/script?id=${item.id}`} className="hover:underline">{item.id}</Link>
                                    </td>
                                    <td className="px-4 py-3 font-bold whitespace-normal">
                                        <Link href={`/script?id=${item.id}`} className="hover:text-primary transition-colors">
                                            <ParsedText text={translateTerm(`Script.Name.${item.id}`)} translate={translateTerm} />
                                        </Link>
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground whitespace-normal max-w-xs" title={translateTerm(`Script.Desc.${item.id}`)}>
                                        <div className="line-clamp-2">
                                            <ParsedText text={translateTerm(`Script.Desc.${item.id}`)} translate={translateTerm} />
                                        </div>
                                        <div className="text-xs text-red-500 font-mono mt-2 break-all bg-red-50 p-1 rounded">
                                            Debug: {item._searchString}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredList.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="px-4 py-12 text-center text-muted-foreground">{translateTerm('Web.NoData')}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default function ScriptPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-muted-foreground tracking-widest animate-pulse">Loading...</div>}>
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
                <div className="flex flex-wrap items-center px-2 py-0.5 gap-0.5 font-bold text-primary text-sm/loose rounded-md hover:bg-muted/80 transition-colors">
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