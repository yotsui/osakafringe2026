'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';

interface PreviewBannerProps {
  unresolvedArtist?: boolean;
  unresolvedVenue?: boolean;
  showRelatedNotice?: boolean;
  noticeText?: { ja: string; en: string };
}

export default function PreviewBanner({
  unresolvedArtist,
  unresolvedVenue,
  showRelatedNotice = true,
  noticeText,
}: PreviewBannerProps) {
  const { language } = useLanguage();

  const isEn = language === 'en';

  return (
    <div className="bg-amber-500/15 border-b border-amber-500/40 text-amber-200 px-4 py-3 shadow-md backdrop-blur-sm sticky top-16 z-40">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-amber-500 text-slate-950">
            {isEn ? 'Preview' : 'プレビュー'}
          </span>
          <p className="text-xs sm:text-sm font-medium text-amber-100">
            {isEn
              ? 'Changes will not be reflected on the live public site until published.'
              : '変更内容は公開操作まで本番の通常ページには反映されません'}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 text-xs">
          {showRelatedNotice && (
            <span className="text-amber-200/90 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/20">
              {isEn
                ? '※ Related performances and content are displayed from published information.'
                : '※ 関連する公演などは公開済み情報を表示しています'}
            </span>
          )}
          {noticeText && (
            <span className="text-amber-200/90 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/20">
              {isEn ? noticeText.en : noticeText.ja}
            </span>
          )}
          {(unresolvedArtist || unresolvedVenue) && (
            <span className="text-amber-300/90 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
              {isEn
                ? 'Note: Associated artist or venue is not published yet; displaying fallback text.'
                : '※ 参照先のアーティストまたは会場が未公開のため、簡易表示されています。'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
