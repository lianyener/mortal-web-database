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

export default function BookDetailClient() {
  return (
    <Suspense fallback={<div className='min-h-screen flex items-center justify-center text-muted-foreground tracking-widest animate-pulse'>Loading...</div>}>
      <BookDetailContent />
    </Suspense>
  );
}

function BookDetailContent() {
  const { translateTermWithParam } = useAppTranslation();
  const params = useParams();
  const id = params.id as string;
  const { data, isLoading, isError } = useItemDetail('book', id);

  const isOpen = useSidebarStore((state) => state.isOpen);

  return (
    <main className={`min-h-screen bg-background text-foreground pb-20 transition-[padding] duration-300 ease-in-out ${isOpen ? 'md:pr-128 lg:pr-144' : ''}`}>
      {/* 頂部固定導覽列 */}
      <TopNavbar />

      {/* 主要閱讀區塊 */}
      <div className='max-w-5xl mx-auto px-6 space-y-6 transition-all duration-300'>
        {isLoading && <div className='text-center text-muted-foreground py-10 tracking-widest animate-pulse'>{translateTermWithParam('Web.Msg.Loading', 'Book')}</div>}
        {isError && <div className='text-center text-destructive py-10 bg-destructive/10 rounded-md'>{translateTermWithParam('Web.Msg.LoadError', 'Book')}</div>}

        {/* 詳細資料模式 */}
        {!isLoading && !isError && data ? <DataDetail data={data} id={id} /> : null}
        {!isLoading && !isError && !data && <div className='text-center text-muted-foreground py-10'>{translateTermWithParam('Web.Msg.NotFound', 'Book')}</div>}
      </div>
    </main>
  );
}

// 詳細資料元件
function DataDetail({ data, id }: { data: any; id: string }) {
  const { translateTerm, translateTermWithParam } = useAppTranslation();
  const getTypeLabel = (type: string) => (type ? translateTerm(`System.Title.${type}`) : translateTerm('Web.NotMartial'));

  return (
    <div className='flex flex-col gap-8'>
      {/* 基本資訊 */}
      <div className='flex flex-col gap-4'>
        <div className='flex items-center justify-between border-b border-border/50 pb-2'>
          <h2 className='text-lg font-bold'>{translateTermWithParam('Web.Info', 'Book')}</h2>
          <div className='flex items-center'>
            <Button asChild variant='outline' size='sm' className='h-8 px-2.5 text-xs'>
              <Link href='/book'>
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
                <div className='font-semibold text-foreground'>{translateTerm(`Book.Name.${id}`, undefined, 1)}</div>
              </div>
              <div>
                <div className='text-xs text-muted-foreground mb-1'>{translateTerm('Web.Type')}</div>
                <div className='font-semibold text-foreground'>{getTypeLabel(data.type)}</div>
              </div>
              <div>
                <div className='text-xs text-muted-foreground mb-1'>{translateTerm('Web.MaxLevel')}</div>
                <div className='font-semibold text-foreground'>{data.level}</div>
              </div>
              <div>
                <div className='text-xs text-muted-foreground mb-1'>{translateTerm('Web.Cost')}</div>
                <div className='font-semibold text-foreground'>{data.cost}</div>
              </div>
            </div>

            <div className='border-t border-border/50 pt-4'>
              <div className='text-xs text-muted-foreground mb-1'>{translateTerm('Web.Desc')}</div>
              <div className='text-sm leading-relaxed text-foreground whitespace-pre-wrap'>{translateTerm(`Book.Desc.${id}`, undefined, 1) || translateTerm('System.NA')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 秘笈內容 */}
      {data.levels && data.levels.length > 0 && (
        <div className='flex flex-col gap-4'>
          <h2 className='pb-2 text-lg font-bold border-b border-border/50'>{translateTermWithParam('Web.Content', 'Book')}</h2>
          <BookLevelTable levels={data.levels} />
        </div>
      )}

      {/* 關聯項目 */}
      {data.rel && Object.values(data.rel).some((obj) => Object.keys(Object(obj)).length > 0) && (
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

// 秘笈等級列表元件 (DataTable)
function BookLevelTable({ levels }: { levels: any[] }) {
  const { translateTerm } = useAppTranslation();

  return (
    <div className='bg-card border rounded-xl shadow-sm overflow-hidden'>
      <div className='overflow-x-auto'>
        <table className='w-full text-sm text-left whitespace-nowrap'>
          <thead className='bg-muted/50 text-muted-foreground border-b border-border/50'>
            <tr>
              <th className='px-4 py-3 font-semibold min-w-20'>{translateTerm('Web.Level')}</th>
              <th className='px-4 py-3 font-semibold min-w-20'>{translateTerm('Web.Point')}</th>
              <th className='px-4 py-3 font-semibold min-w-24'>{translateTerm('Web.Condition')}</th>
              <th className='px-4 py-3 font-semibold min-w-60'>{translateTerm('Web.Effect')}</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-border/70 font-mixed'>
            {levels.map((lvl: any, i: number) => (
              <tr key={i} className='hover:bg-muted/50 transition-colors group'>
                <td className='px-4 py-3.5 align-top text-foreground/75 font-semibold'>Lv.{i + 1}</td>
                <td className='px-4 py-3.5 align-top'>{lvl.point}</td>
                <td className='px-4 py-3.5 align-top *:whitespace-nowarp'>
                  <ParsedText text={lvl.condition} />
                </td>
                <td className='px-4 py-3.5 align-top whitespace-normal'>
                  {lvl.effect && lvl.effect.length > 0 ? (
                    <div className='flex flex-wrap items-center gap-y-1 gap-x-2 flex-1'>
                      {lvl.effect.map((eff: string, j: number) => (
                        <div key={j} className='flex items-center whitespace-nowrap'>
                          <ParsedText text={eff} />
                          {j < lvl.effect.length - 1 && <span className='text-muted-foreground/30 ml-2'>/</span>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className='text-muted-foreground/50'>-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
