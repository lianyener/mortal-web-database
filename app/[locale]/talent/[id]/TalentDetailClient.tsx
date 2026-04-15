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

export default function TalentDetailClient() {
  return (
    <Suspense fallback={<div className='min-h-screen flex items-center justify-center text-muted-foreground tracking-widest animate-pulse'>Loading...</div>}>
      <TalentDetailContent />
    </Suspense>
  );
}

function TalentDetailContent() {
  const { translateTermWithParam } = useAppTranslation();
  const params = useParams();
  const id = params.id as string;
  const { data, isLoading, isError } = useItemDetail('talent', id);

  const isOpen = useSidebarStore((state) => state.isOpen);

  return (
    <main className={`min-h-screen bg-background text-foreground pb-20 transition-[padding] duration-300 ease-in-out ${isOpen ? 'md:pr-128 lg:pr-144' : ''}`}>
      {/* 頂部固定導覽列 */}
      <TopNavbar />

      {/* 主要閱讀區塊 */}
      <div className='max-w-5xl mx-auto px-6 space-y-6 transition-all duration-300'>
        {isLoading && <div className='text-center text-muted-foreground py-10 tracking-widest animate-pulse'>{translateTermWithParam('Web.Msg.Loading', 'Talent')}</div>}
        {isError && <div className='text-center text-destructive py-10 bg-destructive/10 rounded-md'>{translateTermWithParam('Web.Msg.LoadError', 'Talent')}</div>}

        {/* 詳細資料模式 */}
        {!isLoading && !isError && data ? <DataDetail data={data} id={id} /> : null}
        {!isLoading && !isError && !data && <div className='text-center text-muted-foreground py-10'>{translateTermWithParam('Web.Msg.NotFound', 'Talent')}</div>}
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
          <h2 className='text-lg font-bold'>{translateTermWithParam('Web.Info', 'Talent')}</h2>
          <div className='flex items-center'>
            <Button asChild variant='outline' size='sm' className='h-8 px-2.5 text-xs'>
              <Link href='/talent'>
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
                <div className='font-semibold text-foreground'>{translateTerm(`PlayerTalent.Name.${id}`, undefined, 1)}</div>
              </div>
            </div>

            <div className='border-t border-border/50 pt-4'>
              <div className='text-xs text-muted-foreground mb-1'>{translateTerm('Web.Desc')}</div>
              <div className='text-sm leading-relaxed text-foreground whitespace-pre-wrap'>{translateTerm(`PlayerTalent.Desc.${id}`, undefined, 0) || translateTerm('System.NA')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 技能內容 */}
      {data.skill && data.skill !== '' && (
        <div className='flex flex-col gap-4'>
          <h2 className='pb-2 text-lg font-bold border-b border-border/50'>{translateTerm('Web.SkillContent')}</h2>
          <TalentSkillTable skillId={data.skill} maxLevel={data.level} talent={id} />
        </div>
      )}

      {/* 下位技能 */}
      {data.low && data.low.length > 0 && (
        <div className='flex flex-col gap-4'>
          <h2 className='pb-2 text-lg font-bold border-b border-border/50'>{translateTerm('Web.LowerTalent')}</h2>
          <div className='bg-card border rounded-xl p-5 shadow-sm'>
            <div className='flex flex-wrap gap-2'>
              {data.low.map((lowId: string) => (
                <div key={lowId} className='px-3 py-1.5 bg-muted/40 border border-border/50 rounded-md text-sm hover:border-primary/40 transition-colors'>
                  <ParsedText text={`[*Label.Talent,${lowId}*]`} />
                </div>
              ))}
            </div>
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

// 技能等級表格元件
function TalentSkillTable({ skillId, maxLevel, talent }: { skillId: string; maxLevel: number; talent: string }) {
  const { translateTerm } = useAppTranslation();

  // 建立各等級清單
  const levels = [];
  if (maxLevel > 0) {
    for (let i = 1; i <= maxLevel; i++) levels.push(i);
  } else {
    levels.push(0);
  }

  return (
    <div className='bg-card border rounded-xl shadow-sm overflow-hidden'>
      <div className='overflow-x-auto'>
        <table className='w-full text-sm text-left whitespace-nowrap'>
          <thead className='bg-muted/50 text-muted-foreground border-b border-border/50'>
            <tr>
              <th className='px-4 py-3 font-semibold w-24'>{translateTerm('Web.Level')}</th>
              <th className='px-4 py-3 font-semibold min-w-40'>{translateTerm('Web.Name')}</th>
              <th className='px-4 py-3 font-semibold min-w-60 w-full'>{translateTerm('Web.Desc')}</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-border/70 font-mixed'>
            {levels.map((lvl) => {
              let displayLevel = lvl;
              let nameKey = `CombatSkill.Name.${skillId}_${lvl}`;
              let descKey = `CombatSkill.Desc.${skillId}_${lvl}`;

              // 處理 level = 0 的防呆退路邏輯
              if (lvl === 0) {
                displayLevel = 1;
                const baseName = translateTerm(`CombatSkill.Name.${skillId}`, undefined, 0);
                if (baseName && baseName !== '') {
                  nameKey = `CombatSkill.Name.${skillId}`;
                  descKey = `CombatSkill.Desc.${skillId}`;
                } else {
                  nameKey = `CombatSkill.Name.${skillId}_1`;
                  descKey = `CombatSkill.Desc.${skillId}_1`;
                }
              }

              return (
                <tr key={lvl} className='hover:bg-muted/50 transition-colors group'>
                  <td className='px-4 py-3.5 align-top text-foreground/75 font-semibold'>Lv.{displayLevel}</td>
                  <td className='px-4 py-3.5 align-top font-bold text-foreground whitespace-normal'>
                    {translateTerm(nameKey, undefined, 0) || `${translateTerm(`PlayerTalent.Name.${talent}`, undefined, 1)}Lv${displayLevel}`}
                  </td>
                  <td className='px-4 py-3.5 align-top text-muted-foreground whitespace-normal'>{translateTerm(descKey, undefined, 0) || translateTerm('System.NA')}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
