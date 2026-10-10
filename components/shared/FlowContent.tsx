/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Lock, Minus, CircleArrowRight, CircleFadingPlus, CircleCheck } from 'lucide-react';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import { ParsedText } from '@/components/shared/ParsedText';

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

export const FlowContent = ({ flow, triggerContent, scriptData, combatData, battleData }: any) => {
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
  
  if (flow.type === 'Trigger' && triggerContent) {
    const content = triggerContent;
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