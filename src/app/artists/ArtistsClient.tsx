'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Artist, Performance, Venue } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import PerformanceModal from '@/components/audience/PerformanceModal';
import SafeImage from '@/components/common/SafeImage';
import { 
  Users, 
  Sparkles, 
  Calendar, 
  MapPin, 
  Ticket, 
  Globe, 
  ExternalLink, 
  ArrowRight,
  Theater
} from 'lucide-react';
import { TwitterIcon, InstagramIcon, YoutubeIcon } from '@/components/common/SnsIcons';

interface ArtistsClientProps {
  artists: Artist[];
  performances: Performance[];
  venues?: Venue[];
}

export default function ArtistsClient({ artists, performances, venues }: ArtistsClientProps) {
  const { t, getText } = useLanguage();
  const [selectedPerformance, setSelectedPerformance] = useState<Performance | null>(null);

  // Helper to find performances by artist
  const getPerformancesForArtist = (artistId: string, artistName: string) => {
    return performances.filter(
      (p) => p.artistId === artistId || p.artistName === artistName || p.artist?.id === artistId
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-50 border border-pink-200 text-[#E6007E] text-xs font-black uppercase tracking-wider">
          <Users className="w-3.5 h-3.5" />
          <span>{t('artistsPageBadge')}</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          {t('artistsPageTitle')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-xl mx-auto">
          {t('artistsPageSubtitle')}
        </p>
      </div>

      {/* Artists Count */}
      <div className="flex items-center justify-between border-b border-pink-100 pb-3">
        <h2 className="text-lg sm:text-xl font-black text-slate-900">
          {artists.length} {t('artistsCountUnit')}
        </h2>
        <Link
          href="/audience"
          className="inline-flex items-center gap-1 text-xs font-bold text-[#E6007E] hover:underline"
        >
          <span>{t('viewAllAudience')}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Grid of Artists */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {artists.map((artist) => {
          const artistName = getText(artist.name, artist.nameEn);
          const origin = getText(artist.origin, artist.originEn);
          const profile = getText(artist.profile, artist.profileEn);
          const artistShows = getPerformancesForArtist(artist.id, artist.name);

          return (
            <div
              key={artist.id}
              className="bg-white border border-pink-100/80 hover:border-pink-300 rounded-3xl overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Profile Photo */}
                <div className="relative aspect-16/10 w-full overflow-hidden bg-slate-100">
                  <SafeImage
                    src={artist.image}
                    alt={artistName}
                    fill
                    fallbackGenre={artist.genre || 'theater'}
                    fallbackText={artistName}
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                  {/* Badges: Genre & Origin */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
                    {artist.genre && (
                      <span className="px-3 py-1 rounded-full bg-[#E6007E] text-white text-[11px] font-black uppercase shadow-xs">
                        {t(`genre_${artist.genre}`) || artist.genre}
                      </span>
                    )}
                    {origin && (
                      <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-bold shadow-xs">
                        {origin}
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-3 left-4 right-4">
                    <h3 className="text-xl font-black text-white leading-tight drop-shadow-md">
                      {artistName}
                    </h3>
                  </div>
                </div>

                {/* Profile & Info */}
                <div className="p-6 space-y-4">
                  {/* Bio */}
                  <div className="space-y-1.5">
                    <p className="text-[11px] font-black text-pink-600 uppercase tracking-wider">
                      {t('artistProfileTitle')}
                    </p>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium line-clamp-4 whitespace-pre-line">
                      {profile}
                    </p>
                  </div>

                  {/* Social Links */}
                  {(artist.websiteUrl || artist.snsTwitter || artist.snsInstagram || artist.snsYoutube) && (
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                      {artist.websiteUrl && (
                        <a
                          href={artist.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-pink-100 text-slate-700 hover:text-pink-600 transition-colors"
                          title="Official Website"
                        >
                          <Globe className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {artist.snsTwitter && (
                        <a
                          href={artist.snsTwitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-pink-100 text-slate-700 hover:text-pink-600 transition-colors"
                          title="X / Twitter"
                        >
                          <TwitterIcon className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {artist.snsInstagram && (
                        <a
                          href={artist.snsInstagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-pink-100 text-slate-700 hover:text-pink-600 transition-colors"
                          title="Instagram"
                        >
                          <InstagramIcon className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {artist.snsYoutube && (
                        <a
                          href={artist.snsYoutube}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-pink-100 text-slate-700 hover:text-pink-600 transition-colors"
                          title="YouTube"
                        >
                          <YoutubeIcon className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Performances by this Artist */}
              <div className="p-6 pt-0 space-y-3">
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <p className="text-[11px] font-black text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                    <Theater className="w-3.5 h-3.5 text-pink-600" />
                    <span>{t('artistShowsTitle')}</span>
                  </p>

                  {artistShows.length > 0 ? (
                    <div className="space-y-2">
                      {artistShows.map((perf) => {
                        const showTitle = getText(perf.title, perf.titleEn);
                        return (
                          <div
                            key={perf.id}
                            onClick={() => setSelectedPerformance(perf)}
                            className="p-3 rounded-2xl bg-pink-50/50 hover:bg-pink-100/80 border border-pink-100 cursor-pointer transition-all flex items-center justify-between gap-2"
                          >
                            <div className="min-w-0 flex-1">
                              <h4 className="text-xs font-black text-slate-900 truncate hover:text-pink-600">
                                {showTitle}
                              </h4>
                              <p className="text-[11px] text-slate-500 font-bold flex items-center gap-1 mt-0.5">
                                <Calendar className="w-3 h-3 text-pink-600" />
                                <span>{perf.schedules.length}公演</span>
                              </p>
                            </div>
                            <span className="px-2.5 py-1 rounded-xl bg-white text-pink-600 text-[10px] font-black shadow-xs flex-shrink-0">
                              {t('viewDetails')}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">
                      {t('noShowsForArtist')}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Performance Modal */}
      <PerformanceModal
        performance={selectedPerformance}
        onClose={() => setSelectedPerformance(null)}
      />
    </div>
  );
}