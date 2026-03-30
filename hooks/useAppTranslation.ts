import { useTranslations, TranslationValues } from 'next-intl';

export function useAppTranslation() {
    const t = useTranslations();

    // 預定廢棄
    const getTranslation = (baseKey: string, params?: TranslationValues): string => {
        if (!baseKey) return '';
        if (t.has(`${baseKey}._`)) return t(`${baseKey}._`, params);
        if (t.has(baseKey)) return t(baseKey, params);
        return baseKey;
    };

    // 預定廢棄
    const getPlainText = (baseKey: string, params?: TranslationValues): string => {
        let text = getTranslation(baseKey, params);

        if (text !== baseKey && typeof text === 'string' && text.includes('[*')) {
            const regex = /\[\*([\s\S]*?)\*\]/g;
            text = text.replace(regex, (match, content) => {
                const [key, ...args] = content.split(',');
                const cleanKey = key.trim();

                if (cleanKey.startsWith('Label.') && args.length > 0) {
                    const category = cleanKey.replace('Label.', '');
                    const id = args[0].trim();
                    if (t.has(`${category}.Name.${id}._`)) return t(`${category}.Name.${id}._`);
                    if (t.has(`${category}.Name.${id}`)) return t(`${category}.Name.${id}`);
                    if (t.has(`${category}.Title.${id}._`)) return t(`${category}.Title.${id}._`);
                    if (t.has(`${category}.Title.${id}`)) return t(`${category}.Title.${id}`);
                    return id;
                }

                const resolvedStr = getPlainText(cleanKey);
                return resolvedStr !== cleanKey ? resolvedStr : match;
            });
        }
        return text;
    };

    // 翻譯用詞
    const translateTerm = (text: string, params?: TranslationValues): string => {

        // 防呆
        if (!text) return '';

        // 嘗試處理自動降階
        if (t.has(`${text}._`)) text = t(`${text}._`, params);

        // 嘗試正常翻譯
        else if (t.has(text)) text = t(text, params);

        // 無可用翻譯回傳本身
        else return text;

        // 處理巢狀翻譯並回傳
        return translateParagraph(text);
    };

    // 翻譯段落
    const translateParagraph = (text: string): string => {

        // 防呆
        if (!text) return '';

        // 初始化變數
        const regexStatment = /\[%([\s\S]+?)%\]/g
        const regexTerm = /\[\*([\s\S]+?)\*\]/g;

        // 移除比較式外框
        text = text.replace(regexStatment, (_, content) => content);

        // 針對內部用詞進行翻譯
        text = text.replace(regexTerm, (_, content) => {

            // 取得鍵值及參數
            const [key, ...args] = content.split(',');

            if (args.length > 0) {

                // 參數陣列轉換為參數物件
                const params = args.reduce((acc: Record<number, string>, arg: string, i: number) => {

                    // 嘗試翻譯變數
                    acc[i] = translateTerm(arg.trim());
                    return acc;
                }, {} as Record<number, string>);

                // 回傳翻譯結果
                return translateTerm(key.trim(), params);
            }

            // 回傳翻譯結果
            return translateTerm(content);
        });

        // 回傳結果
        return text;
    };

    return { t, translateTerm, translateParagraph, getTranslation, getPlainText };
}