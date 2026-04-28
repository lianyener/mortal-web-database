import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 啟用純靜態匯出模式
  // output: 'export',
};

export default withNextIntl(nextConfig);