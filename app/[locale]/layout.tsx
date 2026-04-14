import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Inter, Sometype_Mono, Chiron_Hei_HK } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { GlobalSidebar } from '@/components/sidebar/GlobalSidebar';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { cn } from '@/lib/utils';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const sometypeMono = Sometype_Mono({ subsets: ['latin'], fallback: [], variable: '--font-sometype-mono' });
const chironHei = Chiron_Hei_HK({ subsets: ['latin'], fallback: [], variable: '--font-chiron-hei' });

// 頁面標題
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return {
    title: t.has('Web.SiteTitle') ? t('Web.SiteTitle') : "Mortal Web Database",
    description: t.has('Web.SiteDescription') ? t('Web.SiteDescription') : "Mortal Web Database 遊戲資料庫",
  };
}

// 靜態語系輸出清單
export function generateStaticParams() {
  return [{ locale: 'zh-tw' }];
}

export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale?: string }>;
}>) {
  // 取得在 i18n/request.ts 定義的 messages
  const { locale = 'zh-tw' } = await params;
  const messages = await getMessages({ locale });

  return (
    // 忽略因瀏覽器擴充功能注入導致的 Hydration 警告
    <html lang={locale} className={cn("h-full", "antialiased", sometypeMono.variable, inter.variable, chironHei.variable)} suppressHydrationWarning>
      <body className="min-h-full flex flex-col">
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
