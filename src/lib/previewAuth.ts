import { notFound, redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { isServerPreviewAuthenticated, COOKIE_NAME } from '@/lib/authCrypto';

export interface PreviewValidationResult {
  draftKey: string;
}

/**
 * プレビュー共通のアクセス検証
 * 1. MICROCMS_PREVIEW_ENABLED のチェック（無効時は404）
 * 2. サーバーサイド認証チェック（未認証時は returnUrl を維持して /password へリダイレクト）
 * 3. draftKey の形式検証（未指定、配列、空文字を排除）
 */
export async function validatePreviewAccess(
  basePath: string,
  id: string,
  rawDraftKey: string | string[] | undefined
): Promise<PreviewValidationResult> {
  // 1. プレビュー機能の有効・無効判定
  if (process.env.MICROCMS_PREVIEW_ENABLED !== 'true') {
    notFound();
  }

  // 2. サーバーサイド二重認証チェック
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(COOKIE_NAME)?.value;
  const isAuthenticated = await isServerPreviewAuthenticated(sessionCookie);

  if (!isAuthenticated) {
    const draftKeyParam =
      typeof rawDraftKey === 'string' && rawDraftKey.trim()
        ? `?draftKey=${encodeURIComponent(rawDraftKey.trim())}`
        : '';
    const returnUrl = `${basePath}/${encodeURIComponent(id)}${draftKeyParam}`;
    redirect(`/password?returnUrl=${encodeURIComponent(returnUrl)}`);
  }

  // 3. draftKey の形式検証
  if (Array.isArray(rawDraftKey)) {
    throw new Error('DRAFT_KEY_MULTIPLE');
  }

  const draftKey = typeof rawDraftKey === 'string' ? rawDraftKey.trim() : '';
  if (!draftKey) {
    throw new Error('DRAFT_KEY_EMPTY');
  }

  return { draftKey };
}
