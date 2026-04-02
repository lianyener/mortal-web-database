// 劇本基本內容節點
export interface ScriptContentNode {
  form: 'effect' | 'remark' | 'branch' | 'perform';
  type?: string;
  text: string;
  branches?: ScriptBranch[];
}

// 分支選項
export interface ScriptBranch {
  index: number;
  text: string;
  condition?: string;
  content?: ScriptContentNode[];
}

// 關聯資料
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

// 關連節點
export interface RelationNode {
    pre?: DataRelations;
    post?: DataRelations;
    intra?: DataRelations;
    inner?: DataRelations;
    to?: DataRelations;
    from?: DataRelations;
}

// 單一劇本資料結構
export interface ScriptData {
  content: ScriptContentNode[];
  rel?: RelationNode;
  remark?: string[];
}

// 側邊欄傳遞參數型別
export interface SidebarContext {
  isOpen: boolean;
  category: string | null;
  id: string | null;
}