/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import Link from 'next/link';
import { useState, useEffect, Suspense, useMemo } from 'react';
import { useQueryStates, parseAsString } from 'nuqs';
import { ChevronDown, ChevronRight, Lock, Minus, CircleArrowRight, CircleFadingPlus, UnfoldVertical, FoldVertical, Search, TableProperties, Filter } from 'lucide-react';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import { useItemDetail } from '@/hooks/queries/useItemDetail';
import { useSidebarStore } from '@/store/useSidebarStore';
import { ParsedText } from '@/components/shared/ParsedText';
import { TopNavbar } from '@/components/layout/TopNavbar';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from "@/components/ui/button-group"

export default function ScriptPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-muted-foreground tracking-widest animate-pulse">Loading...</div>}>
      <ScriptContent />
    </Suspense>
  );
}

function ScriptContent() {

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // 全域分岐收合控制狀態
  const [treeActionId, setTreeActionId] = useState(0);
  const [isGlobalExpand, setIsGlobalExpand] = useState(true);

  // 網址參數
  const [query] = useQueryStates({
    id: parseAsString.withDefault('index'),
  });

  // 判斷啟用列表模式
  const isListView = (query.id === 'index');

  // 透過useItemDetail取得資料
  const { data, isLoading, isError } = useItemDetail('script', query.id);

  // 目標劇本資料
  const contentArray = data?.content || [];

  // i18n解析邏輯
  const { translateTerm, translateParagraph } = useAppTranslation();

  // 側邊欄開啟狀態
  const isOpen = useSidebarStore(state => state.isOpen);

  // 取得該劇本所有可用的 effect 類別
  const availableEffects = useMemo(() => Array.isArray(data?.effects) ? data.effects : [], [data]);
  const [selectedEffects, setSelectedEffects] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // 當載入新劇本時，預設全選所有 effect 類別
  useEffect(() => {
    setSelectedEffects(availableEffects);
  }, [availableEffects]);

  if (!mounted) return null;

  return (
    <main className={`min-h-screen bg-background text-foreground pb-20 transition-[padding] duration-300 ease-in-out ${isOpen ? 'md:pr-128 lg:pr-144' : ''}`}>
      {/* 頂部固定導覽列 */}
      <TopNavbar />

      {/* 主要閱讀區塊 */}
      <div className="max-w-5xl mx-auto px-6 space-y-6">
        {isLoading && (
          <div className="text-center text-muted-foreground py-10 tracking-widest animate-pulse">
            {translateTerm('Web.Loading', { 0: translateTerm('Web.Script') })}
          </div>
        )}
        {isError && (
          <div className="text-center text-destructive py-10 bg-destructive/10 rounded-md">
            {translateTerm('Web.LoadError', { 0: translateTerm('Web.Script') })}
          </div>
        )}

        {/* 列表模式 */}
        {!isLoading && !isError && isListView && data && (
          <DataList data={data} />
        )}

        {/* 單一劇本內容模式 */}
        {!isLoading && !isError && !isListView && data ? (
          <div className="flex flex-col gap-8">

            {/* 基本資訊 */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-border/50 pb-2">
                <h2 className="text-lg font-bold">{translateTerm('Web.ScriptData', undefined, 2)}</h2>
                <div className="flex items-center">
                  <Button asChild variant="outline" size="sm" className="h-8 px-2.5 text-xs">
                    <Link href="/script">
                      <TableProperties className="mr-1.5 size-3.5 rotate-180 text-muted-foreground" />
                      {translateTerm('Web.ReturnList', undefined, 2)}
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="p-5 border rounded-xl shadow-sm bg-card">
                <div className="space-y-4">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">{translateTerm('Web.Id', undefined, 2)}</div>
                    <div className="font-semibold text-foreground">
                      {query.id}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">{translateTerm('Web.Name', undefined, 2)}</div>
                    <div className="font-semibold text-foreground">
                      {translateTerm(`Script.Name.${query.id}`)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">{translateTerm('Web.Desc', undefined, 2)}</div>
                    <div className="text-sm leading-relaxed">
                      {translateTerm(`Script.Desc.${query.id}`) || translateTerm('System.NA')}
                    </div>
                  </div>
                  {data.remark && (Array.isArray(data.remark) ? data.remark.length > 0 : true) && (
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">{translateTerm('Web.Remark')}</div>
                      <div className="px-2.5 py-1.5 text-sm text-amber-700 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/30 rounded-md border border-amber-200 dark:border-amber-900/50">
                        {Array.isArray(data.remark)
                          ? data.remark.map((r: string, i: number) => <div key={i}>{translateParagraph(r)}</div>)
                          : translateParagraph(data.remark)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 劇本內容 */}
            {data.content && data.content.length > 0 && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-border/50 pb-2">
                  <h2 className="text-lg font-bold">{translateTerm('Web.Content', undefined, 2)}</h2>
                  <div className="flex items-center gap-2">

                    {/* 篩選分支下拉選單 */}
                    {availableEffects.length > 0 && (
                      <div className="relative">
                        <Button variant="outline" size="sm" onClick={() => setIsFilterOpen(!isFilterOpen)} className="h-8 px-2.5 text-xs">
                          <Filter className="mr-1.5 size-3.5 text-muted-foreground" />
                          {translateTerm('Web.FilterSwitch', undefined, 2)} ({selectedEffects.length}/{availableEffects.length})
                        </Button>
                        {isFilterOpen && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setIsFilterOpen(false)} />
                            <div className="absolute right-0 sm:right-auto sm:left-0 top-full mt-1 w-max min-w-44 bg-popover/95 backdrop-blur-sm border rounded-md shadow-lg z-50 p-2 flex flex-col gap-1 max-h-[60vh] overflow-y-auto">
                              <div className="flex items-center justify-between px-1 pb-1 mb-1 border-b border-border/50">
                                <button className="text-xs text-primary hover:underline font-semibold" onClick={() => setSelectedEffects(availableEffects)}>{translateTerm('Web.SelectAll', undefined, 2)}</button>
                                <button className="text-xs text-muted-foreground hover:underline font-semibold" onClick={() => setSelectedEffects([])}>{translateTerm('Web.DeselectAll', undefined, 2)}</button>
                              </div>
                              {availableEffects.map((effect: any) => (
                                <label key={effect} className="flex items-center gap-2 px-2 py-1.5 hover:bg-muted/80 rounded cursor-pointer select-none">
                                  <input
                                    type="checkbox"
                                    className="rounded border-primary/50 text-primary focus:ring-primary size-3.5"
                                    checked={selectedEffects.includes(effect)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedEffects([...selectedEffects, effect]);
                                      } else {
                                        setSelectedEffects(selectedEffects.filter(x => x !== effect));
                                      }
                                    }}
                                  />
                                  <span className="text-sm flex items-center gap-1.5">
                                    <span className="text-muted-foreground opacity-80">{translateTerm(`LabelIcon.${effect}`, undefined, 0)}</span>
                                    <span className="font-semibold">{translateTerm(`Web.${effect}`, undefined, 2)}</span>
                                  </span>
                                </label>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    {/* 全域展開/收合按鈕 */}
                    <ButtonGroup>
                      <Button variant="outline" size="sm" onClick={() => { setIsGlobalExpand(true); setTreeActionId(v => v + 1); }} className="h-8 px-2.5 text-xs">
                        <UnfoldVertical className="mr-1.5 size-3.5 text-muted-foreground" />
                        {translateTerm('Web.ExpandAll', undefined, 2)}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => { setIsGlobalExpand(false); setTreeActionId(v => v + 1); }} className="h-8 px-2.5 text-xs">
                        <FoldVertical className="mr-1.5 size-3.5 text-muted-foreground" />
                        {translateTerm('Web.CollapseAll', undefined, 2)}
                      </Button>
                    </ButtonGroup>
                  </div>
                </div>
                <div className="bg-card border rounded-xl p-5 shadow-sm overflow-x-auto font-(family-name:--font-script)">
                  <div className="flex flex-col min-w-max sm:min-w-0">
                    {contentArray.map((node: any, idx: number) => (
                      <DataContent
                        key={idx} node={node}
                        treeActionId={treeActionId} isGlobalExpand={isGlobalExpand}
                        selectedEffects={selectedEffects}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 關聯項目 */}
            {data.rel && (
              <div className="flex flex-col gap-4 mt-2">
                <h2 className="text-lg font-bold border-b border-border/50 pb-2">
                  {translateTerm('Web.Relations', undefined, 2)}
                </h2>
                <div className="flex flex-col gap-3">
                  {Object.entries(data.rel).map(([phase, types]) => (
                    <DataRelation key={phase} phase={phase} types={types} />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}

        {!isLoading && !isError && !isListView && !data && (
          <div className="text-center text-muted-foreground py-10">
            {translateTerm('Web.NotFound', { 0: translateTerm('Web.Script') })}
          </div>
        )}
      </div>
    </main>
  );
}

// 劇本列表元件 (DataTable)
function DataList({ data }: { data: Record<string, any> | any[] }) {
  const { translateTerm, translateParagraph } = useAppTranslation();
  const [searchInput, setSearchInput] = useState('');
  const [searchTarget, setSearchTarget] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 100;

  // 緩存清單
  const list = useMemo(() => {
    if (!data) return [];
    return Array.isArray(data) ? data : Object.entries(data).map(([id, val]: any) => ({
      id,
      ...(typeof val === 'object' ? val : {})
    }));
  }, [data]);

  // 執行搜尋
  const handleSearch = () => {
    setSearchTarget(searchInput);
    setPage(1);
  };

  // 非同步建置搜尋快取，避免阻塞路由跳轉時的初次渲染
  const [searchableList, setSearchableList] = useState<any[]>([]);
  const [isBuildingCache, setIsBuildingCache] = useState(false);

  useEffect(() => {
    if (!list || list.length === 0) return;
    setIsBuildingCache(true);

    // 讓出主執行緒
    const timer = setTimeout(() => {
      const mapped = list.map((item: any) => {
        const id = item.id || '';
        const idText = id.toLowerCase();
        const nameText = translateTerm(`Script.Name.${id}`).toLowerCase();
        const descText = translateTerm(`Script.Desc.${id}`).toLowerCase();
        const keywordText = translateTerm(`Script.Keyword.${id}`).toLowerCase();

        let contentText = '';
        if (item.searchText) {
          contentText = translateParagraph(item.searchText).toLowerCase();
        }

        return {
          ...item,
          _searchString: `${idText} ${nameText} ${descText} ${keywordText} ${contentText}`
        };
      });
      setSearchableList(mapped);
      setIsBuildingCache(false);
    }, 10);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list]);

  // 過濾清單
  const filteredList = useMemo(() => {
    const sourceList = searchableList.length > 0 ? searchableList : list;
    if (!searchTarget) return sourceList;
    const searchLower = searchTarget.trim().toLowerCase();

    // 支援多關鍵字以空白分隔
    const searchTerms = searchLower.split(/\s+/).filter(Boolean);

    return sourceList.filter((item: any) => {

      // 如果快取還沒建好，降級使用即時比對
      const targetString = item._searchString || `${item.id} ${translateTerm(`Script.Name.${item.id}`)} ${translateTerm(`Script.Desc.${item.id}`)} ${translateTerm(`Script.Keyword.${item.id}`)}`.toLowerCase();
      return searchTerms.every(term => targetString.includes(term));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchableList, list, searchTarget]);

  // 分頁顯示資料
  const displayList = useMemo(() => {
    return filteredList.slice(0, page * itemsPerPage);
  }, [filteredList, page]);
  const hasMore = displayList.length < filteredList.length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/50 pb-2">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold">{translateTerm('Web.ScriptList', undefined, 2)}</h2>
          {isBuildingCache && <span className="text-xs text-muted-foreground animate-pulse">({translateTerm('Web.BuildingCache')})</span>}
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <ButtonGroup className="flex-1">
            <input
              type="text"
              placeholder={translateTerm('Web.SearchPlaceholder')}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
              className="px-3 text-sm border rounded-md bg-muted/50 focus:outline-none focus:bg-background transition-colors sm:w-64"
            />
            <Button variant="outline" size="sm" onClick={handleSearch} className="px-2">
              <Search className="size-4 opacity-70" />
            </Button>
          </ButtonGroup>
        </div>
      </div>
      <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-muted/50 text-muted-foreground border-b border-border/50">
              <tr>
                <th className="px-4 py-3 font-semibold w-24">{translateTerm('Web.Id')}</th>
                <th className="px-4 py-3 font-semibold min-w-37.5">{translateTerm('Web.Name')}</th>
                <th className="px-4 py-3 font-semibold min-w-50 w-full">{translateTerm('Web.Desc')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/70">
              {displayList.map((item: any) => (
                <tr key={item.id} className="hover:bg-muted/50 transition-colors group">
                  <td className="px-4 py-3 font-mono text-primary">
                    <Link href={`/script?id=${item.id}`} className="hover:underline">{item.id}</Link>
                  </td>
                  <td className="px-4 py-3 font-bold whitespace-normal">
                    <Link href={`/script?id=${item.id}`} className="hover:text-primary transition-colors">
                      {translateTerm(`Script.Name.${item.id}`)}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-normal max-w-xs" title={translateTerm(`Script.Desc.${item.id}`)}>
                    <div className="line-clamp-2">
                      {translateTerm(`Script.Desc.${item.id}`)}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredList.length === 0 && (
                <tr><td colSpan={3} className="px-4 py-12 text-center text-muted-foreground">{translateTerm('Web.NoData')}</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {/* 載入更多按鈕 */}
        {hasMore && (
          <div className="p-4 border-t border-border/50 bg-muted/20 flex justify-center">
            <Button variant="outline" onClick={() => setPage(p => p + 1)} className="w-full sm:w-auto min-w-50">
              {translateTerm('Web.LoadMore')} ({displayList.length} / {filteredList.length})
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// 劇本內容元件 (Tree)
function DataContent({ node, treeActionId, isGlobalExpand, selectedEffects }: { node: any, treeActionId: number, isGlobalExpand: boolean, selectedEffects?: string[] }) {
  const { translateTerm } = useAppTranslation();
  if (!node) return null;

  // Effect內容
  if (node.form === 'effect') {

    // 切分項目
    const textStr = typeof node.text === 'string' ? node.text : '';
    const effectItems = textStr.split(' / ');

    return (
      <div className="flex items-start gap-2 px-3 py-0.5 text-foreground text-sm/loose rounded-md hover:bg-muted/80 transition-colors">
        <CircleArrowRight className="size-4 shrink-0 text-muted-foreground/50 mt-1.25" />
        <div className="flex flex-wrap items-center gap-y-1 gap-x-2 flex-1">
          {effectItems.map((item: string, idx: number) => (
            <div key={idx} className="flex items-center whitespace-nowrap">
              <ParsedText text={item} />
              {idx < effectItems.length - 1 && <span className="text-muted-foreground/30 ml-2">/</span>}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 分岐內容
  if (node.form === 'branch') {

    // 判斷 Switch 分岐是否因為 Filter 被隱藏 (只要 effects 中沒有任何一項被勾選，整個節點不顯示)
    if (node.type === 'Switch' && selectedEffects && Array.isArray(node.effects) && node.effects.length > 0) {
      const hasSelectedEffect = node.effects.some((e: string) => selectedEffects.includes(e));
      if (!hasSelectedEffect) return null;
    }

    return (
      <div>
        {/* 分岐種類文字(檢定/選項/轉盤...) */}
        <div className="flex flex-wrap items-center px-2 py-0.5 gap-0.5 font-bold text-primary text-sm/loose rounded-md hover:bg-muted/80 transition-colors">
          <ParsedText text={node.text} />
        </div>

        {/* 分岐項目 */}
        <div className="flex flex-col pl-1 mx-2">
          {node.branches?.map((branch: any) => (
            <BranchItem key={branch.index} branch={branch} treeActionId={treeActionId} isGlobalExpand={isGlobalExpand} selectedEffects={selectedEffects} />
          ))}
        </div>
      </div>
    );
  }

  // 未知節點
  return <div className="px-3 py-0.5 text-sm/loose bg-destructive/10 text-destructive rounded-md border">{translateTerm('Web.UnknownNode')}: {JSON.stringify(node)}</div>;
}

// 分岐項目
function BranchItem({ branch, treeActionId, isGlobalExpand, selectedEffects }: { branch: any, treeActionId: number, isGlobalExpand: boolean, selectedEffects?: string[] }) {
  const [isExpanded, setIsExpanded] = useState(isGlobalExpand);
  const { translateTerm } = useAppTranslation();

  // 監聽全域展開/收合訊號
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (treeActionId > 0) setIsExpanded(isGlobalExpand);
  }, [treeActionId, isGlobalExpand]);

  // 單一Effect內容直接在右側同行顯示
  const isSingleEffect = branch.content?.length === 1 && branch.content[0].form === 'effect';
  const effectItems = isSingleEffect && typeof branch.content[0].text === 'string' ? branch.content[0].text.split(' / ') : [];

  // Effect類別陣列
  const effectsList = Array.isArray(branch.effects) ? branch.effects : [];

  return (
    <div className="flex flex-col">
      <div
        className={`flex items-start px-3 py-0.5 -mx-0.5 gap-1 font-semibold text-sm/loose rounded-md transition-colors hover:bg-muted/80 ${isSingleEffect ? '' : 'cursor-pointer'}`}
        onClick={() => {
          // 若使用者正在反白複製劇本文字，則不觸發展開/收合
          if (typeof window !== 'undefined' && window.getSelection()?.toString().length) return;

          // 展開/收合分岐
          if (!isSingleEffect) setIsExpanded(!isExpanded);
        }}
      >
        {/* 左側固定區塊 (圖示+序號) */}
        <div className="flex items-center gap-1 shrink-0 w-10.5">
          <span className="shrink-0 flex items-center justify-center w-4 text-muted-foreground">
            {isSingleEffect ? <Minus className="size-4" /> : (isExpanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />)}
          </span>
          <span className="shrink-0 flex-1 text-right text-muted-foreground">{branch.index}.</span>
        </div>

        {/* 右側彈性內容區塊，允許內部折行 */}
        <div className="flex flex-wrap items-center -ml-3.5 gap-x-0.5 gap-y-1 flex-1 min-w-0">

          {/* 分岐名稱 */}
          <div className="wrap-break-word ml-3.5 mr-1"><ParsedText text={branch.text} /></div>

          {/* 分岐條件 (不一定有) */}
          {branch.condition && (
            <span className="flex items-center pl-1 gap-0.5 leading-5 text-muted-foreground rounded border">
              <Lock className="size-3.5 shrink-0 text-muted-foreground/70" />
              <span><ParsedText text={branch.condition} /></span>
            </span>
          )}

          {/* 收合狀態下，顯示可能影響的類別 Icon */}
          {!isSingleEffect && !isExpanded && (
            <div
              className="flex items-center min-w-10 opacity-60 text-sm select-none pl-1 hover:opacity-90 transition-opacity"
              title={effectsList.length > 0 ? effectsList.map((e: string) => translateTerm(`Web.${e}`)).join(', ') : ''}
            >
              <CircleFadingPlus className="size-4 shrink-0 text-muted-foreground/70 mr-1.5" />
              <div className="truncate tracking-widest">
                {effectsList.map((e: any) => translateTerm(`LabelIcon.${e}`, undefined, 0)).filter(Boolean).join('')}
              </div>
              <span className="ml-0.5 text-muted-foreground/70 font-bold tracking-tighter">...</span>
            </div>
          )}

          {/* 單一Effect直接接在右側顯示 */}
          {isSingleEffect && (
            <div className="flex items-start gap-1.5 ml-1 text-foreground font-normal">
              <CircleArrowRight className="size-4 shrink-0 text-muted-foreground/50 mt-1.25" />
              <div className="flex flex-wrap items-center gap-y-1 gap-x-2 flex-1 min-w-0">
                {effectItems.map((item: string, idx: number) => (
                  <div key={idx} className="flex items-center whitespace-nowrap">
                    <ParsedText text={item} />
                    {idx < effectItems.length - 1 && <span className="text-muted-foreground/30 ml-2 select-none">/</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 分岐內容 */}
      {!isSingleEffect && isExpanded && (
        <div className="flex flex-col pl-4 ml-4 mb-2 border-l-2 border-border/80">
          {branch.content?.map((subNode: any, idx: number) => (
            <DataContent key={idx} node={subNode} treeActionId={treeActionId} isGlobalExpand={isGlobalExpand} selectedEffects={selectedEffects} />
          ))}
        </div>
      )}
    </div>
  );
}

// 關聯項目元件 (Card)
function DataRelation({ phase, types }: { phase: string, types: any }) {
  const { translateTerm } = useAppTranslation();

  // 檢查是否有內容
  if (!types || Object.keys(types).length === 0) return null;
  if (!Object.values(types).some((ids: any) => Array.isArray(ids) && ids.length > 0)) return null;

  return (
    <div className="bg-card border rounded-xl p-4 sm:p-5 shadow-sm w-full">
      <h3 className="text-md font-bold text-primary mb-4 border-b border-border/50 pb-2">
        {translateTerm(`Web.Rel.${phase}`)}
      </h3>
      <div className="flex flex-col gap-3 text-sm">

        {/* 關聯項目類別 */}
        {Object.entries(types).map(([type, ids]: [string, any]) => {
          if (!Array.isArray(ids) || ids.length === 0) return null;
          return (
            <div key={type} className="flex flex-col sm:flex-row gap-2 sm:gap-4 border-b border-border/40 pb-3 last:border-0 last:pb-0">
              <span className="font-semibold text-muted-foreground w-18 shrink-0">{translateTerm(`Web.${type}`, undefined, 2)}</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 flex-1">
                {ids.map((id: string) => (
                  <div key={id} className="flex items-start overflow-hidden">

                    {/* 關聯項目，強制覆寫內部按鈕樣式 */}
                    <div className="flex-1 min-w-0 **:[[role=button]]:block **:[[role=button]]:w-full **:[[role=button]]:text-left **:[[role=button]]:truncate">
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