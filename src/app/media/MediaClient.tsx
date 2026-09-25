'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { 
  Newspaper, 
  Ticket, 
  Mail, 
  ArrowRight, 
  CheckCircle2, 
  ShieldAlert,
  HelpCircle
} from 'lucide-react';

export default function MediaClient() {
  const { t, language } = useLanguage();

  const inquiryItems = language === 'en'
    ? [
        'Media outlet / organization name',
        'Contact person name & email / phone',
        'Preferred date, time, and venue',
        'Performance / event title',
        'Coverage plan / interview details',
        'Photography or audio/video recording requirements',
        'Expected publication or broadcast date',
      ]
    : [
        '媒体名・会社名',
        '担当者名・ご連絡先（メール・電話番号）',
        '取材希望日時・会場名',
        '対象公演名・アーティスト名',
        '取材内容・インタビュー希望の有無',
        '撮影・録音・持ち込み機材の有無',
        '掲載・放送予定日',
      ];

  return (
    <div className="min-h-screen bg-[#fef9fc] py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Editorial Header */}
        <div className="border-l-4 border-[#E6007E] pl-4 sm:pl-6 space-y-2 py-2">
          <div className="text-xs font-black tracking-widest text-[#E6007E] uppercase flex items-center gap-2">
            <Newspaper className="w-4 h-4" />
            <span>{t('mediaPageBadge')}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            {t('mediaPageTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-2xl leading-relaxed">
            {t('mediaPageSubtitle')}
          </p>
        </div>

        {/* Introduction Hero Box (White background) */}
        <div className="bg-white border border-pink-100 rounded-3xl p-6 sm:p-10 shadow-xs space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-50 border border-pink-200 text-[#E6007E] text-xs font-black tracking-wider uppercase">
            INTRODUCTION
          </div>
          <p className="text-base sm:text-lg text-slate-800 leading-relaxed font-bold">
            {t('mediaIntroText')}
          </p>
        </div>

        {/* Venue Guidelines Section */}
        <div className="space-y-6">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              {language === 'en' ? 'Guidelines by Venue Type' : '会場タイプ別の取材案内'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. Free-admission venues */}
            <div className="bg-white border border-slate-200/90 hover:border-pink-300 rounded-2xl p-6 shadow-2xs transition-all space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <h3 className="text-lg font-black text-slate-900 leading-snug">
                  {t('mediaFreeVenueTitle')}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                  {t('mediaFreeVenueDesc')}
                </p>
              </div>
              <div className="pt-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[11px] font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{language === 'en' ? 'General Admission' : '原則取材可能'}</span>
                </span>
              </div>
            </div>

            {/* 2. Commercial venues and partner events */}
            <div className="bg-white border border-slate-200/90 hover:border-pink-300 rounded-2xl p-6 shadow-2xs transition-all space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <h3 className="text-lg font-black text-slate-900 leading-snug">
                  {t('mediaCommercialVenueTitle')}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                  {t('mediaCommercialVenueDesc')}
                </p>
              </div>
              <div className="pt-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 text-[11px] font-bold">
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>{language === 'en' ? 'Advance Coordination Required' : '事前問い合わせ必須'}</span>
                </span>
              </div>
            </div>

            {/* 3. Paid venues */}
            <div className="bg-white border border-slate-200/90 hover:border-pink-300 rounded-2xl p-6 shadow-2xs transition-all space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <h3 className="text-lg font-black text-slate-900 leading-snug">
                  {t('mediaPaidVenueTitle')}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                  {t('mediaPaidVenueDesc')}
                </p>
              </div>
              <div className="pt-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 text-[11px] font-bold">
                  <Ticket className="w-3.5 h-3.5" />
                  <span>{language === 'en' ? 'Media Pass on Request' : 'パス発行要相談'}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Inquiries & Contact Card */}
        <div className="bg-white border border-pink-100 rounded-3xl p-6 sm:p-10 shadow-sm space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#E6007E]/10 text-[#E6007E] flex items-center justify-center">
                <Mail className="w-4 h-4" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                {t('mediaInquiryTitle')}
              </h2>
            </div>
            <p className="text-sm text-slate-600 font-medium leading-relaxed">
              {t('mediaInquiryDesc')}
            </p>
          </div>

          {/* Checklist of required items */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-3">
            <div className="text-xs font-black text-slate-700 uppercase tracking-wider">
              {language === 'en' ? 'Information to Include in Your Inquiry' : 'お問い合わせ時にお知らせいただきたい項目'}
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm font-bold text-slate-700">
              {inquiryItems.map((item, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E6007E] shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Action Button */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
            <p className="text-xs text-slate-500 font-medium">
              {language === 'en'
                ? 'Please use the official contact form to submit your inquiry.'
                : '取材のお申し込み・ご相談は、下記のお問い合わせフォームよりお送りください。'}
            </p>
            <Link
              href="/contact#contact-form"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[#E6007E] hover:bg-[#c4006b] text-white font-black text-sm shadow-md shadow-pink-500/20 transition-all group shrink-0"
            >
              <span>{t('mediaContactBtn')}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Safety & Compliance Notice */}
        <div className="bg-pink-50/50 border border-pink-100 rounded-2xl p-5 flex items-start gap-3.5 text-slate-700">
          <ShieldAlert className="w-5 h-5 text-[#E6007E] shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs leading-relaxed font-medium">
            <p className="font-bold text-slate-900">
              {language === 'en' ? 'Important Notice' : '取材時の注意事項'}
            </p>
            <p className="text-slate-600">
              {t('mediaImportantNotes')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
