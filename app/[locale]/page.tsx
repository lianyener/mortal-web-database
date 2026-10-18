'use client';

import { useState, useEffect, Suspense } from 'react';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import { useSidebarStore } from '@/store/useSidebarStore';
import { TopNavbar } from '@/components/layout/TopNavbar';
import { Link } from '@/i18n/navigation';
import { Info, BookOpen, History, Link as LinkIcon, ChevronRight, Globe, MessageSquare, ExternalLink } from 'lucide-react';
import { SiGithub, SiX, SiFacebook, SiDiscord, SiSteam } from 'react-icons/si';
import { ParsedText } from '@/components/shared/ParsedText';

export default function HomePage() {
  return (
    <Suspense fallback={<div className='min-h-screen flex items-center justify-center text-muted-foreground tracking-widest animate-pulse'>Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}

interface SiteData {
  introduction?: string[];
  guides?: { category: string; items: { title: string; content: string }[] }[];
  links?: { title: string; desc: string; url: string; icon: string }[];
}

interface UpdateContent {
  Category: string;
  Type: string;
  Text: string | string[];
}

interface UpdateLogData {
  Log: { ID: string; Date: string; GameVersion: string; Content: UpdateContent[] }[];
}

const getIconComponent = (iconName: string) => {
  switch (iconName?.toLowerCase()) {
    case 'github':
      return SiGithub;
    case 'globe':
      return Globe;
    case 'discord':
      return SiDiscord;
    case 'messagesquare':
    case 'forum':
      return MessageSquare;
    case 'steam':
      return SiSteam;
    case 'twitter':
    case 'x':
      return SiX;
    case 'facebook':
      return SiFacebook;
    case 'externallink':
      return ExternalLink;
    default:
      return LinkIcon;
  }
};

function HomeContent() {
  const { t, translateTerm, translateTermWithParam } = useAppTranslation();
  const isOpen = useSidebarStore((state) => state.isOpen);
  const [siteData, setSiteData] = useState<SiteData | null>(null);
  const [updateLogData, setUpdateLogData] = useState<UpdateLogData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 動態並行抓取資料
  useEffect(() => {
    Promise.all([fetch('/web/about.json').then((res) => res.json()), fetch('/web/updatelog.json').then((res) => res.json())])
      .then(([aboutData, logData]) => {
        setSiteData(aboutData);
        setUpdateLogData(logData);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load home data:', err);
        setIsLoading(false);
      });
  }, []);

  // 只取出第一大項資料
  const firstGuide = siteData?.guides?.[0];
  const firstLog = updateLogData?.Log?.[0];

  return (
    <main className={`min-h-screen bg-background text-foreground pb-20 transition-[padding] duration-300 ease-in-out ${isOpen ? 'md:pr-128 lg:pr-144' : ''}`}>
      {/* 頂部固定導覽列 */}
      <TopNavbar />

      {/* 主要閱讀區塊 */}
      <div className='max-w-4xl mx-auto px-6 space-y-16 py-10 sm:py-16'>
        {isLoading ? (
          <div className='text-center text-muted-foreground py-20 tracking-widest animate-pulse'>{translateTermWithParam('Web.Msg.Loading', 'Home') || 'Loading...'}</div>
        ) : (
          <>
            {/* 1. 網站簡介 */}
            {siteData?.introduction && (
              <section className='space-y-6'>
                <div className='flex items-center gap-3 border-b border-border/50 pb-4'>
                  <div className='bg-primary/10 p-2 rounded-lg'>
                    <Info className='size-6 text-primary' />
                  </div>
                  <h2 className='text-2xl font-bold tracking-wide'>{translateTerm('Web.Introduction')}</h2>
                </div>
                <div className='bg-card border border-border/60 rounded-lg p-5 sm:p-6 shadow-sm leading-relaxed whitespace-pre-wrap text-muted-foreground'>
                  {siteData.introduction.map((key: string, idx: number) => (
                    <div key={idx} className={idx > 0 ? 'mt-4' : ''}>
                      <ParsedText text={t(key) || ''} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 2. 使用說明 (僅第一大項) */}
            {firstGuide && (
              <section className='space-y-6'>
                <div className='flex items-center justify-between border-b border-border/50 pb-4'>
                  <div className='flex items-center gap-3'>
                    <div className='bg-primary/10 p-2 rounded-lg'>
                      <BookOpen className='size-6 text-primary' />
                    </div>
                    <h2 className='text-2xl font-bold tracking-wide'>{translateTerm('Web.Guide')}</h2>
                  </div>
                  <Link href='/about' className='text-sm font-semibold text-primary/80 hover:text-primary transition-colors flex items-center gap-1 group'>
                    {translateTerm('Web.ViewMore')} <ChevronRight className='size-4 group-hover:translate-x-0.5 transition-transform' />
                  </Link>
                </div>
                <div className='grid gap-8'>
                  <div className='space-y-4'>
                    <h3 className='text-lg font-semibold text-foreground/90 flex items-center gap-1.5 border-b border-border/40 pb-1.5'>
                      <ChevronRight className='size-4 text-primary' />
                      {translateTerm(firstGuide.category)}
                    </h3>
                    <div className='flex flex-col gap-4'>
                      {firstGuide.items.map((item, i) => (
                        <div key={i} className='bg-card border border-border/60 rounded-lg p-4 sm:p-5 shadow-sm'>
                          <div className='font-bold flex items-start gap-2 mb-2'>
                            <span>{translateTerm(item.title)}</span>
                          </div>
                          <div className='text-muted-foreground flex items-start gap-2 text-sm leading-relaxed whitespace-pre-wrap'>
                            <div className='flex-1'>
                              <ParsedText text={t(item.content) || ''} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* 3. 更新日誌 (僅第一大項) */}
            {firstLog && (
              <section className='space-y-6'>
                <div className='flex items-center justify-between border-b border-border/50 pb-4'>
                  <div className='flex items-center gap-3'>
                    <div className='bg-primary/10 p-2 rounded-lg'>
                      <History className='size-6 text-primary' />
                    </div>
                    <h2 className='text-2xl font-bold tracking-wide'>{translateTerm('Web.UpdateLog')}</h2>
                  </div>
                  <Link href='/updatelog' className='text-sm font-semibold text-primary/80 hover:text-primary transition-colors flex items-center gap-1 group'>
                    {translateTerm('Web.ViewMore')} <ChevronRight className='size-4 group-hover:translate-x-0.5 transition-transform' />
                  </Link>
                </div>
                <div className='grid gap-8'>
                  <div className='space-y-4'>
                    <h3 className='text-lg font-semibold text-foreground/90 flex items-center gap-1.5 border-b border-border/40 pb-1.5'>
                      <ChevronRight className='size-4 text-primary' />
                      <span>{firstLog.Date}</span>
                      <span className='text-muted-foreground text-sm font-medium ml-2'>
                        {translateTerm('Web.GameVersion')}: v{firstLog.GameVersion}
                      </span>
                    </h3>
                    <div className='flex flex-col gap-4'>
                      {firstLog.Content.map((item, i) => {
                        const textLines = Array.isArray(item.Text) ? item.Text : [item.Text];

                        return (
                          <div key={i} className='bg-card border border-border/60 rounded-lg p-4 sm:p-5 shadow-sm flex flex-col gap-3'>
                            <div className='flex items-center gap-2'>
                              <span className='px-2.5 py-0.5 rounded-md bg-secondary text-secondary-foreground text-xs font-bold tracking-wider'>{translateTerm(`Web.Term.${item.Type}`)}</span>
                              <span className='px-2.5 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-bold tracking-wider'>{translateTerm(`Web.Label.${item.Category}`)}</span>
                            </div>
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
                </div>
              </section>
            )}

            {/* 4. 相關連結 */}
            {siteData?.links && siteData.links.length > 0 && (
              <section className='space-y-6'>
                <div className='flex items-center gap-3 border-b border-border/50 pb-4'>
                  <div className='bg-primary/10 p-2 rounded-lg'>
                    <LinkIcon className='size-6 text-primary' />
                  </div>
                  <h2 className='text-2xl font-bold tracking-wide'>{translateTerm('Web.Link')}</h2>
                </div>
                <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                  {siteData.links.map((link, idx) => {
                    const IconComponent = getIconComponent(translateTerm(link.icon));
                    return (
                      <a
                        key={idx}
                        href={translateTerm(link.url)}
                        target='_blank'
                        rel='noreferrer'
                        className='flex flex-col p-4 border border-border/60 rounded-lg bg-card hover:border-primary/50 hover:shadow-md transition-all group'
                      >
                        <div className='flex items-center gap-2 font-bold text-primary group-hover:underline mb-1.5 truncate'>
                          <IconComponent className='size-5 shrink-0' />
                          {translateTerm(link.title)}
                        </div>
                        <div className='text-sm text-muted-foreground line-clamp-2 whitespace-pre-wrap'>
                          <ParsedText text={t(link.desc) || ''} />
                        </div>
                      </a>
                    );
                  })}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}
