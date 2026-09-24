'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Venue, Performance } from '@/types';
import dynamic from 'next/dynamic';
import { useLanguage } from '@/context/LanguageContext';
import SafeImage from '@/components/common/SafeImage';
import PerformanceModal from '@/components/audience/PerformanceModal';
import {
  getAllFestivalDates,
  getJstDateString,
  sortVenuesForDate,
  sortVenuesForAllDates,
  getNextAvailableDate,
  getFestivalStatus,
  isPreFestivalSchedule,
} from '@/utils/performanceUtils';
import { formatDatePart, formatScheduleCompact } from '@/utils/dateFormat';

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
  ArrowRight,
  Calendar,
  Clock,
  ChevronDown,
  Sparkles
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
  const { t, getText, language } = useLanguage();
  const searchParams = useSearchParams();
  const [selectedPerformance, setSelectedPerformance] = useState<Performance | null>(null);

  // デモモード（?demo または ?demo=true/1 等）判定
  const isDemoMode = searchParams.has('demo') && searchParams.get('demo') !== 'false';

  // 1. JST 日時の取得
  const [nowMs] = useState<number>(() => Date.now());
  const todayStr = useMemo(() => getJstDateString(nowMs), [nowMs]);
  const tomorrowStr = useMemo(() => getJstDateString(nowMs + 24 * 60 * 60 * 1000), [nowMs]);

  // 2. 全登録公演の日付一覧（昇順）
  const allFestivalDates = useMemo(() => getAllFestivalDates(performances), [performances]);

  // 3. 初期選択タブの判定
  // - フェスティバル開催前：すべての日程
  // - 開催期間中：今日
  // - 開催終了後：すべての日程
  const initialFilterMode = 'all';

  const [filterMode, setFilterMode] = useState<'today' | 'tomorrow' | 'pick_date' | 'all'>(initialFilterMode);
  const [customDate, setCustomDate] = useState<string>(
    allFestivalDates.includes(todayStr)
      ? todayStr
      : (allFestivalDates[0] || todayStr)
  );

  // 現在選択されている対象日付 (YYYY-MM-DD または null)
  const activeTargetDate = useMemo(() => {
    if (filterMode === 'today') return todayStr;
    if (filterMode === 'tomorrow') return tomorrowStr;
    if (filterMode === 'pick_date') return customDate;
    return null;
  }, [filterMode, todayStr, tomorrowStr, customDate]);

  // 4. 選択日・全日程に応じた会場一覧の計算とソート
  const dateVenueItems = useMemo(() => {
    if (!activeTargetDate) return [];
    return sortVenuesForDate(venues, performances, activeTargetDate, isDemoMode);
  }, [venues, performances, activeTargetDate, isDemoMode]);

  const allDatesVenueItems = useMemo(() => {
    if (activeTargetDate) return [];
    return sortVenuesForAllDates(venues, performances, nowMs, isDemoMode);
  }, [venues, performances, activeTargetDate, nowMs, isDemoMode]);

  // マップに渡す会場一覧
  const mapVenues = useMemo(() => {
    if (activeTargetDate) {
      return dateVenueItems.map((item) => item.venue);
    }
    return allDatesVenueItems.map((item) => item.venue);
  }, [activeTargetDate, dateVenueItems, allDatesVenueItems]);

  // 次に公演がある日付の算出（0件時の案内用）
  const nextAvailableDate = useMemo(() => {
    if (!activeTargetDate) return null;
    return getNextAvailableDate(allFestivalDates, activeTargetDate);
  }, [allFestivalDates, activeTargetDate]);

  const festivalStatus = getFestivalStatus();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* 3-Step Editorial Header */}
      <div className="border-l-4 border-[#E6007E] pl-4 sm:pl-6 space-y-2 py-2">
        <div className="text-sm font-black tracking-widest text-[#E6007E] uppercase">
          VENUES & SCHEDULE
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          {t('venuesPageTitle')}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 font-medium max-w-2xl leading-relaxed">
          {t('venuesPageSubtitle')}
        </p>
        {isDemoMode && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold mt-2">
            <Eye className="w-3.5 h-3.5" />
            <span>{t('demoModeVenues')}</span>
          </div>
        )}
      </div>

      {/* Information Banner */}
      {festivalStatus === 'before' ? (
        <div className="bg-pink-50 border border-pink-100 rounded-xl p-4 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-pink-500 shrink-0 mt-0.5" />
          <p className="text-sm font-medium text-pink-900">
            {language === 'en' 
              ? 'Performance and venue information is being updated continuously. New information will be added sequentially.'
              : '公演・会場情報は随時更新しています。最新情報は順次追加されます。'}
          </p>
        </div>
      ) : festivalStatus === 'during' ? (
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-sm font-medium text-amber-900">
            {language === 'en'
              ? 'Performance contents and times may change. Please check the details of each performance before visiting.'
              : '公演内容や開催時間は変更になる場合があります。ご来場前に各公演の詳細をご確認ください。'}
          </p>
        </div>
      ) : null}

      {/* Date Filter Tabs (Placed directly before the map) */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#E6007E]" />
            <span className="text-sm font-black text-slate-800 uppercase tracking-wider">
              {language === 'en' ? 'Select Date' : '日程で会場を探す'}
            </span>
          </div>
          {activeTargetDate && (
            <span className="text-xs font-bold text-[#E6007E] bg-pink-50 px-2.5 py-0.5 rounded-full border border-pink-100">
              {formatDatePart(activeTargetDate, language)}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {/* すべての日程 (All Dates) */}
          <button
            type="button"
            onClick={() => setFilterMode('all')}
            className={`px-4 py-3 rounded-xl text-sm font-bold transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer min-h-[52px] ${
              filterMode === 'all'
                ? 'bg-[#E6007E] text-white shadow-sm ring-2 ring-[#E6007E]/30 font-black'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80'
            }`}
          >
            <span>{t('venueFilterAllDates')}</span>
            <span className={`text-[10px] ${filterMode === 'all' ? 'text-pink-100' : 'text-slate-400'}`}>
              {language === 'en' ? 'Entire Festival' : '全期間・次回順'}
            </span>
          </button>

          {festivalStatus === 'during' && (
            <>
              {/* 今日 (Today) */}
              <button
                type="button"
                onClick={() => setFilterMode('today')}
                className={`px-4 py-3 rounded-xl text-sm font-bold transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer min-h-[52px] ${
                  filterMode === 'today'
                    ? 'bg-[#E6007E] text-white shadow-sm ring-2 ring-[#E6007E]/30 font-black'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80'
                }`}
              >
                <span>{t('venueFilterToday')}</span>
                <span className={`text-[10px] ${filterMode === 'today' ? 'text-pink-100' : 'text-slate-400'}`}>
                  {formatDatePart(todayStr, language)}
                </span>
              </button>

              {/* 明日 (Tomorrow) */}
              <button
                type="button"
                onClick={() => setFilterMode('tomorrow')}
                className={`px-4 py-3 rounded-xl text-sm font-bold transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer min-h-[52px] ${
                  filterMode === 'tomorrow'
                    ? 'bg-[#E6007E] text-white shadow-sm ring-2 ring-[#E6007E]/30 font-black'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80'
                }`}
              >
                <span>{t('venueFilterTomorrow')}</span>
                <span className={`text-[10px] ${filterMode === 'tomorrow' ? 'text-pink-100' : 'text-slate-400'}`}>
                  {formatDatePart(tomorrowStr, language)}
                </span>
              </button>
            </>
          )}

          {/* 日付を選ぶ (Pick Date Dropdown) */}
          <div className={`relative ${festivalStatus !== 'during' ? 'col-span-1 sm:col-span-3' : ''}`}>
            <select
              value={filterMode === 'pick_date' ? customDate : ''}
              onChange={(e) => {
                if (e.target.value) {
                  setCustomDate(e.target.value);
                  setFilterMode('pick_date');
                }
              }}
              className={`w-full h-full min-h-[52px] px-3 py-2 rounded-xl text-xs sm:text-sm font-bold appearance-none transition-all cursor-pointer text-center ${
                filterMode === 'pick_date'
                  ? 'bg-[#E6007E] text-white shadow-sm ring-2 ring-[#E6007E]/30 font-black'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80'
              }`}
            >
              <option value="" disabled className="text-slate-700 bg-white">
                {t('venueFilterPickDate')}
              </option>
              {allFestivalDates.map((date) => (
                <option key={date} value={date} className="text-slate-900 bg-white font-medium py-1">
                  {formatDatePart(date, language)}
                </option>
              ))}
            </select>
            <div className={`absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${
              filterMode === 'pick_date' ? 'text-white' : 'text-slate-400'
            }`}>
              <ChevronDown className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Map */}
      <div className="space-y-4">
        <FestivalMap
          venues={mapVenues}
          performances={performances}
          onSelectPerformance={(p) => setSelectedPerformance(p)}
        />
      </div>

      {/* Venues Section */}
      <div className="space-y-8">
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
          <div className="space-y-0.5">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              {activeTargetDate
                ? `${formatDatePart(activeTargetDate, language)} ${t('showsTodayTitle')}`
                : t('allVenuesTitle')}
            </h2>
            {activeTargetDate && (
              <p className="text-xs text-slate-500 font-medium">
                {language === 'en' ? 'Venues sorted by earliest show start time' : '公演開始時刻が早い順に会場を表示しています'}
              </p>
            )}
          </div>
          <span className="text-xs font-bold text-slate-500">
            <span className="text-[#E6007E] font-black">{mapVenues.length}</span> {t('venuesCountUnit')}
          </span>
        </div>

        {/* 1. 選択日に公演がない場合（Empty State） */}
        {activeTargetDate && dateVenueItems.length === 0 ? (
          <div className="bg-slate-50 border border-dashed border-slate-300 rounded-3xl p-8 sm:p-12 text-center space-y-4 max-w-2xl mx-auto">
            <div className="w-12 h-12 bg-pink-100 text-[#E6007E] rounded-full flex items-center justify-center mx-auto">
              <Calendar className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900">
                {t('noShowsOnThisDate')}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                {language === 'en'
                  ? `${t('noPerformancesOnDateSuffix')}${formatDatePart(activeTargetDate, language)}.`
                  : `${formatDatePart(activeTargetDate, language)}${t('noPerformancesOnDateSuffix')}`}
              </p>
            </div>

            {nextAvailableDate ? (
              <button
                type="button"
                onClick={() => {
                  setCustomDate(nextAvailableDate);
                  setFilterMode('pick_date');
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#E6007E] text-white text-xs sm:text-sm font-black shadow-md hover:bg-pink-600 transition-all cursor-pointer"
              >
                <span>
                  {t('viewNextDatePrefix')}
                  {formatDatePart(nextAvailableDate, language)}
                  {t('viewNextDateSuffix')}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setFilterMode('all')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#E6007E] text-white text-xs sm:text-sm font-black shadow-md hover:bg-pink-600 transition-all cursor-pointer"
              >
                <span>{t('viewAllDatesAction')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : null}

        {/* 2. 選択日指定時の会場カード一覧 */}
        {activeTargetDate && dateVenueItems.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            {dateVenueItems.map(({ venue, shows }) => {
              const venueName = getText(venue.name, venue.nameEn);
              const venueArea = getText(venue.area, venue.areaEn);
              const venueAddress = getText(venue.address, venue.addressEn);
              const venueAccess = getText(venue.access, venue.accessEn);
              const venueDesc = getText(venue.description, venue.descriptionEn);
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
                              {venue.capacity}{t('seatsUnit')}
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

                  {/* Shows at Venue on Selected Date */}
                  <div className="p-6 pt-0 space-y-3">
                    <div className="pt-3 border-t border-slate-100 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#E6007E]" />
                          <span>
                            {language === 'en'
                              ? `${t('showsOnDatePrefix')}${formatDatePart(activeTargetDate, language)} (${shows.length} ${t('showsCountUnit')})`
                              : `${formatDatePart(activeTargetDate, language)}${t('showsOnDateSuffix')} (${shows.length}${t('showsCountUnit')})`}
                          </span>
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

                      {shows.length > 0 ? (
                        <div className="space-y-2">
                          {shows.map((item) => (
                            <Link
                              key={item.performance.id}
                              href={`/performances/${item.performance.id}`}
                              className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-pink-50/80 border border-slate-100 hover:border-pink-200 transition-all flex items-center justify-between gap-3 group"
                            >
                              <div className="flex items-start gap-2.5 truncate pr-2">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 shrink-0">
                                  {item.schedule && isPreFestivalSchedule(item.schedule) && (
                                    <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded bg-purple-600 text-white text-[10px] font-black shrink-0">
                                      {t('preFestival')}
                                    </span>
                                  )}
                                  <span className="inline-flex items-center justify-center px-2 py-1 rounded bg-[#E6007E]/10 text-[#E6007E] text-[11px] font-black shrink-0">
                                    {item.displayTime || t('allDayShow')}
                                  </span>
                                </div>
                                <div className="truncate">
                                  <p className="text-xs font-bold text-slate-900 group-hover:text-[#E6007E] truncate">
                                    {getText(item.performance.title, item.performance.titleEn)}
                                  </p>
                                  <p className="text-[10px] text-slate-400 font-medium truncate">
                                    {getText(item.performance.artist?.name || item.performance.artistName, item.performance.artist?.nameEn || item.performance.artistNameEn)}
                                  </p>
                                </div>
                              </div>
                              <span className="text-[11px] font-bold text-[#E6007E] shrink-0">
                                {t('showDetailsArrow')}
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
                          <span>{t('viewVenueDetails')}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 3. 「すべての日程」選択時の会場カード一覧 */}
        {!activeTargetDate && allDatesVenueItems.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            {allDatesVenueItems.map(({ venue, allShows }) => {
              const venueName = getText(venue.name, venue.nameEn);
              const venueArea = getText(venue.area, venue.areaEn);
              const venueAddress = getText(venue.address, venue.addressEn);
              const venueAccess = getText(venue.access, venue.accessEn);
              const venueDesc = getText(venue.description, venue.descriptionEn);
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
                              {venue.capacity}{t('seatsUnit')}
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

                  {/* Shows at Venue */}
                  <div className="p-6 pt-0 space-y-3">
                    <div className="pt-3 border-t border-slate-100 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-[#E6007E]" />
                          <span>{t('venuePerformancesTitle')}</span>
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

                      {allShows.length > 0 ? (
                        <div className="space-y-2.5">
                          {allShows.map((item) => (
                            <Link
                              key={item.performance.id}
                              href={`/performances/${item.performance.id}`}
                              className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-pink-50/80 border border-slate-100 hover:border-pink-200 transition-all flex flex-col gap-2 group"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="truncate">
                                  <p className="text-xs font-bold text-slate-900 group-hover:text-[#E6007E] truncate">
                                    {getText(item.performance.title, item.performance.titleEn)}
                                  </p>
                                  <p className="text-[10px] text-slate-400 font-medium truncate">
                                    {getText(item.performance.artist?.name || item.performance.artistName, item.performance.artist?.nameEn || item.performance.artistNameEn)}
                                  </p>
                                </div>
                                <span className="text-[11px] font-bold text-[#E6007E] shrink-0">
                                  {t('showDetailsArrow')}
                                </span>
                              </div>

                              {/* 全日程リスト */}
                              <div className="flex flex-wrap gap-1.5 pt-0.5">
                                {item.schedules.length > 0 ? (
                                  item.schedules.map((sItem, sIdx) => (
                                    <span
                                      key={sIdx}
                                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium shrink-0 ${
                                        sItem.isOngoing
                                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold'
                                          : sItem.isEnded
                                          ? 'bg-slate-100 text-slate-500'
                                          : 'bg-white text-slate-700 border border-slate-200/80'
                                      }`}
                                    >
                                      {isPreFestivalSchedule(sItem.schedule) && (
                                        <span className="text-[9px] font-black bg-purple-600 text-white px-1.5 py-0.5 rounded-xs">
                                          {t('preFestival')}
                                        </span>
                                      )}
                                      {sItem.isOngoing && (
                                        <span className="text-[9px] font-black bg-emerald-600 text-white px-1 py-0.2 rounded-xs">
                                          {t('statusOngoing')}
                                        </span>
                                      )}
                                      <span>{formatScheduleCompact(sItem.schedule, language)}</span>
                                    </span>
                                  ))
                                ) : (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500">
                                    {t('tbd')}
                                  </span>
                                )}
                              </div>
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
                          <span>{t('viewVenueDetails')}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Performance Modal (preserved for future Intercepting Routes) */}
      <PerformanceModal
        performance={selectedPerformance}
        onClose={() => setSelectedPerformance(null)}
      />
    </div>
  );
}