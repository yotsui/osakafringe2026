'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Performance } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import PerformanceModal from '@/components/audience/PerformanceModal';
import { Users, Sparkles, Calendar, MapPin, Ticket, ExternalLink, ArrowRight } from 'lucide-react';

interface ArtistsClientProps {
  performances: Performance[];
  venues?: Venue[];
}

export default function ArtistsClient({ performances, venues }: ArtistsClientProps) {
  const { t, getText } = useLanguage();
  const [selectedPerformance, setSelectedPerformance] = useState<Performance | null>(null);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-50 border border-pink-200 text-pink-600 text-xs font-black uppercase tracking-wider">
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

      {/* Grid of Artists */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {performances.map((perf) => {
          const title = getText(perf.title, perf.titleEn);
          const artistName = getText(perf.artistName, perf.artistNameEn);
          const genreCustom = getText(perf.genreCustom, perf.genreCustomEn);
          const description = getText(perf.description, perf.descriptionEn);

          return (
            <div
              key={perf.id}
              className="bg-white border border-pink-100/80 hover:border-pink-300 rounded-3xl overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
            >
              {/* Profile Photo */}
              <div
                className="relative aspect-16/10 w-full overflow-hidden bg-slate-100 cursor-pointer"
                onClick={() => setSelectedPerformance(perf)}
              >
                <Image
                  src={perf.image || 'https://images.unsplash.com/photo-1514306191717-452ec28c7814?auto=format&fit=crop&w=800&q=80'}
                  alt={artistName}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

                <div className="absolute top-3 left-3">
                  <span className="px-3 py-1 rounded-full bg-pink-600 text-white text-xs font-black uppercase shadow-sm">
                    {t(`genre_${perf.genre}`) || perf.genre}
                  </span>
                </div>

                <div className="absolute bottom-3 left-4 right-4">
                  <h3 className="text-lg font-black text-white leading-tight drop-shadow-md">
                    {artistName}
                  </h3>
                </div>
              </div>

              {/* Performance Summary */}
              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <p className="text-xs font-black text-pink-600 uppercase tracking-wide">
                    上演作品 / PERFORMANCE
                  </p>
                  <h4
                    onClick={() => setSelectedPerformance(perf)}
                    className="text-base font-black text-slate-900 hover:text-pink-600 cursor-pointer transition-colors line-clamp-1"
                  >
                    {title}
                  </h4>
                  <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed font-medium">
                    {description}
                  </p>
                </div>

                {/* Schedules preview */}
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                    <span className="flex items-center gap-1 text-pink-600">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{t('schedulesCount')}: {perf.schedules.length}公演</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2">
                    <button
                      onClick={() => setSelectedPerformance(perf)}
                      className="flex-1 py-2 px-3 rounded-xl bg-pink-50 hover:bg-pink-100/80 text-pink-600 text-xs font-bold transition-colors cursor-pointer"
                    >
                      {t('viewDetails')}
                    </button>

                    <Link
                      href="/audience"
                      className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 transition-colors"
                    >
                      <span>Audience</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
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