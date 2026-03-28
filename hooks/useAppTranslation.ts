import { useTranslations, TranslationValues } from 'next-intl';

export function useAppTranslation() {
    const t = useTranslations();

    // 1. 取得原始翻譯字串 (保留 [*...*] 標籤，供 <ParsedText> 轉換為互動按鈕)
    const getTranslation = (baseKey: string, params?: TranslationValues): string => {
        if (!baseKey) return '';
        if (t.has(`${baseKey}._`)) return t(`${baseKey}._`, params);
        if (t.has(baseKey)) return t(baseKey, params);
        return baseKey; // 找不到翻譯時回傳原本的 key
    };

    // 2. 取得純文字翻譯 (將 [*...*] 標籤遞迴解析為純文字，適用於 title、alt 等不支援 HTML 的屬性)
    const getPlainText = (baseKey: string, params?: TranslationValues): string => {
        let text = getTranslation(baseKey, params);
        
        if (text !== baseKey && typeof text === 'string' && text.includes('[*')) {
            const regex = /\[\*([\s\S]*?)\*\]/g;
            text = text.replace(regex, (match, content) => {
                const [key, ...args] = content.split(',');
                const cleanKey = key.trim();
                
                // 若是 Label 標籤，嘗試抓取該項目的純文字名稱 (Name 或 Title)
                if (cleanKey.startsWith('Label.') && args.length > 0) {
                    const category = cleanKey.replace('Label.', '');
                    const id = args[0].trim();
                    if (t.has(`${category}.Name.${id}._`)) return t(`${category}.Name.${id}._`);
                    if (t.has(`${category}.Name.${id}`)) return t(`${category}.Name.${id}`);
                    if (t.has(`${category}.Title.${id}._`)) return t(`${category}.Title.${id}._`);
                    if (t.has(`${category}.Title.${id}`)) return t(`${category}.Title.${id}`);
                    return id;
                }
                
                // 其他標籤，遞迴解析為純文字
                const resolvedStr = getPlainText(cleanKey);
                return resolvedStr !== cleanKey ? resolvedStr : match;
            });
        }
        return text;
    };

    return { t, getTranslation, getPlainText };
}