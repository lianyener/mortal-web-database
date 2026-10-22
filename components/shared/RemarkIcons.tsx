'use client';

import { MessageSquareWarning } from 'lucide-react';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import { ParsedText } from '@/components/shared/ParsedText';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';

interface RemarkIconsProps {
  remarks?: string | string[];
}

export function RemarkIcons({ remarks }: RemarkIconsProps) {
  const { translateParagraph } = useAppTranslation();

  if (!remarks) return null;

  const list = (Array.isArray(remarks) ? remarks : [remarks]).filter(Boolean);
  if (list.length === 0) return null;

  return (
    <HoverCard openDelay={150} closeDelay={150}>
      <HoverCardTrigger asChild>
        <button
          type='button'
          className='mt-1 inline-flex items-center justify-center size-4 rounded text-amber-600 dark:text-amber-400 hover:bg-amber-500/15 transition-colors cursor-pointer select-none'
          onClick={(e) => e.stopPropagation()}
        >
          <MessageSquareWarning className='size-4' />
        </button>
      </HoverCardTrigger>
      <HoverCardContent className='w-120 p-3 text-s z-50 bg-popover text-popover-foreground border shadow-md space-y-2' align='start'>
        <div className='flex flex-col gap-2.5 max-h-64 overflow-y-auto pr-0.5'>
          {list.map((r, i) => (
            <div key={i} className={list.length > 1 ? 'border-b border-border/30 pb-2 last:border-b-0 last:pb-0' : ''}>
              <div className='leading-relaxed whitespace-pre-wrap text-muted-foreground'>
                <ParsedText text={translateParagraph(r, 1, false)} />
              </div>
            </div>
          ))}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
