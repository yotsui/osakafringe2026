'use client';

import React from 'react';
import Image from 'next/image';
import { Performance } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Sparkles, 
  ExternalLink, 
  Ticket,
  ChevronRight
} from 'lucide-react';

interface PerformanceCardProps {
  performance: Performance;
  onSelect?: (performance: Performance) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (performanceId: string) => void;
}

export default function PerformanceCard({
  performance,
  onSelect,
  isFavorite,
  onToggleFavorite,
}: PerformanceCardProps) {
  const { t, getText } = useLanguage();

  const title = getText(performance.title, performance.titleEn);
  const artistName = getText(performance.artistName, performance.artistNameEn);
  const genreCustom = getText(performance.genreCustom, performance.genreCustomEn);
  const description = getText(performance.description, performance.descriptionEn);
  const ticketPrice = getText(performance.ticketPrice, performance.ticketPriceEn);

  const primarySchedule = performance.schedules && performance.schedules.length > 0 ? performance.schedules[0] : null;
  const scheduleVenueName = primarySchedule ? getText(primarySchedule.venueName, primarySchedule.venueNameEn) : null;
  const fallbackVenueName = performance.venue ? getText(performance.venue.name, performance.venue.nameEn) : null;
  const venueDisplayName = scheduleVenueName || fallbackVenueName;

  return (
    <div className="group relative bg-white border border-pink-100/80 hover:border-pink-300 rounded-3xl overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
      {/* Thumbnail */}
      <div className="relative aspect-16/10 w-full overflow-hidden bg-slate-100 cursor-pointer" onClick={() => onSelect?.(performance)}>
        <Image
          src={performance.image || 'https://images.unsplash.com/photo-1514306191717-452ec28c7814?auto=format&fit=crop&w=800&q=80'}
          alt={title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className="px-3 py-1 rounded-full bg-pink-600/90 backdrop-blur-md text-white text-[11px] font-extrabold uppercase shadow-sm">
            {t(`genre_${performance.genre}`) || performance.genre}
          </span>
          {genreCustom && (
            <span className="px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-pink-200 text-[11px] font-bold">
              {genreCustom}
            </span>
          )}
        </div>

        {/* Favorite Button */}
        {onToggleFavorite && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(performance.id);
            }}
            className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all shadow-sm ${
              isFavorite
                ? 'bg-pink-600 text-white scale-110 shadow-pink-500/50'
                : 'bg-white/80 hover:bg-white text-slate-700 hover:text-pink-600'
            }`}
            aria-label="Toggle Favorite"
          >
            <Sparkles className="w-4 h-4" />
          </button>
        )}

        {/* Artist Name on Image */}
        <div className="absolute bottom-3 left-3 right-3">
          <p className="text-white text-xs font-bold truncate drop-shadow-md">
            {artistName}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2 cursor-pointer" onClick={() => onSelect?.(performance)}>
          <h3 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-pink-600 transition-colors line-clamp-2">
            {title}
          </h3>
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-medium">
            {description}
          </p>
        </div>

        {/* Schedule & Venue Metadata */}
        <div className="pt-2 border-t border-slate-100 space-y-2 text-xs font-bold text-slate-600">
          {primarySchedule && (
            <div className="flex items-center gap-2 text-pink-600">
              <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">
                {primarySchedule.date} {primarySchedule.startTime}〜
                {performance.schedules.length > 1 && ` (他 ${performance.schedules.length - 1}公演)`}
              </span>
            </div>
          )}

          {venueDisplayName && (
            <div className="flex items-center gap-2 text-slate-600">
              <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span className="truncate">{venueDisplayName}</span>
            </div>
          )}

          {ticketPrice && (
            <div className="flex items-center gap-2 text-slate-500">
              <Ticket className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span className="truncate">{ticketPrice}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="pt-2 flex items-center justify-between gap-2">
          <button
            onClick={() => onSelect?.(performance)}
            className="flex-1 py-2.5 px-4 rounded-xl bg-pink-50 hover:bg-pink-100/80 text-pink-600 font-extrabold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>{t('viewDetails')}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          {performance.ticketUrl && (
            <a
              href={performance.ticketUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-extrabold text-xs flex items-center justify-center gap-1 shadow-sm transition-all flex-shrink-0"
              title={t('bookTickets')}
            >
              <Ticket className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('tickets')}</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}