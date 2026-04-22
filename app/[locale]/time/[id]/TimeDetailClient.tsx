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

export default function TimeDetailClient() {
  return (
    <Suspense fallback={<div className='min-h-screen flex items-center justify-center text-muted-foreground tracking-widest animate-pulse'>Loading...</div>}>
      <TimeDetailContent />
    </Suspense>
  );
}

function TimeDetailContent() {
  const { translateTermWithParam } = useAppTranslation();
  const params = useParams();
  const id = params.id as string;
  const { data, isLoading, isError } = useItemDetail('time', id);

  const isOpen = useSidebarStore((state) => state.isOpen);

  return (
    <main className={`min-h-screen bg-background text-foreground pb-20 transition-[padding] duration-300 ease-in-out ${isOpen ? 'md:pr-128 lg:pr-144' : ''}`}>
      {/* 頂部固定導覽列 */}
      <TopNavbar />

      {/* 主要閱讀區塊 */}
      <div className='max-w-5xl mx-auto px-6 space-y-6 transition-all duration-300'>
        {isLoading && <div className='text-center text-muted-foreground py-10 tracking-widest animate-pulse'>{translateTermWithParam('Web.Msg.Loading', 'Time')}</div>}
        {isError && <div className='text-center text-destructive py-10 bg-destructive/10 rounded-md'>{translateTermWithParam('Web.Msg.LoadError', 'Time')}</div>}

        {/* 詳細資料模式 */}
        {!isLoading && !isError && data ? <DataDetail data={data} id={id} /> : null}
        {!isLoading && !isError && !data && <div className='text-center text-muted-foreground py-10'>{translateTermWithParam('Web.Msg.NotFound', 'Time')}</div>}
      </div>
    </main>
  );
}

// 詳細資料元件
function DataDetail({ data, id }: { data: any; id: string }) {
  const { translateTerm, translateTermWithParam } = useAppTranslation();

  return (
    <div className='flex flex-col gap-8'>
      {/* 基本資訊 */}
      <div className='flex flex-col gap-4'>
        <div className='flex items-center justify-between border-b border-border/50 pb-2'>
          <h2 className='text-lg font-bold'>{translateTermWithParam('Web.Info', 'Time') || '時間變數資訊'}</h2>
          <div className='flex items-center'>
            <Button asChild variant='outline' size='sm' className='h-8 px-2.5 text-xs'>
              <Link href='/time'>
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
                <div className='font-semibold text-foreground'>{translateTerm(`Trigger.Name.${id}`)}</div>
              </div>
            </div>
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