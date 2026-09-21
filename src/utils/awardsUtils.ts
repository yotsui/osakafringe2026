import type { SiteInfo } from '@/types';

/**
 * サーバー側環境変数 AWARDS_FEATURE_ENABLED の設定確認
 * 明示的に 'true' が設定されている場合のみ true を返す
 */
export function isAwardsFeatureEnabled(): boolean {
  return process.env.AWARDS_FEATURE_ENABLED === 'true';
}

/**
 * OSAKA FRINGE AWARDS 2026 の表示可否判定
 * 
 * 以下の条件をすべて満たした場合のみ true を返す：
 * 1. AWARDS_FEATURE_ENABLED が文字列 "true"
 * 2. awardsInfo.enabled が真偽値 true
 * 3. awardsInfo.title と awardsInfo.summary に空白以外の内容がある
 */
export function isAwardsVisible(siteInfo?: SiteInfo | null): boolean {
  if (!isAwardsFeatureEnabled()) {
    return false;
  }

  const awardsInfo = siteInfo?.awardsInfo;
  if (!awardsInfo) {
    return false;
  }

  if (awardsInfo.enabled !== true) {
    return false;
  }

  const title = typeof awardsInfo.title === 'string' ? awardsInfo.title.trim() : '';
  const summary = typeof awardsInfo.summary === 'string' ? awardsInfo.summary.trim() : '';

  if (!title || !summary) {
    return false;
  }

  return true;
}

/**
 * クライアントに渡す前に、アワード機能が非表示の場合はアワード関連データを安全に除去する
 * これにより、非表示時に不要なクライアント向けデータへの露出を完全に防ぐ
 */
export function sanitizeSiteInfoForAwards(siteInfo: SiteInfo): SiteInfo {
  if (isAwardsVisible(siteInfo)) {
    return siteInfo;
  }
  return {
    ...siteInfo,
    awardsInfo: undefined,
    awardsSections: [],
    awardsEditor: undefined,
    awardsMembers: [],
  };
}

