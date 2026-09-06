'use client';

import React from 'react';
import { Performance } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import SafeImage from '@/components/common/SafeImage';
import { CalendarIcon, MapPinIcon, TicketIcon, ArrowRightIcon } from '@/components/common/CustomIcons';
import { formatScheduleCompact, sortSchedules, deduplicateSchedules, hasMultipleVenues } from '@/utils/dateFormat';
import { formatTicketPrice } from '@/utils/priceFormat';
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
  const { language, t, getText } = useLanguage();

  const title = getText(performance.title, performance.titleEn);
  const artistName = getText(performance.artistName, performance.artistNameEn);
  const genreCustom = language === 'en'
    ? (performance.genreCustomEn || performance.genreCustom)
    : (performance.genreCustom || performance.genreCustomEn);
  const description = getText(performance.description, performance.descriptionEn);
  const priceDisplay = formatTicketPrice(performance.ticketPrice, performance.ticketPriceEn, language);

  // 全スケジュールのソート・重複排除
  const allSchedules = deduplicateSchedules(sortSchedules(performance.schedules || []));
  const isMultiVenues = hasMultipleVenues(allSchedules);

  // 単一会場時のフォールバック会場名
  const fallbackVenueName = performance.venue ? getText(performance.venue.name, performance.venue.nameEn) : null;
  const singleVenueName = allSchedules.length > 0
    ? (getText(allSchedules[0].venueName, allSchedules[0].venueNameEn) || fallbackVenueName)
    : fallbackVenueName;

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
          <span className="px-2.5 py-1 rounded-md bg-[#E6007E] text-white text-[11px] font-black uppercase shadow-xs">
            {performance.genre}
          </span>
          {genreCustom && (
            <span className="px-2 py-1 rounded-md bg-white/90 text-slate-800 text-[11px] font-bold shadow-xs">
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

        {/* Artist Name & Partner Event Overlay */}
        <div className="absolute bottom-2.5 left-3 right-3 z-10 pointer-events-none flex items-center justify-between gap-2">
          <p className="text-xs font-bold text-pink-200 truncate">
            {artistName}
          </p>
          {performance.partner && typeof performance.partner === 'object' && performance.partner.category === '連携イベント・フェス' && (
            <span className="text-[10px] font-black text-[#FFF100] bg-black/60 px-2 py-0.5 rounded shrink-0">
              with {getText(performance.partner.name, performance.partner.nameEn)}
            </span>
          )}
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

        {/* Schedule & Venue Meta (全日程表示) */}
        <div className="space-y-1.5 text-xs font-medium pt-1">
          {allSchedules.length > 0 ? (
            <div className="space-y-1">
              {allSchedules.map((schedule, idx) => {
                const sVenueName = getText(schedule.venueName, schedule.venueNameEn);
                const formattedDate = formatScheduleCompact(schedule, language);
                return (
                  <div key={idx} className="flex items-start gap-1.5 text-slate-600">
                    <CalendarIcon className="w-3.5 h-3.5 shrink-0 text-[#E6007E] mt-0.5" />
                    <div className="min-w-0 flex-1 flex flex-wrap items-center gap-x-2">
                      <span className="font-bold text-slate-800">{formattedDate}</span>
                      {isMultiVenues && sVenueName && (
                        <span className="text-slate-500 text-[11px] truncate">
                          @{sVenueName}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}

          {/* 単一会場の場合は会場名を1回のみ下部に表示 */}
          {!isMultiVenues && singleVenueName && (
            <div className="flex items-center gap-1.5 text-slate-600 pt-0.5">
              <MapPinIcon className="w-3.5 h-3.5 shrink-0 text-[#0078D7]" color="#0078D7" />
              <span className="truncate">{singleVenueName}</span>
            </div>
          )}
        </div>

        {/* Price & Action Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
            <TicketIcon className="w-4 h-4 text-slate-500" />
            <span>{priceDisplay}</span>
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