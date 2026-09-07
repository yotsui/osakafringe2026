'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
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
  Theater,
  Eye
} from 'lucide-react';
import { TwitterIcon, InstagramIcon, YoutubeIcon } from '@/components/common/SnsIcons';

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

interface ArtistsClientProps {
  artists: Artist[];
  performances: Performance[];
  venues?: Venue[];
}

export default function ArtistsClient({ artists, performances, venues }: ArtistsClientProps) {
  const { t, getText } = useLanguage();
  const searchParams = useSearchParams();
  const [selectedPerformance, setSelectedPerformance] = useState<Performance | null>(null);

  // Helper to find performances by artist
  const getPerformancesForArtist = (artistId: string, artistName: string) => {
    return performances.filter(
      (p) => 
        p.artistId === artistId || 
        p.artistName === artistName || 
        p.artist?.id === artistId ||
        (typeof p.artists === 'object' && p.artists?.id === artistId) ||
        p.artists === artistId
    );
  };

  // デモモード（?demo または ?demo=true/1 等）判定
  const isDemoMode = searchParams.has('demo') && searchParams.get('demo') !== 'false';

  // 出演公演が登録されているアーティストのみを抽出（デモモード時は全件）
  const displayArtists = isDemoMode
    ? artists
    : artists.filter((a) => getPerformancesForArtist(a.id, a.name).length > 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* 3-Step Editorial Header */}
      <div className="border-l-4 border-[#E6007E] pl-4 sm:pl-6 space-y-2 py-2">
        <div className="text-xs font-black tracking-widest text-[#E6007E] uppercase">
          ARTISTS
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          {t('artistsPageTitle')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-2xl leading-relaxed">
          {t('artistsPageSubtitle')}
        </p>
        {isDemoMode && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold mt-2">
            <Eye className="w-3.5 h-3.5" />
            <span>DEMO MODE（出演公演未登録アーティストを含む全件表示中）</span>
          </div>
        )}
      </div>

      {/* Artists Count */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
        <h2 className="text-base sm:text-lg font-bold text-slate-900">
          <span className="text-[#E6007E] font-black">{displayArtists.length}</span> {t('artistsCountUnit')}
          {!isDemoMode && artists.length > displayArtists.length && (
            <span className="ml-1.5 text-xs text-slate-400 font-normal">（出演公演登録アーティストのみ）</span>
          )}
        </h2>
        <Link
          href="/audience"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E6007E] hover:underline"
        >
          <span>{t('viewAllAudience')}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Editorial Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
        {displayArtists.map((artist) => {
          const artistName = getText(artist.name, artist.nameEn);
          const origin = getText(artist.origin, artist.originEn);
          const profile = getText(artist.profile, artist.profileEn);
          const artistShows = getPerformancesForArtist(artist.id, artist.name);
          const artistUrl = `/artists/${artist.id}`;

          return (
            <div
              key={artist.id}
              className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden hover:border-[#E6007E] transition-all duration-300 flex flex-col justify-between shadow-2xs hover:shadow-md"
            >
              <div>
                {/* Large Profile Photo */}
                <Link
                  href={artistUrl}
                  className="relative aspect-4/3 w-full overflow-hidden bg-slate-900 block select-none group"
                >
                  <SafeImage
                    src={artist.image}
                    alt={artistName}
                    fill
                    fallbackGenre={artist.genre || 'theater'}
                    fallbackText={artistName}
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />
                </Link>

                {/* Editorial Flow: Genre/Origin -> Name -> Bio */}
                <div className="p-6 space-y-4">
                  {/* Genre & Origin Typography */}
                  <div className="flex items-center justify-between text-xs font-black tracking-wider uppercase">
                    <span className="text-[#E6007E]">
                      {artist.genre || 'performance'}
                    </span>
                    {origin && (
                      <span className="text-slate-400 font-bold text-[11px]">
                        {origin}
                      </span>
                    )}
                  </div>

                  {/* Artist Name */}
                  <Link href={artistUrl} className="block group">
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 group-hover:text-[#E6007E] transition-colors leading-tight">
                      {artistName}
                    </h3>
                  </Link>

                  {/* Profile Bio */}
                  {profile && (
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium line-clamp-3 whitespace-pre-line">
                      {profile}
                    </p>
                  )}

                  {/* Social Links */}
                  {(isValidUrl(artist.websiteUrl) || isValidUrl(artist.snsTwitter) || isValidUrl(artist.snsInstagram) || isValidUrl(artist.snsYoutube)) && (
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                      {isValidUrl(artist.websiteUrl) && (
                        <a
                          href={artist.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-slate-50 hover:bg-pink-50 text-slate-600 hover:text-[#E6007E] transition-colors"
                          title="Official Website"
                        >
                          <Globe className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {isValidUrl(artist.snsTwitter) && (
                        <a
                          href={artist.snsTwitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-slate-50 hover:bg-pink-50 text-slate-600 hover:text-[#E6007E] transition-colors"
                          title="X / Twitter"
                        >
                          <TwitterIcon className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {isValidUrl(artist.snsInstagram) && (
                        <a
                          href={artist.snsInstagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-slate-50 hover:bg-pink-50 text-slate-600 hover:text-[#E6007E] transition-colors"
                          title="Instagram"
                        >
                          <InstagramIcon className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {isValidUrl(artist.snsYoutube) && (
                        <a
                          href={artist.snsYoutube}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-slate-50 hover:bg-pink-50 text-slate-600 hover:text-[#E6007E] transition-colors"
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
              <div className="p-6 pt-0 space-y-2">
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    {t('artistShowsTitle')}
                  </span>

                  {artistShows.length > 0 ? (
                    <div className="space-y-1.5">
                      {artistShows.map((perf) => {
                        const showTitle = getText(perf.title, perf.titleEn);
                        return (
                          <Link
                            key={perf.id}
                            href={`/performances/${perf.id}`}
                            className="w-full text-left p-2.5 rounded-xl bg-slate-50 hover:bg-pink-50/80 border border-slate-100 hover:border-pink-200 transition-all flex items-center justify-between gap-2 group"
                          >
                            <span className="text-xs font-bold text-slate-800 group-hover:text-[#E6007E] truncate">
                              {showTitle}
                            </span>
                            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#E6007E] shrink-0 group-hover:translate-x-0.5 transition-transform" />
                          </Link>
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

      {/* Performance Modal (preserved for future Intercepting Routes) */}
      <PerformanceModal
        performance={selectedPerformance}
        onClose={() => setSelectedPerformance(null)}
      />
    </div>
  );
}