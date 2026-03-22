'use client';

import { useSidebarStore } from '../store/useSidebarStore';

export default function HomePage() {
  const openSidebar = useSidebarStore((state) => state.openSidebar);

  return (
    <main className="flex flex-col items-center justify-center flex-1 p-8">
      <h1 className="text-3xl font-bold mb-6">圖鑑 Wiki 測試首頁</h1>
      <p className="mb-8 text-muted-foreground">點擊下方按鈕測試 Zustand 與側邊欄的連動：</p>
      
      <button
        onClick={() => openSidebar('Flag', 'G00002')}
        className="px-6 py-2 bg-primary text-primary-foreground rounded-md shadow hover:bg-primary/90 transition-colors"
      >
        測試開啟側邊欄 (Flag - G00002)
      </button>
    </main>
  );
}