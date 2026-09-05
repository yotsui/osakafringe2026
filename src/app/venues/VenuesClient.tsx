'use client';

import React, { useState } from 'react';
import { Venue, Performance } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import SafeImage from '@/components/common/SafeImage';
import FestivalMap from '@/components/audience/FestivalMap';
import PerformanceModal from '@/components/audience/PerformanceModal';
import { 
  MapPin, 
  ExternalLink, 
  Globe, 
  Navigation, 
  Sparkles,
  Building2
} from 'lucide-react';
import { InstagramIcon, TwitterIcon } from '@/components/common/SnsIcons';

interface VenuesClientProps {
  venues: Venue[];
  performances: Performance[];
}

export default function VenuesClient({ venues, performances }: VenuesClientProps) {
  const { t, getText } = useLanguage();
  const [selectedPerformance, setSelectedPerformance] = useState<Performance | null>(null);

  // Group performances by venue
  const getPerformancesForVenue = (venueId: string) => {
    return performances.filter(
      (p) => p.venueId === venueId || p.schedules.some((s) => s.venueId === venueId)
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-block px-3 py-1 rounded-full bg-pink-50 border border-pink-200 text-[#E6007E] text-xs font-black uppercase tracking-wider">
          <span>{t('venuesPageBadge')}</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          {t('venuesPageTitle')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-xl mx-auto">
          {t('venuesPageSubtitle')}
        </p>
      </div>

      {/* Interactive Map */}
      <div className="space-y-4">
        <FestivalMap
          venues={venues}
          performances={performances}
          onSelectPerformance={(p) => setSelectedPerformance(p)}
        />
      </div>

      {/* Venues Grid Cards */}
      <div className="space-y-8">
        <div className="flex items-center justify-between border-b border-pink-100 pb-3">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            {t('allVenuesTitle')}
          </h2>
          <span className="text-xs font-bold text-slate-500">
            {venues.length} {t('venuesCountUnit')}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {venues.map((venue) => {
            const venueName = getText(venue.name, venue.nameEn);
            const venueArea = getText(venue.area, venue.areaEn);
            const venueAddress = getText(venue.address, venue.addressEn);
            const venueAccess = getText(venue.access, venue.accessEn);
            const venueDesc = getText(venue.description, venue.descriptionEn);
            const venueShows = getPerformancesForVenue(venue.id);

            const mapQuery = venueAddress || venueName;
            const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`;

            // 写真の有無を判定（未登録・空文字の場合は写真なし）
            const photoGallery: string[] = venue.images && venue.images.length > 0
              ? venue.images.filter(Boolean)
              : (venue.image ? [venue.image] : []);
            const hasPhotos = photoGallery.length > 0;

            return (
              <div
                key={venue.id}
                className="bg-white border border-pink-100/80 hover:border-pink-300 rounded-3xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-6 p-6 sm:p-8"
              >
                {/* 写真がある場合: 画像ギャラリー表示 */}
                {hasPhotos ? (
                  <div className="space-y-3">
                    <div className="relative aspect-16/9 w-full rounded-2xl overflow-hidden bg-slate-900">
                      <SafeImage
                        src={photoGallery[0]}
                        alt={venueName}
                        fill
                        fallbackType="venue"
                        fallbackText={venueName}
                        className="object-cover"
                      />
                      <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#E6007E] text-white text-xs font-black shadow-sm z-10">
                        {venueArea}
                      </div>
                    </div>

                    {photoGallery.length > 1 && (
                      <div className="grid grid-cols-3 gap-2">
                        {photoGallery.slice(1, 4).map((imgUrl, imgIdx) => (
                          <div key={imgIdx} className="relative aspect-16/10 rounded-xl overflow-hidden bg-slate-900 border border-slate-100">
                            <SafeImage src={imgUrl} alt={`${venueName} ${imgIdx + 2}`} fill fallbackType="venue" className="object-cover" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  /* 写真がない場合: エリアバッジと会場アイコンをヘッダーに配置 */
                  <div className="flex items-center justify-between pb-2 border-b border-pink-50">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-pink-50 text-[#E6007E] flex items-center justify-center">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <span className="px-3 py-1 rounded-full bg-pink-100/80 text-[#E6007E] text-xs font-black">
                        {venueArea}
                      </span>
                    </div>
                    {venue.capacity && (
                      <span className="text-xs font-bold text-slate-500">
                        Cap. {venue.capacity}
                      </span>
                    )}
                  </div>
                )}

                {/* Venue Details */}
                <div className="space-y-4 flex-1">
                  <div className="space-y-1">
                    <h3 className="text-xl font-black text-slate-900 leading-tight">
                      {venueName}
                    </h3>
                    <p className="text-xs font-bold text-[#E6007E] flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span>{venueAddress}</span>
                    </p>
                  </div>

                  {venueDesc && (
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                      {venueDesc}
                    </p>
                  )}

                  {venueAccess && (
                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs font-bold text-slate-700 space-y-1">
                      <span className="text-[10px] text-[#E6007E] uppercase font-black tracking-wider">Access</span>
                      <p>{venueAccess}</p>
                    </div>
                  )}

                  {/* Social & Website Links */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {venue.websiteUrl && (
                      <a
                        href={venue.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-pink-50 text-slate-700 hover:text-[#E6007E] text-xs font-bold flex items-center gap-1.5 transition-colors"
                      >
                        <Globe className="w-3.5 h-3.5 text-[#E6007E]" />
                        <span>Website</span>
                      </a>
                    )}
                    {venue.snsTwitter && (
                      <a
                        href={venue.snsTwitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-slate-100 hover:bg-pink-50 text-slate-700 hover:text-[#E6007E] transition-colors"
                        aria-label="X (Twitter)"
                      >
                        <TwitterIcon className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {venue.snsInstagram && (
                      <a
                        href={venue.snsInstagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-slate-100 hover:bg-pink-50 text-slate-700 hover:text-[#E6007E] transition-colors"
                        aria-label="Instagram"
                      >
                        <InstagramIcon className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Shows at this venue & Directions */}
                <div className="pt-4 border-t border-slate-100 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-[#E6007E]" />
                      <span>{t('showsAtVenue')} ({venueShows.length})</span>
                    </span>
                    <a
                      href={googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-extrabold text-[#E6007E] hover:text-pink-700 flex items-center gap-1"
                    >
                      <span>{t('goToMaps')}</span>
                      <Navigation className="w-3 h-3" />
                    </a>
                  </div>

                  {venueShows.length > 0 ? (
                    <div className="space-y-2">
                      {venueShows.map((perf) => (
                        <div
                          key={perf.id}
                          onClick={() => setSelectedPerformance(perf)}
                          className="p-3 bg-pink-50/50 hover:bg-pink-100/70 border border-pink-100 rounded-2xl flex items-center justify-between cursor-pointer transition-colors"
                        >
                          <div className="truncate pr-2">
                            <p className="text-xs font-black text-slate-900 truncate">
                              {getText(perf.title, perf.titleEn)}
                            </p>
                            <p className="text-[11px] text-[#E6007E] font-bold">
                              {getText(perf.artistName, perf.artistNameEn)}
                            </p>
                          </div>
                          <span className="text-[11px] font-extrabold text-[#E6007E] flex-shrink-0">
                            詳細 →
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 font-medium py-2">
                      {t('noShowsScheduled')}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Performance Modal */}
      <PerformanceModal
        performance={selectedPerformance}
        onClose={() => setSelectedPerformance(null)}
      />
    </div>
  );
}