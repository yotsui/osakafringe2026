'use client';

import { usePathname } from 'next/navigation';
import { Analytics } from '@vercel/analytics/next';
import { shouldBlockAnalytics } from '@/utils/analyticsUtils';

export default function VercelAnalyticsWrapper() {
  const currentPath = usePathname();

  // クライアントサイドでの現在のパス判定
  if (shouldBlockAnalytics(currentPath || '')) {
    return null;
  }

  return (
    <Analytics
      beforeSend={(event) => {
        // イベントURLの検証（クライアントSPA遷移や初回読み込み双方で除外）
        if (event && event.url && shouldBlockAnalytics(event.url)) {
          return null;
        }
        return event;
      }}
    />
  );
}
