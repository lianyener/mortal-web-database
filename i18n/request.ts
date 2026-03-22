import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async () => {
  // 動態載入 public/locales/zh-tw.json 檔案
  const localeData = (await import('../public/locales/zh-tw.json')).default;

  return {
    // 在靜態匯出且沒有 [locale] 路由的情況下，直接指定語系，避免 next-intl 底層去讀取 headers()
    locale: 'zh-tw',
    messages: localeData
  };
});