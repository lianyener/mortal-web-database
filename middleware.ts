import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  // 支援的語系清單
  locales: ['zh-tw'],
  // 預設語系
  defaultLocale: 'zh-tw'
});

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};