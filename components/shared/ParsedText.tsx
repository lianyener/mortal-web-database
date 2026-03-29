import React from 'react';
import { useSidebarStore } from '@/store/useSidebarStore';
import { useRouter } from 'next/navigation';

export function ParsedText({
  text,
  translate
}: {
  text: string,
  translate: (key: string, params?: Record<string, string>) => string
}) {
  // 取得 Next.js 的 Router 實例，用來切換不同頁面
  const router = useRouter();

  if (!text) return null;

  // 匹配 [%條件式%] 或 [*翻譯參照*]
  const regex = /(\[%[\s\S]*?%\]|\[\*[\s\S]*?\*\])/g;
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith('[%') && part.endsWith('%]')) {
          const content = part.slice(2, -2);
          return (
            <span key={index} className="inline-block rounded px-1 mx-0.5 bg-amber-600/10 font-semibold">
              <ParsedText text={content} translate={translate} />
            </span>
          );
        } else if (part.startsWith('[*') && part.endsWith('*]')) {
          const content = part.slice(2, -2);
          const [key, ...args] = content.split(',');
          const params = args.reduce((acc, arg, i) => {
            // 【修改】將參數也丟給 translate 嘗試翻譯
            // 如果是 Key (例如 System.Number_1) 會變成 "一"；如果是一般字串或數字，找不到翻譯則會維持原樣
            acc[i] = translate(arg.trim());
            return acc;
          }, {} as Record<number, string>);

          const cleanKey = key.trim();
          const translated = translate(cleanKey, Object.keys(params).length > 0 ? params : undefined);

          let contentNode: React.ReactNode;
          if (translated === cleanKey || translated === part) {
            // 找不到翻譯時，仍保留原本文字作為節點內容
            contentNode = <span className="text-destructive font-mono text-xs bg-destructive/10 px-1 rounded" title="Missing translation">{part}</span>;
          } else {
            // 遞迴解析翻譯後的文字
            contentNode = <ParsedText text={translated} translate={translate} />;
          }

          // 【修改】只針對 Label.X 的格式轉換為超連結，並且擁有對應的參數 ID
          if (cleanKey.startsWith('Label.') && args.length > 0) {
            const category = cleanKey.replace('Label.', ''); // 取得 X (例如 Script, Flag)
            const targetId = args[0].trim(); // 第一個參數即為 ID

            const handleClick = (e: React.MouseEvent) => {
              // 若使用者正在反白選取文字，則不觸發點擊跳轉 (方便使用者複製)
              if (typeof window !== 'undefined' && window.getSelection()?.toString().length) {
                return;
              }

              // 阻止事件冒泡，避免點擊標籤時意外觸發外層容器的 onClick (例如劇本分歧的展開/收縮)
              e.stopPropagation();

              // 取得當下的側邊欄狀態 (使用 getState 避免大量 re-render)
              const sidebarState = useSidebarStore.getState();
              
              // 如果側邊欄目前是開啟的，把參數保留下來，防止主頁面切換時側邊欄被重置關閉
              const sidebarParams = (sidebarState.isOpen && sidebarState.category && sidebarState.id)
                ? `&sidebar=${sidebarState.category}&sidebarId=${sidebarState.id}`
                : '';

              switch (category) {
                case 'Script':
                case 'Free':
                  // 跳轉到獨立的 script 頁面，並保留側邊欄狀態
                  router.push(`/script?id=${targetId}${sidebarParams}`);
                  break;
                case 'Position':
                  // 跳轉到獨立的 position 頁面，並保留側邊欄狀態
                  router.push(`/position?id=${targetId}${sidebarParams}`);
                  break;
                // 可在此處繼續新增其他類別的 switch 處理...
                case 'Flag':
                case 'RelationshipFlag':
                  sidebarState.openSidebar('Flag', targetId.split('.')[0]);
                  break;
                case 'Relationship':
                  sidebarState.openSidebar('Character', targetId);
                  break;
                case 'Buff':
                case 'Debuff':
                case 'Support':
                case 'Stat':
                case 'Enemy':
                  break;
                default:
                  // 預設行為：開啟側邊欄 (讀取 public/data/category/targetId.json)
                  sidebarState.openSidebar(category, targetId);
                  break;
              }
            };

            return (
              // 將 button 改為 span，解除瀏覽器對按鈕文字無法反白的限制
              <span key={index} onClick={handleClick} role="button" tabIndex={0} className="inline-flex items-center font-bold text-inherit transition-colors hover:text-current/80 cursor-pointer" title={`開啟 ${category} 資訊`}>
                {contentNode}
              </span>
            );
          }

          return <React.Fragment key={index}>{contentNode}</React.Fragment>;
        }
        // 普通文字直接渲染
        return <span key={index}>{part}</span>;
      })}
    </>
  );
}