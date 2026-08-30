'use client';

import React from 'react';
import Image from 'next/image';
import { Performance } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { 
  X, 
  Calendar, 
  MapPin, 
  Clock, 
  Ticket, 
  Globe, 
  Sparkles, 
  ExternalLink,
  Share2,
  Navigation
} from 'lucide-react';

interface PerformanceModalProps {
  performance: Performance | null;
  onClose: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
}

export default function PerformanceModal({
  performance,
  onClose,
  isFavorite,
  onToggleFavorite,
}: PerformanceModalProps) {
  const { t, getText } = useLanguage();

  if (!performance) return null;

  const title = getText(performance.title, performance.titleEn);
  const artistName = getText(performance.artistName, performance.artistNameEn);
  const genreCustom = getText(performance.genreCustom, performance.genreCustomEn);
  const description = getText(performance.description, performance.descriptionEn);
  const ticketPrice = getText(performance.ticketPrice, performance.ticketPriceEn);

  const fallbackVenueName = performance.venue ? getText(performance.venue.name, performance.venue.nameEn) : null;
  const fallbackAddress = performance.venue ? getText(performance.venue.address, performance.venue.addressEn) : null;
  const mapQuery = fallbackAddress || fallbackVenueName || 'Osaka';
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl border border-pink-100 shadow-2xl space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Hero Image */}
        <div className="relative aspect-16/9 w-full bg-slate-100">
          <Image
            src={performance.image || 'https://images.unsplash.com/photo-1514306191717-452ec28c7814?auto=format&fit=crop&w=1200&q=80'}
            alt={title}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2.5 rounded-full bg-white/80 hover:bg-white text-slate-800 backdrop-blur-md shadow-md transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Badges & Favorite */}
          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            <span className="px-3 py-1 rounded-full bg-pink-600 text-white text-xs font-black uppercase shadow-md">
              {t(`genre_${performance.genre}`) || performance.genre}
            </span>
            {genreCustom && (
              <span className="px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-pink-200 text-xs font-bold">
                {genreCustom}
              </span>
            )}
          </div>

          {/* Title on Hero */}
          <div className="absolute bottom-6 left-6 right-6 space-y-1 text-white">
            <p className="text-pink-300 text-xs font-black tracking-wider uppercase">
              {artistName}
            </p>
            <h2 className="text-xl sm:text-3xl font-black leading-tight drop-shadow-md">
              {title}
            </h2>
          </div>
        </div>

        {/* Modal Body */}
        <div className="px-6 sm:px-8 pb-8 space-y-8">
          
          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-2">
              {onToggleFavorite && (
                <button
                  onClick={() => onToggleFavorite(performance.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    isFavorite
                      ? 'bg-pink-600 text-white shadow-md shadow-pink-500/30'
                      : 'bg-slate-100 hover:bg-pink-50 text-slate-700 hover:text-pink-600'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isFavorite ? 'お気に入り登録中' : 'お気に入りに追加'}</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {performance.ticketUrl && (
                <a
                  href={performance.ticketUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-black text-xs shadow-md transition-all"
                >
                  <Ticket className="w-4 h-4" />
                  <span>{t('bookTickets')}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-pink-600 uppercase tracking-widest">
              {t('aboutTheShow')}
            </h3>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed whitespace-pre-line font-medium">
              {description}
            </p>
          </div>

          {/* Schedules List with Specific Venues */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-pink-600 uppercase tracking-widest flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>{t('scheduleList')}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {performance.schedules && performance.schedules.map((schedule, idx) => {
                const sVenueName = getText(schedule.venueName, schedule.venueNameEn) || fallbackVenueName;
                const sAddress = fallbackAddress;
                const specificMapUrl = sVenueName ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(sVenueName + ' 大阪')}` : googleMapsUrl;

                return (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs font-black text-pink-600">
                      <span>{schedule.date}</span>
                      <span>{schedule.startTime} 〜 {schedule.endTime || ''}</span>
                    </div>

                    {sVenueName && (
                      <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200/60">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 truncate">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span className="truncate">{sVenueName}</span>
                        </div>
                        <a
                          href={specificMapUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-bold text-pink-600 hover:text-pink-700 flex items-center gap-0.5 flex-shrink-0"
                        >
                          <span>Map</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}

                    {schedule.note && (
                      <p className="text-[11px] text-pink-600 font-bold bg-pink-50 px-2 py-0.5 rounded inline-block">
                        {schedule.note}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Ticket Price & Duration Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-2xl bg-pink-50/50 border border-pink-100">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{t('priceLabel')}</span>
              <p className="text-sm font-black text-slate-900">{ticketPrice || t('inquirePrice')}</p>
            </div>
            {performance.durationMinutes && (
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{t('durationLabel')}</span>
                <p className="text-sm font-black text-slate-900">{performance.durationMinutes} {t('minutes')}</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}