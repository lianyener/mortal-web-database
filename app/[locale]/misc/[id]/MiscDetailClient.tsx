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
import { TopNavbar } from '@/components/layout/TopNavbar';
import { Button } from '@/components/ui/button';

export default function MiscDetailClient() {
  return (
    <Suspense fallback={<div className='min-h-screen flex items-center justify-center text-muted-foreground tracking-widest animate-pulse'>Loading...</div>}>
      <MiscDetailContent />
    </Suspense>
  );
}

function MiscDetailContent() {
  const { translateTermWithParam } = useAppTranslation();
  const params = useParams();
  const id = params.id as string;
  const { data, isLoading, isError } = useItemDetail('misc', id);

  const isOpen = useSidebarStore((state) => state.isOpen);

  return (
    <main className={`min-h-screen bg-background text-foreground pb-20 transition-[padding] duration-300 ease-in-out ${isOpen ? 'md:pr-128 lg:pr-144' : ''}`}>
      {/* 頂部固定導覽列 */}
      <TopNavbar />

      {/* 主要閱讀區塊 */}
      <div className='max-w-5xl mx-auto px-6 space-y-6 transition-all duration-300'>
        {isLoading && <div className='text-center text-muted-foreground py-10 tracking-widest animate-pulse'>{translateTermWithParam('Web.Msg.Loading', 'Misc')}</div>}
        {isError && <div className='text-center text-destructive py-10 bg-destructive/10 rounded-md'>{translateTermWithParam('Web.Msg.LoadError', 'Misc')}</div>}

        {/* 詳細資料模式 */}
        {!isLoading && !isError && data ? <DataDetail data={data} id={id} /> : null}
        {!isLoading && !isError && !data && <div className='text-center text-muted-foreground py-10'>{translateTermWithParam('Web.Msg.NotFound', 'Misc')}</div>}
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
          <h2 className='text-lg font-bold'>{translateTermWithParam('Web.Info', 'Misc')}</h2>
          <div className='flex items-center'>
            <Button asChild variant='outline' size='sm' className='h-8 px-2.5 text-xs'>
              <Link href='/misc'>
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
                <div className='font-semibold text-foreground'>{translateTerm(`Misc.Name.${id}`, undefined, 1)}</div>
              </div>
              <div>
                <div className='text-xs text-muted-foreground mb-1'>{translateTerm('Web.Cost')}</div>
                <div className='font-semibold text-foreground'>{data.cost ?? translateTerm('System.NA')}</div>
              </div>
            </div>
            <div className='border-t border-border/50 pt-4'>
              <div className='text-xs text-muted-foreground mb-1'>{translateTerm('Web.Desc')}</div>
              <div className='text-sm leading-relaxed text-foreground whitespace-pre-wrap'>{translateTerm(`Misc.Desc.${id}`, undefined, 1) || translateTerm('System.NA')}</div>
            </div>
            {data.remark && (Array.isArray(data.remark) ? data.remark.length > 0 : true) && (
              <div className='border-t border-border/50 pt-4'>
                <div className='text-xs text-muted-foreground mb-1'>{translateTerm('Web.Remark')}</div>
                <div className='px-2.5 py-1.5 text-sm text-amber-700 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/30 rounded-md border border-amber-200 dark:border-amber-900/50'>
                  {Array.isArray(data.remark) ? data.remark.map((r: string, i: number) => <div key={i}>{translateParagraph(r)}</div>) : translateParagraph(data.remark)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

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
