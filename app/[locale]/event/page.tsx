/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect, Suspense, useMemo, useRef } from 'react';
import { useLocale } from 'next-intl';
import { Search, Eye, EyeOff } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import { useItemDetail } from '@/hooks/queries/useItemDetail';
import { ParsedText, TriggerContext } from '@/components/shared/ParsedText';
import { FlowContent } from '@/components/shared/FlowContent';
import { RemarkIcons } from '@/components/shared/RemarkIcons';
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

const checkIsTriggerActive = (item: any, scriptData: any) => {
  if (!item?.active) return false;
  if (item.script) return Boolean(scriptData?.[item.script]);
  return Boolean(item.content?.length > 0);
};

// 列表元件
function DataList({ triggerData, scriptData, combatData, battleData }: { triggerData: Record<string, any>; scriptData: any; combatData: any; battleData: any }) {
  const { translateTerm, translateParagraph } = useAppTranslation();

  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchTarget, setSearchTarget] = useState('');
  const [page, setPage] = useState(1);
  const locale = useLocale();
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

  // 依事件類別取得對應資料的 remark
  const getEventRemark = (flow: any) => {
    if (!flow?.type || !flow?.id) return undefined;
    const typeLower = flow.type.toLowerCase();
    if (typeLower === 'script') return scriptData?.[flow.id]?.remark;
    if (typeLower === 'combat') return combatData?.[flow.id]?.remark;
    if (typeLower === 'battle') return battleData?.[flow.id]?.remark;
    return undefined;
  };

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
    const value = searchInputRef.current?.value || '';
    setSearchTarget(value);
    setPage(1);

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      params.delete('cat');
      params.delete('from');

      const remainingQuery = params.toString();
      const cleanUrl = remainingQuery ? `${window.location.pathname}?${remainingQuery}` : window.location.pathname;
      window.history.replaceState(null, '', cleanUrl);
    }
  };

  // 篩選變更時回到第一頁
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1);
  }, [activeOnly, typeFilter, sheetFilter]);

  // 處理 Hash 定位與自動翻頁
  useEffect(() => {
    if (list.length === 0) return;

    // 檢查 Trigger 是否包含目標 ID
    const checkTriggerHasTarget = (trigger: any, target: string, cat?: string) => {
      const catLower = cat?.toLowerCase();

      if (['script', 'combat', 'battle'].includes(catLower || '')) {
        return trigger.eventFlow?.some((f: any) => f.id === target);
      }
      if (catLower === 'mission') {
        return trigger.mission === target;
      }
      if (catLower === 'trigger') {
        return trigger.id === target;
      }

      // 未指定 cat 或未知時的通用檢查
      if (trigger.id === target || trigger.mission === target) return true;
      if (trigger.eventFlow?.some((f: any) => f.id === target)) return true;
      return false;
    };

    // 平滑捲動與高光動畫
    const triggerHighlight = (el: HTMLElement) => {
      el.scrollIntoView({ behavior: 'smooth' });
      el.classList.add('bg-primary/20', 'ring-1', 'ring-primary', 'rounded-sm', 'transition-all', 'duration-500');
      setTimeout(() => el.classList.remove('bg-primary/20', 'ring-1', 'ring-primary'), 2000);
    };

    const locateHash = () => {
      if (typeof window !== 'undefined' && window.location.hash) {
        const rawHash = decodeURIComponent(window.location.hash.substring(1));
        if (!rawHash) return;

        // 解析 targetId 與來源參數
        const [targetId, hashQueryPart] = rawHash.split(/[?&]/);
        const searchParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(hashQueryPart ? rawHash.slice(targetId.length + 1) : '');
        const fromTriggerId = searchParams.get('from') || hashParams.get('from');
        const category = searchParams.get('cat') || hashParams.get('cat') || 'unknown';
        const catLower = category.toLowerCase();

        let targetIndex = -1;

        // 優先檢查來源 Trigger 內部
        if (fromTriggerId) {
          const localIndex = list.findIndex((item: any) => item.id === fromTriggerId && checkTriggerHasTarget(item, targetId, catLower));
          if (localIndex !== -1) {
            targetIndex = localIndex;
          }
        }

        // 取得全域符合的 Trigger
        if (targetIndex === -1) {
          // 依指定類別尋找，已啟用優先
          targetIndex = list.findIndex((item: any) => checkIsTriggerActive(item, scriptData) === true && checkTriggerHasTarget(item, targetId, catLower));
          if (targetIndex === -1) {
            targetIndex = list.findIndex((item: any) => checkTriggerHasTarget(item, targetId, catLower));
          }

          // 沒找到退回盲搜
          if (targetIndex === -1 && catLower !== 'unknown') {
            targetIndex = list.findIndex((item: any) => item.active === true && checkTriggerHasTarget(item, targetId));
            if (targetIndex === -1) {
              targetIndex = list.findIndex((item: any) => checkTriggerHasTarget(item, targetId));
            }
          }
        }

        // 找到目標所在的 Trigger
        if (targetIndex !== -1) {
          const targetTrigger = list[targetIndex];

          // 取得目標精確的 DOM 元素 ID
          let elId = '';

          // 若有指定 cat，優先依據精確類別尋找 DOM ID
          if (['script', 'combat', 'battle'].includes(catLower)) {
            const flowIdx = targetTrigger.eventFlow?.findIndex((f: any) => f.id === targetId);
            if (flowIdx !== undefined && flowIdx !== -1) {
              elId = `flow-${targetTrigger.id}-${targetId}-${flowIdx}`;
            }
          } else if (catLower === 'mission') {
            if (targetTrigger.mission === targetId) {
              elId = `mission-${targetTrigger.id}-${targetTrigger.mission}`;
            }
          } else if (catLower === 'trigger') {
            if (targetTrigger.id === targetId) {
              elId = `trigger-${targetTrigger.id}`;
            }
          }

          // 若未帶 cat，或特定類別沒對應到，採用循序嘗試
          if (!elId) {
            if (targetTrigger.mission === targetId) {
              elId = `mission-${targetTrigger.id}-${targetTrigger.mission}`;
            } else if (targetTrigger.eventFlow?.some((f: any) => f.id === targetId)) {
              const flowIdx = targetTrigger.eventFlow.findIndex((f: any) => f.id === targetId);
              elId = `flow-${targetTrigger.id}-${targetId}-${flowIdx}`;
            } else {
              elId = `trigger-${targetTrigger.id}`;
            }
          }

          // 檢查目標是否已經渲染在當前的 DOM 中
          const existingEl = document.getElementById(elId);

          if (existingEl) {
            // 目標已在當前可見頁面內：直接捲動與高光
            triggerHighlight(existingEl);
          } else {
            // 目標不在當前頁面：先 filter 鎖定該 Trigger
            if (searchInputRef.current) searchInputRef.current.value = targetTrigger.id;
            setSearchTarget(targetTrigger.id);

            // 解除可能阻礙顯示的過濾條件
            if (!checkIsTriggerActive(targetTrigger, scriptData)) setActiveOnly(false);
            setTypeFilter('all');
            setSheetFilter('all');
            setPage(1);

            // 等待 React 重新渲染篩選後的 DOM，再執行捲動與高光
            const retryHighlight = (attempts = 10) => {
              const el = document.getElementById(elId);
              if (el) {
                triggerHighlight(el);
              } else if (attempts > 0) {
                setTimeout(() => retryHighlight(attempts - 1), 100);
              }
            };

            setTimeout(() => retryHighlight(), 100);
          }
        } else {
          // 完全找不到目標改以新分頁/新視窗開啟獨立頁面
          if (catLower && catLower !== 'unknown') {
            const targetUrl = `/${locale}/${catLower}/${targetId}`;
            window.open(targetUrl, '_blank');

            // 清除當前網址中的無效 Hash，避免後續重新整理時重複跳出新視窗
            searchParams.delete('cat');
            searchParams.delete('from');
            const cleanSearch = searchParams.toString();
            const cleanUrl = cleanSearch ? `${window.location.pathname}?${cleanSearch}` : window.location.pathname;
            history.replaceState(null, '', cleanUrl);
          }
        }
      }
    };

    locateHash();

    window.addEventListener('hashchange', locateHash);
    return () => window.removeEventListener('hashchange', locateHash);
  }, [list, locale, scriptData]);

  // 過濾清單
  const filteredList = useMemo(() => {
    let sourceList = list;

    if (activeOnly) sourceList = sourceList.filter((item: any) => checkIsTriggerActive(item, scriptData));
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
  }, [list, searchTarget, activeOnly, typeFilter, sheetFilter, scriptData]);

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
              ref={searchInputRef}
              type='text'
              placeholder={translateTerm('Web.Msg.SearchPlaceholder')}
              defaultValue={searchTarget}
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
                                {trigger.remark && <RemarkIcons remarks={trigger.remark} />}
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
                            {getEventRemark(flow) && <RemarkIcons remarks={getEventRemark(flow)} />}
                          </td>
                          <td className='p-2 align-top whitespace-normal bg-background/30'>
                            <FlowContent flow={flow} scriptData={scriptData} combatData={combatData} battleData={battleData} />
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className='p-2 align-top border-r border-border/30 whitespace-normal'>
                          <div id={`mission-${trigger.id}-${trigger.mission}`} className='scroll-mt-24 p-1 -m-1 font-mono text-primary break-all'>
                            <Link href={`/mission/${trigger.mission}`} target='_blank' rel='noreferrer' className='hover:underline'>
                              {trigger.mission}
                            </Link>
                          </div>
                          <div className='font-bold mt-1 break-all'>{translateTerm(`Mission.Name.${trigger.mission}`)}</div>
                          <div className='text-xs text-muted-foreground mt-1 break-all'>{translateTerm(`Mission.Desc.${trigger.mission}`, undefined, 0)}</div>
                        </td>
                        <td className='p-2 align-top border-r border-border/30 whitespace-normal'>
                          <div id={`trigger-${trigger.id}`} className='scroll-mt-24 p-1 -m-1 font-mono text-primary break-all'>
                            <Link href={`/trigger/${trigger.id}`} target='_blank' rel='noreferrer' className='hover:underline'>
                              {trigger.id}
                            </Link>
                          </div>
                          <div className='font-bold mt-1 break-all'>{translateTerm(`Trigger.Name.${trigger.id}`)}</div>
                          <div className='text-xs text-muted-foreground mt-1 break-all'>{translateTerm(`Trigger.Desc.${trigger.id}`, undefined, 0)}</div>
                          {trigger.remark && <RemarkIcons remarks={trigger.remark} />}
                        </td>
                        <td className='p-2 align-top border-r border-border/30 whitespace-nowrap text-muted-foreground'>{translateTerm(`Web.Label.${trigger.type}`)}</td>
                        <td className='p-2 align-top border-r border-border/30 whitespace-nowrap text-muted-foreground'>
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
                        <td className='p-2 align-top border-r border-border/30 whitespace-normal'>
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
                        <td className='p-2 align-top border-r border-border/30 whitespace-normal bg-background/30'>-</td>
                        <td className='p-2 align-top whitespace-normal bg-background/30'>
                          <FlowContent flow={{ type: 'Trigger' }} triggerContent={trigger.content} />
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
