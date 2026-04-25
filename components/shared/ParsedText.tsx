import React from 'react';
import { useRouter } from '@/i18n/navigation';
import { useSidebarStore } from '@/store/useSidebarStore';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';

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
            <span key={index} className='inline-block px-1 mx-0.5 text-sm/[22.25px] font-semibold rounded bg-amber-600/10'>
              {/* 遞迴處理內部文字 */}
              <ParsedText text={content} />
            </span>
          );
        }

        // 加框
        if (part.startsWith('[#') && part.endsWith('#]')) {
          const content = part.slice(2, -2);
          return (
            <span key={index} className='inline-block px-1 mx-0.5 text-sm/[20.75px] border rounded'>
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
            contentNode = (
              <span className='text-destructive text-xs bg-destructive/10 px-1 rounded' title='Missing translation'>
                {part}
              </span>
            );
          } else {
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
              const sidebarParams = sidebarState.isOpen && sidebarState.category && sidebarState.id ? `?sidebar=${sidebarState.category}&sidebarId=${sidebarState.id}` : '';

              // 依分類處理點擊行為
              switch (category) {
                // 跳轉獨立頁面
                case 'Script':
                case 'Free':
                case 'Combat':
                case 'Battle':
                case 'Position':
                case 'Trigger':
                case 'Mission':
                  router.push(`/${category.toLowerCase()}/${targetId}${sidebarParams}`);
                  break;

                // 開啟側邊欄
                case 'Buff':
                case 'Debuff':
                case 'Support':
                  sidebarState.openSidebar('Effect', targetId.split('.')[0]);
                  break;
                case 'Flag':
                case 'RelationshipFlag':
                  sidebarState.openSidebar('Flag', targetId.split('.')[0]);
                  break;
                case 'Relationship':
                  sidebarState.openSidebar('Character', targetId);
                  break;
                default:
                  if (isLink) sidebarState.openSidebar(category, targetId);
                  break;
              }
            };

            // 只有emoji -> 找不到用詞
            if (translated == translateTerm(`LabelIcon.${category}`)) {
              if (category === 'Effect') {
                contentNode = `${translated}${targetId}`;
              } else {
                contentNode = `${translated}${translateTermWithParam('Web.Unknown', `Web.Label.${category}`)}(${targetId.split('.')[0]})`;
                isLink = false;
              }
            }

            const categoryAlias: { [key: string]: string } = {
              Talent: 'PlayerTalent',
              Dead: 'Library',
              End: 'Library',
              Achievement: 'Library',
              Effect: 'CombatSkill',
              Buff: 'CombatSkill',
              Debuff: 'CombatSkill',
              Support: 'CombatSkill',
              Free: 'Script',
              Relationship: 'Character',
              RelationshipFlag: 'Flag'
            };
            const i18nCategory = categoryAlias[category] || category;

            let tipName = '';
            let tipDesc = '';
            switch (i18nCategory) {
              case 'Flag':
                const targetIds = targetId.split('.');
                const flagId = targetIds[0];
                const flagPhase = targetIds[1] ?? '0';
                tipName = translateTerm(`Flag.${flagId}.${flagPhase}`, undefined, 0) + ` (${flagId})`;
                tipDesc = translateTerm(`Flag.${flagId}.${flagPhase}.Desc`, undefined, 0);
                for (let i = 0; true; i++) {
                  const valDef = translateTerm(`Flag.${flagId}.${flagPhase}.${i}`, undefined, 0);
                  if (valDef) {
                    tipDesc += `\n${i}: ${valDef}`;
                  }
                  else {
                    break;
                  }
                }
                tipDesc = tipDesc.trim();
                break;
              case 'GroupStat':
                tipName = translateTerm(`GroupStat.${targetId}`, undefined, 0);
                tipDesc = translateTerm(`GroupStat.${targetId}.Desc`, undefined, 0);
                break;
              case 'Time':
                tipName = translateTerm(`Time.${targetId}`, undefined, 0) + ` (${targetId})`;
                break;
              case 'Position':
                tipName = translateTerm(`Position.Action.${targetId}`, undefined, 0) + ` (${targetId})`;
                break;
              case 'Library':
                tipName = translateTerm(`${i18nCategory}.Title.${targetId}`, undefined, 0) + ` (${targetId})`;
                tipDesc = translateTerm(`${i18nCategory}.Desc.${targetId}`, undefined, 0);
                break;
              case 'Character':
                tipName = translateTerm(`${i18nCategory}.${targetId}`, undefined, 0) + ` (${targetId})`;
                break;
              case 'Stat':
              case 'Story':
              case 'Place':
              case 'Enemy':
                break;
              default:
                tipName = translateTerm(`${i18nCategory}.Name.${targetId}`, undefined, 1) + ` (${targetId})`;
                tipDesc = translateTerm(`${i18nCategory}.Desc.${targetId}`, undefined, 0);
                break;
            }

            return (
              <HoverCard key={index} openDelay={200} closeDelay={100}>
                <HoverCardTrigger asChild>
                  <span
                    onClick={isLink ? handleClick : undefined}
                    role={isLink ? 'button' : undefined}
                    tabIndex={isLink ? 0 : undefined}
                    className={`inline-flex items-center font-semibold text-inherit transition-colors hover:text-current/80 ${isLink ? 'cursor-pointer' : ''}`}
                  >
                    {contentNode}
                  </span>
                </HoverCardTrigger>
                {(tipName || tipDesc) && (
                  <HoverCardContent className='w-80 z-50 flex flex-col gap-1.5' align='start' sideOffset={4}>
                    {tipName && <div className='font-bold text-sm text-foreground'>{tipName}</div>}
                    {tipDesc && <div className='text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap font-mixed overflow-hidden'>{tipDesc}</div>}
                  </HoverCardContent>
                )}
              </HoverCard>
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
