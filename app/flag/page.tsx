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

export default function FlagPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-muted-foreground tracking-widest animate-pulse">Loading...</div>}>
      <FlagContent />
    </Suspense>
  );
}

function FlagContent() {

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
  const { data, isLoading, isError } = useItemDetail('flag', query.id);

  // 相容結構
  const detailData = isListView ? null : (data?.data ? data : data?.[query.id]);

  // i18n解析邏輯
  const { translateTerm, translateTermWithParam } = useAppTranslation();

  // 側邊欄開啟狀態
  const isOpen = useSidebarStore(state => state.isOpen);

  if (!mounted) return null;

  // 判斷類別(Combat/Battle/Script)取得Script標籤
  const getScriptLabel = (s: string) => {
    if (s.startsWith('CL_')) return `[*Label.Combat,${s}*]`;
    if (s.startsWith('BL_')) return `[*Label.Battle,${s}*]`;
    return `[*Label.Script,${s}*]`;
  };

  return (
    <main className={`min-h-screen bg-background text-foreground pb-20 transition-[padding] duration-300 ease-in-out ${isOpen ? 'md:pr-128 lg:pr-144' : ''}`}>
      {/* 頂部固定導覽列 */}
      <TopNavbar />

      {/* 主要閱讀區塊 */}
      <div className="max-w-5xl mx-auto px-6 space-y-6 transition-all duration-300">
        {isLoading && (
          <div className="text-center text-muted-foreground py-10 tracking-widest animate-pulse">
            {translateTermWithParam('Web.Msg.Loading', 'Flag')}
          </div>
        )}
        {isError && (
          <div className="text-center text-destructive py-10 bg-destructive/10 rounded-md">
            {translateTermWithParam('Web.Msg.LoadError', 'Flag')}
          </div>
        )}

        {/* 列表模式 */}
        {!isLoading && !isError && isListView && data && (
          <DataList data={data} />
        )}

        {/* 單一內容模式 */}
        {!isLoading && !isError && !isListView && detailData ? (
          <div className="flex flex-col gap-8">

            {/* 基本資訊 */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-border/50 pb-2">
                <h2 className="text-lg font-bold">{translateTermWithParam('Web.Info', 'Flag')}</h2>
                <div className="flex items-center">
                  <Button asChild variant="outline" size="sm" className="h-8 px-2.5 text-xs">
                    <Link href="/flag">
                      <TableProperties className="mr-1.5 size-3.5 rotate-180 text-muted-foreground" />
                      {translateTerm('Web.ReturnList')}
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="p-5 border rounded-xl shadow-sm bg-card">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">{translateTerm('Web.Id')}</div>
                    <div className="font-semibold text-foreground break-all">{query.id}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">{translateTerm('Web.Init')}</div>
                    <div className="font-semibold text-foreground">{detailData.init}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Flag專用資訊清單 */}
            {detailData.data && Array.isArray(detailData.data) && (
              <div className="flex flex-col gap-4 mt-2">
                <h2 className="text-lg font-bold border-b border-border/50 pb-2">{translateTermWithParam('Web.Content', 'Flag')}</h2>
                <div className="grid grid-cols-1 gap-4">
                  {detailData.data.map((item: any, index: number) => {
                    const subName = translateTerm(`Flag.${query.id}.${index}`);
                    const subDesc = translateTerm(`Flag.${query.id}.${index}.Desc`);

                    return (
                      <div key={index} className="p-5 bg-card rounded-xl border shadow-sm hover:border-primary/40 transition-colors">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                          <div className="flex flex-col gap-4">
                            <div className="pb-3 border-b border-border/50">
                              <div className="mb-1.5 text-xs text-muted-foreground">{translateTerm('Web.Scenario')}</div>
                              {item.script && Array.isArray(item.script) && item.script.length > 0 ? (
                                <div className="flex flex-wrap -ml-1 gap-1 text-sm font-(family-name:--font-script)">
                                  {item.script.map((s: string) => (
                                    <ParsedText key={s} text={getScriptLabel(s)} />
                                  ))}
                                </div>
                              ) : (
                                <div className="font-semibold text-muted-foreground text-sm">{translateTerm('Web.DefaultScenario')}</div>
                              )}
                            </div>
                            <div>
                              <div className="mb-1.5 text-xs text-muted-foreground">{translateTermWithParam('Web.Info', 'Flag')}</div>
                              <div className="font-bold text-base text-foreground">{subName}</div>
                              {subDesc && (
                                <div className="mt-1 text-sm/relaxed text-muted-foreground">{subDesc}</div>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col">
                            <div className="mb-1.5 text-xs text-muted-foreground">{translateTerm('Web.ValueDef')}</div>
                            {item.value && Object.keys(item.value).length > 0 ? (
                              <div className="flex flex-col gap-1.5 bg-muted/30 p-3 rounded-md border border-border/50 font-(family-name:--font-script)">
                                {Object.entries(item.value).map(([valKey, valText]: [string, any]) => (
                                  <div key={valKey} className="flex gap-2.5">
                                    <span className="w-8 px-1.5 py-0.5 text-secondary-foreground text-center bg-secondary rounded border border-secondary-foreground/20 shrink-0 font-mono text-xs mt-0.5 flex items-center justify-center min-h-5">{valKey}</span>
                                    <div className="flex-1 py-0.5 text-sm"><ParsedText text={String(valText)} /></div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-md border border-border/50 italic">{translateTerm('Web.NoValueDef')}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
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
            {translateTermWithParam('Web.Msg.NotFound', 'Flag')}
          </div>
        )}
      </div>
    </main>
  );
}

// 列表元件 (DataTable)
function DataList({ data }: { data: Record<string, any> | any[] }) {
  const router = useRouter();
  const { translateTerm, translateTermWithParam } = useAppTranslation();
  const [searchInput, setSearchInput] = useState('');
  const [searchTarget, setSearchTarget] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 100;

  // 緩存清單
  const list = useMemo(() => {
    if (!data) return [];
    const arr = Array.isArray(data) ? data : Object.entries(data).map(([id, val]: any) => ({
      id,
      ...(typeof val === 'object' ? val : {})
    }));

    // 預設以 ID 進行排序
    return arr.sort((a, b) => a.id < b.id ? -1 : 1);
  }, [data]);

  // 執行搜尋
  const handleSearch = () => {
    setSearchTarget(searchInput);
    setPage(1);
  };

  // 過濾清單
  const filteredList = useMemo(() => {
    if (!searchTarget) return list;
    const searchLower = searchTarget.trim().toLowerCase();
    const searchTerms = searchLower.split(/\s+/).filter(Boolean);

    return list.filter((item: any) => {
      const dataString = item.data.reduce((a: string, d: any, i: number) => {
        const valueDef = d.value ? Object.keys(d.value).reduce((aa: string, k: string) => `${aa} ${translateTerm(`Flag.${item.id}.${i}.${k}`)}`, '') : '';
        return `${a} ${translateTerm(`Flag.${item.id}.${i}`)} ${translateTerm(`Flag.${item.id}.${i}.Desc`)} ${valueDef}`;
      }, '');
      const targetString = `${item.id} ${dataString}`.toLowerCase();
      return searchTerms.every(term => targetString.includes(term));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list, searchTarget]);

  const displayList = useMemo(() => {
    return filteredList.slice(0, page * itemsPerPage);
  }, [filteredList, page]);
  const hasMore = displayList.length < filteredList.length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/50 pb-2">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold">{translateTermWithParam('Web.List', 'Flag')}</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <ButtonGroup className="flex-1 xl:flex-none">
            <input
              type="text"
              placeholder={translateTerm('Web.Msg.SearchPlaceholder')}
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
                <th className="px-4 py-3 font-semibold min-w-24">{translateTerm('Web.Id')}</th>
                <th className="px-4 py-3 font-semibold min-w-32">{translateTerm('Web.Name')}</th>
                <th className="px-4 py-3 font-semibold min-w-48">{translateTerm('Web.Desc')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/70">
              {displayList.map((item: any) => (
                <tr key={item.id} onClick={() => router.push(`/flag?id=${item.id}`)} className="hover:bg-muted/50 transition-colors group cursor-pointer">
                  <td className="px-4 py-3 font-mono text-primary group-hover:underline">{item.id}</td>
                  <td className="px-4 py-3 font-bold whitespace-normal transition-colors group-hover:text-primary/80">
                    {translateTerm(`Flag.${item.id}.0`, undefined, 1)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-normal max-w-xs" title={translateTerm(`Flag.${item.id}.0.Desc`, undefined, 1)}>
                    <div className="line-clamp-2">{translateTerm(`Flag.${item.id}.0.Desc`, undefined, 1)}</div>
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