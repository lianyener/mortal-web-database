import React from 'react';
import { useRouter } from 'next/navigation';
import { useSidebarStore } from '@/store/useSidebarStore';
import { useAppTranslation } from '@/hooks/useAppTranslation';

export function ParsedText({ text }: { text: string }) {

  const router = useRouter();
  const { translateTerm, translateParagraph, translateTermWithParam } = useAppTranslation();

  if (!text) return null;

  // 匹配 [%條件式%] 或 [*翻譯參照*]
  const regexPart = /(\[%[\s\S]*?%\]|\[\*[\s\S]*?\*\]|\[#[\s\S]*?#\])/g;
  const regexLabel = /^Label\.(\w+)?(?:,(.+))?$/;
  const parts = text.split(regexPart);

  return (
    <>
      {parts.map((part, index) => {

        // 條件式加底
        if (part.startsWith('[%') && part.endsWith('%]')) {
          const content = part.slice(2, -2);
          return (
            <span key={index} className="inline-block px-1 mx-0.5 text-sm/[22.25px] font-semibold rounded bg-amber-600/10">

              {/* 遞迴處理內部文字 */}
              <ParsedText text={content} />
            </span>
          );
        }

        // 加框
        if (part.startsWith('[#') && part.endsWith('#]')) {
          const content = part.slice(2, -2);
          return (
            <span key={index} className="inline-block px-1 mx-0.5 text-sm/[20.75px] border rounded">

              {/* 遞迴處理內部文字 */}
              <ParsedText text={content} />
            </span>
          );
        }

        // 用詞翻譯
        else if (part.startsWith('[*') && part.endsWith('*]')) {

          const content = part.slice(2, -2);
          const translated = translateParagraph(part, 0);
          const baseKey = content.split(',')[0].trim();
          let contentNode: React.ReactNode;

          if (translated === content || translated === baseKey) {
            contentNode = <span className="text-destructive text-xs bg-destructive/10 px-1 rounded" title="Missing translation">{part}</span>;
          }
          else {
            contentNode = translated;
          }

          // 處理額外標籤
          const match = content.match(regexLabel);
          if (match) {
            const category = match[1];
            const targetId = (match[2] ?? '').split(',')[0];
            
            // 是否為連結
            let isLink = true;
            switch (category) {
              case 'Buff':
              case 'Debuff':
              case 'Support':
              case 'Stat':
              case 'Enemy':
              case 'Story':
              case 'Place':
                isLink = false;
                break;
            }

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
                case 'Combat':
                case 'Battle':
                case 'Position':
                case 'Trigger':
                case 'Mission':
                  router.push(`/${category.toLowerCase()}?id=${targetId}${sidebarParams}`);
                  break;

                // 開啟側邊欄
                case 'Flag':
                case 'RelationshipFlag':
                  sidebarState.openSidebar('Flag', targetId.split('.')[0]);
                  break;
                case 'Relationship':
                  router.push(`/character?id=${targetId}${sidebarParams}`);
                  break;
                default:
                  if (isLink) sidebarState.openSidebar(category, targetId);
                  break;
              }
            };

            // 設定提示詞 (文面顯示ID提示名稱，反之提示ID)
            let titleText = ': ';
            switch (category) {
              case 'Script':
              case 'Free':
                titleText += translateTerm(`Script.Name.${targetId}`, undefined, 1);
                break;
              case 'Combat':
              case 'Battle':
              case 'Trigger':
              case 'Mission':
              case 'Character':
                titleText += translateTerm(`${category}.Name.${targetId}`, undefined, 1);
                break;
              case 'Flag':
              case 'RelationshipFlag':
                titleText += targetId.split('.')[0];
                break;
              default:
                titleText += targetId;
                break;
            }
            if (!targetId) titleText = '';
            titleText = `${translateTerm(`Web.Label.${category}`)}${titleText}`;

            // 只有emoji -> 找不到用詞
            if (translated == translateTerm(`LabelIcon.${category}`)) {
              contentNode = `${translated}${translateTermWithParam('Web.Unknown', `Web.Label.${category}`)}(${targetId.split('.')[0]})`;
              isLink = false;
            }

            return (
              <span key={index} onClick={isLink ? handleClick : undefined} role="button" tabIndex={0} title={titleText}
                className={`inline-flex items-center font-semibold text-inherit transition-colors hover:text-current/80 ${isLink ? 'cursor-pointer' : ''}`}>
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