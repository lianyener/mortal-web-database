/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, Suspense, useMemo } from 'react';
import { Search } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import { useItemDetail } from '@/hooks/queries/useItemDetail';
import { useSidebarStore } from '@/store/useSidebarStore';
import { TopNavbar } from '@/components/layout/TopNavbar';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';

export default function EndPage() {
  return (
    <Suspense fallback={<div className='min-h-screen flex items-center justify-center text-muted-foreground tracking-widest animate-pulse'>Loading...</div>}>
      <EndContent />
    </Suspense>
  );
}

function EndContent() {
  const { translateTermWithParam } = useAppTranslation();
  const { data, isLoading, isError } = useItemDetail('end', 'all');

  const isOpen = useSidebarStore((state) => state.isOpen);

  return (
    <main className={`min-h-screen bg-background text-foreground pb-20 transition-[padding] duration-300 ease-in-out ${isOpen ? 'md:pr-128 lg:pr-144' : ''}`}>
      {/* 頂部固定導覽列 */}
      <TopNavbar />

      {/* 主要閱讀區塊 */}
      <div className='max-w-5xl mx-auto px-6 space-y-6 transition-all duration-300'>
        {isLoading && <div className='text-center text-muted-foreground py-10 tracking-widest animate-pulse'>{translateTermWithParam('Web.Msg.Loading', 'End')}</div>}
        {isError && <div className='text-center text-destructive py-10 bg-destructive/10 rounded-md'>{translateTermWithParam('Web.Msg.LoadError', 'End')}</div>}

        {/* 列表模式 */}
        {!isLoading && !isError && data && <DataList data={data} />}
        {!isLoading && !isError && !data && <div className='text-center text-muted-foreground py-10'>{translateTermWithParam('Web.Msg.NotFound', 'End')}</div>}
      </div>
    </main>
  );
}

// 列表元件
function DataList({ data }: { data: Record<string, any> | any[] }) {
  const { translateTerm, translateTermWithParam } = useAppTranslation();
  const [searchInput, setSearchInput] = useState('');
  const [searchTarget, setSearchTarget] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 100;

  // 緩存清單
  const list = useMemo(() => {
    if (!data) return [];
    const arr = Object.entries(data).map(([id, val]: any) => ({ id, ...(typeof val === 'object' ? val : {}) }));
    return arr.sort((a, b) => a.id.localeCompare(b.id));
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
      const targetString = `${item.id} ${translateTerm(`Library.Title.${item.id}`, undefined, 0)} ${translateTerm(`Library.Desc.${item.id}`, undefined, 0)}`.toLowerCase();
      return searchTerms.every((term) => targetString.includes(term));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list, searchTarget]);

  // 分頁顯示
  const displayList = useMemo(() => {
    return filteredList.slice(0, page * itemsPerPage);
  }, [filteredList, page]);
  const hasMore = displayList.length < filteredList.length;

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex flex-wrap items-center justify-between gap-4 border-b border-border/50 pb-2'>
        <div className='flex items-center gap-2'>
          <h2 className='text-lg font-bold'>{translateTermWithParam('Web.List', 'End')}</h2>
        </div>
        <div className='flex flex-wrap items-center gap-2 w-full sm:w-auto'>
          {/* 搜尋框 */}
          <ButtonGroup className='flex-1 xl:flex-none'>
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
                <th className='px-4 py-3 font-semibold min-w-20'>{translateTerm('Web.Id')}</th>
                <th className='px-4 py-3 font-semibold min-w-48'>{translateTerm('Web.Name')}</th>
                <th className='px-4 py-3 font-semibold min-w-64 w-full'>{translateTerm('Web.Desc')}</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-border/70'>
              {displayList.map((item: any) => (
                <tr key={item.id} className='relative hover:bg-muted/50 transition-colors group cursor-pointer'>
                  <td className='p-0 w-0 h-0'>
                    <Link href={`/end/${item.id}`} className='absolute inset-0 z-10' aria-hidden='true' />
                  </td>
                  <td className='px-4 py-3 font-mono text-primary group-hover:underline'>{item.id}</td>
                  <td className='px-4 py-3 font-bold whitespace-normal transition-colors group-hover:text-primary/80'>{translateTerm(`Library.Title.${item.id}`, undefined, 1)}</td>
                  <td className='px-4 py-3 text-muted-foreground whitespace-normal max-w-sm font-mixed' title={translateTerm(`Library.Desc.${item.id}`, undefined, 1)}>
                    <div className='line-clamp-2'>{translateTerm(`Library.Desc.${item.id}`, undefined, 1)}</div>
                  </td>
                </tr>
              ))}
              {filteredList.length === 0 && (
                <tr>
                  <td colSpan={4} className='px-4 py-12 text-center text-muted-foreground'>
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
