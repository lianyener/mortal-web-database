'use client';

import { useState, useEffect, Suspense } from 'react';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import { useSidebarStore } from '@/store/useSidebarStore';
import { TopNavbar } from '@/components/layout/TopNavbar';
import { History, ChevronRight } from 'lucide-react';
import { ParsedText } from '@/components/shared/ParsedText';

export default function UpdateLogPage() {
  return (
    <Suspense fallback={<div className='min-h-screen flex items-center justify-center text-muted-foreground tracking-widest animate-pulse'>Loading...</div>}>
      <UpdateLogContent />
    </Suspense>
  );
}

interface UpdateContent {
  Category: string;
  Type: string;
  Text: string | string[];
}

interface UpdateLog {
  ID: string;
  Date: string;
  GameVersion: string;
  Content: UpdateContent[];
}

interface UpdateLogData {
  Log: UpdateLog[];
}

function UpdateLogContent() {
  const { translateTerm, translateTermWithParam } = useAppTranslation();
  const isOpen = useSidebarStore((state) => state.isOpen);
  const [siteData, setSiteData] = useState<UpdateLogData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 動態抓取 web/updatelog.json
  useEffect(() => {
    fetch('/web/updatelog.json')
      .then((res) => res.json())
      .then((data) => {
        setSiteData(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load updatelog.json:', err);
        setIsLoading(false);
      });
  }, []);

  return (
    <main className={`min-h-screen bg-background text-foreground pb-20 transition-[padding] duration-300 ease-in-out ${isOpen ? 'md:pr-128 lg:pr-144' : ''}`}>
      {/* 頂部固定導覽列 */}
      <TopNavbar />

      {/* 主要閱讀區塊 */}
      <div className='max-w-4xl mx-auto px-6 space-y-16 py-10 sm:py-16'>
        {isLoading ? (
          <div className='text-center text-muted-foreground py-20 tracking-widest animate-pulse'>{translateTermWithParam('Web.Msg.Loading', 'UpdateLog')}</div>
        ) : !siteData || !siteData.Log ? (
          <div className='text-center text-destructive py-20 bg-destructive/10 rounded-md'>{translateTermWithParam('Web.Msg.LoadError', 'UpdateLog')}</div>
        ) : (
          <section className='space-y-6'>
            {/* 標題 */}
            <div className='flex items-center gap-3 border-b border-border/50 pb-4'>
              <div className='bg-primary/10 p-2 rounded-lg'>
                <History className='size-6 text-primary' />
              </div>
              <h2 className='text-2xl font-bold tracking-wide'>{translateTerm('Web.UpdateLog')}</h2>
            </div>

            {/* 內容列表 */}
            <div className='grid gap-8'>
              {siteData.Log.map((log) => (
                <div key={log.ID} className='space-y-4'>
                  {/* 標題：日期與版本，隱藏ID */}
                  <h3 className='text-lg font-semibold text-foreground/90 flex items-center gap-1.5 border-b border-border/40 pb-1.5'>
                    <ChevronRight className='size-4 text-primary' />
                    <span>{log.Date}</span>
                    <span className='text-muted-foreground text-sm font-medium ml-2'>
                      {translateTerm('Web.GameVersion')}: v{log.GameVersion}
                    </span>
                  </h3>

                  {/* 更新項目卡片 */}
                  <div className='flex flex-col gap-4'>
                    {log.Content.map((item, i) => {
                      const textLines = Array.isArray(item.Text) ? item.Text : [item.Text];

                      return (
                        <div key={i} className='bg-card border border-border/60 rounded-lg p-4 sm:p-5 shadow-sm flex flex-col gap-3'>
                          {/* 標籤 */}
                          <div className='flex items-center gap-2'>
                            <span className='px-2.5 py-0.5 rounded-md bg-secondary text-secondary-foreground text-xs font-bold tracking-wider'>{translateTerm(`Web.Term.${item.Type}`)}</span>
                            <span className='px-2.5 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-bold tracking-wider'>{translateTerm(`Web.Label.${item.Category}`)}</span>
                          </div>
                          {/* 文字內容 */}
                          <div className='text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap flex-1 flex flex-col gap-1'>
                            {textLines.map((line, idx) => (
                              <div key={idx}>
                                <ParsedText text={line} />
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
