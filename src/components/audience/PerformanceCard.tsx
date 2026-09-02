'use client';

import React from 'react';
import { Performance } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import SafeImage from '@/components/common/SafeImage';
import { CalendarIcon, MapPinIcon, TicketIcon, ArrowRightIcon } from '@/components/common/CustomIcons';
import { Heart } from 'lucide-react';

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
    <div className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-slate-100 hover:border-pink-200 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          <span className="px-2.5 py-1 rounded-lg bg-[#E6007E] text-white text-[11px] font-black uppercase shadow-xs">
            {t(`genre_${performance.genre}`) || performance.genre}
          </span>
          {genreCustom && (
            <span className="px-2 py-1 rounded-lg bg-[#FFF100] text-black text-[11px] font-bold shadow-xs">
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
            className={`absolute top-3 right-3 p-2 rounded-xl backdrop-blur-md transition-all z-10 cursor-pointer ${
              isFavorite
                ? 'bg-[#E6007E] text-white shadow-md'
                : 'bg-white/80 hover:bg-white text-slate-800'
            }`}
            aria-label="Toggle Favorite"
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        )}

        {/* Artist Name Overlay */}
        <div className="absolute bottom-2.5 left-3 right-3 z-10 pointer-events-none">
          <p className="text-xs font-bold text-pink-200 truncate">
            {artistName}
          </p>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          {/* Title */}
          <h3 
            onClick={() => onSelect?.(performance)}
            className="text-base sm:text-lg font-black text-slate-900 line-clamp-2 leading-snug group-hover:text-[#E6007E] transition-colors cursor-pointer"
          >
            {title}
          </h3>
          
          {/* Description */}
          {description && (
            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {/* Schedule & Venue Meta */}
        <div className="space-y-1.5 text-xs font-medium pt-1">
          {primarySchedule && (
            <div className="flex items-center gap-2 text-slate-600">
              <CalendarIcon className="w-3.5 h-3.5 shrink-0 text-[#E6007E]" />
              <span className="truncate">{primarySchedule.date} {primarySchedule.startTime}〜</span>
            </div>
          )}
          {venueDisplayName && (
            <div className="flex items-center gap-2 text-slate-600">
              <MapPinIcon className="w-3.5 h-3.5 shrink-0 text-[#0078D7]" color="#0078D7" />
              <span className="truncate">{venueDisplayName}</span>
            </div>
          )}
        </div>

        {/* Price & Action Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
            <TicketIcon className="w-4 h-4 text-slate-500" />
            <span>{ticketPrice || t('freePrice')}</span>
          </div>

          <button
            onClick={() => onSelect?.(performance)}
            className="flex items-center gap-1 text-xs font-black text-[#E6007E] hover:text-[#c4006b] group-hover:translate-x-0.5 transition-all cursor-pointer"
          >
            <span>{t('cardDetails')}</span>
            <ArrowRightIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}