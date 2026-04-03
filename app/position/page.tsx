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
import { ParsedText } from '@/components/shared/ParsedText';
import { TopNavbar } from '@/components/layout/TopNavbar';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from "@/components/ui/button-group";

export default function PositionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-muted-foreground tracking-widest animate-pulse">Loading...</div>}>
      <PositionContent />
    </Suspense>
  );
}

function PositionContent() {

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
  const { data, isLoading, isError } = useItemDetail('position', query.id);

  // i18n解析邏輯
  const { translateTerm, translateParagraph, translateTermWithParam } = useAppTranslation();

  // 側邊欄開啟狀態
  const isOpen = useSidebarStore(state => state.isOpen);

  // 相容兩種結構(所有/單一)
  const detailData = isListView ? null : (data?.period ? data : data?.[query.id]);

  if (!mounted) return null;

  return (
    <main className={`min-h-screen bg-background text-foreground pb-20 transition-[padding] duration-300 ease-in-out ${isOpen ? 'md:pr-128 lg:pr-144' : ''}`}>
      {/* 頂部固定導覽列 */}
      <TopNavbar />

      {/* 主要閱讀區塊 */}
      <div className="max-w-5xl mx-auto px-6 space-y-6">
        {isLoading && (
          <div className="text-center text-muted-foreground py-10 tracking-widest animate-pulse">
            {translateTermWithParam('Web.Msg.Loading', 'Position')}
          </div>
        )}
        {isError && (
          <div className="text-center text-destructive py-10 bg-destructive/10 rounded-md">
            {translateTermWithParam('Web.Msg.LoadError', 'Position')}
          </div>
        )}

        {/* 列表模式 */}
        {!isLoading && !isError && isListView && data && (
          <DataList data={data} />
        )}

        {/* 單一地點內容模式 */}
        {!isLoading && !isError && !isListView && detailData ? (
          <div className="flex flex-col gap-8">

            {/* 基本資訊 */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-border/50 pb-2">
                <h2 className="text-lg font-bold">{translateTermWithParam('Web.Info', 'Web.Label.Position')}</h2>
                <div className="flex items-center">
                  <Button asChild variant="outline" size="sm" className="h-8 px-2.5 text-xs">
                    <Link href="/position">
                      <TableProperties className="mr-1.5 size-3.5 rotate-180 text-muted-foreground" />
                      {translateTerm('Web.ReturnList')}
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="p-5 border rounded-xl shadow-sm bg-card">
                <div className="space-y-4">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">{translateTerm('Web.Id')}</div>
                    <div className="font-semibold text-foreground">
                      {query.id}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-border/50 pt-4">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">{translateTerm('Web.Period')}</div>
                      <div className="font-semibold text-sm text-foreground">
                        <ParsedText text={translateParagraph(detailData.period)} />
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">{translateTerm('Web.Label.Position')}</div>
                      <div className="font-semibold text-sm text-foreground">
                        <ParsedText text={translateParagraph(detailData.position)} />
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">{translateTerm('Web.Action')}</div>
                      <div className="font-semibold text-sm text-foreground">
                        <ParsedText text={translateParagraph(detailData.action)} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 事件列表 */}
            {detailData.event && Object.keys(detailData.event).length > 0 && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-border/50 pb-2">
                  <h2 className="text-lg font-bold">{translateTermWithParam('Web.List', 'Web.Label.Event')}</h2>
                </div>
                <EventTable events={detailData.event} />
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
            {translateTermWithParam('Web.NotFound', 'Web.Label.Position')}
          </div>
        )}
      </div>
    </main>
  );
}

// 地點列表元件 (DataTable)
function DataList({ data }: { data: Record<string, any> | any[] }) {
  const router = useRouter();
  const { translateTerm, translateParagraph, translateTermWithParam } = useAppTranslation();
  const [searchInput, setSearchInput] = useState('');
  const [searchTarget, setSearchTarget] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 100;

  // 緩存清單並排序
  const list = useMemo(() => {
    if (!data) return [];
    const rawList = Array.isArray(data) ? data : Object.entries(data).map(([id, val]: any) => ({
      id,
      ...(typeof val === 'object' ? val : {})
    }));

    // 依據 orderKey 進行排序
    return rawList.sort((a, b) => (a.orderKey || 9999) - (b.orderKey || 9999));
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
        const idText = (item.id || '').toLowerCase();
        const periodText = translateParagraph(item.period || '').toLowerCase();
        const positionText = translateParagraph(item.position || '').toLowerCase();
        const actionText = translateParagraph(item.action || '').toLowerCase();
        const searchText = translateParagraph(item.searchText || '').toLowerCase();

        return {
          ...item,
          _searchString: `${idText} ${periodText} ${positionText} ${actionText} ${searchText}`
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
      const targetString = item._searchString || `${item.id} ${translateParagraph(item.period)} ${translateParagraph(item.position)} ${translateParagraph(item.action)}`.toLowerCase();
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
          <h2 className="text-lg font-bold">{translateTermWithParam('Web.List', 'Web.Label.Position')}</h2>
          {isBuildingCache && <span className="text-xs text-muted-foreground animate-pulse">({translateTerm('Web.Msg.BuildingCache')})</span>}
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <ButtonGroup className="flex-1">
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
                <th className="px-4 py-3 font-semibold min-w-24">{translateTerm('Web.Period')}</th>
                <th className="px-4 py-3 font-semibold min-w-24">{translateTerm('Web.Position')}</th>
                <th className="px-4 py-3 font-semibold min-w-24">{translateTerm('Web.Action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/70">
              {displayList.map((item: any) => (
                <tr key={item.id} onClick={() => router.push(`/position?id=${item.id}`)} className="hover:bg-muted/50 transition-colors group cursor-pointer">
                  <td className="px-4 py-3 font-mono text-primary group-hover:underline">{item.id}</td>
                  <td className="px-4 py-3 text-muted-foreground">{translateParagraph(item.period)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{translateParagraph(item.position) || '-'}</td>
                  <td className="px-4 py-3 text-foreground">{translateParagraph(item.action)}</td>
                </tr>
              ))}
              {filteredList.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-12 text-center text-muted-foreground">{translateTerm('Web.Msg.NoData')}</td></tr>
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

// 事件列表元件 (DataTable)
function EventTable({ events }: { events: Record<string, any> }) {
  const { translateTerm, translateParagraph } = useAppTranslation();

  return (
    <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left whitespace-nowrap">
          <thead className="bg-muted/50 text-muted-foreground border-b border-border/50">
            <tr>
              <th className="px-4 py-3 font-semibold min-w-10">{translateTerm('Web.Class')}</th>
              <th className="px-4 py-3 font-semibold min-w-60">{translateTerm('Web.Condition')}</th>
              <th className="px-4 py-3 font-semibold min-w-48">{translateTerm('Web.Rate')}</th>
              <th className="px-4 py-3 font-semibold min-w-48">{translateTerm('Web.Label.Script')}</th>
            </tr>
          </thead>
          {Object.entries(events).sort(([idA], [idB]) => idA.localeCompare(idB)).map(([eventId, eventData]: [string, any]) => {
            const classId = eventId.charAt(0);
            const hasRemark = eventData.remark && eventData.remark.length > 0;
            return (
              <tbody key={eventId} className="border-b border-border/70 last:border-b-0 group font-(family-name:--font-script)">
                <tr className="transition-colors group-hover:bg-muted/50">
                  <td className="px-4 py-3.5 align-top">{translateTerm(`Position.Class.${classId}`)}</td>
                  <td className="px-4 py-3 text-foreground/80 align-top">
                    {eventData.condition && eventData.condition.length > 0 ? (
                      <div className="flex flex-col gap-1.5">
                        {eventData.condition.map((cond: string, i: number) => (
                          <div key={i}><span className="text-muted-foreground">{i + 1}.</span><ParsedText text={cond} /></div>
                        ))}
                      </div>
                    ) : <span className="text-muted-foreground/50">-</span>}
                  </td>
                  <td className="px-4 py-3 text-foreground/80 align-top">
                    {eventData.rate && eventData.rate.length > 0 ? (
                      <div className="flex flex-col gap-1.5">
                        {eventData.rate.map((rate: string, i: number) => (
                          <div key={i}><ParsedText text={rate} /></div>
                        ))}
                      </div>
                    ) : <span className="text-muted-foreground/50">-</span>}
                  </td>
                  <td className="px-4 py-3.5 align-top">
                    {eventData.script ? (
                      <div className="flex flex-col gap-1.5">
                        <div>
                          <ParsedText text={`[*Label.Script,${eventData.script}*]`} />
                        </div>
                        <div className="ml-4.5">({translateTerm(`Script.Name.${eventData.script}`)})</div>
                      </div>
                    ) : <span className="text-muted-foreground/50">-</span>}
                  </td>
                </tr>
                {hasRemark && (
                  <tr className="transition-colors group-hover:bg-muted/50">
                    <td colSpan={4} className="px-3 pb-3 pt-0 align-top whitespace-normal">
                      <div className="flex flex-col gap-1 text-amber-700 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/20 px-3 py-2 rounded-md border border-amber-200/50 dark:border-amber-900/50">
                        {eventData.remark.map((r: string, i: number) => (
                          <div key={i}>{translateParagraph(r)}</div>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            );
          })}
        </table>
      </div>
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
        {translateTerm(`Web.Rel.${phase}`, undefined, 1)}
      </h3>
      <div className="flex flex-col gap-3 text-sm">

        {/* 關聯項目類別 */}
        {Object.entries(types).map(([type, ids]: [string, any]) => {
          if (!Array.isArray(ids) || ids.length === 0) return null;
          return (
            <div key={type} className="flex flex-col sm:flex-row gap-2 sm:gap-4 border-b border-border/40 pb-3 last:border-0 last:pb-0">
              <span className="font-semibold text-muted-foreground w-18 shrink-0">{translateTerm(`Web.Label.${type}`)}</span>
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