// 劇本基本內容節點 (例如 effect 或 remark)
export interface ScriptContentNode {
  form: 'effect' | 'remark' | 'branch' | 'perform';
  type?: string;
  text: string;
  // 如果是 branch，底下還會有 branches
  branches?: ScriptBranch[];
}

// 分支選項
export interface ScriptBranch {
  index: number;
  text: string; // 顯示文字或條件文字，例如 "{@Story.O_Act_1_001}"
  condition?: string; // 判斷條件
  content?: ScriptContentNode[]; // 分支底下的內容
}

// 關聯資料 (rel / backRel)
export interface DataRelations {
  Flag?: string[];
  Character?: string[];
  Script?: string[];
  Book?: string[];
  Misc?: string[];
  Battle?: string[];
  Combat?: string[];
  Position?: string[];
  Library?: string[];
  Mission?: string[];
}

// 單一劇本資料結構
export interface ScriptData {
  content: ScriptContentNode[];
  rel?: {
    pre?: DataRelations;
    intra?: DataRelations;
    post?: DataRelations;
  };
  backRel?: {
    post?: DataRelations;
  };
  remark?: string[];
}

// 用於側邊欄開啟時，傳遞的參數型別
export interface SidebarContext {
  isOpen: boolean;
  category: string | null; // 例如 'Flag', 'Character', 'Script'
  id: string | null;       // 例如 'G00002', 'brother4'
}