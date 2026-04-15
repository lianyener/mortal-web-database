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

export default function FlagDetailClient() {
  return (
    <Suspense fallback={<div className='min-h-screen flex items-center justify-center text-muted-foreground tracking-widest animate-pulse'>Loading...</div>}>
      <FlagDetailContent />
    </Suspense>
  );
}

function FlagDetailContent() {
  const { translateTermWithParam } = useAppTranslation();
  const params = useParams();
  const id = params.id as string;
  const { data, isLoading, isError } = useItemDetail('flag', id);

  const isOpen = useSidebarStore((state) => state.isOpen);

  return (
    <main className={`min-h-screen bg-background text-foreground pb-20 transition-[padding] duration-300 ease-in-out ${isOpen ? 'md:pr-128 lg:pr-144' : ''}`}>
      {/* 頂部固定導覽列 */}
      <TopNavbar />

      {/* 主要閱讀區塊 */}
      <div className='max-w-5xl mx-auto px-6 space-y-6 transition-all duration-300'>
        {isLoading && <div className='text-center text-muted-foreground py-10 tracking-widest animate-pulse'>{translateTermWithParam('Web.Msg.Loading', 'Flag')}</div>}
        {isError && <div className='text-center text-destructive py-10 bg-destructive/10 rounded-md'>{translateTermWithParam('Web.Msg.LoadError', 'Flag')}</div>}

        {/* 詳細資料模式 */}
        {!isLoading && !isError && data ? <DataDetail data={data} id={id} /> : null}
        {!isLoading && !isError && !data && <div className='text-center text-muted-foreground py-10'>{translateTermWithParam('Web.Msg.NotFound', 'Flag')}</div>}
      </div>
    </main>
  );
}

// 詳細資料元件
function DataDetail({ data, id }: { data: any; id: string }) {
  const { translateTerm, translateTermWithParam } = useAppTranslation();

  // 判斷類別(Combat/Battle/Script)取得Script標籤
  const getScriptLabel = (s: string) => {
    if (s.startsWith('CL_')) return `[*Label.Combat,${s}*]`;
    if (s.startsWith('BL_')) return `[*Label.Battle,${s}*]`;
    return `[*Label.Script,${s}*]`;
  };

  return (
    <div className='flex flex-col gap-8'>
      {/* 基本資訊 */}
      <div className='flex flex-col gap-4'>
        <div className='flex items-center justify-between border-b border-border/50 pb-2'>
          <h2 className='text-lg font-bold'>{translateTermWithParam('Web.Info', 'Flag')}</h2>
          <div className='flex items-center'>
            <Button asChild variant='outline' size='sm' className='h-8 px-2.5 text-xs'>
              <Link href='/flag'>
                <TableProperties className='mr-1.5 size-3.5 rotate-180 text-muted-foreground' />
                {translateTerm('Web.ReturnList')}
              </Link>
            </Button>
          </div>
        </div>
        <div className='p-5 border rounded-xl shadow-sm bg-card'>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <div>
              <div className='text-xs text-muted-foreground mb-1'>{translateTerm('Web.Id')}</div>
              <div className='font-semibold text-foreground break-all'>{id}</div>
            </div>
            <div>
              <div className='text-xs text-muted-foreground mb-1'>{translateTerm('Web.Init')}</div>
              <div className='font-semibold text-foreground'>{data.init}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Flag專用資訊清單 */}
      {data.data && Array.isArray(data.data) && (
        <div className='flex flex-col gap-4 mt-2'>
          <h2 className='text-lg font-bold border-b border-border/50 pb-2'>{translateTermWithParam('Web.Content', 'Flag')}</h2>
          <div className='grid grid-cols-1 gap-4'>
            {data.data.map((item: any, index: number) => {
              const subName = translateTerm(`Flag.${id}.${index}`);
              const subDesc = translateTerm(`Flag.${id}.${index}.Desc`);

              return (
                <div key={index} className='p-5 bg-card rounded-xl border shadow-sm hover:border-primary/40 transition-colors'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div className='flex flex-col gap-4'>
                      <div className='pb-3 border-b border-border/50'>
                        <div className='mb-1.5 text-xs text-muted-foreground'>{translateTerm('Web.Scenario')}</div>
                        {item.script && Array.isArray(item.script) && item.script.length > 0 ? (
                          <div className='flex flex-wrap -ml-1 gap-1 text-sm font-mixed'>
                            {item.script.map((s: string) => (
                              <ParsedText key={s} text={getScriptLabel(s)} />
                            ))}
                          </div>
                        ) : (
                          <div className='font-semibold text-muted-foreground text-sm'>{translateTerm('Web.DefaultScenario')}</div>
                        )}
                      </div>
                      <div>
                        <div className='mb-1.5 text-xs text-muted-foreground'>{translateTermWithParam('Web.Info', 'Flag')}</div>
                        <div className='font-bold text-base text-foreground'>{subName}</div>
                        {subDesc && <div className='mt-1 text-sm/relaxed text-muted-foreground'>{subDesc}</div>}
                      </div>
                    </div>

                    <div className='flex flex-col'>
                      <div className='mb-1.5 text-xs text-muted-foreground'>{translateTerm('Web.ValueDef')}</div>
                      {item.value && Object.keys(item.value).length > 0 ? (
                        <div className='flex flex-col gap-1.5 bg-muted/30 p-3 rounded-md border border-border/50 font-mixed'>
                          {Object.entries(item.value).map(([valKey, valText]: [string, any]) => (
                            <div key={valKey} className='flex gap-2.5'>
                              <span className='w-8 px-1.5 py-0.5 text-secondary-foreground text-center bg-secondary rounded border border-secondary-foreground/20 shrink-0 font-mono text-xs mt-0.5 flex items-center justify-center min-h-5'>
                                {valKey}
                              </span>
                              <div className='flex-1 py-0.5 text-sm'>
                                <ParsedText text={String(valText)} />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className='text-sm text-muted-foreground bg-muted/30 p-3 rounded-md border border-border/50 italic'>{translateTerm('Web.NoValueDef')}</div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 關聯項目 */}
      {data.rel && (
        <div className='flex flex-col gap-4 mt-2'>
          <h2 className='pb-2 text-lg font-bold border-b border-border/50'>{translateTerm('Web.Relations')}</h2>
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
