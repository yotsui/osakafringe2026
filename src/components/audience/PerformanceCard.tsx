'use client';

import React from 'react';
import { Performance } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import SafeImage from '@/components/common/SafeImage';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  ExternalLink, 
  Ticket,
  ChevronRight,
  Heart
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
    <div className="group relative bg-white border border-pink-100/90 hover:border-pink-300 rounded-3xl overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
      {/* Thumbnail */}
      <div 
        className="relative aspect-16/10 w-full overflow-hidden bg-slate-900 cursor-pointer select-none" 
        onClick={() => onSelect?.(performance)}
      >
        <SafeImage
          src={performance.image}
          alt={title}
          fill
          fallbackGenre={performance.genre}
          fallbackText={title}
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent pointer-events-none" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          <span className="px-3 py-1 rounded-full bg-pink-600 text-white text-[11px] font-extrabold uppercase shadow-xs">
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
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(performance.id);
            }}
            className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all shadow-sm z-10 cursor-pointer ${
              isFavorite
                ? 'bg-pink-600 text-white shadow-pink-500/30'
                : 'bg-white/80 hover:bg-white text-slate-700 hover:text-pink-600'
            }`}
            aria-label="Toggle Favorite"
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        )}

        {/* Artist Name overlay on image */}
        <div className="absolute bottom-2.5 left-3 right-3 z-10 pointer-events-none">
          <p className="text-[11px] font-black text-pink-200 truncate drop-shadow-sm">
            {artistName}
          </p>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <h3 
            onClick={() => onSelect?.(performance)}
            className="text-base sm:text-lg font-black text-slate-900 group-hover:text-pink-600 transition-colors line-clamp-2 leading-snug cursor-pointer"
          >
            {title}
          </h3>

          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-medium">
            {description}
          </p>
        </div>

        {/* Meta Info */}
        <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
          {primarySchedule && (
            <div className="flex items-center gap-1.5 text-slate-600 font-bold">
              <Calendar className="w-3.5 h-3.5 text-pink-600 flex-shrink-0" />
              <span className="truncate">
                {primarySchedule.date} {primarySchedule.startTime}
                {performance.schedules && performance.schedules.length > 1 && (
                  <span className="ml-1 text-[10px] text-pink-600 font-bold">
                    (+{performance.schedules.length - 1}公演)
                  </span>
                )}
              </span>
            </div>
          )}

          {venueDisplayName && (
            <div className="flex items-center gap-1.5 text-slate-600 font-medium truncate">
              <MapPin className="w-3.5 h-3.5 text-pink-600 flex-shrink-0" />
              <span className="truncate">{venueDisplayName}</span>
            </div>
          )}

          <div className="flex items-center justify-between text-slate-500 pt-1">
            <span className="text-[11px] text-slate-600 font-bold truncate">
              {ticketPrice || t('inquirePrice')}
            </span>
            {performance.durationMinutes && (
              <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                <Clock className="w-3 h-3" />
                {performance.durationMinutes}{t('minutes')}
              </span>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-2 flex items-center gap-2">
          <button
            onClick={() => onSelect?.(performance)}
            className="flex-1 py-2 px-3 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-600 font-bold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
          >
            <span>{t('viewDetails')}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          {performance.ticketUrl && (
            <a
              href={performance.ticketUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2 px-3 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-xs transition-colors cursor-pointer"
            >
              <Ticket className="w-3.5 h-3.5" />
              <span>{t('tickets')}</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}