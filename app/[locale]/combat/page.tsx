/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect, Suspense, useMemo } from 'react';
import { Search } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import { useItemDetail } from '@/hooks/queries/useItemDetail';
import { useSidebarStore } from '@/store/useSidebarStore';
import { TopNavbar } from '@/components/layout/TopNavbar';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';

export default function CombatPage() {
  return (
    <Suspense fallback={<div className='min-h-screen flex items-center justify-center text-muted-foreground tracking-widest animate-pulse'>Loading...</div>}>
      <CombatContent />
    </Suspense>
  );
}

function CombatContent() {
  const { translateTermWithParam } = useAppTranslation();
  const { data, isLoading, isError } = useItemDetail('combat', 'all');

  const isOpen = useSidebarStore((state) => state.isOpen);

  return (
    <main className={`min-h-screen bg-background text-foreground pb-20 transition-[padding] duration-300 ease-in-out ${isOpen ? 'md:pr-128 lg:pr-144' : ''}`}>
      {/* 頂部固定導覽列 */}
      <TopNavbar />

      {/* 主要閱讀區塊 */}
      <div className='max-w-5xl mx-auto px-6 space-y-6'>
        {isLoading && <div className='text-center text-muted-foreground py-10 tracking-widest animate-pulse'>{translateTermWithParam('Web.Msg.Loading', 'Combat')}</div>}
        {isError && <div className='text-center text-destructive py-10 bg-destructive/10 rounded-md'>{translateTermWithParam('Web.Msg.LoadError', 'Combat')}</div>}

        {/* 列表模式 */}
        {!isLoading && !isError && data && <DataList data={data} />}
        {!isLoading && !isError && !data && <div className='text-center text-muted-foreground py-10'>{translateTermWithParam('Web.Msg.NotFound', 'Combat')}</div>}
      </div>
    </main>
  );
}

// 列表元件
function DataList({ data }: { data: Record<string, any> | any[] }) {
  const { translateTerm, translateParagraph, translateTermWithParam } = useAppTranslation();
  const [searchInput, setSearchInput] = useState('');
  const [searchTarget, setSearchTarget] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 100;

  // 緩存清單
  const list = useMemo(() => {
    if (!data) return [];
    return Object.entries(data).map(([id, val]: any) => ({ id, ...(typeof val === 'object' ? val : {}) }));
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

        return { ...item, _searchString: `${idText} ${nameText} ${descText} ${enemyText} ${searchText}` };
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
      return searchTerms.every((term) => targetString.includes(term));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchableList, list, searchTarget]);

  const displayList = useMemo(() => {
    return filteredList.slice(0, page * itemsPerPage);
  }, [filteredList, page]);
  const hasMore = displayList.length < filteredList.length;

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex flex-wrap items-center justify-between gap-4 border-b border-border/50 pb-2'>
        <div className='flex items-center gap-2'>
          <h2 className='text-lg font-bold'>{translateTermWithParam('Web.List', 'Combat')}</h2>
          {isBuildingCache && <span className='text-xs text-muted-foreground animate-pulse'>({translateTerm('Web.Msg.BuildingCache')})</span>}
        </div>
        <div className='flex items-center gap-2 w-full sm:w-auto'>
          <ButtonGroup className='flex-1'>
            <input
              type='text'
              placeholder={translateTerm('Web.Msg.SearchPlaceholder')}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearch();
              }}
              className='px-3 text-sm border rounded-md bg-muted/50 focus:outline-none focus:bg-background transition-colors sm:w-64'
            />
            <Button variant='outline' size='sm' onClick={handleSearch} className='px-2'>
              <Search className='size-4 opacity-70' />
            </Button>
          </ButtonGroup>
        </div>
      </div>
      <div className='bg-card border rounded-xl shadow-sm overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm text-left whitespace-nowrap'>
            <thead className='bg-muted/50 text-muted-foreground border-b border-border/50'>
              <tr>
                <th className='p-0 w-0 h-0'></th>
                <th className='px-4 py-3 font-semibold min-w-24'>{translateTerm('Web.Id')}</th>
                <th className='px-4 py-3 font-semibold min-w-24'>{translateTerm('Web.Name')}</th>
                <th className='px-4 py-3 font-semibold min-w-20'>{translateTerm('Web.Enemy')}</th>
                <th className='px-4 py-3 font-semibold min-w-48'>{translateTerm('Web.Desc')}</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-border/70'>
              {displayList.map((item: any) => (
                <tr key={item.id} className='relative hover:bg-muted/50 transition-colors group cursor-pointer'>
                  <td className='p-0 w-0 h-0'>
                    <Link href={`/combat/${item.id}`} className='absolute inset-0 z-10' aria-hidden='true' />
                  </td>
                  <td className='px-4 py-3 font-mono text-primary group-hover:underline'>{item.id}</td>
                  <td className='px-4 py-3 font-bold whitespace-normal transition-colors group-hover:text-primary/80'>{translateTerm(`Combat.Name.${item.id}`, undefined, 1)}</td>
                  <td className='px-4 py-3 text-muted-foreground whitespace-normal'>{translateParagraph(item.enemy)}</td>
                  <td className='px-4 py-3 text-muted-foreground whitespace-normal max-w-xs' title={translateTerm(`Combat.Desc.${item.id}`, undefined, 1)}>
                    <div className='line-clamp-2'>{translateTerm(`Combat.Desc.${item.id}`, undefined, 1)}</div>
                  </td>
                </tr>
              ))}
              {filteredList.length === 0 && (
                <tr>
                  <td colSpan={5} className='px-4 py-12 text-center text-muted-foreground'>
                    {translateTerm('Web.Msg.NoData')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {hasMore && (
          <div className='p-4 border-t border-border/50 bg-muted/20 flex justify-center'>
            <Button variant='outline' onClick={() => setPage((p) => p + 1)} className='w-full sm:w-auto min-w-50 cursor-pointer'>
              {translateTerm('Web.LoadMore')} ({displayList.length} / {filteredList.length})
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}