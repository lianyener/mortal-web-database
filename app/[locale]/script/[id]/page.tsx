/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Suspense, useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { ChevronDown, ChevronRight, Lock, Minus, CircleArrowRight, CircleFadingPlus, UnfoldVertical, FoldVertical, TableProperties, Filter, CircleCheck, Expand } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import { useItemDetail } from '@/hooks/queries/useItemDetail';
import { useSidebarStore } from '@/store/useSidebarStore';
import { DataRelation } from '@/components/shared/DataRelation';
import { ParsedText } from '@/components/shared/ParsedText';
import { TopNavbar } from '@/components/layout/TopNavbar';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';

export default function ScriptDetailClient() {
  return (
    <Suspense fallback={<div className='min-h-screen flex items-center justify-center text-muted-foreground tracking-widest animate-pulse'>Loading...</div>}>
      <ScriptDetailContent />
    </Suspense>
  );
}

function ScriptDetailContent() {
  const { translateTermWithParam } = useAppTranslation();
  const params = useParams();
  const id = params.id as string;
  const { data, isLoading, isError } = useItemDetail('script', id);

  const isOpen = useSidebarStore((state) => state.isOpen);

  return (
    <main className={`min-h-screen bg-background text-foreground pb-20 transition-[padding] duration-300 ease-in-out ${isOpen ? 'md:pr-128 lg:pr-144' : ''}`}>
      {/* 頂部固定導覽列 */}
      <TopNavbar />

      {/* 主要閱讀區塊 */}
      <div className='max-w-5xl mx-auto px-6 space-y-6'>
        {isLoading && <div className='text-center text-muted-foreground py-10 tracking-widest animate-pulse'>{translateTermWithParam('Web.Msg.Loading', 'Script')}</div>}
        {isError && <div className='text-center text-destructive py-10 bg-destructive/10 rounded-md'>{translateTermWithParam('Web.Msg.LoadError', 'Script')}</div>}

        {/* 詳細資料模式 */}
        {!isLoading && !isError && data ? <DataDetail data={data} id={id} /> : null}
        {!isLoading && !isError && !data && <div className='text-center text-muted-foreground py-10'>{translateTermWithParam('Web.NotFound', 'Web.Script')}</div>}
      </div>
    </main>
  );
}

// 詳細資料元件
function DataDetail({ data, id }: { data: any; id: string }) {
  const { translateTerm, translateParagraph, translateTermWithParam } = useAppTranslation();

  const contentArray = data?.content || [];
  const availableEffects = useMemo(() => (Array.isArray(data?.effects) ? data.effects : []), [data]);
  const [selectedEffects, setSelectedEffects] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [treeActionId, setTreeActionId] = useState(0);
  const [isGlobalExpand, setIsGlobalExpand] = useState(true);

  // 檢查來源
  const hasTrigger = Boolean(data?.rel?.from?.Trigger?.length);
  const hasPosition = Boolean(data?.rel?.from?.Position?.length);

  // 當載入新劇本時，預設全選所有 effect 類別
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedEffects(availableEffects);
  }, [availableEffects]);

  return (
    <div className='flex flex-col gap-8'>
      {/* 基本資訊 */}
      <div className='flex flex-col gap-4'>
        <div className='flex items-center justify-between border-b border-border/50 pb-2'>
          <h2 className='text-lg font-bold whitespace-nowrap'>{translateTermWithParam('Web.Info', 'Script')}</h2>
          <div className='flex justify-end items-center gap-2'>
            {hasTrigger && (
              <Button asChild variant='outline' size='sm' className='h-8 px-2.5 text-xs'>
                <Link href={`/event?cat=script#${id}`}>
                  <Expand className='mr-1.5 size-3.5 text-muted-foreground' />
                  {translateTerm('Web.OpenInEventTable')}
                </Link>
              </Button>
            )}
            {hasPosition && (
              <Button asChild variant='outline' size='sm' className='h-8 px-2.5 text-xs'>
                <Link href={`/random?cat=script#${id}`}>
                  <Expand className='mr-1.5 size-3.5 text-muted-foreground' />
                  {translateTerm('Web.OpenInRandomTable')}
                </Link>
              </Button>
            )}
            <Button asChild variant='outline' size='sm' className='h-8 px-2.5 text-xs'>
              <Link href='/script'>
                <TableProperties className='mr-1.5 size-3.5 rotate-180 text-muted-foreground' />
                {translateTerm('Web.ReturnList')}
              </Link>
            </Button>
          </div>
        </div>
        <div className='p-5 border rounded-xl shadow-sm bg-card'>
          <div className='space-y-4'>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <div>
                <div className='text-xs text-muted-foreground mb-1'>{translateTerm('Web.Id')}</div>
                <div className='font-semibold text-foreground break-all'>{id}</div>
              </div>
              <div>
                <div className='text-xs text-muted-foreground mb-1'>{translateTerm('Web.Name')}</div>
                <div className='font-semibold text-foreground'>{translateTerm(`Script.Name.${id}`)}</div>
              </div>
            </div>
            <div>
              <div className='text-xs text-muted-foreground mb-1'>{translateTerm('Web.Desc')}</div>
              <div className='text-sm leading-relaxed text-foreground whitespace-pre-wrap'>{translateTerm(`Script.Desc.${id}`, undefined, 1) || translateTerm('System.NA')}</div>
            </div>
            {data.remark && (Array.isArray(data.remark) ? data.remark.length > 0 : true) && (
              <div>
                <div className='text-xs text-muted-foreground mb-1'>{translateTerm('Web.Remark')}</div>
                <div className='px-2.5 py-1.5 text-sm text-amber-700 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/30 rounded-md border border-amber-200 dark:border-amber-900/50'>
                  {data.remark.map((r: string, i: number) => (
                    <div key={i}>
                      <ParsedText text={translateParagraph(r, 1, false)} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 劇本內容 */}
      {contentArray.length > 0 && (
        <div className='flex flex-col gap-4'>
          <div className='flex items-center justify-between border-b border-border/50 pb-2'>
            <h2 className='mr-1 text-lg font-bold whitespace-nowrap'>{translateTerm('Web.BranchContent')}</h2>
            <div className='flex flex-wrap justify-end items-center gap-2'>
              {/* 篩選分支下拉選單 */}
              {availableEffects.length > 0 && (
                <div className='relative' title={translateTerm('Web.Msg.FilterSwitch')}>
                  <Button variant='outline' size='sm' onClick={() => setIsFilterOpen(!isFilterOpen)} className='h-8 px-2.5 text-xs'>
                    <Filter className='mr-1.5 size-3.5 text-muted-foreground' />
                    {translateTerm('Web.FilterSwitch')} ({selectedEffects.length}/{availableEffects.length})
                  </Button>
                  {isFilterOpen && (
                    <>
                      <div className='fixed inset-0 z-40' onClick={() => setIsFilterOpen(false)} />
                      <div className='absolute right-0 sm:right-auto sm:left-0 top-full mt-1 w-max min-w-44 bg-popover/95 backdrop-blur-sm border rounded-md shadow-lg z-50 p-2 flex flex-col gap-1 max-h-[60vh] overflow-y-auto'>
                        <div className='flex items-center justify-between px-1 pb-1 mb-1 border-b border-border/50'>
                          <button className='text-xs text-primary hover:underline font-semibold' onClick={() => setSelectedEffects(availableEffects)}>
                            {translateTerm('Web.SelectAll')}
                          </button>
                          <button className='text-xs text-muted-foreground hover:underline font-semibold' onClick={() => setSelectedEffects([])}>
                            {translateTerm('Web.DeselectAll')}
                          </button>
                        </div>
                        {availableEffects.map((effect: any) => (
                          <label key={effect} className='flex items-center gap-2 px-2 py-1.5 hover:bg-muted/80 rounded cursor-pointer select-none'>
                            <input
                              type='checkbox'
                              className='rounded border-primary/50 text-primary focus:ring-primary size-3.5'
                              checked={selectedEffects.includes(effect)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedEffects([...selectedEffects, effect]);
                                } else {
                                  setSelectedEffects(selectedEffects.filter((x) => x !== effect));
                                }
                              }}
                            />
                            <span className='text-sm flex items-center gap-1.5'>
                              <span className='text-muted-foreground opacity-80'>{translateTerm(`LabelIcon.${effect}`)}</span>
                              <span className='font-semibold'>{translateTerm(`Web.Label.${effect}`)}</span>
                            </span>
                          </label>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* 全域展開/收合按鈕 */}
              <ButtonGroup>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => {
                    setIsGlobalExpand(true);
                    setTreeActionId((v) => v + 1);
                  }}
                  className='h-8 px-2.5 text-xs'
                >
                  <UnfoldVertical className='mr-1.5 size-3.5 text-muted-foreground' />
                  {translateTerm('Web.ExpandAll')}
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => {
                    setIsGlobalExpand(false);
                    setTreeActionId((v) => v + 1);
                  }}
                  className='h-8 px-2.5 text-xs'
                >
                  <FoldVertical className='mr-1.5 size-3.5 text-muted-foreground' />
                  {translateTerm('Web.CollapseAll')}
                </Button>
              </ButtonGroup>
            </div>
          </div>
          <div className='bg-card border rounded-xl p-5 shadow-sm overflow-x-auto font-mixed'>
            <div className='flex flex-col min-w-max sm:min-w-0'>
              {contentArray.map((node: any, idx: number) => (
                <DataContent key={idx} node={node} treeActionId={treeActionId} isGlobalExpand={isGlobalExpand} selectedEffects={selectedEffects} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 關聯項目 */}
      {data.rel && (
        <div className='flex flex-col gap-4 mt-2'>
          <h2 className='pb-2 text-lg font-bold border-b border-border/50 whitespace-nowrap'>{translateTerm('Web.Relations')}</h2>
          <div className='flex flex-col gap-3'>
            {Object.entries(data.rel).map(([phase, types]) => (
              <DataRelation key={phase} phase={phase} types={types} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// 劇本內容元件 (Tree)
function DataContent({ node, treeActionId, isGlobalExpand, selectedEffects }: { node: any; treeActionId: number; isGlobalExpand: boolean; selectedEffects?: string[] }) {
  const { translateTerm } = useAppTranslation();
  if (!node) return null;

  // Effect內容
  if (node.form === 'effect') {
    const textStr = typeof node.text === 'string' ? node.text : '';
    const effectItems = textStr.split(' / ');

    return (
      <div className='flex items-start gap-2 px-3 py-0.5 text-foreground text-sm/loose rounded-md hover:bg-muted/80 transition-colors'>
        <CircleArrowRight className='size-4 shrink-0 text-muted-foreground/50 mt-1.25' />
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

  // 分岐內容
  if (node.form === 'branch') {
    // 判斷 Switch 分岐是否因為 Filter 被隱藏
    if (node.type === 'Switch' && selectedEffects && Array.isArray(node.effects) && node.effects.length > 0) {
      const hasSelectedEffect = node.effects.some((e: string) => selectedEffects.includes(e));
      if (!hasSelectedEffect) return null;
    }

    const textStr = typeof node.text === 'string' ? node.text : '';
    const branchTextItems = textStr.split(' / ');
    const label = branchTextItems.shift();

    return (
      <div>
        <div className='flex items-start px-2 py-0.5 gap-2 font-bold text-primary text-sm/loose rounded-md hover:bg-muted/80 transition-colors'>
          <div className='shrink-0'>
            <ParsedText text={label} />
          </div>
          {node.type === 'Dice' && branchTextItems.length > 0 && (
            <div className='flex items-start gap-2'>
              <CircleCheck className='size-4 shrink-0 text-muted-foreground/50 mt-1.25' />
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
        <div className='flex flex-col pl-1 ml-2'>
          {node.branches?.map((branch: any) => (
            <BranchItem key={branch.index} branch={branch} treeActionId={treeActionId} isGlobalExpand={isGlobalExpand} selectedEffects={selectedEffects} />
          ))}
        </div>
      </div>
    );
  }

  // 演出內容
  if (node.form === 'perform') {
    return (
      <div className='flex items-start gap-2 px-3 py-0.5 text-foreground text-sm/loose rounded-md hover:bg-muted/80 transition-colors'>
        <CircleArrowRight className='size-4 shrink-0 text-muted-foreground/50 mt-1.25' />
        <div className='flex-1'>
          <ParsedText text={node.text} />
        </div>
      </div>
    );
  }

  return (
    <div className='px-3 py-0.5 text-sm/loose bg-destructive/10 text-destructive rounded-md border'>
      {translateTerm('Web.UnknownNode')}: {JSON.stringify(node)}
    </div>
  );
}

// 分岐項目
function BranchItem({ branch, treeActionId, isGlobalExpand, selectedEffects }: { branch: any; treeActionId: number; isGlobalExpand: boolean; selectedEffects?: string[] }) {
  const [isExpanded, setIsExpanded] = useState(isGlobalExpand);
  const { translateTerm } = useAppTranslation();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (treeActionId > 0) setIsExpanded(isGlobalExpand);
  }, [treeActionId, isGlobalExpand]);

  const isSingleEffect = branch.content?.length === 1 && branch.content[0].form === 'effect';
  const effectItems = isSingleEffect && typeof branch.content[0].text === 'string' ? branch.content[0].text.split(' / ') : [];
  const effectsList = Array.isArray(branch.effects) ? branch.effects : [];

  return (
    <div className='flex flex-col'>
      <div
        className={`flex items-start px-3 py-0.5 -mx-0.5 gap-1 font-semibold text-sm/loose rounded-md transition-colors hover:bg-muted/80 ${isSingleEffect ? '' : 'cursor-pointer'}`}
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
        <div className='flex flex-wrap items-center -ml-3.5 gap-x-0.5 gap-y-1 flex-1 min-w-0'>
          <div className='wrap-break-word ml-3.5 mr-1'>
            <ParsedText text={branch.text} />
          </div>
          {branch.condition && (
            <span className='flex items-center pl-1 gap-0.5 leading-[22.25px] text-muted-foreground rounded border'>
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
              <CircleArrowRight className='size-4 shrink-0 text-muted-foreground/50 mt-1.25' />
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
        <div className='flex flex-col pl-4 ml-4 mb-2 border-l-2 border-border/80'>
          {branch.content?.map((subNode: any, idx: number) => (
            <DataContent key={idx} node={subNode} treeActionId={treeActionId} isGlobalExpand={isGlobalExpand} selectedEffects={selectedEffects} />
          ))}
        </div>
      )}
    </div>
  );
}
