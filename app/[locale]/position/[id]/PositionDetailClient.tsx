/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Suspense } from 'react';
import { useParams } from 'next/navigation';
import { TableProperties } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import { useItemDetail } from '@/hooks/queries/useItemDetail';
import { useSidebarStore } from '@/store/useSidebarStore';
import { DataRelation } from '@/components/shared/DataRelation';
import { ParsedText } from '@/components/shared/ParsedText';
import { TopNavbar } from '@/components/layout/TopNavbar';
import { Button } from '@/components/ui/button';

export default function PositionDetailClient() {
  return (
    <Suspense fallback={<div className='min-h-screen flex items-center justify-center text-muted-foreground tracking-widest animate-pulse'>Loading...</div>}>
      <PositionDetailContent />
    </Suspense>
  );
}

function PositionDetailContent() {
  const { translateTermWithParam } = useAppTranslation();
  const params = useParams();
  const id = params.id as string;
  const { data, isLoading, isError } = useItemDetail('position', id);

  const isOpen = useSidebarStore((state) => state.isOpen);

  return (
    <main className={`min-h-screen bg-background text-foreground pb-20 transition-[padding] duration-300 ease-in-out ${isOpen ? 'md:pr-128 lg:pr-144' : ''}`}>
      {/* 頂部固定導覽列 */}
      <TopNavbar />

      {/* 主要閱讀區塊 */}
      <div className='max-w-5xl mx-auto px-6 space-y-6'>
        {isLoading && <div className='text-center text-muted-foreground py-10 tracking-widest animate-pulse'>{translateTermWithParam('Web.Msg.Loading', 'Position')}</div>}
        {isError && <div className='text-center text-destructive py-10 bg-destructive/10 rounded-md'>{translateTermWithParam('Web.Msg.LoadError', 'Position')}</div>}

        {/* 詳細資料模式 */}
        {!isLoading && !isError && data ? <DataDetail data={data} id={id} /> : null}
        {!isLoading && !isError && !data && <div className='text-center text-muted-foreground py-10'>{translateTermWithParam('Web.NotFound', 'Web.Label.Position')}</div>}
      </div>
    </main>
  );
}

// 詳細資料元件
function DataDetail({ data, id }: { data: any; id: string }) {
  const { translateTerm, translateParagraph, translateTermWithParam } = useAppTranslation();

  return (
    <div className='flex flex-col gap-8'>
      {/* 基本資訊 */}
      <div className='flex flex-col gap-4'>
        <div className='flex items-center justify-between border-b border-border/50 pb-2'>
          <h2 className='text-lg font-bold whitespace-nowrap'>{translateTermWithParam('Web.Info', 'Web.Label.Position')}</h2>
          <div className='flex items-center'>
            <Button asChild variant='outline' size='sm' className='h-8 px-2.5 text-xs'>
              <Link href='/position'>
                <TableProperties className='mr-1.5 size-3.5 rotate-180 text-muted-foreground' />
                {translateTerm('Web.ReturnList')}
              </Link>
            </Button>
          </div>
        </div>

        <div className='p-5 border rounded-xl shadow-sm bg-card'>
          <div className='space-y-4'>
            <div>
              <div className='text-xs text-muted-foreground mb-1'>{translateTerm('Web.Id')}</div>
              <div className='font-semibold text-foreground'>{id}</div>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-border/50 pt-4'>
              <div>
                <div className='text-xs text-muted-foreground mb-1'>{translateTerm('Web.Period')}</div>
                <div className='font-semibold text-sm text-foreground'>{translateParagraph(data.period)}</div>
              </div>
              <div>
                <div className='text-xs text-muted-foreground mb-1'>{translateTerm('Web.Label.Position')}</div>
                <div className='font-semibold text-sm text-foreground'>{translateParagraph(data.position)}</div>
              </div>
              <div>
                <div className='text-xs text-muted-foreground mb-1'>{translateTerm('Web.Action')}</div>
                <div className='font-semibold text-sm text-foreground'>{translateParagraph(data.action)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 事件列表 */}
      {data.event && Object.keys(data.event).length > 0 && (
        <div className='flex flex-col gap-4'>
          <div className='flex items-center justify-between border-b border-border/50 pb-2'>
            <h2 className='text-lg font-bold whitespace-nowrap'>{translateTermWithParam('Web.List', 'Web.Label.Event')}</h2>
          </div>
          <EventTable events={data.event} />
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

// 事件列表元件 (DataTable)
function EventTable({ events }: { events: Record<string, any> }) {
  const { translateTerm, translateParagraph } = useAppTranslation();

  return (
    <div className='bg-card border rounded-xl shadow-sm overflow-hidden'>
      <div className='overflow-x-auto'>
        <table className='w-full text-sm text-left whitespace-nowrap'>
          <thead className='bg-muted/50 text-muted-foreground border-b border-border/50'>
            <tr>
              <th className='px-4 py-3 font-semibold min-w-10'>{translateTerm('Web.Class')}</th>
              <th className='px-4 py-3 font-semibold min-w-60'>{translateTerm('Web.Condition')}</th>
              <th className='px-4 py-3 font-semibold min-w-48'>{translateTerm('Web.Rate')}</th>
              <th className='px-4 py-3 font-semibold min-w-48'>{translateTerm('Web.Label.Script')}</th>
            </tr>
          </thead>
          {Object.entries(events)
            .sort(([idA], [idB]) => idA.localeCompare(idB))
            .map(([eventId, eventData]: [string, any]) => {
              const classId = eventId.charAt(0);
              const hasRemark = eventData.remark && eventData.remark.length > 0;
              return (
                <tbody key={eventId} className='border-b border-border/70 last:border-b-0 group font-mixed'>
                  <tr className='transition-colors group-hover:bg-muted/50'>
                    <td className='px-4 py-3.5 align-top'>{translateTerm(`Position.Class.${classId}`)}</td>
                    <td className='px-4 py-3 text-foreground/80 align-top'>
                      {eventData.condition && eventData.condition.length > 0 ? (
                        <div className='flex flex-col gap-1.5'>
                          {eventData.condition.map((cond: string, i: number) => (
                            <div key={i}>
                              <span className='text-muted-foreground'>{i + 1}.</span>
                              <ParsedText text={cond} />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className='text-muted-foreground/50'>-</span>
                      )}
                    </td>
                    <td className='px-4 py-3 text-foreground/80 align-top'>
                      {eventData.rate && eventData.rate.length > 0 ? (
                        <div className='flex flex-col gap-1.5'>
                          {eventData.rate.map((rate: string, i: number) => (
                            <div key={i}>
                              <ParsedText text={rate} />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className='text-muted-foreground/50'>-</span>
                      )}
                    </td>
                    <td className='px-4 py-3.5 align-top'>
                      {eventData.script ? (
                        <div className='flex flex-col gap-1.5'>
                          <div>
                            <ParsedText text={`[*Label.Script,${eventData.script}*]`} />
                          </div>
                          <div className='ml-4.5'>({translateTerm(`Script.Name.${eventData.script}`)})</div>
                        </div>
                      ) : (
                        <span className='text-muted-foreground/50'>-</span>
                      )}
                    </td>
                  </tr>
                  {hasRemark && (
                    <tr className='transition-colors group-hover:bg-muted/50'>
                      <td colSpan={4} className='px-3 pb-3 pt-0 align-top whitespace-normal'>
                        <div className='flex flex-col gap-1 text-amber-700 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/20 px-3 py-2 rounded-md border border-amber-200/50 dark:border-amber-900/50'>
                          {eventData.remark.map((r: string, i: number) => (
                            <div key={i}>{translateParagraph(r)}</div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              );
            })}
        </table>
      </div>
    </div>
  );
}
