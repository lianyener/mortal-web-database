import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* 配置選項 */
  experimental: { optimizePackageImports: ['lucide-react'] }
};

export default withNextIntl(nextConfig);