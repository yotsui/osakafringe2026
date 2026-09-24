import React from 'react';
import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import {
  getDraftPerformanceById,
  DraftPreviewError,
} from '@/lib/microcms';
import {
  isServerPreviewAuthenticated,
  COOKIE_NAME,
} from '@/lib/authCrypto';
import PerformanceDetailClient from '@/components/performance/PerformanceDetailClient';
import PreviewBanner from '@/components/preview/PreviewBanner';
import PreviewErrorView from '@/components/preview/PreviewErrorView';

// キャッシュ・静的生成の無効化と動的配信の強制
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// 検索エンジンインデックスおよびキャッシュの厳格な抑止
export const metadata: Metadata = {
  title: '【プレビュー】公演詳細 | 大阪文化万博Osaka Fringe 2026',
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nocache: true,
  },
};

interface PreviewPerformancePageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function PreviewPerformancePage({
  params,
  searchParams,
}: PreviewPerformancePageProps) {
  // 1. プレビュー機能の有効・無効判定（無効時は404）
  if (process.env.MICROCMS_PREVIEW_ENABLED !== 'true') {
    notFound();
  }

  const { id } = await params;
  const query = await searchParams;
  const rawDraftKey = query.draftKey;

  // 2. サーバーサイドでの認証二重検証（未認証なら下書き取得を実行せずログインへ誘導）
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(COOKIE_NAME)?.value;
  const isAuthenticated = await isServerPreviewAuthenticated(sessionCookie);

  if (!isAuthenticated) {
    const draftKeyParam =
      typeof rawDraftKey === 'string' && rawDraftKey.trim()
        ? `?draftKey=${encodeURIComponent(rawDraftKey.trim())}`
        : '';
    const returnUrl = `/preview/performances/${encodeURIComponent(id)}${draftKeyParam}`;
    redirect(`/password?returnUrl=${encodeURIComponent(returnUrl)}`);
  }

  // 3. draftKeyパラメータの厳格検証（未指定、空文字、重複パラメータの排除）
  if (Array.isArray(rawDraftKey)) {
    return (
      <PreviewErrorView
        title="パラメータの形式が不正です"
        message="下書きキー（draftKey）が複数指定されています。"
        suggestion="URLを確認し、microCMSの管理画面からプレビューを開き直してください。"
      />
    );
  }

  const draftKey = typeof rawDraftKey === 'string' ? rawDraftKey.trim() : '';
  if (!draftKey) {
    return (
      <PreviewErrorView
        title="下書きキー（draftKey）がありません"
        message="プレビュー表示に必要な下書きキーが指定されていません。"
        suggestion="通常ページ（/performances/[id]）ではなく、microCMS管理画面の「画面プレビュー」ボタンから開いてください。"
      />
    );
  }

  // 4. 下書きデータの取得（専用関数を使用・no-store）
  let performance: Awaited<ReturnType<typeof getDraftPerformanceById>> | null = null;
  let fetchError: DraftPreviewError | unknown = null;

  try {
    performance = await getDraftPerformanceById(id, draftKey);
  } catch (error) {
    fetchError = error;
  }

  // 取得エラー時の安全なエラー画面ハンドリング
  if (fetchError || !performance) {
    if (fetchError instanceof DraftPreviewError) {
      switch (fetchError.code) {
        case 'NOT_FOUND':
          return (
            <PreviewErrorView
              title="公演が見つかりません"
              message={fetchError.message}
              suggestion="microCMSの管理画面で対象のコンテンツIDが正しいかご確認ください。"
            />
          );
        case 'INVALID_DRAFT_KEY':
          return (
            <PreviewErrorView
              title="下書きキーが無効です"
              message={fetchError.message}
              suggestion="下書きを一度保存し直し、microCMSの管理画面からプレビューを開き直してください。"
            />
          );
        case 'DRAFT_KEY_MISSING':
          return (
            <PreviewErrorView
              title="下書きキーが指定されていません"
              message={fetchError.message}
              suggestion="microCMSの管理画面からプレビューを開き直してください。"
            />
          );
        case 'CONFIG_ERROR':
        case 'NETWORK_ERROR':
        default:
          return (
            <PreviewErrorView
              title="通信エラーが発生しました"
              message={fetchError.message}
              suggestion="ネットワーク接続を確認し、しばらく時間をおいてから再度お試しください。"
            />
          );
      }
    }

    return (
      <PreviewErrorView
        title="プレビューの表示に失敗しました"
        message="予期しないエラーが発生しました。"
        suggestion="microCMSの管理画面からプレビューを開き直してください。"
      />
    );
  }

  // 5. 成功時のプレビュー表示
  const unresolvedArtist = !performance.artist?.name;
  const unresolvedVenue = !performance.venue?.name;

  return (
    <div className="min-h-screen">
      <PreviewBanner
        unresolvedArtist={unresolvedArtist}
        unresolvedVenue={unresolvedVenue}
      />
      <PerformanceDetailClient performance={performance} />
    </div>
  );
}
