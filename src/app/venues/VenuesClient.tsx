'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Venue, Performance } from '@/types';
import dynamic from 'next/dynamic';
import { useLanguage } from '@/context/LanguageContext';
import SafeImage from '@/components/common/SafeImage';
import PerformanceModal from '@/components/audience/PerformanceModal';

const FestivalMap = dynamic(() => import('@/components/audience/FestivalMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] bg-slate-100 rounded-3xl animate-pulse flex flex-col items-center justify-center text-slate-400 gap-3 border border-slate-200">
      <div className="w-8 h-8 border-3 border-[#E6007E] border-t-transparent rounded-full animate-spin" />
      <span className="text-xs font-bold text-slate-500 tracking-wider">MAP LOADING...</span>
    </div>
  ),
});
import { 
  MapPin, 
  Globe, 
  Navigation, 
  Eye,
  ArrowRight
} from 'lucide-react';
import { InstagramIcon, TwitterIcon } from '@/components/common/SnsIcons';

interface VenuesClientProps {
  venues: Venue[];
  performances: Performance[];
}

const isValidUrl = (url?: string | null): boolean => {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (
    trimmed === '' ||
    trimmed === '#' ||
    trimmed === 'null' ||
    trimmed === 'undefined' ||
    trimmed === 'なし' ||
    trimmed === 'None' ||
    trimmed === 'http://' ||
    trimmed === 'https://'
  ) {
    return false;
  }
  return /^https?:\/\//i.test(trimmed);
};

export default function VenuesClient({ venues, performances }: VenuesClientProps) {
  const { t, getText } = useLanguage();
  const searchParams = useSearchParams();
  const [selectedPerformance, setSelectedPerformance] = useState<Performance | null>(null);

  // Group performances by venue
  const getPerformancesForVenue = (venueId: string) => {
    return performances.filter(
      (p) => 
        p.venueId === venueId || 
        p.venue?.id === venueId ||
        (p.schedules && p.schedules.some((s) => s.venueId === venueId || s.venue?.id === venueId))
    );
  };

  // デモモード（?demo または ?demo=true/1 等）判定
  const isDemoMode = searchParams.has('demo') && searchParams.get('demo') !== 'false';

  // 公演が登録されている会場のみを抽出（デモモード時は全件）
  const displayVenues = isDemoMode
    ? venues
    : venues.filter((v) => getPerformancesForVenue(v.id).length > 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* 3-Step Editorial Header */}
      <div className="border-l-4 border-[#E6007E] pl-4 sm:pl-6 space-y-2 py-2">
        <div className="text-xs font-black tracking-widest text-[#E6007E] uppercase">
          VENUES
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          {t('venuesPageTitle')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-2xl leading-relaxed">
          {t('venuesPageSubtitle')}
        </p>
        {isDemoMode && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold mt-2">
            <Eye className="w-3.5 h-3.5" />
            <span>DEMO MODE（公演未登録会場を含む全件表示中）</span>
          </div>
        )}
      </div>

      {/* Interactive Map */}
      <div className="space-y-4">
        <FestivalMap
          venues={displayVenues}
          performances={performances}
          onSelectPerformance={(p) => setSelectedPerformance(p)}
        />
      </div>

      {/* Venues Grid Cards */}
      <div className="space-y-8">
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            {t('allVenuesTitle')}
          </h2>
          <span className="text-xs font-bold text-slate-500">
            <span className="text-[#E6007E] font-black">{displayVenues.length}</span> {t('venuesCountUnit')}
            {!isDemoMode && venues.length > displayVenues.length && (
              <span className="ml-1 text-slate-400 font-normal">（公演登録会場のみ）</span>
            )}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {displayVenues.map((venue) => {
            const venueName = getText(venue.name, venue.nameEn);
            const venueArea = getText(venue.area, venue.areaEn);
            const venueAddress = getText(venue.address, venue.addressEn);
            const venueAccess = getText(venue.access, venue.accessEn);
            const venueDesc = getText(venue.description, venue.descriptionEn);
            const venueShows = getPerformancesForVenue(venue.id);
            const venueUrl = `/venues/${venue.id}`;

            const mapQuery = venueAddress || venueName;
            const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery + ' Osaka')}`;

            const photoGallery: string[] = venue.images && venue.images.length > 0
              ? venue.images.filter(Boolean)
              : (venue.image ? [venue.image] : []);
            const hasPhotos = photoGallery.length > 0;

            return (
              <div
                key={venue.id}
                className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden hover:border-[#E6007E] transition-all duration-300 flex flex-col justify-between shadow-2xs hover:shadow-md"
              >
                <div className="space-y-4">
                  {/* Venue Photo with Typographic Overlay */}
                  {hasPhotos && (
                    <Link
                      href={venueUrl}
                      className="relative aspect-16/9 w-full bg-slate-900 overflow-hidden block select-none group"
                    >
                      <SafeImage
                        src={photoGallery[0]}
                        alt={venueName}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 580px"
                        quality={75}
                        fallbackType="venue"
                        fallbackText={venueName}
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />
                      
                      {/* Area / Venue Type Typography */}
                      <div className="absolute top-3 left-3 flex items-center gap-2 z-10 pointer-events-none">
                        <span className="px-3 py-1 rounded bg-[#E6007E] text-white text-xs font-black tracking-wider uppercase shadow-xs">
                          {venueArea}
                        </span>
                        {venue.venueType && (
                          <span className="px-2.5 py-1 rounded bg-black/75 backdrop-blur-xs text-white text-[11px] font-bold border border-white/20 tracking-wider">
                            {venue.venueType}
                          </span>
                        )}
                      </div>
                    </Link>
                  )}

                  <div className="p-6 space-y-4">
                    {/* Header: Area & Type (if no photo) + Name */}
                    {!hasPhotos && (
                      <div className="flex items-center gap-2 text-xs font-black tracking-wider uppercase">
                        <span className="text-[#E6007E]">{venueArea}</span>
                        {venue.venueType && (
                          <span className="text-slate-400">/ {venue.venueType}</span>
                        )}
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <Link href={venueUrl} className="group">
                          <h3 className="text-xl sm:text-2xl font-black text-slate-900 group-hover:text-[#E6007E] transition-colors leading-tight">
                            {venueName}
                          </h3>
                        </Link>
                        {venue.capacity && (
                          <span className="text-[11px] font-bold text-slate-500 shrink-0 bg-slate-100 px-2.5 py-0.5 rounded">
                            {venue.capacity}席
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-bold text-[#E6007E] flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span>{venueAddress}</span>
                      </p>
                    </div>

                    {venueDesc && (
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium line-clamp-3">
                        {venueDesc}
                      </p>
                    )}

                    {venueAccess && (
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 space-y-0.5">
                        <span className="text-[10px] text-[#E6007E] uppercase font-black tracking-wider block">Access</span>
                        <p className="font-medium">{venueAccess}</p>
                      </div>
                    )}

                    {/* SNS・Web Links */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {isValidUrl(venue.websiteUrl) && (
                        <a
                          href={venue.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 rounded-lg bg-slate-50 hover:bg-pink-50 text-slate-700 hover:text-[#E6007E] text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-100"
                        >
                          <Globe className="w-3.5 h-3.5 text-[#E6007E]" />
                          <span>Website</span>
                        </a>
                      )}
                      {isValidUrl(venue.snsTwitter) && (
                        <a
                          href={venue.snsTwitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-slate-50 hover:bg-pink-50 text-slate-700 hover:text-[#E6007E] transition-colors border border-slate-100"
                          aria-label="X (Twitter)"
                        >
                          <TwitterIcon className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {isValidUrl(venue.snsInstagram) && (
                        <a
                          href={venue.snsInstagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-slate-50 hover:bg-pink-50 text-slate-700 hover:text-[#E6007E] transition-colors border border-slate-100"
                          aria-label="Instagram"
                        >
                          <InstagramIcon className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Shows at Venue & Detail Link */}
                <div className="p-6 pt-0 space-y-3">
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        {t('showsAtVenue')} ({venueShows.length})
                      </span>
                      <a
                        href={googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-black text-[#E6007E] hover:underline flex items-center gap-1"
                      >
                        <span>{t('goToMaps')}</span>
                        <Navigation className="w-3 h-3" />
                      </a>
                    </div>

                    {venueShows.length > 0 ? (
                      <div className="space-y-1.5">
                        {venueShows.slice(0, 3).map((perf) => (
                          <Link
                            key={perf.id}
                            href={`/performances/${perf.id}`}
                            className="w-full text-left p-2.5 rounded-xl bg-slate-50 hover:bg-pink-50/80 border border-slate-100 hover:border-pink-200 transition-all flex items-center justify-between gap-2 group"
                          >
                            <div className="truncate pr-2">
                              <p className="text-xs font-bold text-slate-900 group-hover:text-[#E6007E] truncate">
                                {getText(perf.title, perf.titleEn)}
                              </p>
                              <p className="text-[10px] text-slate-400 font-medium">
                                {getText(perf.artistName, perf.artistNameEn)}
                              </p>
                            </div>
                            <span className="text-[11px] font-bold text-[#E6007E] shrink-0">
                              詳細 →
                            </span>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">
                        {t('noShowsScheduled')}
                      </p>
                    )}

                    <div className="pt-2 flex justify-end">
                      <Link
                        href={venueUrl}
                        className="inline-flex items-center gap-1 text-xs font-black text-[#E6007E] hover:underline"
                      >
                        <span>会場詳細を見る</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Performance Modal (preserved for future Intercepting Routes) */}
      <PerformanceModal
        performance={selectedPerformance}
        onClose={() => setSelectedPerformance(null)}
      />
    </div>
  );
}