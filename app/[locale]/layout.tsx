import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Sometype_Mono, Chiron_Hei_HK } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { GlobalSidebar } from '@/components/sidebar/GlobalSidebar';
import { QueryProvider } from '@/components/providers/QueryProvider';
import './globals.css';

const sometypeMono = Sometype_Mono({ subsets: ['latin'], fallback: [], variable: '--font-sometype-mono' });
const chironHei = Chiron_Hei_HK({ subsets: ['latin'], fallback: [], variable: '--font-chiron-hei' });

// 頁面標題
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  const siteTitle = t.has('Web.SiteTitle') ? t('Web.SiteTitle') : 'Mortal Web Database';
  return { title: { template: `%s - ${siteTitle}`, default: siteTitle }, description: t('About.introduction.0') };
}

export default async function RootLayout({ children, params }: Readonly<{ children: React.ReactNode; params: Promise<{ locale?: string }> }>) {
  // 取得在 i18n/request.ts 定義的 messages
  const { locale = 'zh-tw' } = await params;
  const messages = await getMessages({ locale });

  return (
    // 忽略因瀏覽器擴充功能注入導致的 Hydration 警告
    <html lang={locale} className={`h-full antialiased ${sometypeMono.variable} ${chironHei.variable}`} suppressHydrationWarning>
      <body className='min-h-full flex flex-col'>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <QueryProvider>
            <NuqsAdapter>
              {children}
              {/* 全域側邊欄 */}
              <Suspense fallback={null}>
                <GlobalSidebar />
              </Suspense>
            </NuqsAdapter>
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
