import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel環境以外かつBUILD_STANDALONE指定時のみstandaloneを出力（Vercelとのビルド競合を防止）
  output: process.env.BUILD_STANDALONE === 'true' ? 'standalone' : undefined,
};

export default nextConfig;