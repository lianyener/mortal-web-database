/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect, Suspense, useMemo } from 'react';
import { Search, Eye, EyeOff } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import { useItemDetail } from '@/hooks/queries/useItemDetail';
import { ParsedText, TriggerContext } from '@/components/shared/ParsedText';
import { FlowContent } from '@/components/shared/FlowContent';
import { TopNavbar } from '@/components/layout/TopNavbar';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function EventPage() {
  return (
    <Suspense fallback={<div className='min-h-screen flex items-center justify-center text-muted-foreground tracking-widest animate-pulse'>Loading...</div>}>
      <EventContentView />
    </Suspense>
  );
}

function EventContentView() {
  const { translateTermWithParam } = useAppTranslation();

  // 一次性讀取所需的 4 份檔案
  const { data: triggerData, isLoading: isTriggerLoading, isError: isTriggerError } = useItemDetail('trigger', 'all');
  const { data: scriptData, isLoading: isScriptLoading, isError: isScriptError } = useItemDetail('script', 'all');
  const { data: combatData, isLoading: isCombatLoading, isError: isCombatError } = useItemDetail('combat', 'all');
  const { data: battleData, isLoading: isBattleLoading, isError: isBattleError } = useItemDetail('battle', 'all');

  const isLoading = isTriggerLoading || isScriptLoading || isCombatLoading || isBattleLoading;
  const isError = isTriggerError || isScriptError || isCombatError || isBattleError;

  return (
    <main className='min-h-screen bg-background text-foreground pb-20 transition-[padding] duration-300 ease-in-out'>
      {/* 頂部固定導覽列 */}
      <TopNavbar />

      {/* 主要閱讀區塊 */}
      <div className='w-full max-w-full mx-auto px-4 md:px-6 space-y-6 transition-all duration-300'>
        {isLoading && <div className='text-center text-muted-foreground py-10 tracking-widest animate-pulse'>{translateTermWithParam('Web.Msg.Loading', 'Event')}</div>}
        {isError && <div className='text-center text-destructive py-10 bg-destructive/10 rounded-md'>{translateTermWithParam('Web.Msg.LoadError', 'Event')}</div>}

        {/* 列表模式 */}
        {!isLoading && !isError && triggerData && <DataList triggerData={triggerData} scriptData={scriptData} combatData={combatData} battleData={battleData} />}
        {!isLoading && !isError && !triggerData && <div className='text-center text-muted-foreground py-10'>{translateTermWithParam('Web.Msg.NotFound', 'Event')}</div>}
      </div>
    </main>
  );
}

// 列表元件
function DataList({ triggerData, scriptData, combatData, battleData }: { triggerData: Record<string, any>; scriptData: any; combatData: any; battleData: any }) {
  const { translateTerm, translateParagraph } = useAppTranslation();
  const [searchInput, setSearchInput] = useState('');
  const [searchTarget, setSearchTarget] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 50;

  // 篩選器狀態
  const [activeOnly, setActiveOnly] = useState(true);
  const [typeFilter, setTypeFilter] = useState('all');
  const [sheetFilter, setSheetFilter] = useState('all');

  // 篩選選項
  const typeOptions = ['Main', 'Sub', 'Free'];

  // 緩存清單並以 orderKey 排序
  const list = useMemo(() => {
    if (!triggerData) return [];
    const arr = Object.entries(triggerData).map(([id, val]: any) => ({ id, ...(typeof val === 'object' ? val : {}) }));
    return arr.sort((a, b) => (a.orderKey || '').localeCompare(b.orderKey || ''));
  }, [triggerData]);

  // Sheet 篩選選項
  const sheetOptions = [
    'BeforeExternalStudy',
    'NoExternalStudy',
    'KongtongStudy',
    'QingchengStudy',
    'Brother1Leave',
    'InviteGroom',
    'WulinAssembly',
    'BeforeWestWulin',
    'SectDestroy',
    'WestWulin',
    'Hopeless'
  ];

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
  }, [activeOnly, typeFilter, sheetFilter]);

  // 處理 Hash 定位與自動翻頁
  useEffect(() => {
    if (list.length === 0) return;

    // 檢查 trigger 是否包含目標 ID
    const checkTriggerHasTarget = (trigger: any, target: string) => {
      if (trigger.id === target || trigger.mission === target) return true;
      if (trigger.eventFlow?.some((f: any) => f.id === target)) return true;
      return false;
    };

    const locateHash = () => {
      if (typeof window !== 'undefined' && window.location.hash) {
        const rawHash = decodeURIComponent(window.location.hash.substring(1));
        if (!rawHash) return;

        // 解析 targetId 與來源 fromTriggerId
        const [targetId, queryPart] = rawHash.split('?');
        const urlParams = new URLSearchParams(queryPart || '');
        const fromTriggerId = urlParams.get('from');

        let targetIndex = -1;

        // 優先檢查來源 Trigger 內部
        if (fromTriggerId) {
          const localIndex = list.findIndex((item: any) => item.id === fromTriggerId && checkTriggerHasTarget(item, targetId));
          if (localIndex !== -1) {
            targetIndex = localIndex;
          }
        }

        // 取得全域第 1 組
        if (targetIndex === -1) {
          targetIndex = list.findIndex((item: any) => checkTriggerHasTarget(item, targetId));
        }

        // 執行換頁與捲動
        if (targetIndex !== -1) {
          setPage((currentPage) => {
            const requiredPage = Math.ceil((targetIndex + 1) / itemsPerPage);
            return requiredPage > currentPage ? requiredPage : currentPage;
          });

          setTimeout(() => {
            const trigger = list[targetIndex];
            let elId = `trigger-${trigger.id}`;
            if (trigger.mission === targetId) {
              elId = `mission-${trigger.id}-${trigger.mission}`;
            } else if (trigger.eventFlow?.some((f: any) => f.id === targetId)) {
              const flowIdx = trigger.eventFlow.findIndex((f: any) => f.id === targetId);
              elId = `flow-${trigger.id}-${targetId}-${flowIdx}`;
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

    if (activeOnly) sourceList = sourceList.filter((item: any) => item.active === true && (item.script || item.content.length > 0));
    if (typeFilter !== 'all') sourceList = sourceList.filter((item: any) => item.type === typeFilter);

    if (sheetFilter !== 'all') {
      if (sheetFilter === 'unset') {
        sourceList = sourceList.filter((item: any) => !item.sheet);
      } else {
        sourceList = sourceList.filter((item: any) => item.sheet === sheetFilter);
      }
    }

    if (!searchTarget) return sourceList;
    const searchLower = searchTarget.trim().toLowerCase();
    const searchTerms = searchLower.split(/\s+/).filter(Boolean);

    return sourceList.filter((item: any) => {
      // 合併所有搜尋關聯字：Trigger + Mission + Events 內容
      const targetString = `
        ${item.id} ${translateTerm(`Trigger.Name.${item.id}`)} ${translateTerm(`Trigger.Desc.${item.id}`)}
        ${item.mission} ${translateTerm(`Mission.Name.${item.mission}`)}
        ${item.condition ? item.condition.join(' ') : ''}
        ${translateParagraph(item.searchText)}
        ${(item.eventFlow || []).map((f: any) => `${f.id} ${translateTerm(`${f.type}.Name.${f.id}`)}`).join(' ')}
      `.toLowerCase();

      return searchTerms.every((term) => targetString.includes(term));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list, searchTarget, activeOnly, typeFilter, sheetFilter]);

  // 分頁顯示
  const displayList = useMemo(() => {
    return filteredList.slice(0, page * itemsPerPage);
  }, [filteredList, page]);

  const hasMore = displayList.length < filteredList.length;

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex flex-wrap items-center justify-between gap-4 border-b border-border/50 pb-2'>
        <div className='flex items-center gap-2'>
          <h2 className='text-lg font-bold'>{translateTerm('Web.Label.EventTable')}</h2>
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

          {/* Sheet 篩選 */}
          <Select value={sheetFilter} onValueChange={setSheetFilter}>
            <SelectTrigger className='h-8! text-sm min-w-28 hover:bg-muted/50 transition-colors'>
              <SelectValue placeholder={translateTerm('Web.Sheet')} />
            </SelectTrigger>
            <SelectContent className='min-w-28' position='popper'>
              <SelectItem value='all'>
                {translateTerm('Web.Sheet')} - {translateTerm('Web.Term.All')}
              </SelectItem>
              {sheetOptions.map((s) => (
                <SelectItem key={s} value={s}>
                  {translateTerm(`Sheet.${s}`)}
                </SelectItem>
              ))}
              <SelectItem value='unset'>{translateTerm('Web.Term.Unset')}</SelectItem>
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
                <th className='px-4 py-3 font-semibold w-24'>{translateTerm('Web.Label.Mission')}</th>
                <th className='px-4 py-3 font-semibold w-24'>{translateTerm('Web.Label.Trigger')}</th>
                <th className='px-4 py-3 font-semibold w-20'>{translateTerm('Web.Type')}</th>
                <th className='px-4 py-3 font-semibold w-32'>{translateTerm('Web.Label.Time')}</th>
                <th className='px-4 py-3 font-semibold w-54'>{translateTerm('Web.Condition')}</th>
                <th className='px-4 py-3 font-semibold w-32'>{translateTerm('Web.Event')}</th>
                <th className='px-4 py-3 font-semibold min-w-lg w-full'>{translateTerm('Web.BranchContent')}</th>
              </tr>
            </thead>
            {displayList.map((trigger: any) => {
              const flows = trigger.eventFlow || [];
              const rowCount = Math.max(1, flows.length);

              return (
                <TriggerContext.Provider key={trigger.id} value={trigger.id}>
                  <tbody className={`divide-y divide-border/30 border-b border-border/70 transition-colors ${!trigger.active ? 'opacity-50 grayscale hover:opacity-100 hover:grayscale-0' : ''}`}>
                    {flows.length > 0 ? (
                      flows.map((flow: any, idx: number) => (
                        <tr key={`${trigger.id}-${flow.id}-${idx}`}>
                          {idx === 0 && (
                            <>
                              <td rowSpan={rowCount} className='p-2 align-top border-r border-border/30 whitespace-normal'>
                                <div id={`mission-${trigger.id}-${trigger.mission}`} className='scroll-mt-24 p-1 -m-1 font-mono text-primary break-all'>
                                  <Link href={`/mission/${trigger.mission}`} target='_blank' rel='noreferrer' className='hover:underline'>
                                    {trigger.mission}
                                  </Link>
                                </div>
                                <div className='font-bold mt-1 break-all'>{translateTerm(`Mission.Name.${trigger.mission}`)}</div>
                                <div className='text-xs text-muted-foreground mt-1 break-all'>{translateTerm(`Mission.Desc.${trigger.mission}`, undefined, 0)}</div>
                              </td>
                              <td rowSpan={rowCount} className='p-2 align-top border-r border-border/30 whitespace-normal'>
                                <div id={`trigger-${trigger.id}`} className='scroll-mt-24 p-1 -m-1 font-mono text-primary break-all'>
                                  <Link href={`/trigger/${trigger.id}`} target='_blank' rel='noreferrer' className='hover:underline'>
                                    {trigger.id}
                                  </Link>
                                </div>
                                <div className='font-bold mt-1 break-all'>{translateTerm(`Trigger.Name.${trigger.id}`)}</div>
                                <div className='text-xs text-muted-foreground mt-1 break-all'>{translateTerm(`Trigger.Desc.${trigger.id}`, undefined, 0)}</div>
                              </td>
                              <td rowSpan={rowCount} className='p-2 align-top border-r border-border/30 whitespace-nowrap text-muted-foreground'>
                                {translateTerm(`Web.Label.${trigger.type}`)}
                              </td>
                              <td rowSpan={rowCount} className='p-2 align-top border-r border-border/30 whitespace-nowrap text-muted-foreground'>
                                <div className='flex flex-col mt-0.5 gap-1.5'>
                                  <div className='flex flex-col'>
                                    <span className='text-xs font-bold uppercase opacity-60 leading-none mb-0.5'>{translateTerm('Web.MinTime')}</span>
                                    <span>{formatTime(trigger.minTime)}</span>
                                  </div>
                                  <div className='flex flex-col'>
                                    <span className='text-xs font-bold uppercase opacity-60 leading-none mb-0.5'>{translateTerm('Web.MaxTime')}</span>
                                    <span>{formatTime(trigger.maxTime)}</span>
                                  </div>
                                </div>
                              </td>
                              <td rowSpan={rowCount} className='p-2 align-top border-r border-border/30 whitespace-normal'>
                                {trigger.condition ? (
                                  <div className='flex flex-col items-start gap-1 text-sm/normal'>
                                    {trigger.condition.map((item: any, i: number) => (
                                      <div key={i} className='flex items-start w-full gap-0.5'>
                                        <span className='pl-1.5 text-muted-foreground shrink-0 select-none'>{i + 1}.</span>
                                        <div className='items-center gap-x-0.5 gap-y-1 flex-1 min-w-0'>
                                          <ParsedText text={item} />
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <span className='text-muted-foreground italic pl-1.5'>-</span>
                                )}
                              </td>
                            </>
                          )}
                          <td className='p-2 align-top border-r border-border/30 whitespace-normal bg-background/30'>
                            <div id={`flow-${trigger.id}-${flow.id}-${idx}`} className='scroll-mt-24 p-1 -m-1 font-mono text-primary/80 break-all'>
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
                      <tr>
                        <td className='px-4 py-3 align-top border-r border-border/30 whitespace-normal'>
                          <div id={`mission-${trigger.id}-${trigger.mission}`} className='scroll-mt-24 p-1 -m-1 font-mono text-primary break-all'>
                            <Link href={`/mission/${trigger.mission}`} target='_blank' rel='noreferrer' className='hover:underline'>
                              {trigger.mission}
                            </Link>
                          </div>
                          <div className='font-bold mt-1 break-all'>{translateTerm(`Mission.Name.${trigger.mission}`)}</div>
                          <div className='text-xs text-muted-foreground mt-1 break-all'>{translateTerm(`Mission.Desc.${trigger.mission}`, undefined, 0)}</div>
                        </td>
                        <td className='px-4 py-3 align-top border-r border-border/30 whitespace-normal'>
                          <div id={`trigger-${trigger.id}`} className='scroll-mt-24 p-1 -m-1 font-mono text-primary break-all'>
                            <Link href={`/trigger/${trigger.id}`} target='_blank' rel='noreferrer' className='hover:underline'>
                              {trigger.id}
                            </Link>
                          </div>
                          <div className='font-bold mt-1 break-all'>{translateTerm(`Trigger.Name.${trigger.id}`)}</div>
                          <div className='text-xs text-muted-foreground mt-1 break-all'>{translateTerm(`Trigger.Desc.${trigger.id}`, undefined, 0)}</div>
                        </td>
                        <td className='px-4 py-3 align-top border-r border-border/30 text-muted-foreground'>{translateTerm(`Web.Label.${trigger.type}`)}</td>
                        <td className='px-4 py-3 align-top border-r border-border/30 text-muted-foreground'>
                          <div className='flex flex-col gap-1.5'>
                            <div className='flex flex-col'>
                              <span className='text-[10px] font-bold uppercase opacity-60 leading-none mb-0.5'>{translateTerm('Web.MinTime')}</span>
                              <span>{formatTime(trigger.minTime)}</span>
                            </div>
                            <div className='flex flex-col'>
                              <span className='text-[10px] font-bold uppercase opacity-60 leading-none mb-0.5'>{translateTerm('Web.MaxTime')}</span>
                              <span>{formatTime(trigger.maxTime)}</span>
                            </div>
                          </div>
                        </td>
                        <td className='px-4 py-3 align-top border-r border-border/30 whitespace-normal'>
                          {trigger.condition ? (
                            <div className='flex flex-col items-start gap-1 text-sm/loose'>
                              {trigger.condition.map((item: any, i: number) => (
                                <div key={i} className='flex items-start w-full py-0.5 gap-1'>
                                  <span className='pl-1.5 text-muted-foreground shrink-0 select-none'>{i + 1}.</span>
                                  <div className='items-center gap-x-0.5 gap-y-1 flex-1 min-w-0'>
                                    <ParsedText text={item} />
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className='text-muted-foreground italic pl-1.5'>-</span>
                          )}
                        </td>
                        <td colSpan={2} className='px-4 py-3 align-middle text-center text-muted-foreground italic bg-background/30'>
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
