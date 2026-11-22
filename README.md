# Mortal Web Database

一個用於瀏覽與查詢遊戲內部資料的網頁資料庫應用程式，支援多語系切換與關聯資料快速檢索。

## 資料來源 (Data Source)

本網站所使用的結構化資料（包含事件、劇本、旗標 Flag、戰鬥、道具、天賦與多語系文本等 JSON 檔案），皆需透過另一個解析專案自原始遊戲檔案中提取與轉換而來：

* **資料解析工具**：[lianyener/mortal-parser](https://github.com/lianyener/mortal-parser)

如需更新本專案資料，需使用 `mortal-parser` 解析遊戲檔案，並將產出的資料檔案放置於專案對應的靜態資料目錄（如 `public/data/`）與語系檔目錄中。

## 主要功能

* **多語系支援**：支援繁體中文（`zh-tw`）、日文（`jp`）等多語系介面與遊戲文本切換。
* **全域關聯側邊欄**：點擊文本中的標籤或關聯項目時，可直接在側邊欄展開檢視詳細資訊（支援瀏覽器上一頁/下一頁狀態同步）。
* **高效資料查詢**：前端透過快取機制載入結構化 JSON 資料，減輕伺服器運算負擔並提供流暢的頁面切換體驗。

## 技術棧 (Tech Stack)

* **框架**：[Next.js](https://nextjs.org/) (App Router) / React / TypeScript
* **樣式與 UI**：[Tailwind CSS v4](https://tailwindcss.com/) / [shadcn/ui](https://ui.shadcn.com/) / Lucide Icons
* **國際化 (i18n)**：[next-intl](https://next-intl.dev/)
* **狀態與資料管理**：[TanStack Query](https://tanstack.com/query) / [Zustand](https://zustand-demo.pmnd.rs/) / [nuqs](https://nuqs.47ng.com/)
* **字型**：Google Fonts（Chiron Hei HK / Sometype Mono）

## 本機開發 (Getting Started)

### 1. 環境需求

* **Node.js**：建議使用 `v20.x` 或 `v24.x` LTS 版本

### 2. 安裝相依套件

```bash
git clone <你的儲存庫網址>
cd mortal-web-database
npm install
```

### 3. 準備遊戲資料

1. 前往 [mortal-parser](https://github.com/lianyener/mortal-parser) 依照說明自遊戲主程式解析資料。
2. 將解析生成的資料檔案放入 `public/data/`，並更新對應的語系翻譯檔。

### 4. 啟動開發伺服器

```bash
npm run dev
```

啟動後，在瀏覽器開啟 `http://localhost:3000` 即可預覽網站。

## 專案結構概覽

```text
├── app/
│   ├── [locale]/          # 多語系路由頁面與全域 Layout
│   └── globals.css        # 全域樣式與 Tailwind 主題變數設定
├── components/
│   ├── shared/            # 共用元件（如文本標籤解析器 ParsedText）
│   ├── sidebar/           # 全域關聯資訊側邊欄 (GlobalSidebar)
│   └── ui/                # 基礎 UI 元件 (shadcn/ui)
├── hooks/                 # 自訂 Hooks（資料查詢與多語系翻譯邏輯）
├── i18n/                  # next-intl 路由與語系設定
├── public/
│   └── data/              # 由 mortal-parser 解析產出的靜態資料檔
└── store/                 # Zustand 全域狀態管理
```