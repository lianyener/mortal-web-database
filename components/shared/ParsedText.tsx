import React from 'react';
import { useSidebarStore } from '@/store/useSidebarStore';
import { useRouter } from 'next/navigation';
import { useAppTranslation } from '@/hooks/useAppTranslation';

export function ParsedText({ text }: { text: string }) {

  const router = useRouter();
  const { translateTerm, translateParagraph } = useAppTranslation();

  if (!text) return null;

  // 匹配 [%條件式%] 或 [*翻譯參照*]
  const regexPart = /(\[%[\s\S]*?%\]|\[\*[\s\S]*?\*\])/g;
  const regexLabel = /^Label\.(\w+)?(?:,(.+))?$/;
  const parts = text.split(regexPart);

  return (
    <>
      {parts.map((part, index) => {

        // 條件式加框
        if (part.startsWith('[%') && part.endsWith('%]')) {
          const content = part.slice(2, -2);
          return (
            <span key={index} className="inline-block px-1 mx-0.5 text-sm/relaxed font-semibold rounded bg-amber-600/10">
              {/* 遞迴處理內部文字 */}
              <ParsedText text={content} />
            </span>
          );
        }

        // 用詞翻譯
        else if (part.startsWith('[*') && part.endsWith('*]')) {

          const content = part.slice(2, -2);
          const translated = translateParagraph(part);
          let contentNode: React.ReactNode;
          if (translated === content) {
            contentNode = <span className="text-destructive text-xs bg-destructive/10 px-1 rounded" title="Missing translation">{part}</span>;
          } else {
            contentNode = translated;
          }

          // 處理額外標籤
          const match = content.match(regexLabel);
          if (match) {
            const category = match[1];
            const targetId = (match[2] ?? '').split(',')[0];

            // 設定點擊事件
            const handleClick = (e: React.MouseEvent) => {

              // 選取文字時不觸發跳轉
              if (typeof window !== 'undefined' && window.getSelection()?.toString().length) return;

              // 阻止事件冒泡
              e.stopPropagation();

              // 側邊欄狀態
              const sidebarState = useSidebarStore.getState();
              const sidebarParams = (sidebarState.isOpen && sidebarState.category && sidebarState.id)
                ? `&sidebar=${sidebarState.category}&sidebarId=${sidebarState.id}`
                : '';

              // 依分類處理點擊行為
              switch (category) {
                // 跳轉獨立頁面
                case 'Script':
                case 'Free':
                  router.push(`/script?id=${targetId}${sidebarParams}`);
                  break;
                case 'Position':
                  router.push(`/position?id=${targetId}${sidebarParams}`);
                  break;

                // 開啟側邊欄
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
                case 'Story':
                  break;
                default:
                  sidebarState.openSidebar(category, targetId);
                  break;
              }
            };

            // 是否為連結
            let isLink = true;
            switch (category) {
                case 'Buff':
                case 'Debuff':
                case 'Support':
                case 'Stat':
                case 'Enemy':
                case 'Story':
                isLink = false;
                break;
            }

            // 設定提示詞 (文面顯示ID提示名稱，反之提示ID)
            let titleText = ': ';
            switch (category) {
              case 'Script':
              case 'Free':
                titleText += translateTerm(`Script.Name.${targetId}`);
                break;
              case 'Combat':
              case 'Battle':
                titleText += translateTerm(`${category}.Name.${targetId}`);
                break;
              default:
                titleText += targetId;
                break;
            }
            if (!targetId) titleText = '';
            titleText = `${translateTerm(`Web.${category}`, undefined, 2)}${titleText}`;

            return (
              <span key={index} onClick={handleClick} role="button" tabIndex={0} title={titleText}
                className={`inline-flex items-center font-bold text-inherit transition-colors hover:text-current/80 ${isLink ? 'cursor-pointer' : ''}`}>
                {contentNode}
              </span>
            );
          }

          // 標籤以外用詞
          return <React.Fragment key={index}>{contentNode}</React.Fragment>;
        }

        // 普通文字
        return <span key={index}>{part}</span>;
      })}
    </>
  );
}