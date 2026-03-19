import { create } from 'zustand';
import { SidebarContext } from '@/types/game-data';

interface SidebarStore extends SidebarContext {
  openSidebar: (category: string, id: string) => void;
  closeSidebar: () => void;
}

export const useSidebarStore = create<SidebarStore>((set) => ({
  isOpen: false,
  category: null,
  id: null,
  
  // 開啟側邊欄並設定要檢視的類別與 ID
  openSidebar: (category, id) => set({ isOpen: true, category, id }),
  
  // 關閉側邊欄
  closeSidebar: () => set({ isOpen: false }),
}));