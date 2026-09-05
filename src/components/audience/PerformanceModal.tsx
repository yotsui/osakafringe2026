'use client';

import React, { useEffect, useState } from 'react';
import { Performance } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import SafeImage from '@/components/common/SafeImage';
import { 
  X, 
  Calendar, 
  MapPin, 
  Clock, 
  Ticket, 
  Globe, 
  Sparkles, 
  ExternalLink, 
  Navigation, 
  Heart,
  User,
  Image as ImageIcon
} from 'lucide-react';
import { TwitterIcon, InstagramIcon, YoutubeIcon } from '@/components/common/SnsIcons';

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
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  // Handle ESC key press to close modal
  useEffect(() => {
    if (!performance) return;

    setActiveImageIndex(0);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [performance, onClose]);

  if (!performance) return null;

  const title = getText(performance.title, performance.titleEn);
  const artistName = getText(
    performance.artist?.name || performance.artistName,
    performance.artist?.nameEn || performance.artistNameEn
  );
  const artistOrigin = performance.artist ? getText(performance.artist.origin, performance.artist.originEn) : null;
  const artistProfile = performance.artist ? getText(performance.artist.profile, performance.artist.profileEn) : null;
  const genreCustom = getText(performance.genreCustom, performance.genreCustomEn);
  const description = getText(performance.description, performance.descriptionEn);
  const ticketPrice = getText(performance.ticketPrice, performance.ticketPriceEn);

  const fallbackVenueName = performance.venue ? getText(performance.venue.name, performance.venue.nameEn) : null;
  const fallbackAddress = performance.venue ? getText(performance.venue.address, performance.venue.addressEn) : null;
  const mapQuery = fallbackAddress || fallbackVenueName || 'Osaka';
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`;

  // Gallery Photos
  const allImages = performance.images && performance.images.length > 0 
    ? performance.images 
    : [performance.image || performance.artist?.image || ''];
  const currentImage = allImages[activeImageIndex] || allImages[0];

  const websiteUrl = performance.artist?.websiteUrl;
  const snsTwitter = performance.artist?.snsTwitter;
  const snsInstagram = performance.artist?.snsInstagram;
  const snsYoutube = performance.artist?.snsYoutube;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-10 bg-slate-900/70 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-3xl max-h-[92vh] flex flex-col bg-white rounded-3xl border border-pink-100 shadow-2xl overflow-hidden animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header */}
        <div className="sticky top-0 z-40 flex items-center justify-between px-6 py-3.5 bg-white/90 backdrop-blur-md border-b border-pink-100/80 shadow-xs">
          <div className="flex items-center gap-2 overflow-hidden mr-3">
            <span className="px-2.5 py-0.5 rounded-full bg-pink-50 border border-pink-200 text-[#E6007E] text-[11px] font-black uppercase">
              {t(`genre_${performance.genre}`) || performance.genre}
            </span>
            {genreCustom && (
              <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-bold">
                {genreCustom}
              </span>
            )}
            <span className="text-xs font-bold text-slate-700 truncate">
              {title}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {onToggleFavorite && (
              <button
                type="button"
                onClick={() => onToggleFavorite(performance.id)}
                className={`p-2 rounded-full border transition-all cursor-pointer ${
                  isFavorite
                    ? 'bg-[#E6007E] text-white border-[#E6007E] shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200 hover:text-[#E6007E] hover:border-pink-300'
                }`}
                aria-label="Favorite"
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
            )}

            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-[#E6007E] hover:text-white text-slate-700 text-xs font-black transition-all cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">{t('closeModal')}</span>
              <span className="text-[10px] opacity-60 font-mono hidden md:inline">(ESC)</span>
            </button>
          </div>
        </div>

        {/* Scrollable Modal Content */}
        <div className="overflow-y-auto flex-1 space-y-6">
          {/* Main Photo Container */}
          <div className="relative aspect-16/9 w-full bg-slate-900 overflow-hidden">
            <SafeImage
              src={currentImage}
              alt={title}
              fill
              fallbackGenre={performance.genre}
              fallbackText={title}
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-transparent" />

            {/* Title on Hero */}
            <div className="absolute bottom-6 left-6 right-6 space-y-1.5 text-white">
              <div className="flex items-center gap-2">
                <p className="text-pink-300 text-xs font-black tracking-wider uppercase drop-shadow-sm">
                  {artistName}
                </p>
                {artistOrigin && (
                  <span className="px-2 py-0.5 rounded-md bg-white/20 text-white text-[10px] font-bold">
                    {artistOrigin}
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-3xl font-black leading-tight drop-shadow-md">
                {title}
              </h2>
            </div>
          </div>

          {/* Photo Thumbnails (if multiple images) */}
          {allImages.length > 1 && (
            <div className="px-6 sm:px-8 flex items-center gap-2 overflow-x-auto pb-2">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative w-20 h-14 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all cursor-pointer ${
                    activeImageIndex === idx ? 'border-[#E6007E] scale-105 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <SafeImage
                    src={img}
                    alt={`${title} photo ${idx + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Modal Body */}
          <div className="px-6 sm:px-8 pb-8 space-y-8">
            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-slate-100">
              <div className="flex flex-wrap items-center gap-2">
                {performance.ticketUrl && (
                  <a
                    href={performance.ticketUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 rounded-2xl bg-[#E6007E] hover:bg-[#c4006b] text-white font-black text-xs flex items-center gap-2 shadow-md shadow-pink-500/20 transition-all cursor-pointer"
                  >
                    <Ticket className="w-4 h-4" />
                    <span>{t('bookTickets')}</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                  </a>
                )}

                {websiteUrl && (
                  <a
                    href={websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Globe className="w-4 h-4 text-slate-500" />
                    <span>Web</span>
                  </a>
                )}

                {snsTwitter && (
                  <a
                    href={snsTwitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                    aria-label="X / Twitter"
                  >
                    <TwitterIcon className="w-4 h-4" />
                  </a>
                )}

                {snsInstagram && (
                  <a
                    href={snsInstagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-pink-600 transition-colors cursor-pointer"
                    aria-label="Instagram"
                  >
                    <InstagramIcon className="w-4 h-4" />
                  </a>
                )}

                {snsYoutube && (
                  <a
                    href={snsYoutube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-red-600 transition-colors cursor-pointer"
                    aria-label="YouTube"
                  >
                    <YoutubeIcon className="w-4 h-4" />
                  </a>
                )}
              </div>

              {performance.durationMinutes && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold">
                  <Clock className="w-3.5 h-3.5 text-pink-600" />
                  <span>{t('durationLabel')}: {performance.durationMinutes} {t('minutes')}</span>
                </div>
              )}
            </div>

            {/* Performance Description */}
            <div className="space-y-3">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#E6007E]" />
                <span>{t('aboutTheShow')}</span>
              </h3>
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 text-slate-700 text-xs sm:text-sm leading-relaxed font-medium whitespace-pre-line">
                {description}
              </div>
            </div>

            {/* Artist Profile (Integrated from Artist schema) */}
            {artistProfile && (
              <div className="space-y-3">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <User className="w-4 h-4 text-[#E6007E]" />
                  <span>{t('aboutTheArtist')}（{artistName}）</span>
                </h3>
                <div className="p-5 rounded-2xl bg-pink-50/40 border border-pink-100 text-slate-700 text-xs sm:text-sm leading-relaxed font-medium whitespace-pre-line">
                  {artistProfile}
                </div>
              </div>
            )}

            {/* Schedule & Venues List */}
            <div className="space-y-4">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#E6007E]" />
                <span>{t('scheduleList')}</span>
              </h3>

              <div className="space-y-3">
                {performance.schedules && performance.schedules.length > 0 ? (
                  performance.schedules.map((schedule, idx) => {
                    const sVenueName = getText(schedule.venueName, schedule.venueNameEn) || fallbackVenueName || 'Venue';
                    return (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl border border-pink-100 bg-white hover:border-pink-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-md bg-pink-100 text-pink-700 text-xs font-black">
                              {schedule.date}
                            </span>
                            <span className="text-xs font-bold text-slate-800">
                              {schedule.startTime} - {schedule.endTime}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                            <MapPin className="w-3.5 h-3.5 text-[#E6007E] flex-shrink-0" />
                            <span>{sVenueName}</span>
                          </div>
                          {schedule.note && (
                            <p className="text-[11px] text-slate-400">
                              ※ {schedule.note}
                            </p>
                          )}
                        </div>

                        <a
                          href={googleMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="self-start sm:self-center px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-pink-50 hover:text-[#E6007E] text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Navigation className="w-3.5 h-3.5 text-[#E6007E]" />
                          <span>{t('directions')}</span>
                        </a>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-slate-400">No schedules listed</p>
                )}
              </div>
            </div>

            {/* Ticket Price Info */}
            <div className="p-5 rounded-2xl bg-pink-50/70 border border-pink-100 flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <span className="text-[11px] font-black text-[#E6007E] uppercase">
                  {t('priceLabel')}
                </span>
                <p className="text-sm font-black text-slate-900">
                  {ticketPrice || t('inquirePrice')}
                </p>
              </div>

              {performance.ticketUrl && (
                <a
                  href={performance.ticketUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-[#E6007E] hover:bg-[#c4006b] text-white font-black text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <Ticket className="w-3.5 h-3.5" />
                  <span>{t('tickets')}</span>
                </a>
              )}
            </div>

            {/* Bottom Close Button */}
            <div className="pt-4 flex justify-center">
              <button
                onClick={onClose}
                className="px-8 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs transition-all cursor-pointer"
              >
                {t('closeModal')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}