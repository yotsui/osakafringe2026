'use client';

import React from 'react';
import Link from 'next/link';
import { Performance, Venue, Award, Banner, SiteInfo } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import BannerSection from '@/components/common/BannerSection';
import { Sparkles, ArrowRight, Calendar, MapPin, Trophy, Search } from 'lucide-react';

interface HomeClientProps {
  performances: Performance[];
  venues: Venue[];
  awards: Award[];
  banners: Banner[];
  siteInfo: SiteInfo;
}

export default function HomeClient({
  performances,
  venues,
  awards,
  banners,
  siteInfo,
}: HomeClientProps) {
  const { t, getText } = useLanguage();

  const featuredPerformances = performances.filter((p) => p.isFeatured).slice(0, 3);
  const period = getText(siteInfo.festivalPeriod, siteInfo.festivalPeriodEn);
  const locationSummary = getText(siteInfo.locationSummary, siteInfo.locationSummaryEn) || t('heroLocationSummary');
  const heroTagline = getText(siteInfo.heroTagline, siteInfo.heroTaglineEn) || t('heroTagline');
  const heroSubtitle = getText(siteInfo.heroSubtitle, siteInfo.heroSubtitleEn) || t('heroSubtitle');
  const aboutTitle = getText(siteInfo.aboutTitle, siteInfo.aboutTitleEn);
  const aboutText = getText(siteInfo.aboutText, siteInfo.aboutTextEn);

  const isAwardsVisible = siteInfo.awardsEnabled && awards.length > 0;

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* Hero Section */}
      <section className="relative min-h-[550px] sm:min-h-[620px] flex items-center justify-center overflow-hidden border-b border-purple-900/40">
        <div className="absolute inset-0 bg-slate-950">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 -right-40 w-96 h-96 bg-purple-600/25 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 left-1/3 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl" />
          <div
            className="absolute inset-0 opacity-20 bg-[radial-gradient(#8b5cf6_1px,transparent_1px)]"
            style={{ backgroundSize: '32px 32px' }}
          />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-pink-950/80 to-purple-950/80 border border-pink-500/40 shadow-lg shadow-pink-500/10 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-pink-400 animate-spin" style={{ animationDuration: '6s' }} />
            <span className="text-xs sm:text-sm font-extrabold tracking-widest text-pink-300 uppercase">
              {getText(siteInfo.siteTitle, siteInfo.siteTitleEn) || 'OSAKA FRINGE FESTIVAL 2026'}
            </span>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-tight">
              {heroTagline}
            </h1>
            <p className="text-base sm:text-xl font-medium text-slate-300 max-w-2xl mx-auto leading-relaxed">
              {heroSubtitle}
            </p>
          </div>

          <div className="inline-flex flex-wrap items-center justify-center gap-4 bg-slate-900/90 border border-purple-800/50 rounded-2xl p-3 px-6 shadow-xl backdrop-blur-md text-xs sm:text-sm">
            <div className="flex items-center gap-2 text-pink-400 font-bold">
              <Calendar className="w-4 h-4" />
              <span>{period}</span>
            </div>
            <div className="hidden sm:block w-1.5 h-1.5 rounded-full bg-purple-500" />
            <div className="flex items-center gap-2 text-purple-300 font-bold">
              <MapPin className="w-4 h-4" />
              <span>{locationSummary}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/audience"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 hover:opacity-95 text-white font-extrabold text-base shadow-2xl shadow-pink-600/30 flex items-center justify-center gap-2.5 transition-all hover:scale-105"
            >
              <Search className="w-5 h-5" />
              <span>{t('heroOpenAudience')}</span>
            </Link>

            <Link
              href="/venues"
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-purple-700/60 text-slate-200 font-bold text-base flex items-center justify-center gap-2 transition-all hover:text-white"
            >
              <MapPin className="w-5 h-5 text-purple-400" />
              <span>{t('heroVenuesMap')}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Shows Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-pink-500">
              <Sparkles className="w-4 h-4" />
              <span>{t('pickUpShows')}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white mt-1">{t('pickUpTitle')}</h2>
            <p className="text-sm text-slate-400 mt-1">{t('pickUpSubtitle')}</p>
          </div>
          <Link
            href="/audience"
            className="inline-flex items-center gap-2 text-sm font-bold text-pink-400 hover:text-pink-300 transition-colors group"
          >
            <span>{t('viewAllAudience')}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredPerformances.map((perf) => {
            const pTitle = getText(perf.title, perf.titleEn);
            const pArtist = getText(perf.artistName, perf.artistNameEn);
            const pDesc = getText(perf.description, perf.descriptionEn);
            const genreKey = `genre_${perf.genre}` as any;
            const pGenre = getText(perf.genreCustom, perf.genreCustomEn) || t(genreKey) || perf.genre.toUpperCase();
            const firstSched = perf.schedules[0];

            return (
              <Link
                key={perf.id}
                href={`/audience`}
                className="group relative bg-slate-900 border border-purple-900/40 rounded-3xl overflow-hidden hover:border-pink-500/60 transition-all hover:shadow-2xl hover:shadow-pink-500/10 flex flex-col"
              >
                <div className="relative h-56 w-full overflow-hidden bg-slate-950">
                  <img
                    src={perf.image}
                    alt={pTitle}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-black/30" />
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-pink-600/90 text-white text-[11px] font-bold shadow-md">
                    {pGenre}
                  </span>
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-pink-300 transition-colors line-clamp-2">
                      {pTitle}
                    </h3>
                    <p className="text-xs text-pink-400 font-semibold mt-1">{pArtist}</p>
                    <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                      {pDesc}
                    </p>
                  </div>
                  {firstSched && firstSched.venueName && (
                    <div className="pt-3 border-t border-purple-900/30 flex items-center gap-1.5 text-xs text-slate-300">
                      <MapPin className="w-3.5 h-3.5 text-pink-400 flex-shrink-0" />
                      <span className="truncate">{getText(firstSched.venueName, firstSched.venueNameEn)}</span>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Audience App CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-pink-900/80 via-purple-900/90 to-slate-950 border border-pink-500/30 p-8 sm:p-12 shadow-2xl">
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="px-3 py-1 rounded-full bg-pink-600 text-white text-xs font-extrabold uppercase tracking-wider">
              {t('appCtaBadge')}
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight">
              {t('appCtaTitle')}
            </h2>
            <p className="text-sm text-purple-200 leading-relaxed">
              {t('appCtaDesc')}
            </p>
            <div className="pt-2">
              <Link
                href="/audience"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-extrabold text-sm shadow-xl shadow-pink-600/30 hover:scale-105 transition-all"
              >
                <Search className="w-4 h-4" />
                <span>{t('launchApp')}</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* About Preview Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-purple-400">
              <Sparkles className="w-4 h-4" />
              <span>{t('aboutPreviewBadge')}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight">
              {aboutTitle}
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {aboutText}
            </p>
            <div>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-950 hover:bg-purple-900 border border-purple-800 text-xs font-bold text-purple-200 transition-colors"
              >
                <span>{t('readMore')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="relative rounded-3xl overflow-hidden border border-purple-800/40 shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1000&q=80"
              alt="Osaka Fringe Festival Atmosphere"
              className="w-full h-80 sm:h-96 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 p-4 bg-slate-950/80 backdrop-blur-md rounded-2xl border border-purple-800/40">
              <p className="text-xs font-bold text-pink-400 uppercase">FESTIVAL PERIOD</p>
              <p className="text-sm font-bold text-white mt-0.5">{period}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Awards Section Preview (Only if enabled and awards exist) */}
      {isAwardsVisible && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-amber-400">
                <Trophy className="w-4 h-4" />
                <span>{t('awardsPreviewBadge')}</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-white mt-1">{t('awardsPreviewTitle')}</h2>
              <p className="text-sm text-slate-400 mt-1">{t('awardsPreviewSubtitle')}</p>
            </div>
            <Link
              href="/awards"
              className="inline-flex items-center gap-2 text-sm font-bold text-amber-400 hover:text-amber-300 transition-colors group"
            >
              <span>{t('viewPastWinners')}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {awards.map((award) => {
              const aTitle = getText(award.title, award.titleEn);
              const aCategory = getText(award.category, award.categoryEn);
              const aWinner = getText(award.winner, award.winnerEn);
              const aWork = getText(award.workTitle, award.workTitleEn);
              const aComment = getText(award.comment, award.commentEn);

              return (
                <div
                  key={award.id}
                  className="bg-slate-900 border border-amber-900/30 rounded-3xl p-6 relative overflow-hidden space-y-4 hover:border-amber-500/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-amber-950 text-amber-300 border border-amber-700/50 text-xs font-extrabold">
                      {aCategory}
                    </span>
                    <span className="text-xs font-bold text-slate-500">{award.year}</span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">{aTitle}</h3>
                    <p className="text-sm font-bold text-amber-400 mt-1">{aWinner}</p>
                    <p className="text-xs text-slate-300 italic mt-0.5">{aWork}</p>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed border-t border-purple-900/30 pt-3">
                    {aComment}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Official Banners Section */}
      <BannerSection banners={banners} />
    </div>
  );
}