/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, Suspense, useMemo } from 'react';
import { useQueryStates, parseAsString } from 'nuqs';
import { Search, TableProperties } from 'lucide-react';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import { useItemDetail } from '@/hooks/queries/useItemDetail';
import { useSidebarStore } from '@/store/useSidebarStore';
import { DataRelation } from '@/components/shared/DataRelation';
import { ParsedText } from '@/components/shared/ParsedText';
import { TopNavbar } from '@/components/layout/TopNavbar';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from "@/components/ui/button-group";

export default function EquipPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-muted-foreground tracking-widest animate-pulse">Loading...</div>}>
      <EquipContent />
    </Suspense>
  );
}

function EquipContent() {

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
  const { data, isLoading, isError } = useItemDetail('equip', query.id);

  // 相容結構
  const detailData = isListView ? null : (data?.evolution || data?.rel ? data : data?.[query.id]);

  // i18n解析邏輯
  const { translateTerm, translateTermWithParam } = useAppTranslation();

  // 側邊欄開啟狀態
  const isOpen = useSidebarStore(state => state.isOpen);

  if (!mounted) return null;

  // 類型翻譯
  const getTypeLabel = (type: string) => type ? (translateTerm(`System.Upgrade.${type}`) || type) : translateTerm('System.NA');

  return (
    <main className={`min-h-screen bg-background text-foreground pb-20 transition-[padding] duration-300 ease-in-out ${isOpen ? 'md:pr-128 lg:pr-144' : ''}`}>
      {/* 頂部固定導覽列 */}
      <TopNavbar />

      {/* 主要閱讀區塊 */}
      <div className="max-w-5xl mx-auto px-6 space-y-6 transition-all duration-300">
        {isLoading && (
          <div className="text-center text-muted-foreground py-10 tracking-widest animate-pulse">
            {translateTermWithParam('Web.Msg.Loading', 'Equip')}
          </div>
        )}
        {isError && (
          <div className="text-center text-destructive py-10 bg-destructive/10 rounded-md">
            {translateTermWithParam('Web.Msg.LoadError', 'Equip')}
          </div>
        )}

        {/* 列表模式 */}
        {!isLoading && !isError && isListView && data && (
          <DataList data={data} getTypeLabel={getTypeLabel} />
        )}

        {/* 單一內容模式 */}
        {!isLoading && !isError && !isListView && detailData ? (
          <div className="flex flex-col gap-8">

            {/* 基本資訊 */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-border/50 pb-2">
                <h2 className="text-lg font-bold">{translateTermWithParam('Web.Info', 'Equip')}</h2>
                <div className="flex items-center">
                  <Button asChild variant="outline" size="sm" className="h-8 px-2.5 text-xs">
                    <Link href="/equip">
                      <TableProperties className="mr-1.5 size-3.5 rotate-180 text-muted-foreground" />
                      {translateTerm('Web.ReturnList')}
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="p-5 border rounded-xl shadow-sm bg-card">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="col-span-2 sm:col-span-1">
                      <div className="text-xs text-muted-foreground mb-1">{translateTerm('Web.Id')}</div>
                      <div className="font-semibold text-foreground break-all">{query.id}</div>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <div className="text-xs text-muted-foreground mb-1">{translateTerm('Web.Name')}</div>
                      <div className="font-semibold text-foreground">{translateTerm(`Equip.Name.${query.id}`, undefined, 1)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">{translateTerm('Web.Type')}</div>
                      <div className="font-semibold text-foreground">{getTypeLabel(detailData.type)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">{translateTerm('Web.Faction') || '門派規模'}</div>
                      <div className="font-semibold text-foreground">{detailData.faction ?? translateTerm('System.NA')}</div>
                    </div>
                  </div>

                  <div className="border-t border-border/50 pt-4">
                    <div className="text-xs text-muted-foreground mb-1">{translateTerm('Web.Desc')}</div>
                    <div className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                      {translateTerm(`Equip.Desc.${query.id}`, undefined, 1) || translateTerm('System.NA')}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 開發項目內容 */}
            {detailData.evolution && detailData.evolution.length > 0 && (
              <div className="flex flex-col gap-4">
                <h2 className="pb-2 text-lg font-bold border-b border-border/50">{translateTerm('Web.Evolution') || '開發項目'}</h2>
                <EvolutionTable evolutions={detailData.evolution} />
              </div>
            )}

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
            {translateTermWithParam('Web.Msg.NotFound', 'Equip')}
          </div>
        )}
      </div>
    </main>
  );
}

// 列表元件 (DataTable)
function DataList({ data, getTypeLabel }: { data: Record<string, any> | any[], getTypeLabel: (t: string) => string }) {
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
    const arr = Array.isArray(data) ? data : Object.entries(data).map(([id, val]: any) => ({
      id,
      ...(typeof val === 'object' ? val : {})
    }));
    // 預設以 ID 進行排序
    return arr.sort((a, b) => a.id.localeCompare(b.id));
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

    // 類型篩選
    if (typeFilter !== 'all') {
      sourceList = sourceList.filter((item: any) => (item.type || '') === typeFilter);
    }

    if (!searchTarget) return sourceList;
    const searchLower = searchTarget.trim().toLowerCase();
    const searchTerms = searchLower.split(/\s+/).filter(Boolean);

    return sourceList.filter((item: any) => {
      const evoString = item.evolution ? item.evolution.map((evo: any) => translateParagraph(evo.name)).join(' ') : '';
      const targetString = `${item.id} ${translateTerm(`Equip.Name.${item.id}`)} ${getTypeLabel(item.type)} ${translateTerm(`Equip.Desc.${item.id}`, undefined, 0)} ${evoString}`.toLowerCase();
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
          <h2 className="text-lg font-bold">{translateTermWithParam('Web.List', 'Equip')}</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">

          <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }} className="px-2 h-8 text-xs sm:text-sm border rounded-md bg-muted/50 focus:outline-none focus:bg-background transition-colors max-w-36 truncate">
            <option value="all">{translateTerm('Web.Type')} - {translateTerm('Web.Term.All')}</option>
            {typeOptions.map(t => <option key={t} value={t}>{getTypeLabel(t)}</option>)}
          </select>

          <ButtonGroup className="flex-1 xl:flex-none">
            <input type="text" placeholder={translateTerm('Web.Msg.SearchPlaceholder')} value={searchInput} onChange={(e) => setSearchInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }} className="px-3 text-sm border rounded-md bg-muted/50 focus:outline-none focus:bg-background transition-colors sm:w-64" />
            <Button variant="outline" size="sm" onClick={handleSearch} className="px-2"><Search className="size-4 opacity-70" /></Button>
          </ButtonGroup>
        </div>
      </div>
      <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-muted/50 text-muted-foreground border-b border-border/50">
              <tr>
                <th className="px-4 py-3 font-semibold min-w-24">{translateTerm('Web.Id')}</th>
                <th className="px-4 py-3 font-semibold min-w-32">{translateTerm('Web.Name')}</th>
                <th className="px-4 py-3 font-semibold min-w-24">{translateTerm('Web.Type')}</th>
                <th className="px-4 py-3 font-semibold min-w-48 w-full">{translateTerm('Web.Desc')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/70">
              {displayList.map((item: any) => (
                <tr key={item.id} onClick={() => router.push(`/equip?id=${item.id}`)} className="hover:bg-muted/50 transition-colors group cursor-pointer">
                  <td className="px-4 py-3 font-mono text-primary group-hover:underline">{item.id}</td>
                  <td className="px-4 py-3 font-bold whitespace-normal transition-colors group-hover:text-primary/80">{translateTerm(`Equip.Name.${item.id}`, undefined, 1)}</td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-normal">{getTypeLabel(item.type)}</td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-normal max-w-xs" title={translateTerm(`Equip.Desc.${item.id}`, undefined, 1)}>
                    <div className="line-clamp-2">{translateTerm(`Equip.Desc.${item.id}`, undefined, 1)}</div>
                  </td>
                </tr>
              ))}
              {filteredList.length === 0 && (<tr><td colSpan={4} className="px-4 py-12 text-center text-muted-foreground">{translateTerm('Web.Msg.NoData')}</td></tr>)}
            </tbody>
          </table>
        </div>
        {hasMore && (<div className="p-4 border-t border-border/50 bg-muted/20 flex justify-center"><Button variant="outline" onClick={() => setPage(p => p + 1)} className="w-full sm:w-auto min-w-50">{translateTerm('Web.LoadMore')} ({displayList.length} / {filteredList.length})</Button></div>)}
      </div>
    </div>
  );
}

// 開發項目列表元件 (DataTable)
function EvolutionTable({ evolutions }: { evolutions: any[] }) {
  const { translateTerm } = useAppTranslation();

  return (
    <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left whitespace-nowrap">
          <thead className="bg-muted/50 text-muted-foreground border-b border-border/50">
            <tr>
              <th className="px-4 py-3 font-semibold min-w-32">{translateTerm('Web.Id')}</th>
              <th className="px-4 py-3 font-semibold min-w-40">{translateTerm('Web.Name')}</th>
              <th className="px-4 py-3 font-semibold min-w-60 w-full">{translateTerm('Web.Condition')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/70 font-(family-name:--font-script)">
            {evolutions.map((evo: any, i: number) => {
              // 嘗試從 name (如 [*Equip.Name.Knife_11*]) 提取 ID
              const match = typeof evo.name === 'string' ? evo.name.match(/Label\.Equip,([^*]+)/) : null;
              const targetId = match ? match[1] : '-';

              return (
                <tr key={i} className="hover:bg-muted/50 transition-colors group">
                  <td className="px-4 py-3.5 align-top text-primary">
                    {targetId !== '-' ? (
                      <Link href={`/equip?id=${targetId}`} className="hover:underline">
                        {targetId}
                      </Link>
                    ) : targetId}
                  </td>
                  <td className="px-4 py-3.5 align-top text-foreground whitespace-normal">
                    <ParsedText text={evo.name} />
                  </td>
                  <td className="px-4 py-3 text-foreground/80 align-top whitespace-normal">
                    {evo.condition && evo.condition.length > 0 ? (
                      <div className="flex flex-col gap-1.5">
                        {evo.condition.map((cond: string, j: number) => (
                          <div key={j} className="flex items-start gap-1.5">
                            <span className="text-muted-foreground shrink-0 mt-0.5">{j + 1}.</span>
                            <div><ParsedText text={cond} /></div>
                          </div>
                        ))}
                      </div>
                    ) : <span className="text-muted-foreground/50">-</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}