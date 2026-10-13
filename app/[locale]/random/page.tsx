/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect, Suspense, useMemo } from 'react';
import { Search } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import { useItemDetail } from '@/hooks/queries/useItemDetail';
import { ParsedText, TriggerContext } from '@/components/shared/ParsedText';
import { FlowContent } from '@/components/shared/FlowContent';
import { TopNavbar } from '@/components/layout/TopNavbar';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function RandomEventPage() {
  return (
    <Suspense fallback={<div className='min-h-screen flex items-center justify-center text-muted-foreground tracking-widest animate-pulse'>Loading...</div>}>
      <RandomEventContentView />
    </Suspense>
  );
}

function RandomEventContentView() {
  const { translateTermWithParam } = useAppTranslation();

  // 一次性讀取所需的 4 份檔案
  const { data: positionData, isLoading: isPositionLoading, isError: isPositionError } = useItemDetail('position', 'all');
  const { data: scriptData, isLoading: isScriptLoading, isError: isScriptError } = useItemDetail('script', 'all');
  const { data: combatData, isLoading: isCombatLoading, isError: isCombatError } = useItemDetail('combat', 'all');
  const { data: battleData, isLoading: isBattleLoading, isError: isBattleError } = useItemDetail('battle', 'all');

  const isLoading = isPositionLoading || isScriptLoading || isCombatLoading || isBattleLoading;
  const isError = isPositionError || isScriptError || isCombatError || isBattleError;

  return (
    <main className='min-h-screen bg-background text-foreground pb-20 transition-[padding] duration-300 ease-in-out'>
      {/* 頂部固定導覽列 */}
      <TopNavbar />

      {/* 主要閱讀區塊 */}
      <div className='w-full max-w-full mx-auto px-4 md:px-6 space-y-6 transition-all duration-300'>
        {isLoading && <div className='text-center text-muted-foreground py-10 tracking-widest animate-pulse'>{translateTermWithParam('Web.Msg.Loading', 'Random')}</div>}
        {isError && <div className='text-center text-destructive py-10 bg-destructive/10 rounded-md'>{translateTermWithParam('Web.Msg.LoadError', 'Random')}</div>}

        {/* 列表模式 */}
        {!isLoading && !isError && positionData && <DataList positionData={positionData} scriptData={scriptData} combatData={combatData} battleData={battleData} />}
        {!isLoading && !isError && !positionData && <div className='text-center text-muted-foreground py-10'>{translateTermWithParam('Web.Msg.NotFound', 'Random')}</div>}
      </div>
    </main>
  );
}

// 列表元件
function DataList({ positionData, scriptData, combatData, battleData }: { positionData: Record<string, any>; scriptData: any; combatData: any; battleData: any }) {
  const { translateTerm, translateParagraph } = useAppTranslation();
  const [searchInput, setSearchInput] = useState('');
  const [searchTarget, setSearchTarget] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 50;

  // 篩選器狀態
  const [periodFilter, setPeriodFilter] = useState('all');
  const [positionFilter, setPositionFilter] = useState('all');

  // 緩存清單並以 orderKey 排序
  const list = useMemo(() => {
    if (!positionData) return [];
    const arr = Object.entries(positionData).map(([id, val]: any) => ({ id, ...(typeof val === 'object' ? val : {}) }));
    return arr.sort((a, b) => (a.orderKey || 9999) - (b.orderKey || 9999));
  }, [positionData]);

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

  // 篩選變更時回到第一頁
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1);
  }, [periodFilter, positionFilter]);

  // 處理 Hash 定位與自動翻頁
  useEffect(() => {
    if (list.length === 0) return;

    // 檢查 Position 是否包含目標 ID
    const checkPositionHasTarget = (posItem: any, target: string) => {
      if (posItem.id === target) return true;
      // 檢查底下所有的隨機事件 (event) 裡面的 eventFlow
      if (Object.keys(posItem.event || {}).some((k) => posItem.event[k].eventFlow?.some((f: any) => f.id === target))) {
        return true;
      }
      return false;
    };

    const locateHash = () => {
      if (typeof window !== 'undefined' && window.location.hash) {
        const rawHash = decodeURIComponent(window.location.hash.substring(1));
        if (!rawHash) return;

        // 解析 targetId 與來源 fromPositionId
        const [targetId, queryPart] = rawHash.split('?');
        const urlParams = new URLSearchParams(queryPart || '');
        const fromPositionId = urlParams.get('from');

        let targetIndex = -1;

        // 優先檢查來源 Position 內部
        if (fromPositionId) {
          const localIndex = list.findIndex((item: any) => item.id === fromPositionId && checkPositionHasTarget(item, targetId));
          if (localIndex !== -1) {
            targetIndex = localIndex;
          }
        }

        // 取得全域第 1 組
        if (targetIndex === -1) {
          targetIndex = list.findIndex((item: any) => checkPositionHasTarget(item, targetId));
        }

        // 執行換頁與定位
        if (targetIndex !== -1) {
          setPage((currentPage) => {
            const requiredPage = Math.ceil((targetIndex + 1) / itemsPerPage);
            return requiredPage > currentPage ? requiredPage : currentPage;
          });

          setTimeout(() => {
            const posItem = list[targetIndex];
            let elId = `action-${posItem.id}`;

            if (posItem.id !== targetId) {
              for (const [rId, rEv] of Object.entries(posItem.event || {}) as any) {
                const flowIdx = (rEv.eventFlow || []).findIndex((f: any) => f.id === targetId);
                if (flowIdx !== -1) {
                  elId = `flow-${posItem.id}-${rId}-${targetId}-${flowIdx}`;
                  break;
                }
              }
            }

            const el = document.getElementById(elId);
            if (el) {
              el.scrollIntoView({ behavior: 'smooth' });
              el.classList.add('bg-primary/20', 'ring-1', 'ring-primary', 'rounded-sm', 'transition-all', 'duration-500');
              setTimeout(() => el.classList.remove('bg-primary/20', 'ring-1', 'ring-primary'), 2000);
            }
          }, 300);
        }
      }
    };

    locateHash();

    window.addEventListener('hashchange', locateHash);
    return () => window.removeEventListener('hashchange', locateHash);
  }, [list, itemsPerPage]);

  // 過濾清單
  const filteredList = useMemo(() => {
    let sourceList = list;

    if (periodFilter !== 'all') sourceList = sourceList.filter((item: any) => item.period === periodFilter);
    if (positionFilter !== 'all') sourceList = sourceList.filter((item: any) => item.position === positionFilter);

    if (!searchTarget) return sourceList;
    const searchLower = searchTarget.trim().toLowerCase();
    const searchTerms = searchLower.split(/\s+/).filter(Boolean);

    return sourceList.filter((item: any) => {
      // 合併所有搜尋關聯字
      const eventsText = Object.entries(item.event || {})
        .map(([rId, rEv]: any) => {
          const cond = rEv.condition ? rEv.condition.join(' ') : '';
          const flows = (rEv.eventFlow || []).map((f: any) => `${f.id} ${translateTerm(`${f.type}.Name.${f.id}`)}`).join(' ');
          return `${translateTerm(`Position.Class.${rEv.class}`)} ${rId} ${cond} ${flows}`;
        })
        .join(' ');

      const targetString = `
        ${item.id} ${translateParagraph(item.period)} ${translateParagraph(item.position)} ${translateParagraph(item.action)}
        ${translateParagraph(item.searchText)}
        ${eventsText}
      `.toLowerCase();

      return searchTerms.every((term) => targetString.includes(term));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list, searchTarget, periodFilter, positionFilter]);

  // 分頁顯示
  const displayList = useMemo(() => {
    return filteredList.slice(0, page * itemsPerPage);
  }, [filteredList, page]);

  const hasMore = displayList.length < filteredList.length;

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex flex-wrap items-center justify-between gap-4 border-b border-border/50 pb-2'>
        <div className='flex items-center gap-2'>
          <h2 className='text-lg font-bold'>{translateTerm('Web.Random')}</h2>
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
            <Button variant='outline' size='sm' onClick={handleSearch} className='px-3'>
              <Search className='size-4 opacity-70' />
            </Button>
          </ButtonGroup>
        </div>
      </div>

      <div className='bg-card border rounded-xl shadow-sm overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='table-fixed w-full text-sm text-left'>
            <thead className='bg-muted/50 text-muted-foreground border-b border-border/50 whitespace-nowrap'>
              <tr>
                <th className='px-4 py-3 font-semibold w-20'>{translateTerm('Web.Period')}</th>
                <th className='px-4 py-3 font-semibold w-24'>{translateTerm('Web.Position')}</th>
                <th className='px-4 py-3 font-semibold w-24'>{translateTerm('Web.Action')}</th>
                <th className='px-4 py-3 font-semibold w-20'>{translateTerm('Web.Random')}</th>
                <th className='px-4 py-3 font-semibold w-56'>{translateTerm('Web.Condition')}</th>
                <th className='px-4 py-3 font-semibold w-48'>{translateTerm('Web.Rate')}</th>
                <th className='px-4 py-3 font-semibold w-32'>{translateTerm('Web.Event')}</th>
                <th className='px-4 py-3 font-semibold min-w-lg w-full'>{translateTerm('Web.BranchContent')}</th>
              </tr>
            </thead>
            {displayList.map((posItem: any) => {
              const randomEvents = Object.entries(posItem.event || {}).sort(([idA], [idB]) => idA.localeCompare(idB));
              const posRowCount = Math.max(
                1,
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                randomEvents.reduce((acc, [_, rEv]: any) => acc + Math.max(1, (rEv.eventFlow || []).length), 0)
              );

              return (
                <TriggerContext.Provider key={posItem.id} value={posItem.id}>
                  <tbody className='divide-y divide-border/30 border-b border-border/70 transition-colors hover:bg-muted/20'>
                    {randomEvents.length > 0 ? (
                      randomEvents.map(([rId, rEv]: any, rIdx: number) => {
                        const flows = rEv.eventFlow || [];
                        const rRowCount = Math.max(1, flows.length);

                        return flows.length > 0 ? (
                          flows.map((flow: any, fIdx: number) => (
                            <tr key={`${posItem.id}-${rId}-${flow.id}-${fIdx}`}>
                              {rIdx === 0 && fIdx === 0 && (
                                <>
                                  <td rowSpan={posRowCount} className='p-2 align-top border-r border-border/30 text-muted-foreground break-all'>
                                    {translateParagraph(posItem.period)}
                                  </td>
                                  <td rowSpan={posRowCount} className='p-2 align-top border-r border-border/30 text-muted-foreground break-all'>
                                    {translateParagraph(posItem.position) || '-'}
                                  </td>
                                  <td rowSpan={posRowCount} className='p-2 align-top border-r border-border/30 break-all'>
                                    <div id={`action-${posItem.id}`} className='scroll-mt-24 p-1 -m-1 font-mono text-primary break-all'>
                                      <Link href={`/position/${posItem.id}`} target='_blank' rel='noreferrer' className='hover:underline'>
                                        {posItem.id}
                                      </Link>
                                    </div>
                                    <div className='font-bold mt-1 text-foreground'>{translateParagraph(posItem.action)}</div>
                                  </td>
                                </>
                              )}
                              {fIdx === 0 && (
                                <>
                                  <td rowSpan={rRowCount} className='p-2 align-top border-r border-border/30 break-all'>
                                    <div className='text-foreground'>{translateTerm(`Position.Class.${rEv.class}`)}</div>
                                    <div className='text-foreground mt-1'>{rEv.seq}</div>
                                  </td>
                                  <td rowSpan={rRowCount} className='p-2 align-top border-r border-border/30 break-all'>
                                    <div className='flex flex-col gap-3 font-mixed'>
                                      {rEv.condition && rEv.condition.length > 0 && (
                                        <div className='flex flex-col gap-1.5'>
                                          {rEv.condition.map((cond: string, i: number) => (
                                            <div key={i} className='flex items-start w-full gap-0.5'>
                                              <span className='pl-1.5 text-muted-foreground shrink-0 select-none'>{i + 1}.</span>
                                              <div className='items-center gap-x-0.5 gap-y-1 flex-1 min-w-0'>
                                                <ParsedText text={cond} />
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                      {(!rEv.condition || rEv.condition.length === 0) && <span className='text-muted-foreground italic pl-1.5'>-</span>}
                                    </div>
                                  </td>
                                  <td rowSpan={rRowCount} className='p-2 align-top border-r border-border/30 break-all'>
                                    <div className='flex flex-col gap-3 font-mixed'>
                                      {rEv.rate && rEv.rate.length > 0 && (
                                        <div className='flex flex-col gap-1.5'>
                                          {rEv.rate.map((rate: string, i: number) => (
                                            <div key={i} className='pl-1.5'>
                                              <ParsedText text={rate} />
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                      {(!rEv.rate || rEv.rate.length === 0) && <span className='text-muted-foreground italic pl-1.5'>-</span>}
                                    </div>
                                  </td>
                                </>
                              )}
                              <td className='p-2 align-top border-r border-border/30 whitespace-normal bg-background/30'>
                                <div id={`flow-${posItem.id}-${rId}-${flow.id}-${fIdx}`} className='scroll-mt-24 p-1 -m-1 font-mono text-primary/80 break-all'>
                                  <Link href={`/${flow.type.toLowerCase()}/${flow.id}`} target='_blank' rel='noreferrer' className='hover:underline'>
                                    {flow.id}
                                  </Link>
                                </div>
                                <div className='font-bold mt-1 break-all'>{translateTerm(`${flow.type}.Name.${flow.id}`)}</div>
                                <div className='text-xs text-muted-foreground mt-1 break-all'>{translateTerm(`${flow.type}.Desc.${flow.id}`, undefined, 0)}</div>
                              </td>
                              <td className='p-2 align-top whitespace-normal bg-background/30'>
                                <FlowContent flow={flow} scriptData={scriptData} combatData={combatData} battleData={battleData} />
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr key={`${posItem.id}-${rId}-empty`}>
                            {rIdx === 0 && (
                              <>
                                <td rowSpan={posRowCount} className='p-2 align-top border-r border-border/30 whitespace-nowrap text-muted-foreground'>
                                  {translateParagraph(posItem.period)}
                                </td>
                                <td rowSpan={posRowCount} className='p-2 align-top border-r border-border/30 whitespace-nowrap text-muted-foreground'>
                                  {translateParagraph(posItem.position) || '-'}
                                </td>
                                <td rowSpan={posRowCount} className='p-2 align-top border-r border-border/30 whitespace-normal'>
                                  <div id={`action-${posItem.id}`} className='scroll-mt-24 p-1 -m-1 font-mono text-primary break-all'>
                                    <Link href={`/position/${posItem.id}`} target='_blank' rel='noreferrer' className='hover:underline'>
                                      {posItem.id}
                                    </Link>
                                  </div>
                                  <div className='font-bold mt-1 text-foreground'>{translateParagraph(posItem.action)}</div>
                                </td>
                              </>
                            )}
                            <td className='p-2 align-top border-r border-border/30 whitespace-nowrap'>
                              <div className='font-bold text-foreground'>{translateTerm(`Position.Class.${rEv.class}`)}</div>
                              <div className='text-muted-foreground mt-1'>{rEv.seq}</div>
                            </td>
                            <td className='p-2 align-top border-r border-border/30 whitespace-normal'>
                              <div className='flex flex-col gap-3 font-mixed'>
                                {rEv.condition && rEv.condition.length > 0 && (
                                  <div className='flex flex-col gap-1.5'>
                                    <div className='text-[10px] font-bold uppercase opacity-60 leading-none mb-0.5'>{translateTerm('Web.Condition')}</div>
                                    {rEv.condition.map((cond: string, i: number) => (
                                      <div key={i} className='flex items-start w-full gap-0.5'>
                                        <span className='pl-1.5 text-muted-foreground shrink-0 select-none'>{i + 1}.</span>
                                        <div className='items-center gap-x-0.5 gap-y-1 flex-1 min-w-0'>
                                          <ParsedText text={cond} />
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                {rEv.rate && rEv.rate.length > 0 && (
                                  <div className='flex flex-col gap-1.5'>
                                    <div className='text-[10px] font-bold uppercase opacity-60 leading-none mb-0.5'>{translateTerm('Web.Rate')}</div>
                                    {rEv.rate.map((rate: string, i: number) => (
                                      <div key={i} className='pl-1.5'>
                                        <ParsedText text={rate} />
                                      </div>
                                    ))}
                                  </div>
                                )}
                                {(!rEv.condition || rEv.condition.length === 0) && (!rEv.rate || rEv.rate.length === 0) && <span className='text-muted-foreground italic pl-1.5'>-</span>}
                              </div>
                            </td>
                            <td colSpan={2} className='px-4 py-3 align-middle text-center text-muted-foreground italic bg-background/30'>
                              -
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td className='p-2 align-top border-r border-border/30 text-muted-foreground'>{translateParagraph(posItem.period)}</td>
                        <td className='p-2 align-top border-r border-border/30 text-muted-foreground'>{translateParagraph(posItem.position) || '-'}</td>
                        <td className='p-2 align-top border-r border-border/30 whitespace-normal'>
                          <div id={`action-${posItem.id}`} className='scroll-mt-24 p-1 -m-1 font-mono text-primary break-all'>
                            <Link href={`/position/${posItem.id}`} target='_blank' rel='noreferrer' className='hover:underline'>
                              {posItem.id}
                            </Link>
                          </div>
                          <div className='font-bold mt-1 text-foreground'>{translateParagraph(posItem.action)}</div>
                        </td>
                        <td colSpan={4} className='p-2 align-middle text-center text-muted-foreground italic bg-background/30'>
                          -
                        </td>
                      </tr>
                    )}
                  </tbody>
                </TriggerContext.Provider>
              );
            })}
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
