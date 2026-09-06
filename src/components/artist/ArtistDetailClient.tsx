'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Artist, Performance } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import SafeImage from '@/components/common/SafeImage';
import { 
  Users, 
  Sparkles, 
  Calendar, 
  MapPin, 
  Ticket, 
  Globe, 
  ExternalLink, 
  ArrowLeft,
  ArrowRight,
  Share2,
  Check
} from 'lucide-react';
import { TwitterIcon, InstagramIcon, YoutubeIcon } from '@/components/common/SnsIcons';
import { formatScheduleCompact } from '@/utils/dateFormat';
import { formatTicketPrice } from '@/utils/priceFormat';

interface ArtistDetailClientProps {
  artist: Artist;
  performances: Performance[];
}

export default function ArtistDetailClient({ artist, performances }: ArtistDetailClientProps) {
  const { language, t, getText } = useLanguage();
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : `https://osakafringe.com/artists/${artist.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: getText(artist.name, artist.nameEn),
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

  const name = getText(artist.name, artist.nameEn);
  const origin = getText(artist.origin, artist.originEn);
  const profile = getText(artist.profile, artist.profileEn);

  // Gallery Photos
  const allImages = artist.images && artist.images.length > 0 
    ? artist.images 
    : [artist.image || ''];
  const currentImage = allImages[activeImageIndex] || allImages[0];

  return (
    <div className="min-h-screen bg-[#fef9fc] py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Breadcrumbs & Back Navigation */}
        <div className="flex items-center justify-between gap-4 text-xs font-bold text-slate-500">
          <Link
            href="/artists"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-[#E6007E] text-slate-700 hover:text-[#E6007E] shadow-2xs transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t('artistsPageTitle')}</span>
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
          <div className="relative aspect-16/9 w-full bg-slate-900 overflow-hidden">
            <SafeImage
              src={currentImage}
              alt={name}
              fill
              priority
              fallbackGenre={artist.genre || 'theater'}
              fallbackText={name}
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />

            {/* Badges on Top */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2 z-10">
              <span className="px-3 py-1 rounded-full bg-black/75 backdrop-blur-md text-white text-xs font-black uppercase tracking-wider border border-white/20">
                {artist.genre || 'ARTIST'}
              </span>
              {origin && (
                <span className="px-3 py-1 rounded-full bg-[#E6007E] text-white text-xs font-bold shadow-xs">
                  {origin}
                </span>
              )}
            </div>

            {/* Name on Hero */}
            <div className="absolute bottom-6 left-6 right-6 space-y-1 text-white">
              <div className="text-pink-300 text-xs sm:text-sm font-black tracking-wider uppercase">
                ARTIST PROFILE
              </div>
              <h1 className="text-2xl sm:text-4xl font-black leading-tight drop-shadow-md">
                {name}
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
            {/* Social Links Bar */}
            {(artist.websiteUrl || artist.snsTwitter || artist.snsInstagram || artist.snsYoutube || artist.snsFacebook) && (
              <div className="flex flex-wrap items-center gap-2.5 pb-6 border-b border-slate-100">
                {artist.websiteUrl && (
                  <a
                    href={artist.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Globe className="w-4 h-4 text-slate-500" />
                    <span>Official Website</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                  </a>
                )}

                {artist.snsTwitter && (
                  <a
                    href={artist.snsTwitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                    aria-label="X / Twitter"
                  >
                    <TwitterIcon className="w-4 h-4" />
                  </a>
                )}

                {artist.snsInstagram && (
                  <a
                    href={artist.snsInstagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-pink-600 transition-colors cursor-pointer"
                    aria-label="Instagram"
                  >
                    <InstagramIcon className="w-4 h-4" />
                  </a>
                )}

                {artist.snsYoutube && (
                  <a
                    href={artist.snsYoutube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-red-600 transition-colors cursor-pointer"
                    aria-label="YouTube"
                  >
                    <YoutubeIcon className="w-4 h-4" />
                  </a>
                )}
              </div>
            )}

            {/* Profile Bio */}
            <div className="space-y-3">
              <h2 className="text-base font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#E6007E]" />
                <span>{language === 'ja' ? 'プロフィール' : 'Biography'}</span>
              </h2>
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 text-slate-700 text-sm leading-relaxed font-medium whitespace-pre-line">
                {profile || (language === 'ja' ? 'プロフィール情報は準備中です。' : 'Profile information coming soon.')}
              </div>
            </div>

            {/* Performances by this Artist */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#E6007E]" />
                  <span>{t('artistShowsTitle')} ({performances.length})</span>
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
                    const perfVenue = getText(perf.venue?.name || perf.venueName, perf.venue?.nameEn || perf.venueNameEn);
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
                            {perfVenue && (
                              <span className="text-xs text-slate-500 font-medium truncate flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-[#E6007E]" />
                                {perfVenue}
                              </span>
                            )}
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
                  {t('noShowsForArtist')}
                </div>
              )}
            </div>

            {/* Bottom Back Button */}
            <div className="pt-6 border-t border-slate-100 flex justify-center">
              <Link
                href="/artists"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs sm:text-sm transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{t('artistsPageTitle')}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
