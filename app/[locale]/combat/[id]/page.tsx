/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Suspense } from 'react';
import { useParams } from 'next/navigation';
import { CircleArrowRight, TableProperties, ChevronDown, Minus, Expand } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import { useItemDetail } from '@/hooks/queries/useItemDetail';
import { useSidebarStore } from '@/store/useSidebarStore';
import { DataRelation } from '@/components/shared/DataRelation';
import { ParsedText } from '@/components/shared/ParsedText';
import { TopNavbar } from '@/components/layout/TopNavbar';
import { Button } from '@/components/ui/button';

export default function CombatDetailClient() {
  return (
    <Suspense fallback={<div className='min-h-screen flex items-center justify-center text-muted-foreground tracking-widest animate-pulse'>Loading...</div>}>
      <CombatDetailContent />
    </Suspense>
  );
}

function CombatDetailContent() {
  const { translateTermWithParam } = useAppTranslation();
  const params = useParams();
  const id = params.id as string;
  const { data, isLoading, isError } = useItemDetail('combat', id);

  const isOpen = useSidebarStore((state) => state.isOpen);

  return (
    <main className={`min-h-screen bg-background text-foreground pb-20 transition-[padding] duration-300 ease-in-out ${isOpen ? 'md:pr-128 lg:pr-144' : ''}`}>
      {/* 頂部固定導覽列 */}
      <TopNavbar />

      {/* 主要閱讀區塊 */}
      <div className='max-w-5xl mx-auto px-6 space-y-6'>
        {isLoading && <div className='text-center text-muted-foreground py-10 tracking-widest animate-pulse'>{translateTermWithParam('Web.Msg.Loading', 'Combat')}</div>}
        {isError && <div className='text-center text-destructive py-10 bg-destructive/10 rounded-md'>{translateTermWithParam('Web.Msg.LoadError', 'Combat')}</div>}

        {/* 詳細資料模式 */}
        {!isLoading && !isError && data ? <DataDetail data={data} id={id} /> : null}
        {!isLoading && !isError && !data && <div className='text-center text-muted-foreground py-10'>{translateTermWithParam('Web.Msg.NotFound', 'Combat')}</div>}
      </div>
    </main>
  );
}

// 詳細資料元件
function DataDetail({ data, id }: { data: any; id: string }) {
  const { translateTerm, translateParagraph, translateTermWithParam } = useAppTranslation();
  const contentArray = data?.content || [];

  // 檢查來源
  const hasTrigger = Boolean(data?.rel?.from?.Trigger?.length);
  const hasPosition = Boolean(data?.rel?.from?.Position?.length);

  return (
    <div className='flex flex-col gap-8'>
      {/* 基本資訊 */}
      <div className='flex flex-col gap-4'>
        <div className='flex items-center justify-between border-b border-border/50 pb-2'>
          <h2 className='text-lg font-bold whitespace-nowrap'>{translateTermWithParam('Web.Info', 'Combat')}</h2>
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
              <Link href='/combat'>
                <TableProperties className='mr-1.5 size-3.5 rotate-180 text-muted-foreground' />
                {translateTerm('Web.ReturnList')}
              </Link>
            </Button>
          </div>
        </div>
        <div className='p-5 border rounded-xl shadow-sm bg-card'>
          <div className='space-y-4'>
            <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
              <div>
                <div className='text-xs text-muted-foreground mb-1'>{translateTerm('Web.Id')}</div>
                <div className='font-semibold text-foreground break-all'>{id}</div>
              </div>
              <div>
                <div className='text-xs text-muted-foreground mb-1'>{translateTerm('Web.Name')}</div>
                <div className='font-semibold text-foreground'>{translateTerm(`Combat.Name.${id}`)}</div>
              </div>
              <div>
                <div className='text-xs text-muted-foreground mb-1'>{translateTerm('Web.Enemy')}</div>
                <div className='font-semibold text-foreground'>{translateParagraph(data.enemy)}</div>
              </div>
            </div>
            <div className='border-t border-border/50 pt-4'>
              <div className='text-xs text-muted-foreground mb-1'>{translateTerm('Web.Desc')}</div>
              <div className='text-sm leading-relaxed text-foreground'>{translateTerm(`Combat.Desc.${id}`) || translateTerm('System.NA')}</div>
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

      {/* 內容分支 */}
      {contentArray.length > 0 && (
        <div className='flex flex-col gap-4'>
          <div className='flex items-center border-b border-border/50 pb-2'>
            <h2 className='text-lg font-bold whitespace-nowrap'>{translateTerm('Web.BranchContent')}</h2>
          </div>
          <div className='bg-card border rounded-xl p-5 shadow-sm overflow-x-auto font-mixed'>
            <div className='flex flex-col p-0 m-0 min-w-max sm:min-w-0'>
              {contentArray.map((node: any, idx: number) => (
                <DataContent key={idx} node={node} />
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

// 內容元件
function DataContent({ node }: { node: any }) {
  const { translateTerm } = useAppTranslation();
  if (!node) return null;
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
  if (node.form === 'branch') {
    return (
      <div>
        {node.branches?.map((branch: any, idx: number) => (
          <BranchItem key={idx} branch={branch} />
        ))}
      </div>
    );
  }
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
function BranchItem({ branch }: { branch: any }) {
  const isSingleEffect = branch.content?.length === 1 && branch.content[0].form === 'effect';
  const effectItems = isSingleEffect && typeof branch.content[0].text === 'string' ? branch.content[0].text.split(' / ') : [];
  return (
    <div className='flex flex-col'>
      <div
        className={`flex items-start py-0.5 -mx-0.5 gap-1 font-semibold text-sm/loose rounded-md transition-colors hover:bg-muted/80 ${isSingleEffect ? '' : 'cursor-pointer'}`}
        onClick={() => {
          if (typeof window !== 'undefined' && window.getSelection()?.toString().length) return;
        }}
      >
        <div className='flex pl-2 pr-0.5 py-1.5 items-center shrink-0 text-muted-foreground'>{isSingleEffect ? <Minus className='size-4' /> : <ChevronDown className='size-4' />}</div>
        <div className='flex flex-wrap items-center gap-x-0.5 gap-y-1 flex-1 min-w-0'>
          <div className='wrap-break-word mr-1'>
            <ParsedText text={branch.text} />
          </div>
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
      {!isSingleEffect && (
        <div className='flex flex-col pl-4 ml-4 mb-2 border-l-2 border-border/80'>
          {branch.content?.map((subNode: any, idx: number) => (
            <DataContent key={idx} node={subNode} />
          ))}
        </div>
      )}
    </div>
  );
}
