import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel環境以外かつBUILD_STANDALONE指定時のみstandaloneを出力（Vercelとのビルド競合を防止）
  output: process.env.BUILD_STANDALONE === 'true' ? 'standalone' : undefined,
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30日間のエッジ/ブラウザキャッシュ
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
  async redirects() {
    return [
      {
        source: '/reception',
        destination: 'https://docs.google.com/forms/d/e/1FAIpQLSeZXFfqWX8xf_laUlFMgj9KqPXUUp8tk62Yx9f-dCl1F9ro_A/viewform?usp=pp_url&entry.857453513=1%25E5%2590%258D%25EF%25BC%2588%25E6%259C%25AC%25E4%25BA%25BA%25E3%2581%25AE%25E3%2581%25BF%25EF%25BC%2589',
        permanent: false,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/tmp/:path*',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow, noarchive',
          },
        ],
      },
    ];
  },
};

export default nextConfig;