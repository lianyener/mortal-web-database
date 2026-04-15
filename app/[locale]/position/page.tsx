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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function PositionPage() {
  return (
    <Suspense fallback={<div className='min-h-screen flex items-center justify-center text-muted-foreground tracking-widest animate-pulse'>Loading...</div>}>
      <PositionContent />
    </Suspense>
  );
}

function PositionContent() {
  const { translateTermWithParam } = useAppTranslation();
  const { data, isLoading, isError } = useItemDetail('position', 'all');

  const isOpen = useSidebarStore((state) => state.isOpen);

  return (
    <main className={`min-h-screen bg-background text-foreground pb-20 transition-[padding] duration-300 ease-in-out ${isOpen ? 'md:pr-128 lg:pr-144' : ''}`}>
      {/* 頂部固定導覽列 */}
      <TopNavbar />

      {/* 主要閱讀區塊 */}
      <div className='max-w-5xl mx-auto px-6 space-y-6'>
        {isLoading && <div className='text-center text-muted-foreground py-10 tracking-widest animate-pulse'>{translateTermWithParam('Web.Msg.Loading', 'Position')}</div>}
        {isError && <div className='text-center text-destructive py-10 bg-destructive/10 rounded-md'>{translateTermWithParam('Web.Msg.LoadError', 'Position')}</div>}

        {/* 列表模式 */}
        {!isLoading && !isError && data && <DataList data={data} />}
        {!isLoading && !isError && !data && <div className='text-center text-muted-foreground py-10'>{translateTermWithParam('Web.NotFound', 'Web.Label.Position')}</div>}
      </div>
    </main>
  );
}

// 地點列表元件
function DataList({ data }: { data: Record<string, any> | any[] }) {
  const { translateTerm, translateParagraph, translateTermWithParam } = useAppTranslation();
  const [searchInput, setSearchInput] = useState('');
  const [searchTarget, setSearchTarget] = useState('');
  const [periodFilter, setPeriodFilter] = useState('all');
  const [positionFilter, setPositionFilter] = useState('all');
  const [page, setPage] = useState(1);
  const itemsPerPage = 100;

  // 緩存清單並排序
  const list = useMemo(() => {
    if (!data) return [];
    const rawList = Object.entries(data).map(([id, val]: any) => ({ id, ...(typeof val === 'object' ? val : {}) }));

    return rawList.sort((a, b) => (a.orderKey || 9999) - (b.orderKey || 9999));
  }, [data]);

  // 提取選項
  const { periodOptions, positionOptions } = useMemo(() => {
    const periods = new Set<string>();
    const positions = new Set<string>();
    list.forEach((item: any) => {
      if (item.period) periods.add(item.period);
      if (item.position) positions.add(item.position);
    });
    return { periodOptions: Array.from(periods), positionOptions: Array.from(positions) };
  }, [list]);

  // 執行搜尋
  const handleSearch = () => {
    setSearchTarget(searchInput);
    setPage(1);
  };

  // 切換篩選時回到第一頁
  useEffect(() => {
    setPage(1);
  }, [periodFilter, positionFilter]);

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

        return { ...item, _searchString: `${idText} ${periodText} ${positionText} ${actionText} ${searchText}` };
      });
      setSearchableList(mapped);
      setIsBuildingCache(false);
    }, 10);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list]);

  // 過濾清單
  const filteredList = useMemo(() => {
    let sourceList = searchableList.length > 0 ? searchableList : list;

    // 套用篩選
    if (periodFilter !== 'all') sourceList = sourceList.filter((item: any) => item.period === periodFilter);
    if (positionFilter !== 'all') sourceList = sourceList.filter((item: any) => item.position === positionFilter);

    if (!searchTarget) return sourceList;
    const searchLower = searchTarget.trim().toLowerCase();
    const searchTerms = searchLower.split(/\s+/).filter(Boolean);

    return sourceList.filter((item: any) => {
      // 如果快取還沒建好，降級使用即時比對
      const targetString = item._searchString || `${item.id} ${translateParagraph(item.period)} ${translateParagraph(item.position)} ${translateParagraph(item.action)}`.toLowerCase();
      return searchTerms.every((term) => targetString.includes(term));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchableList, list, searchTarget, periodFilter, positionFilter]);

  // 分頁顯示
  const displayList = useMemo(() => {
    return filteredList.slice(0, page * itemsPerPage);
  }, [filteredList, page]);
  const hasMore = displayList.length < filteredList.length;

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex flex-wrap items-center justify-between gap-4 border-b border-border/50 pb-2'>
        <div className='flex items-center gap-2'>
          <h2 className='text-lg font-bold'>{translateTermWithParam('Web.List', 'Web.Label.Position')}</h2>
          {isBuildingCache && <span className='text-xs text-muted-foreground animate-pulse'>({translateTerm('Web.Msg.BuildingCache')})</span>}
        </div>
        <div className='flex flex-wrap items-center gap-2 w-full md:w-auto'>
          {/* 時期篩選 */}
          <Select value={periodFilter} onValueChange={setPeriodFilter}>
            <SelectTrigger className='h-8! text-sm min-w-32 max-w-48 truncate hover:bg-muted/50 transition-colors'>
              <SelectValue placeholder={translateTerm('Web.Period')} />
            </SelectTrigger>
            <SelectContent className='min-w-32' position='popper'>
              <SelectItem value='all'>
                {translateTerm('Web.Period')} - {translateTerm('Web.Term.All')}
              </SelectItem>
              {periodOptions.map((o) => (
                <SelectItem key={o} value={o}>
                  {translateParagraph(o)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* 地點篩選 */}
          <Select value={positionFilter} onValueChange={setPositionFilter}>
            <SelectTrigger className='h-8! text-sm min-w-32 max-w-48 truncate hover:bg-muted/50 transition-colors'>
              <SelectValue placeholder={translateTerm('Web.Position')} />
            </SelectTrigger>
            <SelectContent className='min-w-28' position='popper'>
              <SelectItem value='all'>
                {translateTerm('Web.Position')} - {translateTerm('Web.Term.All')}
              </SelectItem>
              {positionOptions.map((o) => (
                <SelectItem key={o} value={o}>
                  {translateParagraph(o)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <ButtonGroup className='flex-1 xl:flex-none'>
            <input
              type='text'
              placeholder={translateTerm('Web.Msg.SearchPlaceholder')}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearch();
              }}
              className='px-3 text-sm border rounded-md bg-muted/50 focus:outline-none focus:bg-background transition-colors sm:w-48'
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
                <th className='px-4 py-3 font-semibold min-w-24'>{translateTerm('Web.Period')}</th>
                <th className='px-4 py-3 font-semibold min-w-24'>{translateTerm('Web.Position')}</th>
                <th className='px-4 py-3 font-semibold min-w-24'>{translateTerm('Web.Action')}</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-border/70'>
              {displayList.map((item: any) => (
                <tr key={item.id} className='relative hover:bg-muted/50 transition-colors group cursor-pointer'>
                  <td className='p-0 w-0 h-0'>
                    <Link href={`/position/${item.id}`} className='absolute inset-0 z-10' aria-hidden='true' />
                  </td>
                  <td className='px-4 py-3 font-mono text-primary group-hover:underline'>{item.id}</td>
                  <td className='px-4 py-3 text-muted-foreground'>{translateParagraph(item.period)}</td>
                  <td className='px-4 py-3 text-muted-foreground'>{translateParagraph(item.position) || '-'}</td>
                  <td className='px-4 py-3 text-foreground'>{translateParagraph(item.action)}</td>
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

        {/* 載入更多按鈕 */}
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
