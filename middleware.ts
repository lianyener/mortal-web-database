import createMiddleware from 'next-intl/middleware';

export default createMiddleware({ locales: ['zh-tw', 'zh-cn', 'kr', 'jp'], defaultLocale: 'zh-tw' });

export const config = { matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'] };
