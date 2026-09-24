/**
 * Vercel Analytics フィルタ用判定ユーティリティ
 * プレビュー画面 (/preview/*) およびパスワード認証画面 (/password) からの
 * 解析データ送信を完全にブロックします。
 */
export function shouldBlockAnalytics(urlPath: string): boolean {
  if (!urlPath) return false;
  // URLまたは相対パスからpathname部分を抽出
  try {
    const parsed = urlPath.startsWith('http://') || urlPath.startsWith('https://')
      ? new URL(urlPath)
      : new URL(urlPath, 'https://osakafringe.local');
    const path = parsed.pathname;
    return path === '/password' || path === '/preview' || path.startsWith('/preview/');
  } catch {
    return urlPath === '/password' || urlPath === '/preview' || urlPath.startsWith('/preview/');
  }
}
