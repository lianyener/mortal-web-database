import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['zh-tw'],
  defaultLocale: 'zh-tw'
});

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};