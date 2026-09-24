import React from 'react';
import type { Metadata } from 'next';
import {
  getDraftPartnerById,
  getPartners,
  DraftPreviewError,
} from '@/lib/microcms';
import { validatePreviewAccess } from '@/lib/previewAuth';
import PartnerSection from '@/components/common/PartnerSection';
import PreviewBanner from '@/components/preview/PreviewBanner';
import PreviewErrorView from '@/components/preview/PreviewErrorView';
import type { Partner } from '@/types';

// キャッシュ・静的生成の無効化と動的配信の強制
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export const metadata: Metadata = {
  title: '【プレビュー】パートナー掲載確認 | 大阪文化万博Osaka Fringe 2026',
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nocache: true,
  },
};

interface PreviewPartnerPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function PreviewPartnerPage({
  params,
  searchParams,
}: PreviewPartnerPageProps) {
  const { id } = await params;
  const query = await searchParams;

  let draftKey = '';
  try {
    const validated = await validatePreviewAccess(
      '/preview/partner',
      id,
      query.draftKey
    );
    draftKey = validated.draftKey;
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'DRAFT_KEY_MULTIPLE') {
      return (
        <PreviewErrorView
          title="パラメータの形式が不正です"
          message="下書きキー（draftKey）が複数指定されています。"
          suggestion="URLを確認し、microCMSの管理画面からプレビューを開き直してください。"
        />
      );
    }
    return (
      <PreviewErrorView
        title="下書きキー（draftKey）がありません"
        message="プレビュー表示に必要な下書きキーが指定されていません。"
        suggestion="microCMS管理画面の「画面プレビュー」ボタンから開いてください。"
      />
    );
  }

  // 下書きパートナーおよび公開パートナー一覧の取得
  let draftPartner: Awaited<ReturnType<typeof getDraftPartnerById>> | null = null;
  let publicPartners: Partner[] | null = null;
  let draftError: DraftPreviewError | unknown = null;
  let publicFetchFailed = false;

  try {
    const [fetchedDraft, fetchedPublic] = await Promise.all([
      getDraftPartnerById(id, draftKey),
      getPartners().catch((err) => {
        console.error('[Preview] Failed to fetch public partners:', err);
        publicFetchFailed = true;
        return null;
      }),
    ]);
    draftPartner = fetchedDraft;
    publicPartners = fetchedPublic;
  } catch (error) {
    draftError = error;
  }

  // 公開一覧の取得が失敗した場合は不完全な一覧をプレビューとして見せない
  if (publicFetchFailed || !publicPartners) {
    return (
      <PreviewErrorView
        title="周囲の掲載内容を取得できません"
        message="公開中のパートナー一覧の取得に失敗しました。全体の掲載状況を正確に確認できないため、表示を中断しました。"
        suggestion="ネットワーク接続を確認し、しばらく時間をおいてから再度お試しください。"
      />
    );
  }

  // 下書き取得エラー時の安全なエラー画面ハンドリング
  if (draftError || !draftPartner) {
    if (draftError instanceof DraftPreviewError) {
      switch (draftError.code) {
        case 'NOT_FOUND':
          return (
            <PreviewErrorView
              title="パートナーが見つかりません"
              message={draftError.message}
              suggestion="microCMSの管理画面で対象のコンテンツIDが正しいかご確認ください。"
            />
          );
        case 'INVALID_DRAFT_KEY':
          return (
            <PreviewErrorView
              title="下書きキーが無効です"
              message={draftError.message}
              suggestion="下書きを一度保存し直し、microCMSの管理画面からプレビューを開き直してください。"
            />
          );
        case 'CONFIG_ERROR':
        case 'NETWORK_ERROR':
        default:
          return (
            <PreviewErrorView
              title="通信エラーが発生しました"
              message={draftError.message}
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

  // 一覧の統合：
  // 1. 公開一覧に対象IDが存在する場合：下書きデータで1件置換（ID重複なし、カテゴリ変更時は新カテゴリへ移動）
  // 2. 新規下書きの場合：確認用一覧の該当カテゴリ末尾（配列末尾）へ追加
  const existingIndex = publicPartners.findIndex((p) => p.id === id);
  let displayPartners: Partner[];

  if (existingIndex >= 0) {
    displayPartners = publicPartners.map((p) => (p.id === id ? draftPartner! : p));
  } else {
    displayPartners = [...publicPartners, draftPartner];
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      <PreviewBanner
        showRelatedNotice={true}
        noticeText={{
          ja: '※ 掲載セクション上での表示イメージを確認しています',
          en: '※ Previewing layout appearance in the partners section',
        }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <PartnerSection
          partners={displayPartners}
          highlightPartnerId={id}
        />
      </div>
    </div>
  );
}
