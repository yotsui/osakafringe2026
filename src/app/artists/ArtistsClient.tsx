'use client';

import React from 'react';
import Link from 'next/link';
import { Performance, Venue } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { ArrowRight, MapPin, Clock } from 'lucide-react';

interface ArtistsClientProps {
  performances: Performance[];
  venues: Venue[];
}

export default function ArtistsClient({ performances }: ArtistsClientProps) {
  const { t, getText } = useLanguage();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center space-y-3">
        <span className="px-3 py-1 rounded-full bg-pink-950 border border-pink-700/50 text-pink-300 text-xs font-bold">
          {t('artistsPageBadge')}
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-white">{t('artistsPageTitle')}</h1>
        <p className="text-sm text-slate-400 max-w-xl mx-auto">
          {t('artistsPageSubtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {performances.map((perf) => {
          const title = getText(perf.title, perf.titleEn);
          const artist = getText(perf.artistName, perf.artistNameEn);
          const desc = getText(perf.description, perf.descriptionEn);
          const genreCustom = getText(perf.genreCustom, perf.genreCustomEn) || perf.genre.toUpperCase();
          const venueName = perf.venue ? getText(perf.venue.name, perf.venue.nameEn) : '';

          return (
            <div
              key={perf.id}
              className="bg-slate-900 border border-purple-900/40 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between hover:border-pink-500/50 transition-all hover:shadow-2xl"
            >
              <div className="relative h-56 w-full">
                <img
                  src={perf.image}
                  alt={title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 px-3 py-1 bg-pink-600 rounded-full text-white text-xs font-bold shadow-md">
                  {genreCustom}
                </div>
              </div>

              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">{title}</h3>
                  <p className="text-sm font-semibold text-pink-400 mt-0.5">{artist}</p>
                  <p className="text-xs text-slate-400 mt-3 line-clamp-3 leading-relaxed">
                    {desc}
                  </p>
                </div>

                <div className="space-y-2 pt-3 border-t border-purple-900/40 text-xs text-slate-300">
                  {venueName && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-pink-400 flex-shrink-0" />
                      <span>{venueName}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-purple-300">
                    <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{perf.schedules.length} {t('schedulesCount')}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href="/audience"
                    className="w-full py-2.5 px-4 rounded-xl bg-purple-950 hover:bg-purple-900 border border-purple-800 text-xs font-bold text-purple-200 flex items-center justify-center gap-2 transition-colors"
                  >
                    <span>{t('viewOnAudienceApp')}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}