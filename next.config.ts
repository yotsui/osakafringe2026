import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel環境以外かつBUILD_STANDALONE指定時のみstandaloneを出力（Vercelとのビルド競合を防止）
  output: process.env.BUILD_STANDALONE === 'true' ? 'standalone' : undefined,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'plus.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'images.microcms-assets.io',
      },
      {
        protocol: 'https',
        hostname: 'osakafringe.com',
      },
      {
        protocol: 'https',
        hostname: 'osaka-info.jp',
      },
    ],
  },
};

export default nextConfig;