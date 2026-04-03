/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, Suspense, useMemo } from 'react';
import { useQueryStates, parseAsString } from 'nuqs';
import { CircleArrowRight, Search, TableProperties, ChevronDown, Minus } from 'lucide-react';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import { useItemDetail } from '@/hooks/queries/useItemDetail';
import { useSidebarStore } from '@/store/useSidebarStore';
import { DataRelation } from '@/components/shared/DataRelation';
import { ParsedText } from '@/components/shared/ParsedText';
import { TopNavbar } from '@/components/layout/TopNavbar';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from "@/components/ui/button-group";

export default function CombatPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-muted-foreground tracking-widest animate-pulse">Loading...</div>}>
      <CombatContent />
    </Suspense>
  );
}

function CombatContent() {

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
  const { data, isLoading, isError } = useItemDetail('combat', query.id);

  // 相容兩種結構(所有/單一)
  const detailData = isListView ? null : (data?.content ? data : data?.[query.id]);

  // 目標內容資料
  const contentArray = detailData?.content || [];

  // i18n解析邏輯
  const { translateTerm, translateParagraph, translateTermWithParam } = useAppTranslation();

  // 側邊欄開啟狀態
  const isOpen = useSidebarStore(state => state.isOpen);

  if (!mounted) return null;

  return (
    <main className={`min-h-screen bg-background text-foreground pb-20 transition-[padding] duration-300 ease-in-out ${isOpen ? 'md:pr-128 lg:pr-144' : ''}`}>
      {/* 頂部固定導覽列 */}
      <TopNavbar />

      {/* 主要閱讀區塊 */}
      <div className="max-w-5xl mx-auto px-6 space-y-6">
        {isLoading && (
          <div className="text-center text-muted-foreground py-10 tracking-widest animate-pulse">
            {translateTermWithParam('Web.Msg.Loading', 'Combat')}
          </div>
        )}
        {isError && (
          <div className="text-center text-destructive py-10 bg-destructive/10 rounded-md">
            {translateTermWithParam('Web.Msg.LoadError', 'Combat')}
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
                <h2 className="text-lg font-bold">{translateTermWithParam('Web.Info', 'Combat')}</h2>
                <div className="flex items-center">
                  <Button asChild variant="outline" size="sm" className="h-8 px-2.5 text-xs">
                    <Link href="/combat">
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
                        {translateTerm(`Combat.Name.${query.id}`)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">{translateTerm('Web.Enemy')}</div>
                      <div className="font-semibold text-foreground">
                        {translateParagraph(detailData.enemy)}
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-border/50 pt-4">
                    <div className="text-xs text-muted-foreground mb-1">{translateTerm('Web.Desc')}</div>
                    <div className="text-sm leading-relaxed text-foreground">
                      {translateTerm(`Combat.Desc.${query.id}`) || translateTerm('System.NA')}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 內容分支 */}
            {contentArray.length > 0 && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center border-b border-border/50 pb-2">
                  <h2 className="text-lg font-bold">{translateTerm('Web.Content')}</h2>
                </div>
                <div className="bg-card border rounded-xl p-5 shadow-sm overflow-x-auto font-(family-name:--font-script)">
                  <div className="flex flex-col p-0 m-0 min-w-max sm:min-w-0">
                    {contentArray.map((node: any, idx: number) => (
                      <DataContent key={idx} node={node} />
                    ))}
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
            {translateTermWithParam('Web.NotFound', 'Combat')}
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

  // 非同步建置搜尋快取
  const [searchableList, setSearchableList] = useState<any[]>([]);
  const [isBuildingCache, setIsBuildingCache] = useState(false);

  useEffect(() => {
    if (!list || list.length === 0) return;
    setIsBuildingCache(true);

    const timer = setTimeout(() => {
      const mapped = list.map((item: any) => {
        const id = item.id || '';
        const idText = id.toLowerCase();
        const nameText = translateTerm(`Combat.Name.${id}`, undefined, 1).toLowerCase();
        const descText = translateTerm(`Combat.Desc.${id}`, undefined, 1).toLowerCase();
        const enemyText = translateParagraph(item.enemy || '').toLowerCase();
        const searchText = translateParagraph(item.searchText || '').toLowerCase();

        return {
          ...item,
          _searchString: `${idText} ${nameText} ${descText} ${enemyText} ${searchText}`
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

    // 支援多關鍵字
    const searchTerms = searchLower.split(/\s+/).filter(Boolean);

    return sourceList.filter((item: any) => {
      const targetString = item._searchString || `${item.id} ${translateTerm(`Combat.Name.${item.id}`)} ${translateTerm(`Combat.Desc.${item.id}`)} ${translateParagraph(item.enemy)}`.toLowerCase();
      return searchTerms.every(term => targetString.includes(term));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchableList, list, searchTarget]);

  const displayList = useMemo(() => {
    return filteredList.slice(0, page * itemsPerPage);
  }, [filteredList, page]);
  const hasMore = displayList.length < filteredList.length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/50 pb-2">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold">{translateTermWithParam('Web.List', 'Combat')}</h2>
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
                <th className="px-4 py-3 font-semibold min-w-40">{translateTerm('Web.Name')}</th>
                <th className="px-4 py-3 font-semibold min-w-32">{translateTerm('Web.Enemy')}</th>
                <th className="px-4 py-3 font-semibold min-w-50 w-full">{translateTerm('Web.Desc')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/70">
              {displayList.map((item: any) => (
                <tr key={item.id} onClick={() => router.push(`/combat?id=${item.id}`)} className="hover:bg-muted/50 transition-colors group cursor-pointer">
                  <td className="px-4 py-3 font-mono text-primary group-hover:underline">{item.id}</td>
                  <td className="px-4 py-3 font-bold whitespace-normal transition-colors group-hover:text-primary/80">
                    {translateTerm(`Combat.Name.${item.id}`, undefined, 1)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-normal">
                    {translateParagraph(item.enemy)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-normal max-w-xs" title={translateTerm(`Combat.Desc.${item.id}`, undefined, 1)}>
                    <div className="line-clamp-2">{translateTerm(`Combat.Desc.${item.id}`, undefined, 1)}</div>
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
        {node.branches?.map((branch: any, idx: number) => (
          <BranchItem key={idx} branch={branch} />
        ))}
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

// 分岐項目
function BranchItem({ branch }: { branch: any }) {

  const isSingleEffect = branch.content?.length === 1 && branch.content[0].form === 'effect';
  const effectItems = isSingleEffect && typeof branch.content[0].text === 'string' ? branch.content[0].text.split(' / ') : [];

  return (
    <div className="flex flex-col">
      <div
        className={`flex items-start py-0.5 -mx-0.5 gap-1 font-semibold text-sm/loose rounded-md transition-colors hover:bg-muted/80 ${isSingleEffect ? '' : 'cursor-pointer'}`}
        onClick={() => {
          if (typeof window !== 'undefined' && window.getSelection()?.toString().length) return;
        }}
      >
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