/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect, Suspense, useMemo } from 'react';
import { Search, Eye, EyeOff } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import { useItemDetail } from '@/hooks/queries/useItemDetail';
import { useSidebarStore } from '@/store/useSidebarStore';
import { TopNavbar } from '@/components/layout/TopNavbar';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function TriggerPage() {
  return (
    <Suspense fallback={<div className='min-h-screen flex items-center justify-center text-muted-foreground tracking-widest animate-pulse'>Loading...</div>}>
      <TriggerContent />
    </Suspense>
  );
}

function TriggerContent() {
  const { translateTermWithParam } = useAppTranslation();
  const { data, isLoading, isError } = useItemDetail('trigger', 'all');

  const isOpen = useSidebarStore((state) => state.isOpen);

  return (
    <main className={`min-h-screen bg-background text-foreground pb-20 transition-[padding] duration-300 ease-in-out ${isOpen ? 'md:pr-128 lg:pr-144' : ''}`}>
      {/* 頂部固定導覽列 */}
      <TopNavbar />

      {/* 主要閱讀區塊 */}
      <div className='max-w-5xl mx-auto px-6 space-y-6 transition-all duration-300'>
        {isLoading && <div className='text-center text-muted-foreground py-10 tracking-widest animate-pulse'>{translateTermWithParam('Web.Msg.Loading', 'Trigger')}</div>}
        {isError && <div className='text-center text-destructive py-10 bg-destructive/10 rounded-md'>{translateTermWithParam('Web.Msg.LoadError', 'Trigger')}</div>}

        {/* 列表模式 */}
        {!isLoading && !isError && data && <DataList data={data} />}
        {!isLoading && !isError && !data && <div className='text-center text-muted-foreground py-10'>{translateTermWithParam('Web.Msg.NotFound', 'Trigger')}</div>}
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

  // 篩選器狀態
  const [activeOnly, setActiveOnly] = useState(true);
  const [typeFilter, setTypeFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('all');
  const [stageFilter, setStageFilter] = useState('all');

  // 緩存清單並以 orderKey 排序
  const list = useMemo(() => {
    if (!data) return [];
    const arr = Object.entries(data).map(([id, val]: any) => ({ id, ...(typeof val === 'object' ? val : {}) }));
    return arr.sort((a, b) => (a.orderKey || '').localeCompare(b.orderKey || ''));
  }, [data]);

  // 篩選選項
  const typeOptions = ['Main', 'Sub', 'Free'];
  const yearOptions = Array.from(Array(4).keys(), (n) => String(n + 1));
  const monthOptions = Array.from(Array(12).keys(), (n) => String(n + 1));
  const stageOptions = Array.from(Array(3).keys(), (n) => String(n + 1));

  // Helper: 格式化時間
  const formatTime = (timeObj: any) => {
    if (!timeObj || (!timeObj.year && !timeObj.month && !timeObj.stage)) return translateTerm('System.NA');
    const y = timeObj.year || '';
    const m = timeObj.month || '';
    const s = timeObj.stage || '';
    return translateParagraph(`[*Custom.GameTimeText,${y},${m},${s}*]`);
  };

  // 執行搜尋
  const handleSearch = () => {
    setSearchTarget(searchInput);
    setPage(1);
  };

  // 篩選變更時回到第一頁
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1);
  }, [activeOnly, typeFilter, yearFilter, monthFilter, stageFilter]);

  // 過濾清單
  const filteredList = useMemo(() => {
    let sourceList = list;

    if (activeOnly) sourceList = sourceList.filter((item: any) => item.active === true && (item.script || item.content.length > 0));
    if (typeFilter !== 'all') sourceList = sourceList.filter((item: any) => item.type === typeFilter);
    if (yearFilter !== 'all') sourceList = sourceList.filter((item: any) => parseInt(item.minTime?.year) <= parseInt(yearFilter) && parseInt(item.maxTime?.year || 5) >= parseInt(yearFilter));
    if (monthFilter !== 'all') sourceList = sourceList.filter((item: any) => parseInt(item.minTime?.month) <= parseInt(monthFilter) && parseInt(item.maxTime?.month || 13) >= parseInt(monthFilter));
    if (stageFilter !== 'all') sourceList = sourceList.filter((item: any) => parseInt(item.minTime?.stage) <= parseInt(stageFilter) && parseInt(item.maxTime?.stage || 4) >= parseInt(stageFilter));

    if (!searchTarget) return sourceList;
    const searchLower = searchTarget.trim().toLowerCase();
    const searchTerms = searchLower.split(/\s+/).filter(Boolean);

    return sourceList.filter((item: any) => {
      const targetString = `${item.id} ${translateTerm(`Trigger.Name.${item.id}`)} ${translateTerm(`Trigger.Desc.${item.id}`)} ${translateParagraph(item.searchText)}`.toLowerCase();
      return searchTerms.every((term) => targetString.includes(term));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list, searchTarget, activeOnly, typeFilter, yearFilter, monthFilter, stageFilter]);

  // 分頁顯示
  const displayList = useMemo(() => {
    return filteredList.slice(0, page * itemsPerPage);
  }, [filteredList, page]);
  const hasMore = displayList.length < filteredList.length;

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex flex-wrap items-center justify-between gap-4 border-b border-border/50 pb-2'>
        <div className='flex items-center gap-2'>
          <h2 className='text-lg font-bold'>{translateTermWithParam('Web.List', 'Trigger')}</h2>
        </div>
        <div className='flex flex-wrap items-center gap-2 w-full lg:w-auto'>
          {/* 狀態切換按鈕 */}
          <Button
            variant={activeOnly ? 'default' : 'outline'}
            size='sm'
            onClick={() => setActiveOnly(!activeOnly)}
            className='h-8 px-2.5 text-sm'
            title={activeOnly ? translateTerm('Web.ShowInactive') : translateTerm('Web.HideInactive')}
          >
            {activeOnly ? <Eye className='mr-1.5 size-3.5' /> : <EyeOff className='mr-1.5 size-3.5' />}
            {activeOnly ? translateTerm('Web.ActiveOnly') : translateTerm('Web.Term.All')}
          </Button>

          {/* 類型篩選 */}
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className='h-8! text-sm min-w-28 hover:bg-muted/50 transition-colors'>
              <SelectValue placeholder={translateTerm('Web.Type')} />
            </SelectTrigger>
            <SelectContent className='min-w-28' position='popper'>
              <SelectItem value='all'>
                {translateTerm('Web.Type')} - {translateTerm('Web.Term.All')}
              </SelectItem>
              {typeOptions.map((o) => (
                <SelectItem key={o} value={o}>
                  {translateTerm(`Web.Label.${o}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* 年份篩選 */}
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className='h-8! text-sm min-w-18 hover:bg-muted/50 transition-colors'>
              <SelectValue placeholder={translateTerm('Web.Term.Year')} />
            </SelectTrigger>
            <SelectContent className='min-w-18' position='popper'>
              <SelectItem value='all'>{translateTerm('Web.Term.Year')}</SelectItem>
              {yearOptions.map((o) => (
                <SelectItem key={o} value={o}>
                  {translateParagraph(`[*System.Number_${o}*][*Web.Term.Year*]`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* 月份篩選 */}
          <Select value={monthFilter} onValueChange={setMonthFilter}>
            <SelectTrigger className='h-8! text-sm min-w-18 hover:bg-muted/50 transition-colors'>
              <SelectValue placeholder={translateTerm('Web.Term.Month')} />
            </SelectTrigger>
            <SelectContent className='min-w-18' position='popper'>
              <SelectItem value='all'>{translateTerm('Web.Term.Month')}</SelectItem>
              {monthOptions.map((o) => (
                <SelectItem key={o} value={o}>
                  {translateTerm(`System.Month_${o}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* 階段篩選 */}
          <Select value={stageFilter} onValueChange={setStageFilter}>
            <SelectTrigger className='h-8! text-sm min-w-18 hover:bg-muted/50 transition-colors'>
              <SelectValue placeholder={translateTerm('Web.Term.Stage')} />
            </SelectTrigger>
            <SelectContent className='min-w-18' position='popper'>
              <SelectItem value='all'>{translateTerm('Web.Term.Stage')}</SelectItem>
              {stageOptions.map((o) => (
                <SelectItem key={o} value={o}>
                  {translateTerm(`System.Stage_${o}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

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
                <th className='px-4 py-3 font-semibold min-w-24'>{translateTerm('Web.Name')}</th>
                <th className='px-4 py-3 font-semibold min-w-20'>{translateTerm('Web.Type')}</th>
                <th className='px-4 py-3 font-semibold min-w-32'>{translateTerm('Web.MinTime')}</th>
                <th className='px-4 py-3 font-semibold min-w-32'>{translateTerm('Web.MaxTime')}</th>
                <th className='px-4 py-3 font-semibold min-w-32'>{translateTerm('Web.Desc')}</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-border/70'>
              {displayList.map((item: any) => (
                <tr key={item.id} className={`relative hover:bg-muted/50 transition-colors group cursor-pointer ${!item.active ? 'opacity-50 grayscale hover:opacity-100 hover:grayscale-0' : ''}`}>
                  <td className='p-0 w-0 h-0'>
                    <Link href={`/trigger/${item.id}`} className='absolute inset-0 z-10' aria-hidden='true' />
                  </td>
                  <td className='px-4 py-3 font-mono text-primary group-hover:underline'>{item.id}</td>
                  <td className='px-4 py-3 font-bold whitespace-normal transition-colors group-hover:text-primary/80'>{translateTerm(`Trigger.Name.${item.id}`, undefined, 1)}</td>
                  <td className='px-4 py-3 text-muted-foreground'>{translateTerm(`Web.Label.${item.type}`)}</td>
                  <td className='px-4 py-3 text-muted-foreground'>{formatTime(item.minTime)}</td>
                  <td className='px-4 py-3 text-muted-foreground'>{formatTime(item.maxTime)}</td>
                  <td className='px-4 py-3 text-muted-foreground whitespace-normal max-w-xs' title={translateTerm(`Trigger.Desc.${item.id}`, undefined, 1)}>
                    <div className='line-clamp-2'>{translateTerm(`Trigger.Desc.${item.id}`, undefined, 1)}</div>
                  </td>
                </tr>
              ))}
              {filteredList.length === 0 && (
                <tr>
                  <td colSpan={7} className='px-4 py-12 text-center text-muted-foreground'>
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
