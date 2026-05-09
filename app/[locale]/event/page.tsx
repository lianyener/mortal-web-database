/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect, Suspense, useMemo } from 'react';
import { Search, ChevronDown, ChevronRight, Lock, Minus, CircleArrowRight, CircleFadingPlus, CircleCheck, Eye, EyeOff } from 'lucide-react';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import { useItemDetail } from '@/hooks/queries/useItemDetail';
import { ParsedText } from '@/components/shared/ParsedText';
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

      {/* 主要閱讀區塊 (加大寬度以符合表格需求) */}
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

// --- 各類型事件的自定義內容節點 ---

// Script
function ScriptNode({ node }: { node: any }) {
  const { translateTerm } = useAppTranslation();
  if (!node) return null;
  if (node.form === 'effect') {
    const textStr = typeof node.text === 'string' ? node.text : '';
    const effectItems = textStr.split(' / ');
    return (
      <div className='flex items-start gap-2 px-1 py-0.25 text-foreground text-sm/relaxed'>
        <CircleArrowRight className='size-4 shrink-0 text-muted-foreground/50 mt-0.5' />
        <div className='flex flex-wrap items-center gap-y-1 gap-x-2 flex-1'>
          {effectItems.map((item: string, idx: number) => (
            <div key={idx} className='flex items-center whitespace-nowrap'>
              <ParsedText text={item} />
              {idx < effectItems.length - 1 && <span className='text-muted-foreground/30 ml-2'>/</span>}
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (node.form === 'branch') {
    const textStr = typeof node.text === 'string' ? node.text : '';
    const branchTextItems = textStr.split(' / ');
    const label = branchTextItems.shift();
    return (
      <div>
        <div className='flex items-start py-0.25 gap-2 font-bold text-primary text-sm/relaxed'>
          <div className='shrink-0'>
            <ParsedText text={label} />
          </div>
          {node.type === 'Dice' && branchTextItems.length > 0 && (
            <div className='flex items-start gap-2'>
              <CircleCheck className='size-4 shrink-0 text-muted-foreground/50 mt-0.5' />
              <div className='flex flex-wrap items-center gap-y-1 gap-x-2 flex-1'>
                {branchTextItems.map((item: string, idx: number) => (
                  <div key={idx} className='flex items-center whitespace-nowrap'>
                    <ParsedText text={item} />
                    {idx < branchTextItems.length - 1 && <span className='text-muted-foreground/30 ml-2'>/</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className='flex flex-col pl-1'>
          {node.branches?.map((branch: any) => (
            <ScriptBranchItem key={branch.index} branch={branch} />
          ))}
        </div>
      </div>
    );
  }
  if (node.form === 'perform') {
    return (
      <div className='flex items-start gap-2 py-0.25 text-foreground text-sm/relaxed'>
        <CircleArrowRight className='size-4 shrink-0 text-muted-foreground/50 mt-0.5' />
        <div className='flex-1'>
          <ParsedText text={node.text} />
        </div>
      </div>
    );
  }
  return (
    <div className='py-0.5 text-sm/relaxed bg-destructive/10 text-destructive rounded-md border'>
      {translateTerm('Web.UnknownNode')}: {JSON.stringify(node)}
    </div>
  );
}

function ScriptBranchItem({ branch }: { branch: any }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const { translateTerm } = useAppTranslation();

  const isSingleEffect = branch.content?.length === 1 && branch.content[0].form === 'effect';
  const effectItems = isSingleEffect && typeof branch.content[0].text === 'string' ? branch.content[0].text.split(' / ') : [];
  const effectsList = Array.isArray(branch.effects) ? branch.effects : [];

  return (
    <div className='flex flex-col'>
      <div
        className={`flex items-start py-0.25 -mx-0.5 gap-1 font-semibold text-sm/relaxed ${isSingleEffect ? '' : 'hover:cursor-pointer'}`}
        onClick={() => {
          if (typeof window !== 'undefined' && window.getSelection()?.toString().length) return;
          if (!isSingleEffect) setIsExpanded(!isExpanded);
        }}
      >
        <div className='flex items-center gap-1 shrink-0 w-10.5'>
          <span className='shrink-0 flex items-center justify-center w-4 text-muted-foreground'>
            {isSingleEffect ? <Minus className='size-4' /> : isExpanded ? <ChevronDown className='size-4' /> : <ChevronRight className='size-4' />}
          </span>
          <span className='shrink-0 flex-1 text-right text-muted-foreground'>{branch.index}.</span>
        </div>
        <div className='flex flex-wrap items-center -ml-5.5 gap-x-0.5 gap-y-1 flex-1 min-w-0'>
          <div className='wrap-break-word ml-5.5 mr-1'>
            <ParsedText text={branch.text} />
          </div>
          {branch.condition && (
            <span className='flex items-center pl-1 gap-0.5 text-muted-foreground rounded border'>
              <Lock className='size-3.5 shrink-0 text-muted-foreground/70' />
              <span className='mr-1'>
                <ParsedText text={branch.condition} />
              </span>
            </span>
          )}
          {!isSingleEffect && !isExpanded && (
            <div
              className='flex items-center min-w-10 opacity-60 text-sm select-none pl-1 hover:opacity-90 transition-opacity'
              title={effectsList.length > 0 ? effectsList.map((e: string) => translateTerm(`Web.Label.${e}`)).join(', ') : ''}
            >
              <CircleFadingPlus className='size-4 shrink-0 text-muted-foreground/70 mr-1.5' />
              <div className='truncate tracking-widest'>
                {effectsList
                  .map((e: any) => translateTerm(`LabelIcon.${e}`, undefined, 0))
                  .filter(Boolean)
                  .join('')}
              </div>
              <span className='ml-0.5 text-muted-foreground/70 font-bold tracking-tighter'>...</span>
            </div>
          )}
          {isSingleEffect && (
            <div className='flex items-start gap-1.5 ml-1 text-foreground font-normal'>
              <CircleArrowRight className='size-4 shrink-0 text-muted-foreground/50 mt-0.5' />
              <div className='flex flex-wrap items-center gap-y-1 gap-x-2 flex-1 min-w-0'>
                {effectItems.map((item: string, idx: number) => (
                  <div key={idx} className='flex items-center whitespace-nowrap'>
                    <ParsedText text={item} />
                    {idx < effectItems.length - 1 && <span className='text-muted-foreground/30 ml-2 select-none'>/</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {!isSingleEffect && isExpanded && (
        <div className='flex flex-col pl-4 ml-1.5 mb-2 border-l-2 border-border/80'>
          {branch.content?.map((subNode: any, idx: number) => (
            <ScriptNode key={idx} node={subNode} />
          ))}
        </div>
      )}
    </div>
  );
}

// Combat
function CombatNode({ node }: { node: any }) {
  const { translateTerm } = useAppTranslation();
  if (!node) return null;
  if (node.form === 'effect') {
    const textStr = typeof node.text === 'string' ? node.text : '';
    const effectItems = textStr.split(' / ');
    return (
      <div className='flex items-start gap-2 py-0.25 text-foreground text-sm/relaxed'>
        <CircleArrowRight className='size-4 shrink-0 text-muted-foreground/50 mt-0.5' />
        <div className='flex flex-wrap items-center gap-y-1 gap-x-2 flex-1'>
          {effectItems.map((item: string, idx: number) => (
            <div key={idx} className='flex items-center whitespace-nowrap'>
              <ParsedText text={item} />
              {idx < effectItems.length - 1 && <span className='text-muted-foreground/30 ml-2'>/</span>}
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (node.form === 'branch') {
    return (
      <div>
        {node.branches?.map((branch: any, idx: number) => (
          <CombatBranchItem key={idx} branch={branch} />
        ))}
      </div>
    );
  }
  if (node.form === 'perform') {
    return (
      <div className='flex items-start gap-2 py-0.25 text-foreground text-sm/relaxed'>
        <CircleArrowRight className='size-4 shrink-0 text-muted-foreground/50 mt-0.5' />
        <div className='flex-1'>
          <ParsedText text={node.text} />
        </div>
      </div>
    );
  }
  return (
    <div className='py-0.25 text-sm/relaxed bg-destructive/10 text-destructive rounded-md border'>
      {translateTerm('Web.UnknownNode')}: {JSON.stringify(node)}
    </div>
  );
}

function CombatBranchItem({ branch }: { branch: any }) {
  const isSingleEffect = branch.content?.length === 1 && branch.content[0].form === 'effect';
  const effectItems = isSingleEffect && typeof branch.content[0].text === 'string' ? branch.content[0].text.split(' / ') : [];
  return (
    <div className='flex flex-col'>
      <div
        className={`flex items-start py-0.25 -mx-0.5 gap-1 font-semibold text-sm/relaxed ${isSingleEffect ? '' : 'hover:cursor-pointer'}`}
        onClick={() => {
          if (typeof window !== 'undefined' && window.getSelection()?.toString().length) return;
        }}
      >
        <div className='flex pl-1 pr-0.5 items-center shrink-0 text-muted-foreground'>{isSingleEffect ? <Minus className='size-4' /> : <ChevronDown className='size-4' />}</div>
        <div className='flex flex-wrap items-center gap-x-0.5 gap-y-1 flex-1 min-w-0'>
          <div className='wrap-break-word mr-1'>
            <ParsedText text={branch.text} />
          </div>
          {isSingleEffect && (
            <div className='flex items-start gap-1.5 ml-0.5 text-foreground font-normal'>
              <CircleArrowRight className='size-4 shrink-0 text-muted-foreground/50 mt-0.5' />
              <div className='flex flex-wrap items-center gap-y-1 gap-x-2 flex-1 min-w-0'>
                {effectItems.map((item: string, idx: number) => (
                  <div key={idx} className='flex items-center whitespace-nowrap'>
                    <ParsedText text={item} />
                    {idx < effectItems.length - 1 && <span className='text-muted-foreground/30 ml-2 select-none'>/</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {!isSingleEffect && (
        <div className='flex flex-col pl-4 ml-4 mb-2 border-l-2 border-border/80'>
          {branch.content?.map((subNode: any, idx: number) => (
            <CombatNode key={idx} node={subNode} />
          ))}
        </div>
      )}
    </div>
  );
}

// --- 單項事件內容分配器 ---

const FlowContent = ({ flow, scriptData, combatData, battleData }: any) => {
  const { translateTerm } = useAppTranslation();

  if (flow.type === 'Script' && scriptData?.[flow.id]) {
    const content = scriptData[flow.id].content;
    if (!content || content.length === 0) return <span className='text-muted-foreground italic'>-</span>;
    return (
      <div className='flex flex-col min-w-max sm:min-w-0 font-mixed'>
        {content.map((node: any, idx: number) => (
          <ScriptNode key={idx} node={node} />
        ))}
      </div>
    );
  }

  if (flow.type === 'Combat' && combatData?.[flow.id]) {
    const combat = combatData[flow.id];
    const content = combat.content;
    if (!content || content.length === 0) return <span className='text-muted-foreground italic'>-</span>;
    return (
      <div className='flex flex-col p-0 m-0 min-w-max sm:min-w-0 font-mixed'>
        {combat.enemy && (
          <div className='flex items-start gap-2 mb-2 pb-2 border-b border-border/40 text-sm'>
            <span className='font-bold text-primary/80 shrink-0'>{translateTerm('Web.Enemy')}:</span>
            <div className='flex-1 min-w-0'>
              <ParsedText text={combat.enemy} />
            </div>
          </div>
        )}
        {content.map((node: any, idx: number) => (
          <CombatNode key={idx} node={node} />
        ))}
      </div>
    );
  }

  if (flow.type === 'Battle' && battleData?.[flow.id]) {
    const battle = battleData[flow.id];
    const end = battle.end;
    if (!end || end.length === 0) return <span className='text-muted-foreground italic'>-</span>;

    const battleGroups = [
      { key: 'friend', label: translateTerm('Web.Friend') },
      { key: 'enemy', label: translateTerm('Web.Enemy') },
      { key: 'neutral', label: translateTerm('Web.Neutral') }
    ];

    return (
      <div className='flex flex-col items-start text-sm/relaxed font-mixed'>
        <div className='flex flex-col gap-1 w-full mb-2 pb-2 border-b border-border/40'>
          {battleGroups.map((g) => {
            const groupData = battle[g.key];
            if (!groupData?.name || groupData.name.length === 0) return null;
            return (
              <div key={g.key} className='flex items-start gap-2 text-sm'>
                <span className='font-bold text-primary/80 shrink-0'>{g.label}:</span>
                <div className='flex flex-wrap items-center gap-x-1.5 gap-y-0.5 flex-1 min-w-0'>
                  {groupData.name.map((n: string, i: number) => (
                    <div key={i} className='whitespace-nowrap'><ParsedText text={n} /></div>
                  ))}
                  <span className='text-muted-foreground text-xs ml-0.5 flex items-center'>
                    (<ParsedText text={String(groupData.people)} /> {translateTerm('Web.People')})
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        {end.map((item: any, i: number) => (
          <div key={i} className='flex items-start w-full py-0.25 gap-1'>
            <span className='pl-0.5 text-muted-foreground shrink-0 select-none'>{i + 1}.</span>
            <div className='flex flex-wrap items-center gap-x-0.5 gap-y-1 flex-1 min-w-0'>
              <ParsedText text={`${item.condition}`} />
              <div className='flex items-start gap-1.5 ml-0.5 text-foreground font-normal'>
                <CircleArrowRight className='size-4 shrink-0 text-muted-foreground/50 mt-1.25' />
                <div className='flex-1 min-w-0'>
                  <div className='flex items-center whitespace-nowrap'>
                    <ParsedText text={item.result} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return <span className='text-muted-foreground italic'>-</span>;
};

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
    setPage(1);
  }, [activeOnly, typeFilter, sheetFilter]);

  // 處理 Hash 定位與自動翻頁
  useEffect(() => {
    if (list.length === 0) return;

    const locateHash = () => {
      if (typeof window !== 'undefined' && window.location.hash) {
        const targetId = decodeURIComponent(window.location.hash.substring(1));
        if (!targetId) return;

        const targetIndex = list.findIndex((item: any) =>
          item.id === targetId ||
          item.mission === targetId ||
          item.eventFlow?.some((f: any) => f.id === targetId)
        );

        if (targetIndex !== -1) {
          setPage((currentPage) => {
            const requiredPage = Math.ceil((targetIndex + 1) / itemsPerPage);
            return requiredPage > currentPage ? requiredPage : currentPage;
          });
          
          setTimeout(() => {
            // 重組帶有 trigger.id 保證唯一性的複合 DOM ID
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
              // 高光提示動畫
              el.classList.add('bg-primary/20', 'ring-1', 'ring-primary', 'rounded-sm', 'transition-all', 'duration-500');
              setTimeout(() => el.classList.remove('bg-primary/20', 'ring-1', 'ring-primary'), 2000);
            }
          }, 300);
        }
      }
    };

    locateHash(); // 初始化時執行

    window.addEventListener('hashchange', locateHash);
    return () => window.removeEventListener('hashchange', locateHash);
  }, [list]); // 僅依賴 list

  // 過濾清單
  const filteredList = useMemo(() => {
    let sourceList = list;

    if (activeOnly) sourceList = sourceList.filter((item: any) => item.active === true && item.script);
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
              <SelectItem value='unset'>
                {translateTerm('Web.Term.Unset')}
              </SelectItem>
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
          <table className='w-full text-sm text-left'>
            <thead className='bg-muted/50 text-muted-foreground border-b border-border/50 whitespace-nowrap'>
              <tr>
                <th className='px-4 py-3 font-semibold min-w-28'>{translateTerm('Web.Label.Mission')}</th>
                <th className='px-4 py-3 font-semibold min-w-28'>{translateTerm('Web.Label.Trigger')}</th>
                <th className='px-4 py-3 font-semibold min-w-20'>{translateTerm('Web.Type')}</th>
                <th className='px-4 py-3 font-semibold min-w-32'>{translateTerm('Web.Label.Time')}</th>
                <th className='px-4 py-3 font-semibold min-w-52'>{translateTerm('Web.Condition')}</th>
                <th className='px-4 py-3 font-semibold min-w-28'>{translateTerm('Web.Event')}</th>
                <th className='px-4 py-3 font-semibold min-w-lg w-full'>{translateTerm('Web.BranchContent')}</th>
              </tr>
            </thead>
            {displayList.map((trigger: any) => {
              const flows = trigger.eventFlow || [];
              const rowCount = Math.max(1, flows.length);

              return (
                <tbody
                  key={trigger.id}
                  className={`divide-y divide-border/30 border-b border-border/70 transition-colors ${!trigger.active ? 'opacity-50 grayscale hover:opacity-100 hover:grayscale-0' : ''}`}
                >
                  {flows.length > 0 ? (
                    flows.map((flow: any, idx: number) => (
                      <tr key={`${trigger.id}-${flow.id}-${idx}`}>
                        {idx === 0 && (
                          <>
                            <td rowSpan={rowCount} className='p-2 align-top border-r border-border/30 whitespace-normal'>
                              <div id={`mission-${trigger.id}-${trigger.mission}`} className='scroll-mt-24 p-1 -m-1 font-mono text-primary break-all'>{trigger.mission}</div>
                              <div className='font-bold mt-1'>{translateTerm(`Mission.Name.${trigger.mission}`)}</div>
                              <div className='text-xs text-muted-foreground mt-1'>{translateTerm(`Mission.Desc.${trigger.mission}`, undefined, 0)}</div>
                            </td>
                            <td rowSpan={rowCount} className='p-2 align-top border-r border-border/30 whitespace-normal'>
                              <div id={`trigger-${trigger.id}`} className='scroll-mt-24 p-1 -m-1 font-mono text-primary break-all'>{trigger.id}</div>
                              <div className='font-bold mt-1'>{translateTerm(`Trigger.Name.${trigger.id}`)}</div>
                              <div className='text-xs text-muted-foreground mt-1'>{translateTerm(`Trigger.Desc.${trigger.id}`, undefined, 0)}</div>
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
                          <div id={`flow-${trigger.id}-${flow.id}-${idx}`} className='scroll-mt-24 p-1 -m-1 font-mono text-primary/80 break-all'>{flow.id}</div>
                          <div className='font-bold mt-1'>{translateTerm(`${flow.type}.Name.${flow.id}`)}</div>
                          <div className='text-xs text-muted-foreground mt-1'>{translateTerm(`${flow.type}.Desc.${flow.id}`, undefined, 0)}</div>
                        </td>
                        <td className='p-2 align-top whitespace-normal bg-background/30'>
                          <FlowContent flow={flow} scriptData={scriptData} combatData={combatData} battleData={battleData} />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className='px-4 py-3 align-top border-r border-border/30 whitespace-normal'>
                        <div id={`mission-${trigger.id}-${trigger.mission}`} className='scroll-mt-24 p-1 -m-1 font-mono text-primary break-all'>{trigger.mission}</div>
                        <div className='font-bold mt-1'>{translateTerm(`Mission.Name.${trigger.mission}`)}</div>
                        <div className='text-xs text-muted-foreground mt-1'>{translateTerm(`Mission.Desc.${trigger.mission}`, undefined, 0)}</div>
                      </td>
                      <td className='px-4 py-3 align-top border-r border-border/30 whitespace-normal'>
                        <div id={`trigger-${trigger.id}`} className='scroll-mt-24 p-1 -m-1 font-mono text-primary break-all'>{trigger.id}</div>
                        <div className='font-bold mt-1'>{translateTerm(`Trigger.Name.${trigger.id}`)}</div>
                        <div className='text-xs text-muted-foreground mt-1'>{translateTerm(`Trigger.Desc.${trigger.id}`, undefined, 0)}</div>
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
