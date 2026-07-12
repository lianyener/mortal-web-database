import {defineRouting} from 'next-intl/routing';
 
export const routing = defineRouting({
  locales: ['zh-tw', 'zh-cn', 'kr', 'jp'],
  defaultLocale: 'zh-tw'
});