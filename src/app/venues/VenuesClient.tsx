'use client';

import React from 'react';
import { Venue, Performance } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import FestivalMap from '@/components/audience/FestivalMap';
import { MapPin, Navigation, Globe, ExternalLink, Camera } from 'lucide-react';

interface VenuesClientProps {
  venues: Venue[];
  performances: Performance[];
}

export default function VenuesClient({ venues, performances }: VenuesClientProps) {
  const { t, getText } = useLanguage();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="px-3 py-1 rounded-full bg-pink-950 border border-pink-700/50 text-pink-300 text-xs font-bold">
          {t('venuesPageBadge')}
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-white">{t('venuesPageTitle')}</h1>
        <p className="text-sm text-slate-400 max-w-xl mx-auto">
          {t('venuesPageSubtitle')}
        </p>
      </div>

      {/* Interactive Map */}
      <FestivalMap venues={venues} performances={performances} />

      {/* Venues Grid */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <MapPin className="w-5 h-5 text-pink-400" />
          <span>{t('allVenuesTitle')} ({venues.length}{t('venuesCountUnit')})</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {venues.map((venue) => {
            const vName = getText(venue.name, venue.nameEn);
            const vArea = getText(venue.area, venue.areaEn);
            const vAddress = getText(venue.address, venue.addressEn);
            const vAccess = getText(venue.access, venue.accessEn);
            const vDesc = getText(venue.description, venue.descriptionEn);

            // Venues can be either the performance's default venueId or associated via any schedule.venueId
            const venuePerfs = performances.filter(
              (p) => p.venueId === venue.id || p.schedules.some((s) => s.venueId === venue.id)
            );
            const navUrl = `https://www.google.com/maps/dir/?api=1&destination=${venue.location.lat},${venue.location.lng}`;

            const imagesList = venue.images && venue.images.length > 0
              ? venue.images.slice(0, 3)
              : (venue.image ? [venue.image] : []);

            return (
              <div
                key={venue.id}
                className="bg-slate-900 border border-purple-900/40 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between hover:border-pink-500/50 transition-colors"
              >
                {/* Photo Gallery (up to 3 images) */}
                {imagesList.length > 0 && (
                  <div className="relative">
                    <div className="relative h-52 w-full overflow-hidden bg-slate-950">
                      <img
                        src={imagesList[0]}
                        alt={vName}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3 px-3 py-1 bg-slate-950/80 backdrop-blur-md rounded-full text-pink-300 text-xs font-bold border border-purple-800/50">
                        {vArea}
                      </div>
                      {imagesList.length > 1 && (
                        <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-slate-950/80 backdrop-blur-md rounded-lg text-white text-[11px] font-bold border border-white/20 flex items-center gap-1">
                          <Camera className="w-3.5 h-3.5 text-pink-400" />
                          <span>{imagesList.length} {t('photosCount')}</span>
                        </div>
                      )}
                    </div>
                    {/* Thumbnails if multiple images */}
                    {imagesList.length > 1 && (
                      <div className="grid grid-cols-3 gap-1 p-1 bg-slate-950">
                        {imagesList.map((imgUrl, i) => (
                          <div key={i} className="h-16 overflow-hidden rounded-lg">
                            <img src={imgUrl} alt={`${vName} ${i+1}`} className="w-full h-full object-cover hover:opacity-80 transition-opacity" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-white">{vName}</h3>
                    <p className="text-xs text-slate-400 flex items-start gap-1">
                      <MapPin className="w-4 h-4 text-pink-400 flex-shrink-0 mt-0.5" />
                      <span>{vAddress}</span>
                    </p>
                    <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-purple-900/30">
                      {vAccess}
                    </p>
                    {vDesc && (
                      <p className="text-xs text-slate-400 leading-relaxed pt-1">
                        {vDesc}
                      </p>
                    )}

                    {/* Official Website & SNS Links */}
                    {(venue.websiteUrl || venue.snsTwitter || venue.snsInstagram || venue.snsFacebook || venue.snsOther) && (
                      <div className="flex flex-wrap gap-2 pt-2 border-t border-purple-900/30">
                        {venue.websiteUrl && (
                          <a
                            href={venue.websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-[11px] text-slate-300 border border-purple-900/40 flex items-center gap-1"
                          >
                            <Globe className="w-3 h-3 text-pink-400" />
                            <span>Web</span>
                          </a>
                        )}
                        {venue.snsTwitter && (
                          <a
                            href={venue.snsTwitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-[11px] text-slate-300 border border-purple-900/40"
                          >
                            Twitter/X
                          </a>
                        )}
                        {venue.snsInstagram && (
                          <a
                            href={venue.snsInstagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-[11px] text-slate-300 border border-purple-900/40"
                          >
                            Instagram
                          </a>
                        )}
                        {venue.snsFacebook && (
                          <a
                            href={venue.snsFacebook}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-[11px] text-slate-300 border border-purple-900/40"
                          >
                            Facebook
                          </a>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Performances at this venue */}
                  <div className="pt-3 border-t border-purple-900/40">
                    <div className="text-xs font-bold text-purple-300 mb-2">
                      {t('showsAtVenue')} ({venuePerfs.length}):
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {venuePerfs.length > 0 ? (
                        venuePerfs.map((p) => (
                          <span
                            key={p.id}
                            className="text-[11px] bg-slate-950 px-2.5 py-1 rounded-lg border border-purple-900/40 text-slate-300"
                          >
                            {getText(p.title, p.titleEn)}
                          </span>
                        ))
                      ) : (
                        <span className="text-[11px] text-slate-500 italic">
                          {t('noShowsScheduled')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Navigation CTA */}
                  <div className="pt-2">
                    <a
                      href={navUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-pink-500/10 transition-all"
                    >
                      <Navigation className="w-4 h-4" />
                      <span>{t('goToMaps')}</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}