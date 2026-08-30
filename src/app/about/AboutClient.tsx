'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Sparkles, Globe, MapPin, Users, Building, Landmark, Coffee } from 'lucide-react';

export default function AboutClient() {
  const { t } = useLanguage();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="px-3 py-1 rounded-full bg-purple-950 border border-purple-600/50 text-purple-300 text-xs font-bold uppercase tracking-widest">
          {t('aboutPageBadge')}
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-white">
          OSAKA FRINGE 2026 | SPILL OVER
        </h1>
        <p className="text-base font-bold text-pink-400 max-w-xl mx-auto">
          街の一角を、世界の舞台へ。
        </p>
      </div>

      {/* Main Philosophy Card */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-900 via-purple-950/60 to-slate-900 border border-purple-800/50 p-8 sm:p-12 shadow-2xl space-y-6">
        <div className="max-w-3xl space-y-4">
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            熱気と表現があふれ出す、オープンアクセス芸術祭
          </h2>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed whitespace-pre-line">
            「フリンジ（Fringe）」とは、劇場だけでなく街中のあらゆる場所を舞台に、プロ・アマ問わずアーティストが自由に参加できるオープンアクセス型の芸術祭です。

            街全体が劇場化し、都市が一体となって共創することで、持続可能な文化経済圏を生み出します。
            劇場や美術館だけでなく、広場、歴史的建築、カフェ、オフィスビル、路地裏まで。
            大阪のあらゆる空間がパフォーマンスの場となり、国内外から集まるアーティストが多様な表現を繰り広げます。
          </p>
        </div>
      </div>

      {/* 3 Pillars of Osaka Fringe */}
      <div className="space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-2xl sm:text-3xl font-black text-white">フェスティバルの3大特徴</h2>
          <p className="text-xs text-slate-400">誰もが主役になれるオープンな仕組み</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-purple-900/40 rounded-3xl p-6 sm:p-8 space-y-3 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-pink-950 border border-pink-700/50 flex items-center justify-center text-pink-400">
              <Globe className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">{t('feature1Title')}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">{t('feature1Desc')}</p>
          </div>

          <div className="bg-slate-900 border border-purple-900/40 rounded-3xl p-6 sm:p-8 space-y-3 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-purple-950 border border-purple-700/50 flex items-center justify-center text-purple-400">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">{t('feature2Title')}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">{t('feature2Desc')}</p>
          </div>

          <div className="bg-slate-900 border border-purple-900/40 rounded-3xl p-6 sm:p-8 space-y-3 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-amber-950 border border-amber-700/50 flex items-center justify-center text-amber-400">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">{t('feature3Title')}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">{t('feature3Desc')}</p>
          </div>
        </div>
      </div>

      {/* 3 Venue Categories from osakafringe.com */}
      <div className="bg-slate-900/90 border border-purple-800/40 rounded-3xl p-8 sm:p-12 space-y-8 shadow-2xl">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="px-3 py-1 rounded-full bg-pink-950 border border-pink-700/50 text-pink-300 text-xs font-extrabold uppercase">
            VENUE CATEGORIES
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            大阪の街をハックする 3つの会場カテゴリー
          </h2>
          <p className="text-xs text-slate-400">
            大規模ショーケースから日常の隙間まで、街のあらゆる空間が舞台になります。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* CORE */}
          <div className="bg-slate-950 p-6 rounded-2xl border border-pink-900/40 space-y-3">
            <div className="flex items-center gap-2 text-pink-400 font-black text-base">
              <Building className="w-5 h-5" />
              <span>【CORE】発信拠点</span>
            </div>
            <p className="text-xs text-slate-300 font-semibold">
              商業施設アトリウム・駅前広場・公開空地・デッキ
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              人通りの多い空間を活用し、フェスティバルの熱気を都市全体に発信するショーケース拠点。
            </p>
          </div>

          {/* HISTORICAL */}
          <div className="bg-slate-950 p-6 rounded-2xl border border-purple-900/40 space-y-3">
            <div className="flex items-center gap-2 text-purple-400 font-black text-base">
              <Landmark className="w-5 h-5" />
              <span>【HISTORICAL】歴史的・象徴的空間</span>
            </div>
            <p className="text-xs text-slate-300 font-semibold">
              登録有形文化財・近代建築（レトロビル）・神社仏閣
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              大阪の歴史的都市資産と現代アートを掛け合わせ、新たな文化価値を創出するプレミアム空間。
            </p>
          </div>

          {/* LOCAL */}
          <div className="bg-slate-950 p-6 rounded-2xl border border-amber-900/40 space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-black text-base">
              <Coffee className="w-5 h-5" />
              <span>【LOCAL】日常・ユニークベニュー</span>
            </div>
            <p className="text-xs text-slate-300 font-semibold">
              カフェ・バー・ギャラリー・倉庫・銭湯・空き店舗
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              街の「隙間」をハックし、アーティストと観客が密に交わる多様な小規模会場。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}