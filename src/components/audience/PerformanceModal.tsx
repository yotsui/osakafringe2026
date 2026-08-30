'use client';

import React from 'react';
import { Performance } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import {
  X,
  MapPin,
  Calendar,
  Clock,
  Ticket,
  ExternalLink,
  Navigation,
  Heart,
  Globe,
} from 'lucide-react';

interface PerformanceModalProps {
  performance: Performance | null;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}

export default function PerformanceModal({
  performance,
  onClose,
  isFavorite,
  onToggleFavorite,
}: PerformanceModalProps) {
  const { getText, t } = useLanguage();

  if (!performance) return null;

  const title = getText(performance.title, performance.titleEn);
  const artist = getText(performance.artistName, performance.artistNameEn);
  const desc = getText(performance.description, performance.descriptionEn);
  const genreCustom = getText(performance.genreCustom, performance.genreCustomEn);
  const ticketPrice = getText(performance.ticketPrice, performance.ticketPriceEn);

  const genreKey = `genre_${performance.genre}` as any;
  const genreLabel = genreCustom || t(genreKey) || performance.genre;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-slate-900 border border-purple-800/60 rounded-3xl overflow-hidden shadow-2xl my-8 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-950/80 text-white hover:bg-pink-600 transition-colors border border-white/20"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Image */}
        <div className="relative h-64 sm:h-72 w-full flex-shrink-0 bg-slate-950">
          <img
            src={performance.image}
            alt={title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-black/50" />

          {/* Badges on image */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="px-3.5 py-1.5 rounded-full bg-pink-600 text-white text-xs font-bold shadow-lg">
              {genreLabel}
            </span>
          </div>

          <button
            onClick={() => onToggleFavorite(performance.id)}
            className={`absolute bottom-4 right-4 p-3 rounded-full backdrop-blur-md transition-all shadow-xl ${
              isFavorite
                ? 'bg-pink-600 text-white'
                : 'bg-slate-950/70 text-slate-300 hover:text-white border border-white/20'
            }`}
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1 text-slate-200">
          {/* Titles */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">{title}</h2>
            <p className="text-base font-bold text-pink-400 mt-1">{artist}</p>
          </div>

          {/* Key metadata chips */}
          <div className="grid grid-cols-2 gap-3">
            {performance.durationMinutes && (
              <div className="bg-slate-950 p-3 rounded-2xl border border-purple-900/40 flex items-center gap-2.5 text-xs">
                <Clock className="w-4 h-4 text-pink-400 flex-shrink-0" />
                <div>
                  <span className="text-slate-400 block">{t('durationLabel')}</span>
                  <span className="font-bold text-white">
                    {performance.durationMinutes} {t('minutes')}
                  </span>
                </div>
              </div>
            )}

            <div className="bg-slate-950 p-3 rounded-2xl border border-purple-900/40 flex items-center gap-2.5 text-xs">
              <Ticket className="w-4 h-4 text-purple-400 flex-shrink-0" />
              <div>
                <span className="text-slate-400 block">{t('priceLabel')}</span>
                <span className="font-bold text-white">
                  {ticketPrice || t('inquirePrice')}
                </span>
              </div>
            </div>
          </div>

          {/* Schedules with Venue Integration */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-purple-300 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-pink-400" />
              <span>{t('scheduleList')}</span>
            </h3>
            <div className="space-y-2">
              {performance.schedules.map((s, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950 p-3.5 rounded-2xl border border-purple-900/40 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2"
                >
                  <div className="flex items-center gap-2 text-white font-bold">
                    <Clock className="w-3.5 h-3.5 text-pink-400" />
                    <span>
                      {s.date} {s.startTime} - {s.endTime}
                    </span>
                    {s.note && (
                      <span className="px-2 py-0.5 rounded bg-purple-900/60 text-[10px] text-purple-300">
                        {s.note}
                      </span>
                    )}
                  </div>
                  {s.venueName && (
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <MapPin className="w-3.5 h-3.5 text-purple-400" />
                      <span>{getText(s.venueName, s.venueNameEn)}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {t('aboutTheShow')}
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {desc}
            </p>
          </div>

          {/* Social Links */}
          {(performance.websiteUrl || performance.snsTwitter || performance.snsInstagram || performance.snsYoutube) && (
            <div className="space-y-2 pt-2 border-t border-purple-900/30">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {t('officialLinks')}
              </h3>
              <div className="flex flex-wrap gap-2">
                {performance.websiteUrl && (
                  <a
                    href={performance.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-xs text-slate-300 border border-purple-900/40 flex items-center gap-1.5"
                  >
                    <Globe className="w-3.5 h-3.5 text-pink-400" />
                    <span>Website</span>
                  </a>
                )}
                {performance.snsTwitter && (
                  <a
                    href={performance.snsTwitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-xs text-slate-300 border border-purple-900/40 flex items-center gap-1.5"
                  >
                    <span>Twitter / X</span>
                  </a>
                )}
                {performance.snsInstagram && (
                  <a
                    href={performance.snsInstagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-xs text-slate-300 border border-purple-900/40 flex items-center gap-1.5"
                  >
                    <span>Instagram</span>
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer (Ticket Reservation CTA - only if ticketUrl exists) */}
        {performance.ticketUrl && performance.ticketUrl.trim() !== '' && (
          <div className="p-4 sm:p-6 bg-slate-950 border-t border-purple-900/50 flex items-center justify-end">
            <a
              href={performance.ticketUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto py-3 px-8 rounded-2xl bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 hover:opacity-95 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl shadow-pink-600/25 transition-all"
            >
              <span>{t('bookTickets')}</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}