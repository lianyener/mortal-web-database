import {defineRouting} from 'next-intl/routing';
 
export const routing = defineRouting({
  locales: ['zh-tw', 'zh-cn', 'kr'],
  defaultLocale: 'zh-tw'
});