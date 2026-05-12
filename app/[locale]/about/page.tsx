/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Suspense } from 'react';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import { useSidebarStore } from '@/store/useSidebarStore';
import { TopNavbar } from '@/components/layout/TopNavbar';
import { Info, HelpCircle, BookOpen, Link as LinkIcon, ShieldAlert, ChevronRight } from 'lucide-react';

export default function AboutPage() {
  return (
    <Suspense fallback={<div className='min-h-screen flex items-center justify-center text-muted-foreground tracking-widest animate-pulse'>Loading...</div>}>
      <AboutContent />
    </Suspense>
  );
}

// === 資料格式設計 (Data Format Design) ===
// 實務上您可以將這些資料抽出成獨立的設定檔 (例如 src/config/about.ts 或 JSON 檔)
// 或是結合多國語系 (i18n) key 搭配 translateTerm 來替換多語系字串內容

const siteData = {
  // 1. 網站簡介
  introduction: "這是一個為《活俠傳》量身打造的非官方網頁版資料庫。\n我們致力於將遊戲中的各類事件、角色、數值、物品等資料進行整理，提供玩家一個方便檢索、快速查閱的平台。\n\n所有資料皆透過遊戲客戶端解包而來，希望能幫助大家更深入地了解武林世界。",

  // 2. 使用說明 (分類 > 標題 > 內容)
  guides: [
    {
      category: "基礎操作",
      items: [
        { title: "搜尋與篩選", content: "在各個列表頁面中，您可以使用上方的搜尋框與下拉選單來過濾資料。大部分的搜尋框支援多組關鍵字，只需以空格分隔即可進行交集比對搜尋。" },
        { title: "側邊欄資訊", content: "點擊帶有底線、顏色高光或以外框標示的連結（例如事件、角色、武學），頁面右側將會滑出詳細資訊側邊欄，讓您不需離開當前頁面即可檢視詳情內容。" }
      ]
    },
    {
      category: "進階功能",
      items: [
        { title: "網址快速跳轉", content: "您可以透過點擊側邊欄右上角的「在新視窗開啟」圖示按鈕，取得該項目的獨立網址，方便將特定事件或物品快速分享給其他玩家。" },
        { title: "詞條懸浮提示", content: "將滑鼠游標停留在某些專有名詞或變數上，將會自動浮現簡短的說明提示，這對於快速了解各類 Flag（變數旗標）與能力屬性非常有用。" }
      ]
    }
  ],

  // 3. 常見問題 (分類 > 問題 > 答案)
  faqs: [
    {
      category: "資料相關",
      items: [
        { q: "資料多久更新一次？", a: "我們會在遊戲有重大更新（如新增劇情、調整數值）時，盡快同步並更新網站資料庫。" },
        { q: "為什麼有些文本顯示「未知」或沒有翻譯？", a: "這可能是因為遊戲檔案中尚未補齊該語系的文本，或是由於資料庫解析時的遺漏。如果發現嚴重錯誤，歡迎回報給我們。" }
      ]
    },
    {
      category: "系統相關",
      items: [
        { q: "支援行動裝置（手機）瀏覽嗎？", a: "是的，網站採用了響應式設計，但在電腦的大螢幕上瀏覽能獲得最佳的閱讀體驗（尤其是複雜的樹狀表格與側邊欄的雙開互動）。" }
      ]
    }
  ],

  // 4. 相關連結
  links: [
    { title: "GitHub 專案原始碼", url: "https://github.com/your-repo/mortal-web-database", desc: "本專案的原始碼，歡迎發送 Issue 回報問題或提出 Pull Request。" },
    { title: "活俠傳 Steam 商店頁面", url: "https://store.steampowered.com/app/1859910/_/", desc: "支持原作者原始鳥熊，購買正版遊戲。" },
    { title: "巴哈姆特 活俠傳 哈啦板", url: "https://forum.gamer.com.tw/A.php?bsn=73319", desc: "與其他玩家一起交流討論。" }
  ]
};

function AboutContent() {
  const { translateTerm } = useAppTranslation();
  const isOpen = useSidebarStore((state) => state.isOpen);

  return (
    <main className={`min-h-screen bg-background text-foreground pb-20 transition-[padding] duration-300 ease-in-out ${isOpen ? 'md:pr-128 lg:pr-144' : ''}`}>
      {/* 頂部固定導覽列 */}
      <TopNavbar />

      {/* 主要閱讀區塊 */}
      <div className='max-w-4xl mx-auto px-6 space-y-12 py-8'>
        
        {/* 頁面標題 */}
        <div className='space-y-2 border-b border-border/50 pb-6'>
          <h1 className='text-3xl font-extrabold tracking-tight'>{translateTerm('Web.About')}</h1>
          <p className='text-muted-foreground'>{translateTerm('Web.SiteTitle')} - 關於本站與常見問題</p>
        </div>

        {/* 1. 網站簡介 */}
        <section className='space-y-4'>
          <div className='flex items-center gap-2'>
            <Info className='size-5 text-primary' />
            <h2 className='text-xl font-bold'>網站簡介</h2>
          </div>
          <div className='bg-card border border-border/60 rounded-xl p-5 sm:p-6 shadow-sm leading-relaxed whitespace-pre-wrap text-muted-foreground'>
            {siteData.introduction}
          </div>
        </section>

        {/* 2. 使用說明 */}
        <section className='space-y-4'>
          <div className='flex items-center gap-2'>
            <BookOpen className='size-5 text-primary' />
            <h2 className='text-xl font-bold'>使用說明</h2>
          </div>
          <div className='grid gap-8'>
            {siteData.guides.map((guide, idx) => (
              <div key={idx} className='space-y-4'>
                <h3 className='text-lg font-semibold text-foreground/90 flex items-center gap-1.5 border-b border-border/40 pb-1.5'>
                  <ChevronRight className='size-4 text-primary' />
                  {guide.category}
                </h3>
                <div className='grid sm:grid-cols-2 gap-4'>
                  {guide.items.map((item, i) => (
                    <div key={i} className='bg-muted/30 border border-border/50 rounded-lg p-4 sm:p-5 transition-colors hover:bg-muted/50'>
                      <h4 className='font-bold mb-2 text-foreground/90'>{item.title}</h4>
                      <p className='text-sm text-muted-foreground leading-relaxed'>{item.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. 常見問題 */}
        <section className='space-y-4'>
          <div className='flex items-center gap-2'>
            <HelpCircle className='size-5 text-primary' />
            <h2 className='text-xl font-bold'>常見問題</h2>
          </div>
          <div className='grid gap-8'>
            {siteData.faqs.map((faq, idx) => (
              <div key={idx} className='space-y-4'>
                <h3 className='text-lg font-semibold text-foreground/90 flex items-center gap-1.5 border-b border-border/40 pb-1.5'>
                  <ChevronRight className='size-4 text-primary' />
                  {faq.category}
                </h3>
                <div className='flex flex-col gap-4'>
                  {faq.items.map((item, i) => (
                    <div key={i} className='bg-card border border-border/60 rounded-lg p-4 sm:p-5 shadow-sm'>
                      <div className='font-bold flex items-start gap-2 mb-2'>
                        <span className='text-primary shrink-0'>Q:</span>
                        <span>{item.q}</span>
                      </div>
                      <div className='text-muted-foreground flex items-start gap-2 text-sm leading-relaxed'>
                        <span className='font-bold opacity-70 shrink-0'>A:</span>
                        <span>{item.a}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. 相關連結 */}
        <section className='space-y-4'>
          <div className='flex items-center gap-2'>
            <LinkIcon className='size-5 text-primary' />
            <h2 className='text-xl font-bold'>相關連結</h2>
          </div>
          <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-4'>
            {siteData.links.map((link, idx) => (
              <a key={idx} href={link.url} target="_blank" rel="noreferrer" className='flex flex-col p-4 border border-border/60 rounded-lg bg-card hover:border-primary/50 hover:shadow-md transition-all group'>
                <div className='font-bold text-primary group-hover:underline mb-1.5 truncate'>{link.title}</div>
                <div className='text-sm text-muted-foreground line-clamp-2'>{link.desc}</div>
              </a>
            ))}
          </div>
        </section>

        {/* 版權宣告與免責聲明 (建議新增的區塊) */}
        <section className='space-y-4 pt-4'>
          <div className='flex items-center gap-2'>
            <ShieldAlert className='size-5 text-destructive/80' />
            <h2 className='text-xl font-bold'>版權宣告與免責聲明</h2>
          </div>
          <div className='bg-destructive/5 text-destructive/90 border border-destructive/20 rounded-xl p-5 sm:p-6 text-sm leading-relaxed'>
            本網站為玩家自製的非官方資料庫，所有遊戲內文本、圖片及相關資料之版權均歸原遊戲開發商（原始鳥熊 Obb Studio）所有。
            <br /><br />
            本站僅供社群交流與參考使用，請勿用於任何商業用途。若有任何侵權疑慮，請透過 Github 聯繫我們，我們將盡速協助處理。
          </div>
        </section>

      </div>
    </main>
  );
}