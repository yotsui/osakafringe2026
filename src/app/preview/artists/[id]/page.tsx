import React from 'react';
import type { Metadata } from 'next';
import {
  getDraftArtistById,
  getPerformances,
  DraftPreviewError,
} from '@/lib/microcms';
import { validatePreviewAccess } from '@/lib/previewAuth';
import ArtistDetailClient from '@/components/artist/ArtistDetailClient';
import PreviewBanner from '@/components/preview/PreviewBanner';
import PreviewErrorView from '@/components/preview/PreviewErrorView';
import type { Performance } from '@/types';

// キャッシュ・静的生成の無効化と動的配信の強制
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export const metadata: Metadata = {
  title: '【プレビュー】アーティスト詳細 | 大阪文化万博Osaka Fringe 2026',
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nocache: true,
  },
};

interface PreviewArtistPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function PreviewArtistPage({
  params,
  searchParams,
}: PreviewArtistPageProps) {
  const { id } = await params;
  const query = await searchParams;

  let draftKey = '';
  try {
    const validated = await validatePreviewAccess(
      '/preview/artists',
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

  // 下書きアーティストデータおよび公開公演一覧の取得
  let artist: Awaited<ReturnType<typeof getDraftArtistById>> | null = null;
  let allPerformances: Performance[] = [];
  let fetchError: DraftPreviewError | unknown = null;

  try {
    const [fetchedArtist, performances] = await Promise.all([
      getDraftArtistById(id, draftKey),
      getPerformances().catch(() => []),
    ]);
    artist = fetchedArtist;
    allPerformances = performances;
  } catch (error) {
    fetchError = error;
  }

  if (fetchError || !artist) {
    if (fetchError instanceof DraftPreviewError) {
      switch (fetchError.code) {
        case 'NOT_FOUND':
          return (
            <PreviewErrorView
              title="アーティストが見つかりません"
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

  // 関連公演の抽出（アーティストIDによる紐付けを優先し、名前を編集しても消えない）
  const matchingPerformances = allPerformances.filter(
    (p) =>
      p.artistId === id ||
      p.artist?.id === id ||
      (typeof p.artists === 'object' && p.artists?.id === id) ||
      p.artists === id
  );

  // アーティスト名などを下書き変更した場合、表示用データ上で関連公演カードにも反映
  const currentArtist = artist;
  const artistPerformances: Performance[] = matchingPerformances.map((p) => ({
    ...p,
    artistName: currentArtist.name,
    artistNameEn: currentArtist.nameEn || currentArtist.name,
    artist: currentArtist,
  }));

  return (
    <div className="min-h-screen">
      <PreviewBanner showRelatedNotice={true} />
      <ArtistDetailClient
        artist={artist}
        performances={artistPerformances}
      />
    </div>
  );
}
