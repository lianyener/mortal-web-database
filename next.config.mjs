import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* 配置選項 */
  experimental: { optimizePackageImports: ['lucide-react'] },

  // 轉址
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'mortal-web-database.vercel.app',
          },
        ],
        destination: 'https://mortal.eraser.moe/:path*',
        permanent: true, // 發送 HTTP 308 永久重定向
      },
    ];
  }
};

export default withNextIntl(nextConfig);