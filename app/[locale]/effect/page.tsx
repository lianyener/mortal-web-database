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

export default function EffectPage() {
  return (
    <Suspense fallback={<div className='min-h-screen flex items-center justify-center text-muted-foreground tracking-widest animate-pulse'>Loading...</div>}>
      <EffectContent />
    </Suspense>
  );
}

function EffectContent() {
  const { translateTermWithParam } = useAppTranslation();
  const { data, isLoading, isError } = useItemDetail('effect', 'all');

  const isOpen = useSidebarStore((state) => state.isOpen);

  return (
    <main className={`min-h-screen bg-background text-foreground pb-20 transition-[padding] duration-300 ease-in-out ${isOpen ? 'md:pr-128 lg:pr-144' : ''}`}>
      {/* 頂部固定導覽列 */}
      <TopNavbar />

      {/* 主要閱讀區塊 */}
      <div className='max-w-5xl mx-auto px-6 space-y-6 transition-all duration-300'>
        {isLoading && <div className='text-center text-muted-foreground py-10 tracking-widest animate-pulse'>{translateTermWithParam('Web.Msg.Loading', 'Effect')}</div>}
        {isError && <div className='text-center text-destructive py-10 bg-destructive/10 rounded-md'>{translateTermWithParam('Web.Msg.LoadError', 'Effect')}</div>}

        {/* 列表模式 */}
        {!isLoading && !isError && data && <DataList data={data} />}
        {!isLoading && !isError && !data && <div className='text-center text-muted-foreground py-10'>{translateTermWithParam('Web.Msg.NotFound', 'Effect')}</div>}
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

  // 篩選器狀態
  const [showOnly, setShowOnly] = useState(true);
  const [stateFilter, setStateFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // 緩存清單並取得所有選項
  const list = useMemo(() => {
    if (!data) return [];
    const arr = Object.entries(data).map(([id, val]: any) => ({ id, ...(typeof val === 'object' ? val : {}) }));
    return arr.sort((a, b) => a.id.localeCompare(b.id));
  }, [data]);

  // 動態取得所有狀態與類型選項
  const stateOptions = useMemo(() => Array.from(new Set(list.map((item) => item.state).filter(Boolean))), [list]);
  const typeOptions = useMemo(() => Array.from(new Set(list.map((item) => item.type).filter(Boolean))), [list]);

  // 執行搜尋
  const handleSearch = () => {
    setSearchTarget(searchInput);
    setPage(1);
  };

  // 篩選變更時回到第一頁
  useEffect(() => {
    setPage(1);
  }, [showOnly, stateFilter, typeFilter]);

  // 過濾清單
  const filteredList = useMemo(() => {
    let sourceList = list;

    // 顯示隱藏過濾
    if (showOnly) sourceList = sourceList.filter((item: any) => translateTerm(`CombatSkill.Desc.${item.id}`, undefined, 0) !== '');

    // 狀態與類型過濾
    if (stateFilter !== 'all') sourceList = sourceList.filter((item: any) => item.state === stateFilter);
    if (typeFilter !== 'all') sourceList = sourceList.filter((item: any) => item.type === typeFilter);

    if (!searchTarget) return sourceList;
    const searchLower = searchTarget.trim().toLowerCase();
    const searchTerms = searchLower.split(/\s+/).filter(Boolean);

    return sourceList.filter((item: any) => {
      const targetString = `${item.id} ${translateTerm(`CombatSkill.Name.${item.id}`)} ${translateTerm(`CombatSkill.Desc.${item.id}`)}`.toLowerCase();
      return searchTerms.every((term) => targetString.includes(term));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list, searchTarget, showOnly, stateFilter, typeFilter]);

  // 分頁顯示
  const displayList = useMemo(() => {
    return filteredList.slice(0, page * itemsPerPage);
  }, [filteredList, page]);
  const hasMore = displayList.length < filteredList.length;

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex flex-wrap items-center justify-between gap-4 border-b border-border/50 pb-2'>
        <div className='flex items-center gap-2'>
          <h2 className='text-lg font-bold'>{translateTermWithParam('Web.List', 'Effect')}</h2>
        </div>
        <div className='flex flex-wrap items-center gap-2 w-full lg:w-auto'>
          {/* 顯示狀態切換按鈕 */}
          <Button
            variant={showOnly ? 'default' : 'outline'}
            size='sm'
            onClick={() => setShowOnly(!showOnly)}
            className='h-8 px-2.5 text-sm'
            title={showOnly ? translateTerm('Web.ShowHidden') : translateTerm('Web.HideHidden')}
          >
            {showOnly ? <Eye className='mr-1.5 size-3.5' /> : <EyeOff className='mr-1.5 size-3.5' />}
            {showOnly ? translateTerm('Web.DisplayedOnly') : translateTerm('Web.Term.All')}
          </Button>

          {/* 狀態篩選 */}
          <Select value={stateFilter} onValueChange={setStateFilter}>
            <SelectTrigger className='h-8! text-sm min-w-28 hover:bg-muted/50 transition-colors'>
              <SelectValue placeholder={translateTerm('Web.State')} />
            </SelectTrigger>
            <SelectContent className='min-w-28' position='popper'>
              <SelectItem value='all'>
                {translateTerm('Web.State')} - {translateTerm('Web.Term.All')}
              </SelectItem>
              {stateOptions.map((o: unknown) => (
                <SelectItem key={o as string} value={o as string}>
                  {translateTerm(`Custom.${o}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* 類型篩選 */}
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className='h-8! text-sm min-w-28 hover:bg-muted/50 transition-colors'>
              <SelectValue placeholder={translateTerm('Web.Type')} />
            </SelectTrigger>
            <SelectContent className='min-w-28' position='popper'>
              <SelectItem value='all'>
                {translateTerm('Web.Type')} - {translateTerm('Web.Term.All')}
              </SelectItem>
              {typeOptions.map((o: unknown) => (
                <SelectItem key={o as string} value={o as string}>
                  {translateTerm(`Web.${o}`)}
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
                <th className='px-4 py-3 font-semibold min-w-40'>{translateTerm('Web.Name')}</th>
                <th className='px-4 py-3 font-semibold min-w-24'>{translateTerm('Web.State')}</th>
                <th className='px-4 py-3 font-semibold min-w-24'>{translateTerm('Web.Type')}</th>
                <th className='px-4 py-3 font-semibold min-w-48 w-full'>{translateTerm('Web.Desc')}</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-border/70'>
              {displayList.map((item: any) => {
                const hide = translateTerm(`CombatSkill.Desc.${item.id}`, undefined, 0) === '';

                return (
                  <tr key={item.id} className={`relative hover:bg-muted/50 transition-colors group cursor-pointer ${hide ? 'opacity-50 grayscale hover:opacity-100 hover:grayscale-0' : ''}`}>
                    <td className='p-0 w-0 h-0'>
                      <Link href={`/effect/${item.id}`} className='absolute inset-0 z-10' aria-hidden='true' />
                    </td>
                    <td className='px-4 py-3 font-mono text-primary group-hover:underline'>{item.id}</td>
                    <td className='px-4 py-3 font-bold whitespace-normal transition-colors group-hover:text-primary/80'>{translateTerm(`CombatSkill.Name.${item.id}`)}</td>
                    <td className='px-4 py-3 text-muted-foreground'>{translateTerm(`Custom.${item.state}`)}</td>
                    <td className='px-4 py-3 text-muted-foreground'>{translateTerm(`Web.${item.type}`)}</td>
                    <td className='px-4 py-3 text-muted-foreground whitespace-normal max-w-xs' title={translateTerm(`CombatSkill.Desc.${item.id}`, undefined, 0)}>
                      <div className='line-clamp-2'>{translateTerm(`CombatSkill.Desc.${item.id}`, undefined, 0) || translateTerm('System.NA')}</div>
                    </td>
                  </tr>
                );
              })}
              {filteredList.length === 0 && (
                <tr>
                  <td colSpan={6} className='px-4 py-12 text-center text-muted-foreground'>
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
