'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Venue, Performance } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import PerformanceCard from './PerformanceCard';
import PerformanceModal from './PerformanceModal';
import FestivalMap from './FestivalMap';
import {
  Search,
  MapPin,
  Calendar,
  Sparkles,
  Flame,
  Heart,
  Grid,
  Map as MapIcon,
  RotateCcw,
} from 'lucide-react';

interface AudienceAppProps {
  initialPerformances: Performance[];
  venues: Venue[];
}

export default function AudienceApp({ initialPerformances, venues }: AudienceAppProps) {
  const { t, getText } = useLanguage();

  // Search & Filter States
  const [keyword, setKeyword] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [selectedVenueId, setSelectedVenueId] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>('all');
  const [isTodayOnly, setIsTodayOnly] = useState<boolean>(false);

  // View States
  const [viewMode, setViewMode] = useState<'list' | 'map' | 'favorites'>('list');
  const [selectedPerformance, setSelectedPerformance] = useState<Performance | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Load favorites from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('osaka_fringe_favs');
      if (saved) {
        setFavorites(JSON.parse(saved));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem('osaka_fringe_favs', JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  // Extract all distinct dates
  const allDates = useMemo(() => {
    const set = new Set<string>();
    initialPerformances.forEach((p) => {
      p.schedules.forEach((s) => set.add(s.date));
    });
    return Array.from(set).sort();
  }, [initialPerformances]);

  // Determine "Today"
  const todayDateStr = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    if (allDates.includes(today)) return today;
    return allDates[0] || '2026-09-18';
  }, [allDates]);

  // Filter logic
  const filteredPerformances = useMemo(() => {
    return initialPerformances.filter((p) => {
      // 1. Favorites tab filter
      if (viewMode === 'favorites' && !favorites.includes(p.id)) {
        return false;
      }

      // 2. Today's show filter
      if (isTodayOnly) {
        const hasToday = p.schedules.some((s) => s.date === todayDateStr);
        if (!hasToday) return false;
      }

      // 3. Date filter (when not today only)
      if (!isTodayOnly && selectedDate !== 'all') {
        const hasDate = p.schedules.some((s) => s.date === selectedDate);
        if (!hasDate) return false;
      }

      // 4. Genre filter (WHAT)
      if (selectedGenre !== 'all' && p.genre !== selectedGenre) {
        return false;
      }

      // 5. Venue filter (WHERE) - checks both default venueId and any schedule.venueId
      if (selectedVenueId !== 'all') {
        const matchesDefaultVenue = p.venueId === selectedVenueId;
        const matchesScheduleVenue = p.schedules.some((s) => s.venueId === selectedVenueId);
        if (!matchesDefaultVenue && !matchesScheduleVenue) {
          return false;
        }
      }

      // 6. Keyword search (WHAT / Title / Artist / Description)
      if (keyword.trim() !== '') {
        const q = keyword.toLowerCase();
        const matchTitle = p.title.toLowerCase().includes(q) || (p.titleEn && p.titleEn.toLowerCase().includes(q));
        const matchArtist = p.artistName.toLowerCase().includes(q) || (p.artistNameEn && p.artistNameEn.toLowerCase().includes(q));
        const matchDesc = p.description.toLowerCase().includes(q) || (p.descriptionEn && p.descriptionEn.toLowerCase().includes(q));
        const matchCustom = p.genreCustom && p.genreCustom.toLowerCase().includes(q);
        if (!matchTitle && !matchArtist && !matchDesc && !matchCustom) {
          return false;
        }
      }

      return true;
    });
  }, [
    initialPerformances,
    viewMode,
    favorites,
    isTodayOnly,
    selectedDate,
    todayDateStr,
    selectedGenre,
    selectedVenueId,
    keyword,
  ]);

  const resetFilters = () => {
    setKeyword('');
    setSelectedGenre('all');
    setSelectedVenueId('all');
    setSelectedDate('all');
    setIsTodayOnly(false);
  };

  const hasActiveFilters =
    keyword !== '' ||
    selectedGenre !== 'all' ||
    selectedVenueId !== 'all' ||
    selectedDate !== 'all' ||
    isTodayOnly;

  return (
    <div className="space-y-8">
      {/* Search Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-950 via-slate-900 to-pink-950 border border-purple-800/40 p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full bg-pink-600/90 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1 shadow-md">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AUDIENCE APP 2026</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            {t('audienceTitle')}
          </h1>
          <p className="text-sm text-purple-200 mt-2 leading-relaxed">
            {t('audienceSubtitle')}
          </p>
        </div>
      </div>

      {/* Main Filter Console (WHAT / WHERE / WHEN) */}
      <div className="bg-slate-900/95 border border-purple-800/50 rounded-3xl p-5 sm:p-7 shadow-xl space-y-6">
        {/* Quick Tabs: Today / All Dates / Favorites */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-purple-900/40 pb-5">
          <div className="flex flex-wrap items-center gap-2">
            {/* Today's Shows Quick Button */}
            <button
              onClick={() => {
                setIsTodayOnly(!isTodayOnly);
                if (!isTodayOnly) setSelectedDate('all');
              }}
              className={`px-4 py-2 rounded-2xl text-xs font-extrabold flex items-center gap-2 transition-all ${
                isTodayOnly
                  ? 'bg-gradient-to-r from-amber-500 to-pink-600 text-white shadow-lg shadow-pink-500/25 scale-105'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-purple-800/40'
              }`}
            >
              <Flame className={`w-4 h-4 ${isTodayOnly ? 'text-amber-300 animate-pulse' : 'text-amber-400'}`} />
              <span>{t('todaysShows')} ({todayDateStr})</span>
            </button>

            {/* View Mode Switcher */}
            <div className="flex items-center bg-slate-950 p-1 rounded-2xl border border-purple-900/40">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  viewMode === 'list'
                    ? 'bg-pink-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>{t('tabSearch')}</span>
              </button>

              <button
                onClick={() => setViewMode('map')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  viewMode === 'map'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <MapIcon className="w-3.5 h-3.5" />
                <span>{t('tabMap')}</span>
              </button>

              <button
                onClick={() => setViewMode('favorites')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  viewMode === 'favorites'
                    ? 'bg-pink-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Heart className="w-3.5 h-3.5 fill-current text-pink-400" />
                <span>{t('tabFavorites')} ({favorites.length})</span>
              </button>
            </div>
          </div>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-xs text-slate-400 hover:text-pink-400 font-semibold flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t('resetFilters')}</span>
            </button>
          )}
        </div>

        {/* 3 Pillars: WHAT / WHERE / WHEN */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* WHAT (Keyword & 8 Major Genres) */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold text-pink-400 uppercase tracking-wider flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5" />
              <span>{t('filterWhat')}</span>
            </label>
            <div className="space-y-2">
              <div className="relative">
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder={t('searchPlaceholder')}
                  className="w-full bg-slate-950 border border-purple-800/40 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 transition-colors"
                />
                {keyword && (
                  <button
                    onClick={() => setKeyword('')}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-white text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="w-full bg-slate-950 border border-purple-800/40 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-pink-500 cursor-pointer"
              >
                <option value="all">{t('allGenres')}</option>
                <option value="street">{t('genre_street')}</option>
                <option value="dance">{t('genre_dance')}</option>
                <option value="music">{t('genre_music')}</option>
                <option value="theater">{t('genre_theater')}</option>
                <option value="traditional">{t('genre_traditional')}</option>
                <option value="kamishibai">{t('genre_kamishibai')}</option>
                <option value="exhibition">{t('genre_exhibition')}</option>
                <option value="other">{t('genre_other')}</option>
              </select>
            </div>
          </div>

          {/* WHERE (Venue & Area) */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              <span>{t('filterWhere')}</span>
            </label>
            <div className="space-y-2">
              <select
                value={selectedVenueId}
                onChange={(e) => setSelectedVenueId(e.target.value)}
                className="w-full bg-slate-950 border border-purple-800/40 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                <option value="all">{t('allVenues')}</option>
                {venues.map((v) => (
                  <option key={v.id} value={v.id}>
                    {getText(v.area, v.areaEn)} - {getText(v.name, v.nameEn)}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setViewMode('map')}
                className="w-full py-2 bg-purple-950/60 hover:bg-purple-900/80 border border-purple-800/40 rounded-xl text-xs font-semibold text-purple-300 flex items-center justify-center gap-1.5 transition-colors"
              >
                <MapIcon className="w-3.5 h-3.5" />
                <span>{t('tabMap')}</span>
              </button>
            </div>
          </div>

          {/* WHEN (Date Selector) */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>{t('filterWhen')}</span>
            </label>
            <div className="space-y-2">
              <select
                value={isTodayOnly ? todayDateStr : selectedDate}
                onChange={(e) => {
                  setIsTodayOnly(false);
                  setSelectedDate(e.target.value);
                }}
                disabled={isTodayOnly}
                className={`w-full bg-slate-950 border border-purple-800/40 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer ${
                  isTodayOnly ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <option value="all">{t('allDates')}</option>
                {allDates.map((date) => (
                  <option key={date} value={date}>
                    {date} {date === todayDateStr ? '(Today)' : ''}
                  </option>
                ))}
              </select>
              <div className="text-[11px] text-slate-400 bg-slate-950 p-2 rounded-xl border border-purple-900/30">
                {isTodayOnly ? t('showingTodayOnly') : t('showingAllDates')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area: Map View or Performance Grid */}
      {viewMode === 'map' ? (
        <div className="space-y-4">
          <FestivalMap
            venues={venues}
            performances={initialPerformances}
            selectedVenueId={selectedVenueId === 'all' ? null : selectedVenueId}
            onSelectVenue={(id) => setSelectedVenueId(id)}
          />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Result Count Header */}
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <p>
              {t('resultsCount')}:{' '}
              <span className="text-base font-extrabold text-pink-400">
                {filteredPerformances.length}
              </span>{' '}
              {t('showsUnit')}
            </p>
            {viewMode === 'favorites' && (
              <span className="text-pink-400 font-semibold">{t('viewingFavorites')}</span>
            )}
          </div>

          {/* Cards Grid */}
          {filteredPerformances.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPerformances.map((perf) => (
                <PerformanceCard
                  key={perf.id}
                  performance={perf}
                  onSelect={(p) => setSelectedPerformance(p)}
                  isFavorite={favorites.includes(perf.id)}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center bg-slate-900/50 rounded-3xl border border-purple-900/30 space-y-3">
              <Search className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-300">{t('noResults')}</p>
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-pink-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-pink-500 transition-colors"
              >
                {t('showAllShows')}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Detail Modal */}
      <PerformanceModal
        performance={selectedPerformance}
        onClose={() => setSelectedPerformance(null)}
        isFavorite={selectedPerformance ? favorites.includes(selectedPerformance.id) : false}
        onToggleFavorite={toggleFavorite}
      />
    </div>
  );
}