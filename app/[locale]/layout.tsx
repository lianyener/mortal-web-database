import type { Metadata } from 'next';
import { Suspense } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { GlobalSidebar } from '@/components/sidebar/GlobalSidebar';
import { QueryProvider } from '@/components/providers/QueryProvider';
import './globals.css';

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
    <>
      <html lang={locale} className='h-full antialiased' suppressHydrationWarning>
        <head>
          <link rel='preconnect' href='https://fonts.googleapis.com' />
          <link rel='preconnect' href='https://fonts.gstatic.com' crossOrigin='anonymous' />
          { /* eslint-disable-next-line @next/next/no-page-custom-font */ }
          <link href='https://fonts.googleapis.com/css2?family=Chiron+Hei+HK:ital,wght@0,200..900;1,200..900&family=Sometype+Mono:ital,wght@0,400..700;1,400..700&display=swap' rel='stylesheet' />
        </head>
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
    </>
  );
}
