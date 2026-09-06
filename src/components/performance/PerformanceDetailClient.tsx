'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Performance } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import SafeImage from '@/components/common/SafeImage';
import { 
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
  ArrowLeft,
  Share2,
  Building2,
  Check
} from 'lucide-react';
import { TwitterIcon, InstagramIcon, YoutubeIcon } from '@/components/common/SnsIcons';
import { formatScheduleDetailed, sortSchedules, deduplicateSchedules } from '@/utils/dateFormat';
import { formatTicketPrice } from '@/utils/priceFormat';

interface PerformanceDetailClientProps {
  performance: Performance;
}

export default function PerformanceDetailClient({ performance }: PerformanceDetailClientProps) {
  const { language, t, getText } = useLanguage();
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isFavorite, setIsFavorite] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('osaka_fringe_favs');
        const favs: string[] = saved ? JSON.parse(saved) : [];
        return favs.includes(performance.id);
      } catch {
        return false;
      }
    }
    return false;
  });

  const toggleFavorite = () => {
    setIsFavorite((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        try {
          const saved = localStorage.getItem('osaka_fringe_favs');
          let favs: string[] = saved ? JSON.parse(saved) : [];
          if (next) {
            if (!favs.includes(performance.id)) favs.push(performance.id);
          } else {
            favs = favs.filter((id) => id !== performance.id);
          }
          localStorage.setItem('osaka_fringe_favs', JSON.stringify(favs));
        } catch {}
      }
      return next;
    });
  };

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : `https://osakafringe.com/performances/${performance.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: getText(performance.title, performance.titleEn),
          url,
        });
      } catch {
        // Fallback to clipboard
        await navigator.clipboard.writeText(url);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      }
    } else {
      await navigator.clipboard.writeText(url);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const title = getText(performance.title, performance.titleEn);
  const artistName = getText(
    performance.artist?.name || performance.artistName,
    performance.artist?.nameEn || performance.artistNameEn
  );
  const artistOrigin = performance.artist ? getText(performance.artist.origin, performance.artist.originEn) : null;
  const artistProfile = performance.artist ? getText(performance.artist.profile, performance.artist.profileEn) : null;
  const genreCustom = language === 'en'
    ? (performance.genreCustomEn || performance.genreCustom)
    : (performance.genreCustom || performance.genreCustomEn);
  const description = getText(performance.description, performance.descriptionEn);
  const priceDisplay = formatTicketPrice(performance.ticketPrice, performance.ticketPriceEn, language);

  const fallbackVenueName = performance.venue ? getText(performance.venue.name, performance.venue.nameEn) : null;
  const fallbackAddress = performance.venue ? getText(performance.venue.address, performance.venue.addressEn) : null;
  const fallbackArea = performance.venue ? getText(performance.venue.area, performance.venue.areaEn) : null;
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

  const sortedSchedules = deduplicateSchedules(sortSchedules(performance.schedules || []));

  return (
    <div className="min-h-screen bg-[#fef9fc] py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Breadcrumbs & Back Navigation */}
        <div className="flex items-center justify-between gap-4 text-xs font-bold text-slate-500">
          <Link
            href="/audience"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-[#E6007E] text-slate-700 hover:text-[#E6007E] shadow-2xs transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t('viewAllAudience')}</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-pink-300 text-slate-700 hover:text-[#E6007E] shadow-2xs transition-all cursor-pointer"
              title="Share"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{isCopied ? (language === 'ja' ? 'URLコピー完了' : 'Copied!') : (language === 'ja' ? '共有' : 'Share')}</span>
            </button>

            <button
              type="button"
              onClick={toggleFavorite}
              className={`p-1.5 rounded-xl border transition-all cursor-pointer shadow-2xs ${
                isFavorite
                  ? 'bg-[#E6007E] text-white border-[#E6007E]'
                  : 'bg-white text-slate-600 border-slate-200 hover:text-[#E6007E] hover:border-pink-300'
              }`}
              title="Favorite"
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Main Card Container */}
        <div className="bg-white rounded-3xl border border-pink-100 shadow-xl overflow-hidden">
          {/* Hero Image */}
          <div className="relative aspect-16/9 w-full bg-slate-900 overflow-hidden">
            <SafeImage
              src={currentImage}
              alt={title}
              fill
              priority
              fallbackGenre={performance.genre}
              fallbackText={title}
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />

            {/* Badges on Top */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2 z-10">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-black/75 backdrop-blur-md text-white text-xs font-black uppercase tracking-wider border border-white/20">
                  {performance.genre}
                </span>
                {genreCustom && (
                  <span className="px-2.5 py-1 rounded-full bg-amber-500/90 text-white text-[11px] font-bold">
                    {genreCustom}
                  </span>
                )}
              </div>

              {performance.partner && typeof performance.partner === 'object' && performance.partner.category === '連携イベント・フェス' && (
                <span className="px-2.5 py-1 rounded-full bg-[#E6007E] text-white text-[11px] font-black">
                  {getText(performance.partner.name, performance.partner.nameEn)}
                </span>
              )}
            </div>

            {/* Title on Hero */}
            <div className="absolute bottom-6 left-6 right-6 space-y-2 text-white">
              <div className="flex items-center gap-2">
                {performance.artist ? (
                  <Link
                    href={`/artists/${performance.artist.id}`}
                    className="text-pink-300 hover:text-white text-xs sm:text-sm font-black tracking-wider uppercase drop-shadow-sm hover:underline"
                  >
                    {artistName} →
                  </Link>
                ) : (
                  <p className="text-pink-300 text-xs sm:text-sm font-black tracking-wider uppercase drop-shadow-sm">
                    {artistName}
                  </p>
                )}
                {artistOrigin && (
                  <span className="px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-xs text-white text-[10px] font-bold">
                    {artistOrigin}
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-4xl font-black leading-tight drop-shadow-md">
                {title}
              </h1>
            </div>
          </div>

          {/* Photo Thumbnails */}
          {allImages.length > 1 && (
            <div className="px-6 sm:px-8 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-2 overflow-x-auto">
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

          {/* Body Content */}
          <div className="p-6 sm:p-10 space-y-8">
            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div className="flex flex-wrap items-center gap-2.5">
                {performance.ticketUrl && (
                  <a
                    href={performance.ticketUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 rounded-2xl bg-[#E6007E] hover:bg-[#c4006b] text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-pink-500/20 transition-all cursor-pointer"
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
                    className="px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
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
                    className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
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
                    className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-pink-600 transition-colors cursor-pointer"
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
                    className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-red-600 transition-colors cursor-pointer"
                    aria-label="YouTube"
                  >
                    <YoutubeIcon className="w-4 h-4" />
                  </a>
                )}
              </div>

              {performance.durationMinutes && (
                <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold">
                  <Clock className="w-4 h-4 text-[#E6007E]" />
                  <span>{t('durationLabel')}: {performance.durationMinutes} {t('minutes')}</span>
                </div>
              )}
            </div>

            {/* Performance Description */}
            <div className="space-y-3">
              <h2 className="text-base font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#E6007E]" />
                <span>{t('aboutTheShow')}</span>
              </h2>
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 text-slate-700 text-sm leading-relaxed font-medium whitespace-pre-line">
                {description}
              </div>
            </div>

            {/* Artist Section (with link to Artist detail) */}
            {performance.artist && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <User className="w-4 h-4 text-[#E6007E]" />
                    <span>{t('aboutTheArtist')}（{artistName}）</span>
                  </h2>
                  <Link
                    href={`/artists/${performance.artist.id}`}
                    className="text-xs font-bold text-[#E6007E] hover:underline"
                  >
                    {language === 'ja' ? 'アーティスト詳細ページへ →' : 'View Artist Profile →'}
                  </Link>
                </div>

                <div className="p-6 rounded-2xl bg-pink-50/40 border border-pink-100 flex flex-col sm:flex-row gap-5 items-start">
                  {(performance.artist.image || (performance.artist.images && performance.artist.images.length > 0)) && (
                    <div className="relative w-24 h-24 sm:w-32 sm:h-32 shrink-0 rounded-2xl overflow-hidden border border-pink-200 shadow-xs bg-white">
                      <SafeImage
                        src={performance.artist.image || performance.artist.images?.[0]}
                        alt={artistName}
                        fill
                        fallbackGenre={performance.genre}
                        fallbackText={artistName}
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        href={`/artists/${performance.artist.id}`}
                        className="text-lg font-black text-slate-900 hover:text-[#E6007E] transition-colors"
                      >
                        {artistName}
                      </Link>
                      {artistOrigin && (
                        <span className="px-2.5 py-0.5 rounded-full bg-pink-100 text-[#E6007E] text-xs font-bold">
                          {artistOrigin}
                        </span>
                      )}
                    </div>
                    {artistProfile && (
                      <p className="text-slate-700 text-xs sm:text-sm leading-relaxed font-medium whitespace-pre-line line-clamp-4">
                        {artistProfile}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Schedule List */}
            <div className="space-y-4">
              <h2 className="text-base font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#E6007E]" />
                <span>{t('scheduleList')}</span>
              </h2>

              <div className="space-y-3">
                {sortedSchedules.length > 0 ? (
                  sortedSchedules.map((schedule, idx) => {
                    const sVenueName = getText(schedule.venueName, schedule.venueNameEn) || fallbackVenueName || 'Venue';
                    const sVenueId = schedule.venueId || schedule.venue?.id || performance.venueId || performance.venue?.id;
                    const formattedDate = formatScheduleDetailed(schedule, language);
                    const venueDirectionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(sVenueName + ' Osaka')}`;

                    return (
                      <div
                        key={idx}
                        className="p-5 rounded-2xl border border-pink-100 bg-white hover:border-pink-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 rounded-lg bg-pink-100 text-[#E6007E] text-xs font-black">
                              {formattedDate}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-700 font-bold">
                            <MapPin className="w-4 h-4 text-[#E6007E] flex-shrink-0" />
                            {sVenueId ? (
                              <Link
                                href={`/venues/${sVenueId}`}
                                className="hover:text-[#E6007E] hover:underline"
                              >
                                {sVenueName} →
                              </Link>
                            ) : (
                              <span>{sVenueName}</span>
                            )}
                          </div>
                          {schedule.note && (
                            <p className="text-xs text-slate-400">
                              ※ {schedule.note}
                            </p>
                          )}
                        </div>

                        <a
                          href={venueDirectionsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="self-start sm:self-center px-4 py-2 rounded-xl bg-slate-100 hover:bg-pink-50 hover:text-[#E6007E] text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
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

            {/* Main Venue Section (with link to Venue detail) */}
            {performance.venue && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#E6007E]" />
                    <span>{language === 'ja' ? '会場案内' : 'Venue Information'}</span>
                  </h2>
                  <Link
                    href={`/venues/${performance.venue.id}`}
                    className="text-xs font-bold text-[#E6007E] hover:underline"
                  >
                    {language === 'ja' ? '会場詳細ページへ →' : 'View Venue Details →'}
                  </Link>
                </div>

                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <Link
                      href={`/venues/${performance.venue.id}`}
                      className="text-lg font-black text-slate-900 hover:text-[#E6007E] transition-colors"
                    >
                      {getText(performance.venue.name, performance.venue.nameEn)}
                    </Link>
                    {fallbackArea && (
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-800 text-xs font-bold">
                        {fallbackArea}
                      </span>
                    )}
                  </div>

                  {fallbackAddress && (
                    <p className="text-xs text-slate-600 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#E6007E] shrink-0" />
                      <span>{fallbackAddress}</span>
                    </p>
                  )}

                  {performance.venue.access && (
                    <p className="text-xs text-slate-500 font-medium">
                      アクセス: {getText(performance.venue.access, performance.venue.accessEn)}
                    </p>
                  )}

                  <div className="pt-2">
                    <a
                      href={googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 hover:border-pink-300 text-slate-800 hover:text-[#E6007E] text-xs font-bold transition-all"
                    >
                      <Navigation className="w-3.5 h-3.5 text-[#E6007E]" />
                      <span>{t('goToMaps')}</span>
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Partner Event Info (If linked with a partner) */}
            {performance.partner && typeof performance.partner === 'object' && performance.partner.category === '連携イベント・フェス' && (
              <div className="space-y-3">
                <h2 className="text-base font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#E6007E]" />
                  <span>連携イベント情報（Partner Event）</span>
                </h2>
                <div className="p-6 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-900 text-xs font-black">
                      連携イベント
                    </span>
                    <h3 className="text-sm font-black text-slate-900">
                      {getText(performance.partner.name, performance.partner.nameEn)}
                    </h3>
                  </div>
                  {performance.partner.description && (
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium whitespace-pre-line">
                      {getText(performance.partner.description, performance.partner.descriptionEn)}
                    </p>
                  )}
                  {performance.partner.websiteUrl && (
                    <a
                      href={performance.partner.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E6007E] hover:underline pt-1"
                    >
                      <span>公式サイトを見る</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Ticket Price Box */}
            <div className="p-6 rounded-2xl bg-pink-50/80 border border-pink-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-black text-[#E6007E] uppercase">
                  {t('priceLabel')}
                </span>
                <p className="text-lg sm:text-xl font-black text-slate-900">
                  {priceDisplay}
                </p>
              </div>

              {performance.ticketUrl && (
                <a
                  href={performance.ticketUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3.5 rounded-2xl bg-[#E6007E] hover:bg-[#c4006b] text-white font-black text-sm flex items-center justify-center gap-2 shadow-md shadow-pink-500/20 transition-all cursor-pointer"
                >
                  <Ticket className="w-4 h-4" />
                  <span>{t('bookTickets')}</span>
                  <ExternalLink className="w-4 h-4 opacity-80" />
                </a>
              )}
            </div>

            {/* Bottom Back Button */}
            <div className="pt-6 border-t border-slate-100 flex justify-center">
              <Link
                href="/audience"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs sm:text-sm transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{t('viewAllAudience')}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
