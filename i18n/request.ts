import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  // 確保語系存在且在支援列表中，否則退回預設語系
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  // 動態載入對應語系的 JSON 檔案
  const localeData = (await import(`../public/locales/${locale}.json`)).default;

  return {
    locale,
    messages: localeData
  };
});