'use client';

import React, { useState } from 'react';
import { SiteInfo } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import {
  CreditCard,
  Lock,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Landmark
} from 'lucide-react';

interface DonateClientProps {
  siteInfo: SiteInfo;
}

const PRESET_AMOUNTS = [1000, 3000, 5000, 10000, 30000];

export default function DonateClient({ siteInfo }: DonateClientProps) {
  const { t, getText, language } = useLanguage();

  const title = getText(siteInfo.donationTitle, siteInfo.donationTitleEn);
  const text = getText(siteInfo.donationText, siteInfo.donationTextEn);
  const bankInfo = getText(siteInfo.donationBankInfo, siteInfo.donationBankInfoEn);

  // Form State
  const [selectedAmount, setSelectedAmount] = useState<number | 'custom'>(3000);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [donorName, setDonorName] = useState<string>('');
  const [donorEmail, setDonorEmail] = useState<string>('');
  const [donorMessage, setDonorMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Calculate final amount
  const getFinalAmount = (): number => {
    if (selectedAmount === 'custom') {
      const parsed = parseInt(customAmount, 10);
      return isNaN(parsed) ? 0 : parsed;
    }
    return selectedAmount;
  };

  const currentAmount = getFinalAmount();

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (currentAmount < 500) {
      setErrorMsg(t('customAmountMinError'));
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/donate/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: currentAmount,
          donorName,
          donorEmail,
          donorMessage,
          locale: language,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.url) {
        throw new Error(data.error || 'Failed to initiate checkout session');
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : 'Error redirecting to payment. Please try again.';
      setErrorMsg(msg);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16 sm:space-y-24 text-slate-900">
      
      {/* 1. Header & Lead */}
      <section className="space-y-8">
        <div className="border-l-4 border-[#E6007E] pl-4 sm:pl-6 space-y-3 py-1">
          <div className="text-xs font-black tracking-widest text-[#E6007E] uppercase">
            {t('donateSectionBadge')}
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight whitespace-pre-line">
            {title || t('donatePageTitle')}
          </h1>
        </div>

        <div className="bg-slate-50/60 border border-slate-200/80 rounded-2xl p-6 sm:p-10 space-y-4">
          <p className="text-sm sm:text-base text-slate-700 leading-relaxed sm:leading-loose whitespace-pre-line font-medium">
            {text || t('donatePageSubtitle')}
          </p>
        </div>
      </section>

      {/* 2. History & Contemporary Reconstruction (1980s — 1990s) */}
      <section className="border-t border-slate-200 pt-12 sm:pt-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-4 space-y-2">
            <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tighter">
              {t('historyTypography')}
            </div>
            <div className="h-1 w-12 bg-[#E6007E]" />
            <p className="text-xs text-slate-500 font-bold tracking-widest uppercase pt-1">
              OSAKA CULTURAL MEMORY
            </p>
          </div>
          <div className="lg:col-span-8 space-y-4">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              {t('historyTitle')}
            </h2>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed sm:leading-loose whitespace-pre-line font-medium">
              {t('historyText')}
            </p>
          </div>
        </div>
      </section>

      {/* 3. Message / Philosophy */}
      <section className="border-t border-slate-200 pt-12 sm:pt-16 space-y-6">
        <div className="space-y-2">
          <div className="text-xs font-black tracking-widest text-[#E6007E] uppercase">
            {t('messageBadge')}
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-snug whitespace-pre-line">
            {t('donateMessageHeader')}
          </h2>
        </div>
        <div className="prose max-w-none text-sm sm:text-base text-slate-700 leading-relaxed sm:leading-loose whitespace-pre-line font-medium">
          {t('donateMessageBody')}
        </div>
      </section>

      {/* 4. Institutional Dialogue / Sustainable Environment */}
      <section className="bg-slate-900 text-white rounded-2xl p-6 sm:p-10 space-y-6">
        <div className="space-y-2">
          <div className="text-xs font-black tracking-widest text-pink-400 uppercase">
            {t('institutionBadge')}
          </div>
          <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight leading-snug whitespace-pre-line">
            {t('institutionTitle')}
          </h2>
        </div>
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed sm:leading-loose whitespace-pre-line font-medium">
          {t('institutionBody')}
        </p>
      </section>

      {/* 5. 4 Core Support Impacts (01 - 04) */}
      <section className="space-y-8 pt-4">
        <div className="space-y-2 border-b border-slate-200 pb-4">
          <div className="text-xs font-black tracking-widest text-[#E6007E] uppercase">
            {t('donatePurposeBadge')}
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            {t('donatePurpose')}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10">
          
          {/* 01 */}
          <div className="border border-slate-200 rounded-xl p-6 sm:p-8 bg-white space-y-4">
            <div className="flex items-baseline justify-between border-b border-slate-100 pb-3">
              <span className="text-3xl sm:text-4xl font-black text-[#E6007E]">
                {t('impact1Num')}
              </span>
              <span className="text-xs font-black text-slate-400 tracking-wider">
                {t('impact1Eng')}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
              {t('impact1Title')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line font-medium">
              {t('impact1Desc')}
            </p>
          </div>

          {/* 02 */}
          <div className="border border-slate-200 rounded-xl p-6 sm:p-8 bg-white space-y-4">
            <div className="flex items-baseline justify-between border-b border-slate-100 pb-3">
              <span className="text-3xl sm:text-4xl font-black text-[#E6007E]">
                {t('impact2Num')}
              </span>
              <span className="text-xs font-black text-slate-400 tracking-wider">
                {t('impact2Eng')}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
              {t('impact2Title')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line font-medium">
              {t('impact2Desc')}
            </p>
          </div>

          {/* 03 */}
          <div className="border border-slate-200 rounded-xl p-6 sm:p-8 bg-white space-y-4">
            <div className="flex items-baseline justify-between border-b border-slate-100 pb-3">
              <span className="text-3xl sm:text-4xl font-black text-[#E6007E]">
                {t('impact3Num')}
              </span>
              <span className="text-xs font-black text-slate-400 tracking-wider">
                {t('impact3Eng')}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
              {t('impact3Title')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line font-medium">
              {t('impact3Desc')}
            </p>
          </div>

          {/* 04 */}
          <div className="border border-slate-200 rounded-xl p-6 sm:p-8 bg-white space-y-4">
            <div className="flex items-baseline justify-between border-b border-slate-100 pb-3">
              <span className="text-3xl sm:text-4xl font-black text-[#E6007E]">
                {t('impact4Num')}
              </span>
              <span className="text-xs font-black text-slate-400 tracking-wider">
                {t('impact4Eng')}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
              {t('impact4Title')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line font-medium">
              {t('impact4Desc')}
            </p>
          </div>

        </div>
      </section>

      {/* 6. Pre-Form Message */}
      <section className="border-t border-slate-200 pt-12 sm:pt-16 space-y-4">
        <div className="text-xs font-black tracking-widest text-[#E6007E] uppercase">
          {t('preFormBadge')}
        </div>
        <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-snug whitespace-pre-line">
          {t('preFormTitle')}
        </h2>
        <p className="text-sm sm:text-base text-slate-700 leading-relaxed sm:leading-loose whitespace-pre-line font-medium">
          {t('preFormBody')}
        </p>
      </section>

      {/* 7. Online Donation Form via Stripe */}
      <section className="bg-white border-2 border-slate-900 rounded-2xl p-6 sm:p-10 space-y-8">
        <div className="space-y-1">
          <h3 className="text-xl sm:text-2xl font-black text-slate-900">
            {t('onlineDonationTitle')}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
            {t('onlineDonationSub')}
          </p>
        </div>

        <form onSubmit={handleCheckout} className="space-y-8">
          {/* Amount Selection */}
          <div className="space-y-3">
            <label className="block text-xs font-black text-slate-900 uppercase tracking-wider">
              {t('selectAmount')} <span className="text-[#E6007E]">*</span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {PRESET_AMOUNTS.map((amt) => {
                const isSelected = selectedAmount === amt;
                return (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      setSelectedAmount(amt);
                      setCustomAmount('');
                      setErrorMsg(null);
                    }}
                    className={`relative flex items-center justify-center p-4 rounded-xl border-2 font-black transition-all text-base sm:text-lg cursor-pointer ${
                      isSelected
                        ? 'border-[#E6007E] bg-pink-50/60 text-[#E6007E]'
                        : 'border-slate-200 bg-white hover:border-slate-400 text-slate-800'
                    }`}
                  >
                    ¥{amt.toLocaleString()}
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-[#E6007E] absolute top-2 right-2" />
                    )}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => {
                  setSelectedAmount('custom');
                  setErrorMsg(null);
                }}
                className={`relative flex items-center justify-center p-4 rounded-xl border-2 font-black transition-all text-sm sm:text-base cursor-pointer ${
                  selectedAmount === 'custom'
                    ? 'border-[#E6007E] bg-pink-50/60 text-[#E6007E]'
                    : 'border-slate-200 bg-white hover:border-slate-400 text-slate-800'
                }`}
              >
                {t('customAmount')}
                {selectedAmount === 'custom' && (
                  <CheckCircle2 className="w-4 h-4 text-[#E6007E] absolute top-2 right-2" />
                )}
              </button>
            </div>

            {/* Custom Amount Input Field */}
            {selectedAmount === 'custom' && (
              <div className="pt-2">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-lg">
                    ¥
                  </span>
                  <input
                    type="number"
                    min={500}
                    step={100}
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value);
                      setErrorMsg(null);
                    }}
                    placeholder={t('customAmountPlaceholder')}
                    className="w-full pl-9 pr-4 py-3 rounded-xl border-2 border-[#E6007E] outline-none font-bold text-slate-900 text-base"
                    required
                    autoFocus
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1 pl-1 font-medium">
                  {t('customAmountMinError')}
                </p>
              </div>
            )}
          </div>

          {/* Donor Information (Optional) */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Donor Name */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-black text-slate-700">
                    {t('donorName')}
                  </label>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {t('donorNameHint')}
                  </span>
                </div>
                <input
                  type="text"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  placeholder={t('donorNamePlaceholder')}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#E6007E] outline-none text-xs sm:text-sm text-slate-800"
                />
              </div>

              {/* Donor Email */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-black text-slate-700">
                    {t('donorEmail')}
                  </label>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {t('donorEmailHint')}
                  </span>
                </div>
                <input
                  type="email"
                  value={donorEmail}
                  onChange={(e) => setDonorEmail(e.target.value)}
                  placeholder={t('donorEmailPlaceholder')}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#E6007E] outline-none text-xs sm:text-sm text-slate-800"
                />
              </div>
            </div>

            {/* Donor Message */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-slate-700">
                {t('donorMessage')}
              </label>
              <textarea
                rows={3}
                value={donorMessage}
                onChange={(e) => setDonorMessage(e.target.value)}
                placeholder={t('donorMessagePlaceholder')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#E6007E] outline-none text-xs sm:text-sm text-slate-800 resize-none"
              />
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="flex items-center gap-2 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Submit Button */}
          <div className="space-y-3 pt-2">
            <button
              type="submit"
              disabled={loading || currentAmount < 500}
              className="w-full py-4 px-6 rounded-xl bg-[#E6007E] hover:bg-[#c4006b] text-white font-black text-base sm:text-lg flex items-center justify-center gap-3 transition-all transform active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{t('processing')}</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  <span>
                    {language === 'en' ? (
                      `Support Osaka Fringe — ¥${currentAmount.toLocaleString()}`
                    ) : (
                      `この金額でOsaka Fringeを支える　¥${currentAmount.toLocaleString()}`
                    )}
                  </span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-slate-500 text-xs font-medium text-center">
              <Lock className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
              <span>{t('securePaymentNotice')}</span>
            </div>
          </div>
        </form>
      </section>

      {/* 8. Bank Transfer Section */}
      <section className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-10 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
            <Landmark className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900">
              {t('bankTransferTitle')}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              {t('bankTransferSub')}
            </p>
          </div>
        </div>

        <div className="p-6 rounded-xl bg-white border border-slate-200 space-y-3">
          <pre className="text-xs sm:text-sm font-bold text-slate-800 whitespace-pre-wrap font-mono leading-relaxed">
            {bankInfo || `金融機関名：大阪シティ信用金庫\n支店名：阿倍野支店\n口座種別：普通預金\n口座番号：8173108\n口座名義：オオサカブンカフリンジキコウセツリツジュンビシツ\n（大阪文化フリンジ機構設立準備室）`}
          </pre>
        </div>

        <p className="text-xs text-slate-500 font-medium leading-relaxed whitespace-pre-line">
          {t('bankTransferNotice')}
        </p>
      </section>

      {/* 9. Page Closing Statement */}
      <section className="border-t border-slate-200 pt-12 sm:pt-16 pb-8 space-y-6 text-center max-w-2xl mx-auto">
        <div className="text-xs font-black tracking-widest text-[#E6007E] uppercase">
          {t('closingBadge')}
        </div>
        <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-snug whitespace-pre-line">
          {t('closingTitle')}
        </h2>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed sm:leading-loose whitespace-pre-line font-medium text-left sm:text-center">
          {t('closingBody')}
        </p>
        <div className="pt-4 text-xs font-black tracking-widest text-slate-400 uppercase">
          {t('closingSign')}
        </div>
      </section>

    </div>
  );
}