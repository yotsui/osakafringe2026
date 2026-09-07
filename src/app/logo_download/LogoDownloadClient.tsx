'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';
import { Download, FileText, ArrowRight, CheckCircle2, ChevronRight, Mail } from 'lucide-react';

interface LogoItem {
  id: string;
  titleKey: string;
  enTitle: string;
  jaTitle: string;
  filename: string;
  src: string;
  aspectClass: string;
  dimensions: string;
}

export default function LogoDownloadClient() {
  const { language, t, getText } = useLanguage();

  const logoItems: LogoItem[] = [
    {
      id: 'period-01',
      titleKey: 'logoWithPeriod1',
      jaTitle: '開催期間あり 01（横型）',
      enTitle: 'With Dates 01 (Horizontal)',
      filename: 'osaka_fringe_logo_period_01.png',
      src: '/brand/osaka_fringe_logo_period_01.png',
      aspectClass: 'aspect-[322/64]',
      dimensions: '横型・日付入り',
    },
    {
      id: 'period-02',
      titleKey: 'logoWithPeriod2',
      jaTitle: '開催期間あり 02（縦型）',
      enTitle: 'With Dates 02 (Stacked)',
      filename: 'osaka_fringe_logo_period_02.png',
      src: '/brand/osaka_fringe_logo_period_02.png',
      aspectClass: 'aspect-[215/110]',
      dimensions: '縦型・日付入り',
    },
    {
      id: 'no-period-01',
      titleKey: 'logoNoPeriod1',
      jaTitle: '開催期間なし 01（横型）',
      enTitle: 'Without Dates 01 (Horizontal)',
      filename: 'osaka_fringe_logo_01.png',
      src: '/brand/osaka_fringe_logo_01.png',
      aspectClass: 'aspect-[385/78]',
      dimensions: '横型・日付なし',
    },
    {
      id: 'no-period-02',
      titleKey: 'logoNoPeriod2',
      jaTitle: '開催期間なし 02（縦型）',
      enTitle: 'Without Dates 02 (Stacked)',
      filename: 'osaka_fringe_logo_02.png',
      src: '/brand/osaka_fringe_logo_02.png',
      aspectClass: 'aspect-[215/110]',
      dimensions: '縦型・日付なし',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center gap-2 text-xs font-bold text-slate-500">
          <Link href="/" className="hover:text-slate-900 transition-colors">
            {t('navHome')}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900">{t('navBrandAssets')}</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 space-y-16">
        {/* Page Hero */}
        <section className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-50 border border-pink-200 text-[#E6007E] text-xs font-black tracking-widest uppercase">
            {t('logoDownloadHeroBadge')}
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              {t('logoDownloadHeroTitle')}
            </h1>
            <p className="text-lg sm:text-xl font-bold text-[#E6007E]">
              {t('logoDownloadHeroSubtitle')}
            </p>
          </div>
          <div className="w-16 h-1 bg-[#E6007E] rounded-full" />
          <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed whitespace-pre-line max-w-3xl">
            {t('logoDownloadHeroDesc')}
          </p>
        </section>

        {/* Section 1: PNG Logos */}
        <section className="space-y-8">
          <div className="border-b border-slate-200 pb-4">
            <div className="text-xs font-black text-[#E6007E] uppercase tracking-widest">
              01 / PNG FORMAT
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              {t('logoSectionTitle')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-bold mt-1">
              {t('logoSectionSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {logoItems.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-xs hover:border-pink-200 transition-colors"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-sm sm:text-base font-black text-slate-900">
                      {getText(item.jaTitle, item.enTitle)}
                    </h3>
                    <span className="text-xs font-bold text-slate-400">PNG</span>
                  </div>

                  {/* Logo Preview */}
                  <div className="w-full bg-slate-50/80 border border-slate-200/80 rounded-xl p-6 flex items-center justify-center min-h-[160px]">
                    <div className="relative w-full max-w-[280px] h-20 flex items-center justify-center">
                      <Image
                        src={item.src}
                        alt={getText(item.jaTitle, item.enTitle)}
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 100vw, 300px"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <a
                    href={item.src}
                    download={item.filename}
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-slate-900 hover:bg-[#E6007E] text-white text-xs font-black tracking-wider transition-colors duration-200 rounded-lg shadow-xs"
                  >
                    <Download className="w-4 h-4" />
                    <span>{t('downloadPng')}</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 2: PDF Pack */}
        <section className="space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <div className="text-xs font-black text-[#E6007E] uppercase tracking-widest">
              02 / PDF FORMAT
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              {t('pdfSectionTitle')}
            </h2>
          </div>

          <div className="bg-white border border-pink-100 rounded-2xl p-6 sm:p-10 shadow-xs space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="inline-flex items-center gap-2 text-xs font-black text-[#E6007E] uppercase tracking-wider">
                  <FileText className="w-4 h-4" />
                  <span>ALL-IN-ONE VECTOR PACKAGE</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  {language === 'en'
                    ? 'Official Logo Pack in PDF Format (4 Patterns)'
                    : 'PDF形式公式ロゴパック（全4パターン収録）'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                  {t('pdfSectionDesc')}
                </p>
              </div>

              <div className="shrink-0">
                <a
                  href="/brand/osaka_fringe_logo.pdf"
                  download="osaka_fringe_logo.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2.5 px-6 py-4 bg-[#E6007E] hover:bg-[#C5006C] text-white text-sm font-black tracking-wide transition-colors duration-200 rounded-lg shadow-xs"
                >
                  <Download className="w-4 h-4" />
                  <span>{t('downloadPdf')}</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Guidelines */}
        <section className="space-y-8">
          <div className="border-b border-slate-200 pb-4">
            <div className="text-xs font-black text-[#E6007E] uppercase tracking-widest">
              03 / USAGE GUIDELINES
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              {t('guidelinesTitle')}
            </h2>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 space-y-8 shadow-xs">
            {/* Policy */}
            <div className="space-y-3 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#E6007E]" />
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  {t('guidelinesPolicyTitle')}
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed pl-4 border-l-2 border-[#E6007E]/40">
                {t('guidelinesPolicyText')}
              </p>
            </div>

            {/* List of rules */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Rule 1 */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-white bg-slate-900 px-2 py-0.5 rounded">
                    01
                  </span>
                  <h4 className="text-sm font-black text-slate-900">
                    {t('guidelinesLogoTitle')}
                  </h4>
                </div>
                <ul className="space-y-2 text-xs text-slate-600 font-medium leading-relaxed">
                  <li className="flex items-start gap-1.5">
                    <span className="text-[#E6007E] font-bold">•</span>
                    <span>{t('guidelinesLogoPriority')}</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-[#E6007E] font-bold">•</span>
                    <span>{t('guidelinesLogoSize')}</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-[#E6007E] font-bold">•</span>
                    <span>{t('guidelinesLogoFormat')}</span>
                  </li>
                </ul>
              </div>

              {/* Rule 2 */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-white bg-slate-900 px-2 py-0.5 rounded">
                    02
                  </span>
                  <h4 className="text-sm font-black text-slate-900">
                    {t('guidelinesReviewTitle')}
                  </h4>
                </div>
                <div className="space-y-2 text-xs text-slate-600 font-medium leading-relaxed">
                  <p>{t('guidelinesReviewTiming')}</p>
                  <p className="font-bold text-slate-800 bg-slate-50 p-2 rounded border border-slate-100">
                    {t('guidelinesReviewPeriod')}
                  </p>
                  <p className="font-bold text-slate-800 bg-slate-50 p-2 rounded border border-slate-100">
                    {t('guidelinesReviewNoContact')}
                  </p>
                </div>
              </div>

              {/* Rule 3 */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-white bg-slate-900 px-2 py-0.5 rounded">
                    03
                  </span>
                  <h4 className="text-sm font-black text-slate-900">
                    {t('guidelinesScopeTitle')}
                  </h4>
                </div>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  {t('guidelinesScopeText')}
                </p>
              </div>
            </div>

            {/* Submission CTA */}
            <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/80 p-5 rounded-xl border border-slate-100">
              <div className="space-y-1">
                <p className="text-xs font-black text-slate-900">
                  {t('guidelinesContactPrompt')}
                </p>
                <p className="text-xs text-slate-600 font-medium">
                  {language === 'en'
                    ? 'For submission of designs or logo inquiries, please use our contact form.'
                    : 'ロゴ使用データの事前送付やお問い合わせは、事務局お問い合わせフォームよりご連絡ください。'}
                </p>
              </div>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-[#E6007E] text-white text-xs font-black tracking-wider transition-colors duration-200 rounded-lg shrink-0 shadow-xs"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>{t('guidelinesContactAction')}</span>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
