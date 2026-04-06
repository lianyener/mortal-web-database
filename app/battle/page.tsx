/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, Suspense, useMemo } from 'react';
import { useQueryStates, parseAsString } from 'nuqs';
import { CircleArrowRight, Search, TableProperties } from 'lucide-react';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import { useItemDetail } from '@/hooks/queries/useItemDetail';
import { useSidebarStore } from '@/store/useSidebarStore';
import { DataRelation } from '@/components/shared/DataRelation';
import { ParsedText } from '@/components/shared/ParsedText';
import { TopNavbar } from '@/components/layout/TopNavbar';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from "@/components/ui/button-group";

export default function BattlePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-muted-foreground tracking-widest animate-pulse">Loading...</div>}>
      <BattleContent />
    </Suspense>
  );
}

function BattleContent() {

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
  const { data, isLoading, isError } = useItemDetail('battle', query.id);

  // 相容兩種結構(所有/單一)
  const detailData = isListView ? null : (data?.type ? data : data?.[query.id]);

  // i18n解析邏輯
  const { translateTerm, translateParagraph, translateTermWithParam } = useAppTranslation();

  // 側邊欄開啟狀態
  const isOpen = useSidebarStore(state => state.isOpen);

  if (!mounted) return null;

  // 預處理陣容資料
  const groups = [
    { key: 'friend', label: translateTerm('Web.Friend') },
    { key: 'enemy', label: translateTerm('Web.Enemy') },
    { key: 'neutral', label: translateTerm('Web.Neutral') }
  ];
  const groupCount = groups.reduce((count, g) => {
    if (detailData?.[g.key]?.name && detailData[g.key].name.length > 0) count++;
    return count;
  }, 0);

  return (
    <main className={`min-h-screen bg-background text-foreground pb-20 transition-[padding] duration-300 ease-in-out ${isOpen ? 'md:pr-128 lg:pr-144' : ''}`}>
      {/* 頂部固定導覽列 */}
      <TopNavbar />

      {/* 主要閱讀區塊 */}
      <div className="max-w-5xl mx-auto px-6 space-y-6">
        {isLoading && (
          <div className="text-center text-muted-foreground py-10 tracking-widest animate-pulse">
            {translateTermWithParam('Web.Msg.Loading', 'Battle')}
          </div>
        )}
        {isError && (
          <div className="text-center text-destructive py-10 bg-destructive/10 rounded-md">
            {translateTermWithParam('Web.Msg.LoadError', 'Battle')}
          </div>
        )}

        {/* 列表模式 */}
        {!isLoading && !isError && isListView && data && (
          <DataList data={data} />
        )}

        {/* 單一戰鬥內容模式 */}
        {!isLoading && !isError && !isListView && detailData ? (
          <div className="flex flex-col gap-8">

            {/* 基本資訊 */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-border/50 pb-2">
                <h2 className="text-lg font-bold">{translateTermWithParam('Web.Info', 'Battle')}</h2>
                <div className="flex items-center">
                  <Button asChild variant="outline" size="sm" className="h-8 px-2.5 text-xs">
                    <Link href="/battle">
                      <TableProperties className="mr-1.5 size-3.5 rotate-180 text-muted-foreground" />
                      {translateTerm('Web.ReturnList')}
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="p-5 border rounded-xl shadow-sm bg-card">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">{translateTerm('Web.Id')}</div>
                      <div className="font-semibold text-foreground">
                        {query.id}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">{translateTerm('Web.Name')}</div>
                      <div className="font-semibold text-foreground">
                        {translateTerm(`Battle.Name.${query.id}`)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">{translateTerm('Web.Type')}</div>
                      <div className="font-semibold text-foreground">
                        {translateTerm(`EnemyTeam.${detailData.type}`)}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-border/50 pt-4">
                    <div className="text-xs text-muted-foreground mb-1">{translateTerm('Web.Desc')}</div>
                    <div className="text-sm leading-relaxed text-foreground">
                      {translateTerm(`Battle.Desc.${query.id}`, undefined, 1) || translateTerm('System.NA')}
                    </div>
                  </div>

                  {detailData.remark && (Array.isArray(detailData.remark) ? detailData.remark.length > 0 : true) && (
                    <div>
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

            {/* 戰役內容 */}
            {groupCount > 0 && (
              <div className="flex flex-col gap-4">
                <div className="pb-2 flex items-center border-b border-border/50">
                  <h2 className="text-lg font-bold">{translateTermWithParam('Web.Content', 'Battle')}</h2>
                </div>
                <div className="bg-card border rounded-xl p-5 shadow-sm overflow-x-auto font-(family-name:--font-script)">

                  {/* 戰役陣容 */}
                  <div className={`grid grid-cols-1 sm:grid-cols-${groupCount} gap-4 mb-3`}>
                    {groups.map(group => {
                      if (!detailData[group.key]?.name || detailData[group.key].name.length === 0) return null;
                      const list = detailData[group.key].name;
                      const people = String(detailData[group.key].people);
                      return (
                        <div key={group.key} className="flex flex-col gap-2">
                          <h3 className="font-bold text-primary border-b border-border/40 pb-1.5">{group.label}</h3>
                          <div className="flex items-start gap-0.5 bg-muted/30 px-2.5 py-1 text-sm/loose rounded-md border border-border/50">
                            <div className='whitespace-nowrap'>{translateTerm('Web.People')}:</div>
                            <div><ParsedText text={people} /></div>
                          </div>
                          <div className="flex items-start gap-0.5 h-full bg-muted/30 px-2.5 py-1 text-sm/loose rounded-md border border-border/50">
                            <div className='whitespace-nowrap'>{translateTerm('Web.Team')}:</div>
                            <div className='flex flex-wrap w-full whitespace-nowrap'>
                              {list.map((item: any, i: number) => (
                                <div key={i} className="mr-1.5">
                                  <ParsedText text={item} />
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* 結束條件 */}
                  <div className='pt-3'>
                    <h3 className="font-bold text-primary border-b border-border/40 pb-1.5">{translateTerm('Web.End')}</h3>
                    <div className="flex flex-col items-start pt-2 gap-1 text-sm/loose">
                      {detailData.end && detailData.end.map((item: any, i: number) => (
                        <div key={i} className='flex items-start w-full py-0.5 gap-1 rounded-md transition-colors hover:bg-muted/80'>
                          <span className="pl-1.5 text-muted-foreground shrink-0 select-none">{i + 1}.</span>
                          <div className="flex flex-wrap items-center gap-x-0.5 gap-y-1 flex-1 min-w-0">
                            <ParsedText text={`${item.condition}`} />
                            <div className="flex items-start gap-1.5 ml-1 text-foreground font-normal">
                              <CircleArrowRight className="size-4 shrink-0 text-muted-foreground/50 mt-1.25" />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center whitespace-nowrap">
                                  <ParsedText text={item.result} />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 關聯項目 */}
            {detailData.rel && (
              <div className="flex flex-col gap-4 mt-2">
                <h2 className="text-lg font-bold border-b border-border/50 pb-2">
                  {translateTerm('Web.Relations')}
                </h2>
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
            {translateTermWithParam('Web.Msg.NotFound', 'Battle')}
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
  const [typeFilter, setTypeFilter] = useState('all');

  // 緩存清單
  const list = useMemo(() => {
    if (!data) return [];
    return Array.isArray(data) ? data : Object.entries(data).map(([id, val]: any) => ({
      id,
      ...(typeof val === 'object' ? val : {})
    }));
  }, [data]);

  // 提取唯一的 Type 選項
  const typeOptions = useMemo(() => {
    const types = new Set<string>();
    list.forEach((item: any) => { if (item.type) types.add(item.type); });
    return Array.from(types).sort((a, b) => a.localeCompare(b));
  }, [list]);

  // 執行搜尋
  const handleSearch = () => {
    setSearchTarget(searchInput);
    setPage(1);
  };

  // 過濾清單
  const filteredList = useMemo(() => {
    let sourceList = list;

    // 套用Type過濾
    if (typeFilter !== 'all') {
      sourceList = sourceList.filter((item: any) => item.type === typeFilter);
    }

    if (!searchTarget) return sourceList;
    const searchLower = searchTarget.trim().toLowerCase();

    // 支援多關鍵字
    const searchTerms = searchLower.split(/\s+/).filter(Boolean);

    return sourceList.filter((item: any) => {
      const targetString = `${item.id} ${translateTerm(`EnemyTeam.${item.type}`)} ${translateTerm(`Battle.Name.${item.id}`)} ${translateTerm(`Battle.Desc.${item.id}`)} ${translateParagraph(item.searchText)}`.toLowerCase();
      return searchTerms.every(term => targetString.includes(term));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list, searchTarget, typeFilter]);

  const displayList = useMemo(() => {
    return filteredList.slice(0, page * itemsPerPage);
  }, [filteredList, page]);
  const hasMore = displayList.length < filteredList.length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/50 pb-2">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold">{translateTermWithParam('Web.List', 'Battle')}</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">

          {/* 類型篩選 */}
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
            className="px-2 h-8 text-xs sm:text-sm border rounded-md bg-muted/50 focus:outline-none focus:bg-background transition-colors max-w-36 sm:max-w-48 truncate"
          >
            <option value="all">{translateTerm('Web.Type')} - {translateTerm('Web.Term.All')}</option>
            {typeOptions.map(t => <option key={t} value={t}>{translateTerm(`EnemyTeam.${t}`)}</option>)}
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
                <th className="px-4 py-3 font-semibold min-w-48">{translateTerm('Web.Desc')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/70">
              {displayList.map((item: any) => (
                <tr key={item.id} onClick={() => router.push(`/battle?id=${item.id}`)} className="hover:bg-muted/50 transition-colors group cursor-pointer">
                  <td className="px-4 py-3 font-mono text-primary group-hover:underline">{item.id}</td>
                  <td className="px-4 py-3 font-bold whitespace-normal transition-colors group-hover:text-primary/80">
                    {translateTerm(`Battle.Name.${item.id}`, undefined, 1)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-normal">
                    {translateTerm(`EnemyTeam.${item.type}`)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-normal max-w-xs" title={translateTerm(`Battle.Desc.${item.id}`, undefined, 1)}>
                    <div className="line-clamp-2">{translateTerm(`Battle.Desc.${item.id}`, undefined, 1)}</div>
                  </td>
                </tr>
              ))}
              {filteredList.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-12 text-center text-muted-foreground">{translateTerm('Web.Msg.NoData')}</td></tr>
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