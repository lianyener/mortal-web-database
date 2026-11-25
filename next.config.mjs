import createNextIntlPlugin from 'next-intl/plugin';
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';

initOpenNextCloudflareForDev();

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* 配置選項 */
  experimental: { optimizePackageImports: ['lucide-react'] },
  images: { unoptimized: true }
};

export default withNextIntl(nextConfig);