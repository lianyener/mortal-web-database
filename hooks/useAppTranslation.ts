import { useMemo } from 'react';
import { useTranslations, TranslationValues } from 'next-intl';

export function useAppTranslation() {
  const t = useTranslations();

  // 快取常用之翻譯物件
  const { translateTerm, translateParagraph, translateTermWithParam } = useMemo(() => {

    const tTermWithParam = (text: string, param: string, defaultText: number = 2): string => {
      if (param.includes('.')) param = tTerm(param, undefined, 1);
      return tTerm(text, { 0: param }, defaultText);
    }

    // 翻譯用詞
    const tTerm = (text: string, params?: TranslationValues, defaultText: number = 2, nest: boolean = true): string => {

      // 防呆
      if (!text) return '';

      // 嘗試處理自動降階
      if (t.has(`${text}._`)) text = t(`${text}._`, params);

      // 嘗試正常翻譯
      else if (t.has(text)) text = t(text, params);

      // 無可用翻譯回傳 0:空白 / 1:本身 / 2:最後一個KEY
      else return defaultText === 0 ? '' : defaultText === 2 ? text.split('.').pop()! : text;

      // 處理巢狀翻譯並回傳
      return nest ? tParagraph(text, defaultText) : text;
    };

    // 翻譯段落
    const tParagraph = (text: string, defaultText: number = 1, nest: boolean = true): string => {

      // 防呆
      if (!text) return '';

      // 初始化變數
      const regexStatment = /\[([%#])([\s\S]+?)\1\]/g
      const regexTerm = /\[\*([\s\S]+?)\*\]/g;

      // 移除比較式外框
      text = text.replace(regexStatment, (_, symbol, content) => content);

      // 針對內部用詞進行翻譯
      text = text.replace(regexTerm, (_, content) => {

        // 取得鍵值及參數
        const [key, ...args] = content.split(',');

        if (args.length > 0) {

          // 參數陣列轉換為參數物件
          const params = args.reduce((acc: Record<number, string>, arg: string, i: number) => {

            // 嘗試翻譯變數
            if (arg.includes('.')) acc[i] = tTerm(arg.trim(), undefined, 1);
            else acc[i] = arg.trim();
            
            return acc;
          }, {} as Record<number, string>);

          // 回傳翻譯結果
          return tTerm(key.trim(), params, defaultText, nest);
        }

        // 回傳翻譯結果
        return tTerm(content, undefined, defaultText, nest);
      });

      // 回傳結果
      return text;
    };

    return { translateTerm: tTerm, translateParagraph: tParagraph, translateTermWithParam: tTermWithParam };
  }, [t]);

  return { t, translateTerm, translateParagraph, translateTermWithParam };
}