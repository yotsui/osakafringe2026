'use client';

import React from 'react';
import { Performance } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { MapPin, Clock, Navigation, Heart, ExternalLink, Sparkles } from 'lucide-react';

interface PerformanceCardProps {
  performance: Performance;
  onSelect: (performance: Performance) => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}

export default function PerformanceCard({
  performance,
  onSelect,
  isFavorite,
  onToggleFavorite,
}: PerformanceCardProps) {
  const { getText, t } = useLanguage();

  const title = getText(performance.title, performance.titleEn);
  const artist = getText(performance.artistName, performance.artistNameEn);
  const genreCustom = getText(performance.genreCustom, performance.genreCustomEn);
  const desc = getText(performance.description, performance.descriptionEn);

  // Genre display text
  const genreKey = `genre_${performance.genre}` as any;
  const genreLabel = genreCustom || t(genreKey) || performance.genre;

  const nextSchedule = performance.schedules[0];

  return (
    <div className="group relative bg-slate-900 border border-purple-900/40 rounded-3xl overflow-hidden hover:border-pink-500/60 transition-all hover:shadow-2xl hover:shadow-pink-500/10 flex flex-col justify-between">
      {/* Top Image Container */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-950">
        <img
          src={performance.image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-black/40" />

        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(performance.id);
          }}
          className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-md transition-all ${
            isFavorite
              ? 'bg-pink-600 text-white shadow-lg shadow-pink-600/50'
              : 'bg-slate-950/60 text-slate-300 hover:text-white border border-white/20'
          }`}
          aria-label="Add to favorites"
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
        </button>

        {/* Genre Badge & Featured Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
          <span className="px-3 py-1 rounded-full bg-pink-600/90 text-white text-[11px] font-bold shadow-md backdrop-blur-sm">
            {genreLabel}
          </span>
          {performance.isFeatured && (
            <span className="px-2.5 py-1 rounded-full bg-amber-500 text-slate-950 text-[10px] font-extrabold flex items-center gap-1 shadow-md">
              <Sparkles className="w-3 h-3" />
              <span>FEATURED</span>
            </span>
          )}
        </div>

        {/* Next schedule badge */}
        {nextSchedule && (
          <div className="absolute bottom-2 left-3 right-3 flex items-center gap-1.5 text-[11px] font-semibold text-purple-200 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-purple-800/40 w-fit">
            <Clock className="w-3.5 h-3.5 text-pink-400" />
            <span>
              {nextSchedule.date} {nextSchedule.startTime}〜
            </span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3
            onClick={() => onSelect(performance)}
            className="text-base font-bold text-white group-hover:text-pink-300 transition-colors line-clamp-2 cursor-pointer"
          >
            {title}
          </h3>
          <p className="text-xs font-semibold text-pink-400 mt-1">{artist}</p>

          <p className="text-xs text-slate-400 line-clamp-2 mt-2 leading-relaxed">{desc}</p>
        </div>

        {/* Venue Info */}
        {nextSchedule && nextSchedule.venueName && (
          <div className="pt-3 border-t border-purple-900/30 flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-slate-300 truncate">
              <MapPin className="w-3.5 h-3.5 text-pink-400 flex-shrink-0" />
              <span className="truncate">{getText(nextSchedule.venueName, nextSchedule.venueNameEn)}</span>
            </div>
          </div>
        )}

        {/* Card Footer Actions */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => onSelect(performance)}
            className="flex-1 py-2 px-3 rounded-xl bg-purple-950 hover:bg-purple-900 border border-purple-800/60 text-xs font-bold text-purple-200 transition-colors text-center"
          >
            {t('viewDetails')}
          </button>
          {performance.ticketUrl && performance.ticketUrl.trim() !== '' && (
            <a
              href={performance.ticketUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="py-2 px-3 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:opacity-90 text-xs font-bold text-white transition-opacity flex items-center gap-1 shadow-md shadow-pink-500/10"
            >
              <span>{t('tickets')}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}