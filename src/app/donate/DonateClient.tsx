'use client';

import React from 'react';
import { SiteInfo } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { Heart, Sparkles, ExternalLink, Building, CheckCircle } from 'lucide-react';

interface DonateClientProps {
  siteInfo: SiteInfo;
}

export default function DonateClient({ siteInfo }: DonateClientProps) {
  const { t, getText } = useLanguage();

  const title = getText(siteInfo.donationTitle, siteInfo.donationTitleEn);
  const text = getText(siteInfo.donationText, siteInfo.donationTextEn);
  const bankInfo = getText(siteInfo.donationBankInfo, siteInfo.donationBankInfoEn);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-950 border border-pink-700/50 text-pink-300 text-xs font-bold">
          <Heart className="w-3.5 h-3.5 fill-current" />
          <span>{t('donatePageBadge')}</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white">{title}</h1>
        <p className="text-sm text-slate-400 max-w-xl mx-auto">
          {t('donatePageSubtitle')}
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-slate-900 border border-purple-900/40 rounded-3xl p-6 sm:p-10 space-y-8 shadow-2xl">
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-pink-400" />
            <span>{t('donatePurpose')}</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed whitespace-pre-line">
            {text}
          </p>
        </div>

        {/* Impact List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-purple-900/40">
          <div className="p-4 bg-slate-950 rounded-2xl border border-purple-800/30 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-pink-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300">
              <strong className="text-white block text-sm">{t('impact1Title')}</strong>
              {t('impact1Desc')}
            </div>
          </div>
          <div className="p-4 bg-slate-950 rounded-2xl border border-purple-800/30 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300">
              <strong className="text-white block text-sm">{t('impact2Title')}</strong>
              {t('impact2Desc')}
            </div>
          </div>
        </div>

        {/* Donation Methods */}
        <div className="space-y-6 pt-6 border-t border-purple-900/40">
          <h3 className="text-base font-bold text-white">{t('donateMethods')}</h3>

          {/* Crowdfunding CTA */}
          {siteInfo.donationCrowdfundingUrl && (
            <div className="p-6 bg-gradient-to-r from-pink-950 to-purple-950 rounded-2xl border border-pink-600/40 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-white text-base">{t('crowdfundingTitle')}</h4>
                <p className="text-xs text-slate-300 mt-1">
                  {t('crowdfundingDesc')}
                </p>
              </div>
              <a
                href={siteInfo.donationCrowdfundingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-6 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-pink-600/30 transition-all flex-shrink-0"
              >
                <span>{t('viewProject')}</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}

          {/* Bank Transfer Info */}
          {bankInfo && (
            <div className="p-5 bg-slate-950 rounded-2xl border border-purple-900/40 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-purple-300">
                <Building className="w-4 h-4" />
                <span>{t('bankTransferTitle')}</span>
              </div>
              <p className="text-xs text-slate-300 font-mono bg-slate-900 p-3 rounded-xl border border-purple-800/30">
                {bankInfo}
              </p>
              <p className="text-[11px] text-slate-400">
                {t('bankTransferNotice')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}