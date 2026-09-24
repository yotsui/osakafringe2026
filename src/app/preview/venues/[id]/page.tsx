import React from 'react';
import type { Metadata } from 'next';
import {
  getDraftVenueById,
  getPerformances,
  DraftPreviewError,
} from '@/lib/microcms';
import { validatePreviewAccess } from '@/lib/previewAuth';
import VenueDetailClient from '@/components/venue/VenueDetailClient';
import PreviewBanner from '@/components/preview/PreviewBanner';
import PreviewErrorView from '@/components/preview/PreviewErrorView';
import type { Performance } from '@/types';

// キャッシュ・静的生成の無効化と動的配信の強制
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export const metadata: Metadata = {
  title: '【プレビュー】会場詳細 | 大阪文化万博Osaka Fringe 2026',
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nocache: true,
  },
};

interface PreviewVenuePageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function PreviewVenuePage({
  params,
  searchParams,
}: PreviewVenuePageProps) {
  const { id } = await params;
  const query = await searchParams;

  let draftKey = '';
  try {
    const validated = await validatePreviewAccess(
      '/preview/venues',
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

  // 下書き会場データおよび公開公演一覧の取得
  let venue: Awaited<ReturnType<typeof getDraftVenueById>> | null = null;
  let allPerformances: Performance[] = [];
  let fetchError: DraftPreviewError | unknown = null;

  try {
    const [fetchedVenue, performances] = await Promise.all([
      getDraftVenueById(id, draftKey),
      getPerformances().catch(() => []),
    ]);
    venue = fetchedVenue;
    allPerformances = performances;
  } catch (error) {
    fetchError = error;
  }

  if (fetchError || !venue) {
    if (fetchError instanceof DraftPreviewError) {
      switch (fetchError.code) {
        case 'NOT_FOUND':
          return (
            <PreviewErrorView
              title="会場が見つかりません"
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

  // 「この会場の公演」を公開済み公演から抽出（メイン会場および日程ごとの会場参照を網羅）
  const matchingPerformances = allPerformances.filter(
    (p) =>
      p.venueId === id ||
      p.venue?.id === id ||
      (p.schedules && p.schedules.some((s) => s.venueId === id || s.venue?.id === id))
  );

  // 会場名などを下書き変更した場合、同じ対象IDを参照する画面内の関連公演にもプレビュー表示用として反映
  const currentVenue = venue;
  const venuePerformances: Performance[] = matchingPerformances.map((p) => {
    const isMainVenue = p.venueId === id || p.venue?.id === id;
    const updatedSchedules = p.schedules?.map((s) => {
      if (s.venueId === id || s.venue?.id === id) {
        return {
          ...s,
          venueName: currentVenue.name,
          venueNameEn: currentVenue.nameEn || currentVenue.name,
          venue: currentVenue,
        };
      }
      return s;
    });

    return {
      ...p,
      ...(isMainVenue
        ? {
            venueName: currentVenue.name,
            venueNameEn: currentVenue.nameEn || currentVenue.name,
            venue: currentVenue,
          }
        : {}),
      schedules: updatedSchedules,
    };
  });

  return (
    <div className="min-h-screen">
      <PreviewBanner showRelatedNotice={true} />
      <VenueDetailClient
        venue={venue}
        performances={venuePerformances}
      />
    </div>
  );
}
