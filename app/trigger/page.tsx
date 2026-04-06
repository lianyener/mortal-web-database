/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, Suspense, useMemo } from 'react';
import { useQueryStates, parseAsString } from 'nuqs';
import { CircleArrowRight, Search, TableProperties, ChevronDown, Minus, Eye, EyeOff } from 'lucide-react';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import { useItemDetail } from '@/hooks/queries/useItemDetail';
import { useSidebarStore } from '@/store/useSidebarStore';
import { DataRelation } from '@/components/shared/DataRelation';
import { ParsedText } from '@/components/shared/ParsedText';
import { TopNavbar } from '@/components/layout/TopNavbar';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from "@/components/ui/button-group";

export default function TriggerPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-muted-foreground tracking-widest animate-pulse">Loading...</div>}>
      <TriggerContent />
    </Suspense>
  );
}

function TriggerContent() {

  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  // 網址參數
  const [query] = useQueryStates({
    id: parseAsString.withDefault('all'),
  });

  // 判斷啟用列表模式
  const isListView = (query.id === 'all');

  // 透過useItemDetail取得資料
  const { data, isLoading, isError } = useItemDetail('trigger', query.id);

  // 相容結構
  const detailData = isListView ? null : (data?.type ? data : data?.[query.id]);

  // i18n解析邏輯
  const { translateTerm, translateParagraph, translateTermWithParam } = useAppTranslation();

  // 側邊欄開啟狀態
  const isOpen = useSidebarStore(state => state.isOpen);

  // 整理 Content 陣列，如果劇本有設定 script 屬性，在尾端塞入跳轉節點
  const contentArray = useMemo(() => {
    if (!detailData) return [];
    const arr = [...(detailData.content || [])];
    if (detailData.script) {
      arr.push({
        form: 'effect',
        type: 'Script',
        text: `◎[*Custom.NextScript*][*Label.Script,${detailData.script}*]`
      });
    }
    return arr;
  }, [detailData]);

  if (!mounted) return null;

  return (
    <main className={`min-h-screen bg-background text-foreground pb-20 transition-[padding] duration-300 ease-in-out ${isOpen ? 'md:pr-128 lg:pr-144' : ''}`}>
      {/* 頂部固定導覽列 */}
      <TopNavbar />

      {/* 主要閱讀區塊 */}
      <div className={`max-w-5xl mx-auto px-6 space-y-6 transition-all duration-300`}>
        {isLoading && (
          <div className="text-center text-muted-foreground py-10 tracking-widest animate-pulse">
            {translateTermWithParam('Web.Msg.Loading', 'Trigger')}
          </div>
        )}
        {isError && (
          <div className="text-center text-destructive py-10 bg-destructive/10 rounded-md">
            {translateTermWithParam('Web.Msg.LoadError', 'Trigger')}
          </div>
        )}

        {/* 列表模式 */}
        {!isLoading && !isError && isListView && data && (
          <DataList data={data} />
        )}

        {/* 單一觸發器內容模式 */}
        {!isLoading && !isError && !isListView && detailData ? (
          <div className="flex flex-col gap-8">

            {/* 基本資訊 */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-border/50 pb-2">
                <h2 className="text-lg font-bold">{translateTermWithParam('Web.Info', 'Trigger')}</h2>
                <div className="flex items-center">
                  <Button asChild variant="outline" size="sm" className="h-8 px-2.5 text-xs">
                    <Link href="/trigger">
                      <TableProperties className="mr-1.5 size-3.5 rotate-180 text-muted-foreground" />
                      {translateTerm('Web.ReturnList')}
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="p-5 border rounded-xl shadow-sm bg-card">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">{translateTerm('Web.Id')}</div>
                      <div className="font-semibold text-foreground break-all">{query.id}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">{translateTerm('Web.Name')}</div>
                      <div className="font-semibold text-foreground">{translateTerm(`Trigger.Name.${query.id}`)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">{translateTerm('Web.Type')}</div>
                      <div className="font-semibold text-foreground">{translateTerm(`Web.Label.${detailData.type}`)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">{translateTerm('Web.Active')}</div>
                      <div className="font-semibold text-foreground">
                        {detailData.active ? (
                          <span className="text-primary">{translateTerm('Web.Term.Yes')}</span>
                        ) : (
                          <span className="text-muted-foreground/70">{translateTerm('Web.Term.No')}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-border/50 pt-4">
                    <div className="text-xs text-muted-foreground mb-1">{translateTerm('Web.Desc')}</div>
                    <div className="text-sm leading-relaxed text-foreground">
                      {translateTerm(`Trigger.Desc.${query.id}`, undefined, 1) || translateTerm('System.NA')}
                    </div>
                  </div>

                  {detailData.remark && (Array.isArray(detailData.remark) ? detailData.remark.length > 0 : true) && (
                    <div className="border-t border-border/50 pt-4">
                      <div className="text-xs text-muted-foreground mb-1">{translateTerm('Web.Remark')}</div>
                      <div className="px-2.5 py-1.5 text-sm text-amber-700 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/30 rounded-md border border-amber-200 dark:border-amber-900/50">
                        {Array.isArray(detailData.remark)
                          ? detailData.remark.map((r: string, i: number) => <div key={i}>{translateParagraph(r)}</div>)
                          : translateParagraph(detailData.remark)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="pb-2 flex items-center border-b border-border/50">
                <h2 className="text-lg font-bold">{translateTermWithParam('Web.Content', 'Trigger')}</h2>
              </div>
              <div className="bg-card border rounded-xl p-5 shadow-sm overflow-x-auto font-(family-name:--font-script)">

                {/* 觸發條件 */}
                {detailData.condition && (
                  <div>
                    <h3 className="font-bold text-primary border-b border-border/40 pb-1.5">{translateTerm('Web.Condition')}</h3>
                    <div className="flex flex-col items-start pt-2 gap-1 text-sm/loose">
                      {detailData.condition.map((item: any, i: number) => (
                        <div key={i} className='flex items-start w-full py-0.5 gap-1 rounded-md transition-colors hover:bg-muted/80'>
                          <span className="pl-1.5 text-muted-foreground shrink-0 select-none">{i + 1}.</span>
                          <div className="items-center gap-x-0.5 gap-y-1 flex-1 min-w-0">
                            <ParsedText text={item} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 觸發 */}
                {contentArray.length > 0 && (
                  <div className='not-first:pt-3'>
                    <h3 className="font-bold text-primary border-b border-border/40 pb-1.5">{translateTerm('Web.Label.Trigger')}</h3>
                    <div className="flex flex-col pt-2 min-w-max sm:min-w-0">
                      {contentArray.map((node: any, idx: number) => (
                        <DataContent key={idx} node={node} />
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* 關聯項目 */}
            {detailData.rel && (
              <div className="flex flex-col gap-4 mt-2">
                <h2 className="pb-2 text-lg font-bold border-b border-border/50">{translateTerm('Web.Relations')}</h2>
                <div className="flex flex-col gap-3">
                  {Object.entries(detailData.rel).map(([phase, types]) => (
                    <DataRelation key={phase} phase={phase} types={types} />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}

        {!isLoading && !isError && !isListView && !detailData && (
          <div className="text-center text-muted-foreground py-10">
            {translateTermWithParam('Web.Msg.NotFound', 'Trigger')}
          </div>
        )}
      </div>
    </main>
  );
}

// 列表元件 (DataTable)
function DataList({ data }: { data: Record<string, any> | any[] }) {
  const router = useRouter();
  const { translateTerm, translateParagraph, translateTermWithParam } = useAppTranslation();
  const [searchInput, setSearchInput] = useState('');
  const [searchTarget, setSearchTarget] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 100;

  // 篩選器狀態
  const [activeOnly, setActiveOnly] = useState(true);
  const [typeFilter, setTypeFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('all');
  const [stageFilter, setStageFilter] = useState('all');

  // 緩存清單並以 orderKey 排序
  const list = useMemo(() => {
    if (!data) return [];
    const arr = Array.isArray(data) ? data : Object.entries(data).map(([id, val]: any) => ({
      id,
      ...(typeof val === 'object' ? val : {})
    }));
    return arr.sort((a, b) => (a.orderKey || '').localeCompare(b.orderKey || ''));
  }, [data]);

  // 提取選項
  const { typeOptions, yearOptions, monthOptions, stageOptions } = useMemo(() => {
    const types = new Set<string>();
    const years = new Set<string>();
    const months = new Set<string>();
    const stages = new Set<string>();

    list.forEach((item: any) => {
      if (item.type) types.add(item.type);
      if (item.minTime?.year) years.add(item.minTime.year);
      if (item.maxTime?.year) years.add(item.maxTime.year);
      if (item.minTime?.month) months.add(item.minTime.month);
      if (item.maxTime?.month) months.add(item.maxTime.month);
      if (item.minTime?.stage) stages.add(item.minTime.stage);
      if (item.maxTime?.stage) stages.add(item.maxTime.stage);
    });

    return {
      typeOptions: ['Main', 'Sub', 'Free'],
      yearOptions: Array.from(years).sort((a, b) => parseInt(a) - parseInt(b)),
      monthOptions: Array.from(months).sort((a, b) => parseInt(a) - parseInt(b)),
      stageOptions: Array.from(stages).sort((a, b) => parseInt(a) - parseInt(b)),
    };
  }, [list]);

  // 格式化時間輔助函式
  const formatTime = (timeObj: any) => {
    if (!timeObj || (!timeObj.year && !timeObj.month && !timeObj.stage)) return translateTerm('System.NA');
    const y = timeObj.year || '';
    const m = timeObj.month || '';
    const s = timeObj.stage || '';
    return <ParsedText text={`[*Custom.GameTimeText,${y},${m},${s}*]`} />;
  };

  // 執行搜尋
  const handleSearch = () => {
    setSearchTarget(searchInput);
    setPage(1);
  };

  // 篩選變更時回到第一頁
  useEffect(() => {
    setPage(1);
  }, [activeOnly, typeFilter, yearFilter, monthFilter, stageFilter]);

  // 過濾清單
  const filteredList = useMemo(() => {
    let sourceList = list;

    if (activeOnly) sourceList = sourceList.filter((item: any) => item.active === true);
    if (typeFilter !== 'all') sourceList = sourceList.filter((item: any) => item.type === typeFilter);
    if (yearFilter !== 'all') sourceList = sourceList.filter((item: any) => parseInt(item.minTime?.year) <= parseInt(yearFilter) && parseInt(item.maxTime?.year || 5) >= parseInt(yearFilter));
    if (monthFilter !== 'all') sourceList = sourceList.filter((item: any) => parseInt(item.minTime?.month) <= parseInt(monthFilter) && parseInt(item.maxTime?.month || 13) >= parseInt(monthFilter));
    if (stageFilter !== 'all') sourceList = sourceList.filter((item: any) => parseInt(item.minTime?.stage) <= parseInt(stageFilter) && parseInt(item.maxTime?.stage || 4) >= parseInt(stageFilter));

    if (!searchTarget) return sourceList;
    const searchLower = searchTarget.trim().toLowerCase();
    const searchTerms = searchLower.split(/\s+/).filter(Boolean);

    return sourceList.filter((item: any) => {
      const targetString = `${item.id} ${translateTerm(`Trigger.Name.${item.id}`)} ${translateTerm(`Trigger.Desc.${item.id}`)} ${translateParagraph(item.searchText)}`.toLowerCase();
      return searchTerms.every(term => targetString.includes(term));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list, searchTarget, activeOnly, typeFilter, yearFilter, monthFilter, stageFilter]);

  const displayList = useMemo(() => {
    return filteredList.slice(0, page * itemsPerPage);
  }, [filteredList, page]);
  const hasMore = displayList.length < filteredList.length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/50 pb-2">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold">{translateTermWithParam('Web.List', 'Trigger')}</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto">

          <Button
            variant={activeOnly ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveOnly(!activeOnly)}
            className="h-8 px-2.5 text-sm"
            title={activeOnly ? translateTerm('Web.ShowInactive') : translateTerm('Web.HideInactive')}
          >
            {activeOnly ? <Eye className="mr-1.5 size-3.5" /> : <EyeOff className="mr-1.5 size-3.5" />}
            {activeOnly ? translateTerm('Web.ActiveOnly') : translateTerm('Web.Term.All')}
          </Button>

          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="px-2 h-8 text-xs sm:text-sm border rounded-md bg-muted/50 focus:outline-none focus:bg-background transition-colors max-w-28 truncate">
            <option value="all">{translateTerm('Web.Type')} - {translateTerm('Web.Term.All')}</option>
            {typeOptions.map(o => <option key={o} value={o}>{translateTerm(`Web.Label.${o}`)}</option>)}
          </select>

          <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)} className="px-2 h-8 text-xs sm:text-sm border rounded-md bg-muted/50 focus:outline-none focus:bg-background transition-colors max-w-24 truncate">
            <option value="all">{translateTerm('Web.Term.Year')}</option>
            {yearOptions.map(o => <option key={o} value={o}>{translateParagraph(`[*System.Number_${o}*][*Web.Term.Year*]`)}</option>)}
          </select>

          <select value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)} className="px-2 h-8 text-xs sm:text-sm border rounded-md bg-muted/50 focus:outline-none focus:bg-background transition-colors max-w-24 truncate">
            <option value="all">{translateTerm('Web.Term.Month')}</option>
            {monthOptions.map(o => <option key={o} value={o}>{translateTerm(`System.Month_${o}`)}</option>)}
          </select>

          <select value={stageFilter} onChange={(e) => setStageFilter(e.target.value)} className="px-2 h-8 text-xs sm:text-sm border rounded-md bg-muted/50 focus:outline-none focus:bg-background transition-colors max-w-24 truncate">
            <option value="all">{translateTerm('Web.Term.Stage')}</option>
            {stageOptions.map(o => <option key={o} value={o}>{translateTerm(`System.Stage_${o}`)}</option>)}
          </select>

          <ButtonGroup className="flex-1 xl:flex-none">
            <input
              type="text"
              placeholder={translateTerm('Web.Msg.SearchPlaceholder')}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
              className="px-3 text-sm border rounded-md bg-muted/50 focus:outline-none focus:bg-background transition-colors sm:w-48"
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
                <th className="px-4 py-3 font-semibold min-w-24">{translateTerm('Web.Id')}</th>
                <th className="px-4 py-3 font-semibold min-w-24">{translateTerm('Web.Name')}</th>
                <th className="px-4 py-3 font-semibold min-w-20">{translateTerm('Web.Type')}</th>
                <th className="px-4 py-3 font-semibold min-w-32">{translateTerm('Web.MinTime')}</th>
                <th className="px-4 py-3 font-semibold min-w-32">{translateTerm('Web.MaxTime')}</th>
                <th className="px-4 py-3 font-semibold min-w-32">{translateTerm('Web.Desc')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/70">
              {displayList.map((item: any) => (
                <tr key={item.id} onClick={() => router.push(`/trigger?id=${item.id}`)} className={`hover:bg-muted/50 transition-colors group cursor-pointer ${!item.active ? 'opacity-50 grayscale hover:opacity-100 hover:grayscale-0' : ''}`}>
                  <td className="px-4 py-3 font-mono text-primary group-hover:underline">{item.id}</td>
                  <td className="px-4 py-3 font-bold whitespace-normal transition-colors group-hover:text-primary/80">
                    {translateTerm(`Trigger.Name.${item.id}`, undefined, 1)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {translateTerm(`Web.Label.${item.type}`)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{formatTime(item.minTime)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatTime(item.maxTime)}</td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-normal max-w-xs" title={translateTerm(`Trigger.Desc.${item.id}`, undefined, 1)}>
                    <div className="line-clamp-2">{translateTerm(`Trigger.Desc.${item.id}`, undefined, 1)}</div>
                  </td>
                </tr>
              ))}
              {filteredList.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">{translateTerm('Web.Msg.NoData')}</td></tr>
              )}
            </tbody>
          </table>
        </div>
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

// 內容元件
function DataContent({ node }: { node: any }) {
  const { translateTerm } = useAppTranslation();
  if (!node) return null;

  if (node.form === "effect") {
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

  if (node.form === "branch") {
    return (
      <div>
        {/* 分岐種類文字(檢定/選項/轉盤...) */}
        <div className="flex flex-wrap items-center px-2 py-0.5 gap-0.5 font-bold text-primary text-sm/loose rounded-md hover:bg-muted/80 transition-colors">
          <ParsedText text={node.text} />
        </div>
        
        {/* 分岐項目 */}
        <div className="flex flex-col pl-1 ml-2">
          {node.branches?.map((branch: any) => (
            <BranchItem key={branch.index} branch={branch} />
          ))}
        </div>
      </div>
    );
  }

  if (node.form === 'perform') {
    return (
      <div className="flex items-start gap-2 px-3 py-0.5 text-foreground text-sm/loose rounded-md hover:bg-muted/80 transition-colors">
        <CircleArrowRight className="size-4 shrink-0 text-muted-foreground/50 mt-1.25" />
        <div className="flex-1">
          <ParsedText text={node.text} />
        </div>
      </div>
    );
  }
  return <div className="px-3 py-0.5 text-sm/loose bg-destructive/10 text-destructive rounded-md border">{translateTerm('Web.UnknownNode')}: {JSON.stringify(node)}</div>;
}

// 分岐項目 (預設展開，無收合按鈕)
function BranchItem({ branch }: { branch: any }) {
  const isSingleEffect = branch.content?.length === 1 && branch.content[0].form === 'effect';
  const effectItems = isSingleEffect && typeof branch.content[0].text === 'string' ? branch.content[0].text.split(' / ') : [];

  return (
    <div className="flex flex-col">
      <div className="flex items-start py-0.5 -mx-0.5 gap-1 font-semibold text-sm/loose rounded-md transition-colors hover:bg-muted/80">
        <div className="flex pl-2 pr-0.5 py-1.5 items-center shrink-0 text-muted-foreground">
          {isSingleEffect ? <Minus className="size-4" /> : <ChevronDown className="size-4" />}
        </div>
        <div className="flex flex-wrap items-center gap-x-0.5 gap-y-1 flex-1 min-w-0">
          <div className="wrap-break-word mr-1"><ParsedText text={branch.text} /></div>
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

      {!isSingleEffect && (
        <div className="flex flex-col pl-4 ml-4 mb-2 border-l-2 border-border/80">
          {branch.content?.map((subNode: any, idx: number) => (
            <DataContent key={idx} node={subNode} />
          ))}
        </div>
      )}
    </div>
  );
}