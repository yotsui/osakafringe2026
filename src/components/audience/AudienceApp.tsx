'use client';

import React, { useState, useMemo } from 'react';
import { Performance, Venue } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import PerformanceCard from './PerformanceCard';
import PerformanceModal from './PerformanceModal';
import FestivalMap from './FestivalMap';
import { 
  Search, 
  Filter, 
  Sparkles, 
  MapPin, 
  Calendar, 
  Flame, 
  RotateCcw,
  Layers,
  Map as MapIcon,
  Heart
} from 'lucide-react';

interface AudienceAppProps {
  initialPerformances: Performance[];
  venues: Venue[];
}

export default function AudienceApp({
  initialPerformances,
  venues,
}: AudienceAppProps) {
  const { t, getText } = useLanguage();

  // Filters State
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [selectedVenueId, setSelectedVenueId] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'search' | 'map' | 'favorites'>('search');

  // Favorites in state & localStorage
  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('osaka_fringe_favs');
        return saved ? JSON.parse(saved) : [];
      } catch {
        return [];
      }
    }
    return [];
  });

  const [selectedPerformance, setSelectedPerformance] = useState<Performance | null>(null);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      if (typeof window !== 'undefined') {
        localStorage.setItem('osaka_fringe_favs', JSON.stringify(next));
      }
      return next;
    });
  };

  // Distinct festival dates
  const festivalDates = useMemo(() => {
    const set = new Set<string>();
    initialPerformances.forEach((p) => {
      p.schedules.forEach((s) => set.add(s.date));
    });
    return Array.from(set).sort();
  }, [initialPerformances]);

  // Filter logic
  const filteredPerformances = useMemo(() => {
    return initialPerformances.filter((perf) => {
      // Favorites filter
      if (activeTab === 'favorites' && !favorites.includes(perf.id)) {
        return false;
      }

      // Genre filter (8 genres)
      if (selectedGenre !== 'all' && perf.genre !== selectedGenre) {
        return false;
      }

      // Venue filter
      if (selectedVenueId !== 'all') {
        const matchesDefaultVenue = perf.venueId === selectedVenueId;
        const matchesScheduleVenue = perf.schedules.some((s) => s.venueId === selectedVenueId);
        if (!matchesDefaultVenue && !matchesScheduleVenue) {
          return false;
        }
      }

      // Date filter
      if (selectedDate !== 'all') {
        const matchesDate = perf.schedules.some((s) => s.date === selectedDate);
        if (!matchesDate) {
          return false;
        }
      }

      // Search query (keyword)
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const titleJa = perf.title.toLowerCase();
        const titleEn = (perf.titleEn || '').toLowerCase();
        const artistJa = (perf.artist?.name || perf.artistName || '').toLowerCase();
        const artistEn = (perf.artist?.nameEn || perf.artistNameEn || '').toLowerCase();
        const descJa = perf.description.toLowerCase();
        const descEn = (perf.descriptionEn || '').toLowerCase();

        const matches =
          titleJa.includes(q) ||
          titleEn.includes(q) ||
          artistJa.includes(q) ||
          artistEn.includes(q) ||
          descJa.includes(q) ||
          descEn.includes(q);

        if (!matches) return false;
      }

      return true;
    });
  }, [
    initialPerformances,
    selectedGenre,
    selectedVenueId,
    selectedDate,
    searchQuery,
    activeTab,
    favorites,
  ]);

  const resetFilters = () => {
    setSelectedGenre('all');
    setSelectedVenueId('all');
    setSelectedDate('all');
    setSearchQuery('');
  };

  const genres = [
    { id: 'all', label: t('allGenres') },
    { id: 'street', label: t('genre_street') },
    { id: 'dance', label: t('genre_dance') },
    { id: 'music', label: t('genre_music') },
    { id: 'theater', label: t('genre_theater') },
    { id: 'traditional', label: t('genre_traditional') },
    { id: 'kamishibai', label: t('genre_kamishibai') },
    { id: 'exhibition', label: t('genre_exhibition') },
    { id: 'other', label: t('genre_other') },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* App Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-50 border border-pink-200 text-pink-600 text-xs font-black uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t('appCtaBadge')}</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          {t('audienceTitle')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          {t('audienceSubtitle')}
        </p>
      </div>

      {/* Main Tabs (Search / Map / Favorites) */}
      <div className="flex items-center justify-center">
        <div className="flex p-1.5 rounded-2xl bg-slate-100 border border-slate-200 shadow-inner max-w-md w-full">
          <button
            onClick={() => setActiveTab('search')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'search'
                ? 'bg-white text-pink-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{t('tabSearch')}</span>
          </button>

          <button
            onClick={() => setActiveTab('map')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'map'
                ? 'bg-white text-pink-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>{t('tabMap')}</span>
          </button>

          <button
            onClick={() => setActiveTab('favorites')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'favorites'
                ? 'bg-pink-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            <span>{t('tabFavorites')} ({favorites.length})</span>
          </button>
        </div>
      </div>

      {/* Map View */}
      {activeTab === 'map' ? (
        <div className="space-y-6">
          <FestivalMap
            venues={venues}
            performances={initialPerformances}
            onSelectPerformance={(p) => setSelectedPerformance(p)}
          />
        </div>
      ) : (
        /* Search / List / Favorites View */
        <div className="space-y-8">
          
          {/* WHAT / WHERE / WHEN Filter Control Panel */}
          <div className="bg-slate-50 border border-pink-100 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 shadow-2xs transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
                >
                  クリア
                </button>
              )}
            </div>

            {/* 3 Select Dropdowns: WHAT / WHERE / WHEN */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* WHAT: Genre */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-pink-600" />
                  <span>{t('filterWhat')}</span>
                </label>
                <select
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-pink-500 shadow-2xs"
                >
                  {genres.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* WHERE: Venue */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-pink-600" />
                  <span>{t('filterWhere')}</span>
                </label>
                <select
                  value={selectedVenueId}
                  onChange={(e) => setSelectedVenueId(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-pink-500 shadow-2xs"
                >
                  <option value="all">{t('allVenues')}</option>
                  {venues.map((v) => (
                    <option key={v.id} value={v.id}>
                      {getText(v.name, v.nameEn)}
                    </option>
                  ))}
                </select>
              </div>

              {/* WHEN: Date */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-pink-600" />
                  <span>{t('filterWhen')}</span>
                </label>
                <select
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-pink-500 shadow-2xs"
                >
                  <option value="all">{t('allDates')}</option>
                  {festivalDates.map((date) => (
                    <option key={date} value={date}>
                      {date}
                    </option>
                  ))}
                </select>
              </div>

            </div>

            {/* Reset Button */}
            {(selectedGenre !== 'all' || selectedVenueId !== 'all' || selectedDate !== 'all' || searchQuery) && (
              <div className="flex justify-end pt-2">
                <button
                  onClick={resetFilters}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-200/80 hover:bg-slate-300 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{t('resetFilters')}</span>
                </button>
              </div>
            )}
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between px-2">
            <p className="text-xs font-black text-slate-600 uppercase tracking-wider">
              {t('resultsCount')}: <span className="text-pink-600 text-sm">{filteredPerformances.length}</span> {t('showsUnit')}
            </p>
          </div>

          {/* Performances Grid */}
          {filteredPerformances.length === 0 ? (
            <div className="py-20 text-center space-y-4 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
              <p className="text-sm font-bold text-slate-500">{t('noResults')}</p>
              <button
                onClick={resetFilters}
                className="px-6 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs shadow-sm transition-colors"
              >
                {t('showAllShows')}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          )}
        </div>
      )}

      {/* Performance Modal */}
      <PerformanceModal
        performance={selectedPerformance}
        onClose={() => setSelectedPerformance(null)}
        isFavorite={selectedPerformance ? favorites.includes(selectedPerformance.id) : false}
        onToggleFavorite={toggleFavorite}
      />
    </div>
  );
}