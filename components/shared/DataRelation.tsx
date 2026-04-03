/* eslint-disable @typescript-eslint/no-explicit-any */
import { useAppTranslation } from '@/hooks/useAppTranslation';
import { ParsedText } from '@/components/shared/ParsedText';

export function DataRelation({ phase, types }: { phase: string, types: any }) {
  const { translateTerm } = useAppTranslation();

  // 檢查是否有內容
  if (!types || Object.keys(types).length === 0) return null;
  if (!Object.values(types).some((ids: any) => Array.isArray(ids) && ids.length > 0)) return null;

  return (
    <div className="bg-card border rounded-xl p-4 sm:p-5 shadow-sm w-full">
      <h3 className="text-md font-bold text-primary mb-4 border-b border-border/50 pb-2">
        {translateTerm(`Web.Rel.${phase}`, undefined, 1)}
      </h3>
      <div className="flex flex-col gap-3 text-sm">
        
        {/* 關聯項目類別 */}
        {Object.entries(types).map(([type, ids]: [string, any]) => {
          if (!Array.isArray(ids) || ids.length === 0) return null;
          return (
            <div key={type} className="flex flex-col sm:flex-row gap-2 sm:gap-4 border-b border-border/40 pb-3 last:border-0 last:pb-0">
              <span className="font-semibold text-muted-foreground w-18 shrink-0">{translateTerm(`Web.Label.${type}`)}</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 flex-1">
                {ids.map((id: string) => (
                  <div key={id} className="flex items-start overflow-hidden">

                    {/* 關聯項目，強制覆寫內部按鈕樣式 */}
                    <div className="flex-1 min-w-0 **:[[role=button]]:block **:[[role=button]]:w-full **:[[role=button]]:text-left **:[[role=button]]:truncate">
                      <ParsedText text={`[*Label.${type},${id}*]`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}