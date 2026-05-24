import createMiddleware from 'next-intl/middleware';

export default createMiddleware({ locales: ['zh-tw', 'zh-cn', 'kr'], defaultLocale: 'zh-tw' });

export const config = { matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'] };
