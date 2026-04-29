/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Suspense } from 'react';
import { useParams } from 'next/navigation';
import { CircleArrowRight, TableProperties } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import { useItemDetail } from '@/hooks/queries/useItemDetail';
import { useSidebarStore } from '@/store/useSidebarStore';
import { DataRelation } from '@/components/shared/DataRelation';
import { ParsedText } from '@/components/shared/ParsedText';
import { TopNavbar } from '@/components/layout/TopNavbar';
import { Button } from '@/components/ui/button';

export default function BattleDetailClient() {
  return (
    <Suspense fallback={<div className='min-h-screen flex items-center justify-center text-muted-foreground tracking-widest animate-pulse'>Loading...</div>}>
      <BattleDetailContent />
    </Suspense>
  );
}

function BattleDetailContent() {
  const { translateTermWithParam } = useAppTranslation();
  const params = useParams();
  const id = params.id as string;
  const { data, isLoading, isError } = useItemDetail('battle', id);

  const isOpen = useSidebarStore((state) => state.isOpen);

  return (
    <main className={`min-h-screen bg-background text-foreground pb-20 transition-[padding] duration-300 ease-in-out ${isOpen ? 'md:pr-128 lg:pr-144' : ''}`}>
      {/* 頂部固定導覽列 */}
      <TopNavbar />

      {/* 主要閱讀區塊 */}
      <div className='max-w-5xl mx-auto px-6 space-y-6'>
        {isLoading && <div className='text-center text-muted-foreground py-10 tracking-widest animate-pulse'>{translateTermWithParam('Web.Msg.Loading', 'Battle')}</div>}
        {isError && <div className='text-center text-destructive py-10 bg-destructive/10 rounded-md'>{translateTermWithParam('Web.Msg.LoadError', 'Battle')}</div>}

        {/* 詳細資料模式 */}
        {!isLoading && !isError && data ? <DataDetail data={data} id={id} /> : null}
        {!isLoading && !isError && !data && <div className='text-center text-muted-foreground py-10'>{translateTermWithParam('Web.Msg.NotFound', 'Battle')}</div>}
      </div>
    </main>
  );
}

// 詳細資料元件
function DataDetail({ data, id }: { data: any; id: string }) {
  const { translateTerm, translateParagraph, translateTermWithParam } = useAppTranslation();

  // 預處理陣容資料
  const groups = [
    { key: 'friend', label: translateTerm('Web.Friend') },
    { key: 'enemy', label: translateTerm('Web.Enemy') },
    { key: 'neutral', label: translateTerm('Web.Neutral') }
  ];
  const groupCount = groups.reduce((count, g) => {
    if (data?.[g.key]?.name && data[g.key].name.length > 0) count++;
    return count;
  }, 0);

  return (
    <div className='flex flex-col gap-8'>
      {/* 基本資訊 */}
      <div className='flex flex-col gap-4'>
        <div className='flex items-center justify-between border-b border-border/50 pb-2'>
          <h2 className='text-lg font-bold'>{translateTermWithParam('Web.Info', 'Battle')}</h2>
          <div className='flex items-center'>
            <Button asChild variant='outline' size='sm' className='h-8 px-2.5 text-xs'>
              <Link href='/battle'>
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
                <div className='font-semibold text-foreground'>{id}</div>
              </div>
              <div>
                <div className='text-xs text-muted-foreground mb-1'>{translateTerm('Web.Name')}</div>
                <div className='font-semibold text-foreground'>{translateTerm(`Battle.Name.${id}`)}</div>
              </div>
              <div>
                <div className='text-xs text-muted-foreground mb-1'>{translateTerm('Web.Type')}</div>
                <div className='font-semibold text-foreground'>{translateTerm(`EnemyTeam.${data.type}`)}</div>
              </div>
            </div>

            <div className='border-t border-border/50 pt-4'>
              <div className='text-xs text-muted-foreground mb-1'>{translateTerm('Web.Desc')}</div>
              <div className='text-sm leading-relaxed text-foreground'>{translateTerm(`Battle.Desc.${id}`, undefined, 1) || translateTerm('System.NA')}</div>
            </div>

            {data.remark && (Array.isArray(data.remark) ? data.remark.length > 0 : true) && (
              <div>
                <div className='text-xs text-muted-foreground mb-1'>{translateTerm('Web.Remark')}</div>
                <div className='px-2.5 py-1.5 text-sm text-amber-700 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/30 rounded-md border border-amber-200 dark:border-amber-900/50'>
                  {Array.isArray(data.remark) ? data.remark.map((r: string, i: number) => <div key={i}>{translateParagraph(r)}</div>) : translateParagraph(data.remark)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 戰役內容 */}
      {groupCount > 0 && (
        <div className='flex flex-col gap-4'>
          <div className='pb-2 flex items-center border-b border-border/50'>
            <h2 className='text-lg font-bold'>{translateTermWithParam('Web.Content', 'Battle')}</h2>
          </div>
          <div className='bg-card border rounded-xl p-5 shadow-sm overflow-x-auto font-mixed'>
            {/* 戰役陣容 */}
            <div className={`grid grid-cols-1 sm:grid-cols-${groupCount} gap-4 mb-3`}>
              {groups.map((group) => {
                if (!data[group.key]?.name || data[group.key].name.length === 0) return null;
                const list = data[group.key].name;
                const people = String(data[group.key].people);
                return (
                  <div key={group.key} className='flex flex-col gap-2'>
                    <h3 className='font-bold text-primary border-b border-border/40 pb-1.5'>{group.label}</h3>
                    <div className='flex items-start gap-0.5 bg-muted/30 px-2.5 py-1 text-sm/loose rounded-md border border-border/50'>
                      <div className='whitespace-nowrap'>{translateTerm('Web.People')}:</div>
                      <div>
                        <ParsedText text={people} />
                      </div>
                    </div>
                    <div className='flex items-start gap-0.5 h-full bg-muted/30 px-2.5 py-1 text-sm/loose rounded-md border border-border/50'>
                      <div className='whitespace-nowrap'>{translateTerm('Web.Team')}:</div>
                      <div className='flex flex-wrap w-full whitespace-nowrap'>
                        {list.map((item: any, i: number) => (
                          <div key={i} className='mr-1.5'>
                            <ParsedText text={item} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 結束條件 */}
            <div className='pt-3'>
              <h3 className='font-bold text-primary border-b border-border/40 pb-1.5'>{translateTerm('Web.End')}</h3>
              <div className='flex flex-col items-start pt-2 gap-1 text-sm/loose'>
                {data.end &&
                  data.end.map((item: any, i: number) => (
                    <div key={i} className='flex items-start w-full py-0.5 gap-1 rounded-md transition-colors hover:bg-muted/80'>
                      <span className='pl-1.5 text-muted-foreground shrink-0 select-none'>{i + 1}.</span>
                      <div className='flex flex-wrap items-center gap-x-0.5 gap-y-1 flex-1 min-w-0'>
                        <ParsedText text={`${item.condition}`} />
                        <div className='flex items-start gap-1.5 ml-1 text-foreground font-normal'>
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
            </div>
          </div>
        </div>
      )}

      {/* 關聯項目 */}
      {data.rel && (
        <div className='flex flex-col gap-4 mt-2'>
          <h2 className='text-lg font-bold border-b border-border/50 pb-2'>{translateTerm('Web.Relations')}</h2>
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