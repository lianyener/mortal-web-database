import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { GlobalSidebar } from '@/components/sidebar/GlobalSidebar';
import { Suspense } from "react";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 使用 generateMetadata 來支援動態的多語系 Metadata
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return {
    title: t.has('Web.SiteTitle') ? t('Web.SiteTitle') : "Mortal Web Database",
    description: t.has('Web.SiteDescription') ? t('Web.SiteDescription') : "Mortal Web Database 遊戲資料庫",
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 取得在 i18n/request.ts 定義的 messages
  const messages = await getMessages();

  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", inter.variable)}
      // 忽略因瀏覽器擴充功能(如翻譯、防毒套件)在 <html> 注入屬性所導致的 Hydration 警告
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        {/* 明確給予 locale，防止純靜態匯出在 Client 端抓不到語系而崩潰 */}
        <NextIntlClientProvider messages={messages} locale="zh-tw">
          <QueryProvider>
            <NuqsAdapter>
              {children}
              {/* 將全域側邊欄掛載於此，它會在所有頁面之上待命 */}
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
