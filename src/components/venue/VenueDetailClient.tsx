'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Venue, Performance } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import SafeImage from '@/components/common/SafeImage';
import { 
  Building2, 
  MapPin, 
  Navigation, 
  Calendar, 
  Ticket, 
  Globe, 
  ExternalLink, 
  ArrowLeft,
  ArrowRight,
  Share2,
  Check,
  Clock
} from 'lucide-react';
import { TwitterIcon, InstagramIcon } from '@/components/common/SnsIcons';
import { formatScheduleCompact } from '@/utils/dateFormat';
import { formatTicketPrice } from '@/utils/priceFormat';

interface VenueDetailClientProps {
  venue: Venue;
  performances: Performance[];
}

export default function VenueDetailClient({ venue, performances }: VenueDetailClientProps) {
  const { language, t, getText } = useLanguage();
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : `https://osakafringe.com/venues/${venue.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: getText(venue.name, venue.nameEn),
          url,
        });
      } catch {
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

  const name = getText(venue.name, venue.nameEn);
  const area = getText(venue.area, venue.areaEn);
  const address = getText(venue.address, venue.addressEn);
  const access = getText(venue.access, venue.accessEn);
  const description = getText(venue.description, venue.descriptionEn);

  const mapQuery = address || name;
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery + ' Osaka')}`;

  // Photos Gallery
  const photoGallery: string[] = venue.images && venue.images.length > 0
    ? venue.images.filter(Boolean)
    : (venue.image ? [venue.image] : []);
  const currentImage = photoGallery[activeImageIndex] || photoGallery[0];

  return (
    <div className="min-h-screen bg-[#fef9fc] py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Breadcrumbs & Back Navigation */}
        <div className="flex items-center justify-between gap-4 text-xs font-bold text-slate-500">
          <Link
            href="/venues"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-[#E6007E] text-slate-700 hover:text-[#E6007E] shadow-2xs transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t('venuesPageTitle')}</span>
          </Link>

          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-pink-300 text-slate-700 hover:text-[#E6007E] shadow-2xs transition-all cursor-pointer"
            title="Share"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{isCopied ? (language === 'ja' ? 'URLコピー完了' : 'Copied!') : (language === 'ja' ? '共有' : 'Share')}</span>
          </button>
        </div>

        {/* Main Card Container */}
        <div className="bg-white rounded-3xl border border-pink-100 shadow-xl overflow-hidden">
          {/* Hero Image */}
          {photoGallery.length > 0 ? (
            <div className="relative aspect-16/9 w-full bg-slate-900 overflow-hidden">
              <SafeImage
                src={currentImage}
                alt={name}
                fill
                priority
                fallbackType="venue"
                fallbackText={name}
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />

              {/* Badges on Top */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2 z-10">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-[#E6007E] text-white text-xs font-black uppercase tracking-wider shadow-xs">
                    {area}
                  </span>
                  {venue.venueType && (
                    <span className="px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md text-white text-[11px] font-bold border border-white/20 tracking-wider">
                      {venue.venueType}
                    </span>
                  )}
                </div>

                {venue.capacity && (
                  <span className="px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold">
                    {venue.capacity}席
                  </span>
                )}
              </div>

              {/* Name on Hero */}
              <div className="absolute bottom-6 left-6 right-6 space-y-1 text-white">
                <div className="text-pink-300 text-xs sm:text-sm font-black tracking-wider uppercase">
                  VENUE INFORMATION
                </div>
                <h1 className="text-2xl sm:text-4xl font-black leading-tight drop-shadow-md">
                  {name}
                </h1>
              </div>
            </div>
          ) : (
            <div className="p-8 bg-gradient-to-r from-slate-900 to-slate-800 text-white space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-[#E6007E] text-white text-xs font-black uppercase tracking-wider">
                  {area}
                </span>
                {venue.venueType && (
                  <span className="px-2.5 py-1 rounded-full bg-white/20 text-white text-[11px] font-bold">
                    {venue.venueType}
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-4xl font-black leading-tight">
                {name}
              </h1>
            </div>
          )}

          {/* Photo Thumbnails */}
          {photoGallery.length > 1 && (
            <div className="px-6 sm:px-8 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-2 overflow-x-auto">
              {photoGallery.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative w-20 h-14 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all cursor-pointer ${
                    activeImageIndex === idx ? 'border-[#E6007E] scale-105 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <SafeImage
                    src={img}
                    alt={`${name} photo ${idx + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Body Content */}
          <div className="p-6 sm:p-10 space-y-8">
            {/* Quick Actions & Links */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div className="flex flex-wrap items-center gap-2.5">
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-2xl bg-[#E6007E] hover:bg-[#c4006b] text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-pink-500/20 transition-all cursor-pointer"
                >
                  <Navigation className="w-4 h-4" />
                  <span>{t('goToMaps')}</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </a>

                {venue.websiteUrl && (
                  <a
                    href={venue.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Globe className="w-4 h-4 text-slate-500" />
                    <span>Website</span>
                  </a>
                )}

                {venue.snsTwitter && (
                  <a
                    href={venue.snsTwitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                    aria-label="X (Twitter)"
                  >
                    <TwitterIcon className="w-4 h-4" />
                  </a>
                )}

                {venue.snsInstagram && (
                  <a
                    href={venue.snsInstagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-pink-600 transition-colors cursor-pointer"
                    aria-label="Instagram"
                  >
                    <InstagramIcon className="w-4 h-4" />
                  </a>
                )}
              </div>

              {venue.capacity && (
                <div className="text-xs font-bold text-slate-600 bg-slate-100 px-3.5 py-2 rounded-xl">
                  {language === 'ja' ? `収容人数: 約${venue.capacity}名` : `Capacity: ~${venue.capacity}`}
                </div>
              )}
            </div>

            {/* Address & Access Box */}
            <div className="space-y-4">
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-4">
                <div className="space-y-1">
                  <span className="text-[11px] font-black text-[#E6007E] uppercase tracking-wider block">
                    {language === 'ja' ? '所在地・住所' : 'Address'}
                  </span>
                  <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#E6007E] shrink-0" />
                    <span>{address || '大阪市内'}</span>
                  </p>
                </div>

                {access && (
                  <div className="space-y-1 pt-3 border-t border-slate-200/60">
                    <span className="text-[11px] font-black text-[#E6007E] uppercase tracking-wider block">
                      {language === 'ja' ? 'アクセス' : 'Access'}
                    </span>
                    <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                      {access}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Venue Description */}
            {description && (
              <div className="space-y-3">
                <h2 className="text-base font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#E6007E]" />
                  <span>{language === 'ja' ? '会場について' : 'About the Venue'}</span>
                </h2>
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 text-slate-700 text-sm leading-relaxed font-medium whitespace-pre-line">
                  {description}
                </div>
              </div>
            )}

            {/* Shows at this Venue */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#E6007E]" />
                  <span>{t('showsAtVenue')} ({performances.length})</span>
                </h2>
                <Link
                  href="/audience"
                  className="text-xs font-bold text-[#E6007E] hover:underline"
                >
                  {t('viewAllAudience')} →
                </Link>
              </div>

              {performances.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {performances.map((perf) => {
                    const perfTitle = getText(perf.title, perf.titleEn);
                    const perfArtist = getText(perf.artistName, perf.artistNameEn);
                    const perfPrice = formatTicketPrice(perf.ticketPrice, perf.ticketPriceEn, language);

                    return (
                      <Link
                        key={perf.id}
                        href={`/performances/${perf.id}`}
                        className="group p-4 rounded-2xl border border-pink-100 bg-white hover:border-[#E6007E] hover:shadow-md transition-all flex flex-col justify-between space-y-3"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-pink-100 text-[#E6007E] text-[10px] font-black uppercase">
                              {perf.genre}
                            </span>
                            <span className="text-xs font-bold text-[#E6007E] truncate">
                              {perfArtist}
                            </span>
                          </div>
                          <h3 className="text-sm font-black text-slate-900 group-hover:text-[#E6007E] line-clamp-2 leading-snug transition-colors">
                            {perfTitle}
                          </h3>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-700">{perfPrice}</span>
                          <span className="font-black text-[#E6007E] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                            <span>{t('cardDetails')}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center rounded-2xl bg-slate-50 border border-slate-100 text-slate-400 text-xs">
                  {t('noShowsScheduled')}
                </div>
              )}
            </div>

            {/* Bottom Back Button */}
            <div className="pt-6 border-t border-slate-100 flex justify-center">
              <Link
                href="/venues"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs sm:text-sm transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{t('venuesPageTitle')}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
