'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import { ChevronDown, Sun, Moon } from 'lucide-react';

export function TopNavbar() {
  const { translateTerm, translateTermWithParam } = useAppTranslation();

  // 深淺色模式切換邏輯
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);

  // 初始化時讀取本機記憶的深淺色設定，若無則依據系統偏好設定
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'dark' || (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = !isDark;
    setIsDark(nextTheme);
    if (nextTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // 導覽列架構
  const menuGroups = [
    {
      titleKey: 'Web.Event',
      items: [
        { titleKey: 'Web.Label.Mission', href: null },
        { titleKey: 'Web.Label.Trigger', href: null },
        { titleKey: 'Web.Label.Position', href: '/position' },
        { titleKey: 'Web.Label.Script', href: '/script' },
        { titleKey: 'Web.Label.Combat', href: '/combat' },
        { titleKey: 'Web.Label.Battle', href: null },
      ]
    },
    {
      titleKey: 'Web.Item',
      items: [
        { titleKey: 'Web.Label.Flag', href: null },
        { titleKey: 'Web.Label.Character', href: null },
        { titleKey: 'Web.Label.Book', href: null },
        { titleKey: 'Web.Label.Equip', href: null },
        { titleKey: 'Web.Label.Special', href: null },
        { titleKey: 'Web.Label.Misc', href: null },
        { titleKey: 'Web.Label.Talent', href: null },
        { titleKey: 'Web.Label.Achievement', href: null },
        { titleKey: 'Web.Label.End', href: null },
        { titleKey: 'Web.Label.Dead', href: null },
      ]
    },
    {
      titleKey: 'Web.About',
      items: [
        { titleKey: 'Web.Introduce', href: null },
        { titleKey: 'Web.UpdateLog', href: null },
      ]
    }
  ];

  return (
    <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b px-6 py-4 mb-8 shadow-sm">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">

        {/* 左側 Logo / 標題 */}
        <Link href="/" className="text-xl font-extrabold text-primary hover:opacity-80 transition-opacity">
          {translateTerm('Web.SiteTitle')}
        </Link>

        {/* 右側導覽選單 */}
        <div className="flex flex-wrap items-center gap-x-4 sm:gap-x-6 gap-y-2">
          {menuGroups.map((group, i) => (
            <div key={i} className="relative group">
              <button className="flex items-center gap-1 text-sm font-semibold text-foreground hover:text-primary transition-colors py-2 outline-none">
                {translateTerm(group.titleKey)}
                <ChevronDown className="size-3.5 opacity-50 group-hover:rotate-180 transition-transform duration-200" />
              </button>

              {/* 下拉選單區塊 */}
              <div className={`absolute top-full hidden group-hover:block pt-1 min-w-30 z-30 -left-1`}>
                <div className="bg-card border border-border/50 rounded-lg shadow-lg py-1.5 flex flex-col">
                  {group.items.map((item, j) => (
                    item.href ? (
                      <Link key={j} href={item.href} className="px-4 py-2 text-sm text-foreground hover:bg-muted hover:text-primary transition-colors text-left font-medium">
                        {translateTerm(item.titleKey)}
                      </Link>
                    ) : (
                      // 尚未實作的頁面，顯示為灰色不可點擊
                      <span key={j} className="px-4 py-2 text-sm text-muted-foreground/50 cursor-not-allowed text-left font-medium select-none">
                        {translateTerm(item.titleKey)}
                      </span>
                    )
                  ))}
                </div>
              </div>
            </div>
          ))}

          {/* 分隔線 (僅在桌機版顯示) */}
          <div className="hidden sm:block w-px h-5 bg-border/80 mx-1"></div>

          {/* 深淺色主題切換按鈕 */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-muted/50 hover:bg-muted text-foreground transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary"
            title={translateTermWithParam('Web.ThemeSwitch', isDark ? 'LightMode' : 'DarkMode')}
          >
            {mounted ? (isDark ? <Moon className="size-4" /> : <Sun className="size-4" />) : <div className="size-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}