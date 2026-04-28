import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

// 初始化 next-intl 外掛
const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  // 設定
  output: 'standalone'
};

// 本機開發環境載入 OpenNext 的 Cloudflare 模擬器
if (process.env.NODE_ENV === 'development') {
  import('@opennextjs/cloudflare').then(m => m.initOpenNextCloudflareForDev());
}

// 匯出時，一定要用 withNextIntl 包裹起來！
export default withNextIntl(nextConfig);