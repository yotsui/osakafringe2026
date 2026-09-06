'use client';

import React from 'react';
import Link from 'next/link';
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

  const performanceUrl = `/performances/${performance.id}`;

  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden border border-slate-200/90 hover:border-[#E6007E] shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col justify-between">
      {/* Thumbnail */}
      <Link 
        href={performanceUrl}
        className="relative aspect-16/10 w-full overflow-hidden bg-slate-900 block select-none"
      >
        <SafeImage
          src={performance.image}
          alt={title}
          fill
          fallbackGenre={performance.genre}
          fallbackText={title}
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />

        {/* Small 1-Line Genre Badge */}
        <div className="absolute top-3 left-3 z-10 pointer-events-none">
          <span className="px-2.5 py-0.5 rounded bg-black/75 backdrop-blur-xs text-white text-[10px] font-bold tracking-wider uppercase border border-white/10">
            {performance.genre}
            {genreCustom && ` / ${genreCustom}`}
          </span>
        </div>

        {/* Favorite Button */}
        {onToggleFavorite && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
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

        {/* Partner Event Overlay (if any) */}
        {performance.partner && typeof performance.partner === 'object' && performance.partner.category === '連携イベント・フェス' && (
          <div className="absolute bottom-2.5 right-3 z-10 pointer-events-none">
            <span className="text-[10px] font-bold text-white bg-[#E6007E]/90 px-2 py-0.5 rounded tracking-wide">
              {getText(performance.partner.name, performance.partner.nameEn)} × Osaka Fringe
            </span>
          </div>
        )}
      </Link>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          {/* Artist Name */}
          <p className="text-xs font-bold text-[#E6007E] truncate">
            {performance.artist?.id ? (
              <Link href={`/artists/${performance.artist.id}`} className="hover:underline">
                {artistName}
              </Link>
            ) : (
              artistName
            )}
          </p>

          {/* Title - Priority #1 */}
          <Link 
            href={performanceUrl}
            className="block text-base sm:text-lg font-black text-slate-900 line-clamp-2 leading-snug group-hover:text-[#E6007E] transition-colors"
          >
            {title}
          </Link>
          
          {/* Description */}
          {description && (
            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-medium">
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
                const sVenueId = schedule.venueId || schedule.venue?.id;
                const formattedDate = formatScheduleCompact(schedule, language);
                return (
                  <div key={idx} className="flex items-start gap-1.5 text-slate-600">
                    <CalendarIcon className="w-3.5 h-3.5 shrink-0 text-[#E6007E] mt-0.5" />
                    <div className="min-w-0 flex-1 flex flex-wrap items-center gap-x-2">
                      <span className="font-bold text-slate-800">{formattedDate}</span>
                      {isMultiVenues && sVenueName && (
                        <span className="text-slate-500 text-[11px] truncate">
                          @{sVenueId ? (
                            <Link href={`/venues/${sVenueId}`} className="hover:text-[#E6007E] hover:underline">
                              {sVenueName}
                            </Link>
                          ) : (
                            sVenueName
                          )}
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
              <MapPinIcon className="w-3.5 h-3.5 shrink-0 text-[#E6007E]" color="#E6007E" />
              {performance.venue?.id || performance.venueId ? (
                <Link
                  href={`/venues/${performance.venue?.id || performance.venueId}`}
                  className="truncate font-medium hover:text-[#E6007E] hover:underline"
                >
                  {singleVenueName}
                </Link>
              ) : (
                <span className="truncate font-medium">{singleVenueName}</span>
              )}
            </div>
          )}
        </div>

        {/* Price & Action Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
            <TicketIcon className="w-4 h-4 text-slate-400" />
            <span>{priceDisplay}</span>
          </div>

          <Link
            href={performanceUrl}
            className="flex items-center gap-1 text-xs font-black text-[#E6007E] hover:underline group-hover:translate-x-0.5 transition-all"
          >
            <span>{t('cardDetails')}</span>
            <ArrowRightIcon className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}