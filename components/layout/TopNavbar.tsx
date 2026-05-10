'use client';

import { Link } from '@/i18n/navigation';
import { useState, useEffect } from 'react';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import { ChevronDown, Sun, Moon, Menu, X } from 'lucide-react';

export function TopNavbar() {
  const { translateTerm, translateTermWithParam } = useAppTranslation();

  // 深淺色模式切換邏輯
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
        { titleKey: 'Web.Label.Mission', href: '/mission' },
        { titleKey: 'Web.Label.Trigger', href: '/trigger' },
        { titleKey: 'Web.Label.Position', href: '/position' },
        { titleKey: 'Web.Label.Free', href: '/free' },
        { titleKey: 'Web.Label.Script', href: '/script' },
        { titleKey: 'Web.Label.Combat', href: '/combat' },
        { titleKey: 'Web.Label.Battle', href: '/battle' },
        { titleKey: 'Web.Label.EventTable', href: '/event' },
        { titleKey: 'Web.Label.RandomTable', href: '/random' }
      ]
    },
    {
      titleKey: 'Web.Item',
      items: [
        { titleKey: 'Web.Label.Flag', href: '/flag' },
        { titleKey: 'Web.Label.Character', href: '/character' },
        { titleKey: 'Web.Label.Book', href: '/book' },
        { titleKey: 'Web.Label.Equip', href: '/equip' },
        { titleKey: 'Web.Label.Special', href: '/special' },
        { titleKey: 'Web.Label.Misc', href: '/misc' },
        { titleKey: 'Web.Label.Talent', href: '/talent' },
        { titleKey: 'Web.Label.Effect', href: '/effect' },
        { titleKey: 'Web.Label.Achievement', href: '/achievement' },
        { titleKey: 'Web.Label.End', href: '/end' },
        { titleKey: 'Web.Label.Dead', href: '/dead' },
        { titleKey: 'Web.Label.Time', href: '/time' },
        { titleKey: 'Web.Label.GroupStat', href: '/groupstat' }
      ]
    },
    {
      titleKey: 'Web.About',
      items: [
        { titleKey: 'Web.Introduce', href: null },
        { titleKey: 'Web.UpdateLog', href: null }
      ]
    }
  ];

  return (
    <div className='sticky top-0 z-20 bg-background/95 backdrop-blur-md border-b px-6 py-4 mb-8 shadow-sm'>
      <div className='max-w-5xl mx-auto flex flex-col'>
        <div className='flex items-center justify-between gap-4'>
          {/* 左側 Logo / 標題 */}
          <Link href='/' className='text-xl font-extrabold text-primary hover:opacity-80 transition-opacity shrink-0'>
            {translateTerm('Web.SiteTitle')}
          </Link>

          {/* 右側導覽選單 (桌機版) */}
          <div className='hidden md:flex flex-wrap items-center gap-x-4 lg:gap-x-6 gap-y-2'>
            {menuGroups.map((group, i) => (
              <div key={i} className='relative group'>
                <button className='flex items-center gap-1 text-sm font-semibold text-foreground hover:text-primary transition-colors py-2 outline-none'>
                  {translateTerm(group.titleKey)}
                  <ChevronDown className='size-3.5 opacity-50 group-hover:rotate-180 transition-transform duration-200' />
                </button>

                {/* 下拉選單區塊 */}
                <div className={`absolute top-full hidden group-hover:block pt-1 min-w-30 z-30 -left-1`}>
                  <div className='bg-card border border-border/50 rounded-lg shadow-lg py-1.5 flex flex-col'>
                    {group.items.map((item, j) =>
                      item.href ? (
                        <Link key={j} href={item.href} className='px-4 py-2 text-sm text-foreground hover:bg-muted hover:text-primary transition-colors text-left font-medium'>
                          {translateTerm(item.titleKey)}
                        </Link>
                      ) : (
                        // 尚未實作的頁面，顯示為灰色不可點擊
                        <span key={j} className='px-4 py-2 text-sm text-muted-foreground/50 cursor-not-allowed text-left font-medium select-none'>
                          {translateTerm(item.titleKey)}
                        </span>
                      )
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* 分隔線 */}
            <div className='w-px h-5 bg-border/80 mx-1'></div>

            {/* 深淺色主題切換按鈕 */}
            <button
              onClick={toggleTheme}
              className='p-2 rounded-full bg-muted/50 hover:bg-muted text-foreground transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary'
              title={translateTermWithParam('Web.ThemeSwitch', isDark ? 'LightMode' : 'DarkMode')}
            >
              {mounted ? isDark ? <Moon className='size-4' /> : <Sun className='size-4' /> : <div className='size-4' />}
            </button>
          </div>

          {/* 行動版按鈕群組 */}
          <div className='flex md:hidden items-center gap-2 shrink-0'>
            <button
              onClick={toggleTheme}
              className='p-2 rounded-full bg-muted/50 hover:bg-muted text-foreground transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary'
              title={translateTermWithParam('Web.ThemeSwitch', isDark ? 'LightMode' : 'DarkMode')}
            >
              {mounted ? isDark ? <Moon className='size-4' /> : <Sun className='size-4' /> : <div className='size-4' />}
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className='p-2 rounded-md bg-muted/50 hover:bg-muted text-foreground transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary'
            >
              {isMobileMenuOpen ? <X className='size-4' /> : <Menu className='size-4' />}
            </button>
          </div>
        </div>

        {/* 行動版下拉選單 */}
        {isMobileMenuOpen && (
          <div className='md:hidden flex flex-col gap-5 pt-4 mt-4 border-t border-border/50 max-h-[75vh] overflow-y-auto pb-2'>
            {menuGroups.map((group, i) => (
              <div key={i} className='flex flex-col gap-2.5'>
                <div className='font-bold text-primary text-sm flex items-center gap-2'>{translateTerm(group.titleKey)}</div>
                <div className='grid grid-cols-2 gap-2'>
                  {group.items.map((item, j) =>
                    item.href ? (
                      <Link
                        key={j}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className='px-3 py-2 text-sm text-foreground bg-muted/40 rounded-md hover:bg-primary/10 hover:text-primary transition-colors font-medium border border-transparent hover:border-primary/20'
                      >
                        {translateTerm(item.titleKey)}
                      </Link>
                    ) : (
                      <span key={j} className='px-3 py-2 text-sm text-muted-foreground/50 bg-muted/20 rounded-md cursor-not-allowed font-medium select-none border border-transparent'>
                        {translateTerm(item.titleKey)}
                      </span>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
