'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';

interface PreviewBannerProps {
  unresolvedArtist?: boolean;
  unresolvedVenue?: boolean;
}

export default function PreviewBanner({ unresolvedArtist, unresolvedVenue }: PreviewBannerProps) {
  const { language } = useLanguage();

  const isEn = language === 'en';

  return (
    <div className="bg-amber-500/15 border-b border-amber-500/40 text-amber-200 px-4 py-3 shadow-md backdrop-blur-sm sticky top-16 z-40">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-amber-500 text-slate-950">
            {isEn ? 'Preview' : 'プレビュー'}
          </span>
          <p className="text-xs sm:text-sm font-medium text-amber-100">
            {isEn
              ? 'Changes will not be reflected on the live public site until published.'
              : '変更内容は公開操作まで本番の通常ページには反映されません'}
          </p>
        </div>
        {(unresolvedArtist || unresolvedVenue) && (
          <div className="text-xs text-amber-300/90 bg-amber-950/60 px-2 py-1 rounded border border-amber-500/20">
            {isEn
              ? 'Note: Associated artist or venue is not published yet; displaying fallback text.'
              : '※ 参照先のアーティストまたは会場が未公開のため、簡易表示されています。'}
          </div>
        )}
      </div>
    </div>
  );
}
