'use client';

import React, { useState } from 'react';
import { SiteInfo, DonationStoryKey, DonationStory } from '@/types';
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
  const bankNote = getText(siteInfo.donationBankNote, siteInfo.donationBankNoteEn);

  // Story Map for dynamic CMS sections
  const storyMap = new Map<string, DonationStory>(
    (siteInfo.donationStories ?? []).map((story) => [story.sectionKey, story])
  );

  const getStory = (key: DonationStoryKey) => {
    const s = storyMap.get(key);
    if (!s) return { title: '', text: '' };
    const storyTitle = language === 'en' ? (s.titleEn || s.title) : s.title;
    const storyText = language === 'en' ? (s.textEn || s.text) : s.text;
    return { title: storyTitle, text: storyText };
  };

  const historyStory = getStory('HISTORY');
  const messageStory = getStory('MESSAGE');
  const envStory = getStory('ENVIRONMENT');
  const preformStory = getStory('PREFORM');
  const closingStory = getStory('CLOSING');

  const impacts = siteInfo.donationImpacts ?? [];

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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-14 sm:space-y-20 text-slate-900">
      
      {/* 1. Header & Lead */}
      <section className="space-y-6">
        <div className="border-l-4 border-[#E6007E] pl-4 sm:pl-6 space-y-2 py-1">
          <div className="text-xs font-black tracking-widest text-[#E6007E] uppercase">
            {t('donateSectionBadge')}
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight whitespace-pre-line">
            {title || (language === 'en' ? 'Creating a City Where the Next Generation of Artists Can Grow.' : '次の表現者が、大阪から育つ土壌をつくる。')}
          </h1>
        </div>

        {text && (
          <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-6 sm:p-8">
            <p className="text-sm sm:text-base text-slate-700 leading-[1.7] whitespace-pre-line font-medium">
              {text}
            </p>
          </div>
        )}
      </section>

      {/* 2. History & Contemporary Reconstruction (1980s — 1990s) */}
      {(historyStory.title || historyStory.text) && (
        <section className="border-t border-slate-200 pt-10 sm:pt-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            <div className="lg:col-span-4 space-y-1.5">
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tighter">
                {t('historyTypography')}
              </div>
              <div className="h-1 w-10 bg-[#E6007E]" />
              <p className="text-xs text-slate-500 font-bold tracking-widest uppercase pt-1">
                {t('historyBadge')}
              </p>
            </div>
            <div className="lg:col-span-8 space-y-4">
              {historyStory.title && (
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  {historyStory.title}
                </h2>
              )}
              {historyStory.text && (
                <p className="text-sm sm:text-base text-slate-700 leading-[1.7] whitespace-pre-line font-medium">
                  {historyStory.text}
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 3. Message / Philosophy */}
      {(messageStory.title || messageStory.text) && (
        <section className="border-t border-slate-200 pt-10 sm:pt-12 space-y-4">
          <div className="space-y-1.5">
            <div className="text-xs font-black tracking-widest text-[#E6007E] uppercase">
              {t('messageBadge')}
            </div>
            {messageStory.title && (
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug whitespace-pre-line">
                {messageStory.title}
              </h2>
            )}
          </div>
          {messageStory.text && (
            <div className="prose max-w-none text-sm sm:text-base text-slate-700 leading-[1.7] whitespace-pre-line font-medium">
              {messageStory.text}
            </div>
          )}
        </section>
      )}

      {/* 4. Institutional Dialogue / Sustainable Environment */}
      {(envStory.title || envStory.text) && (
        <section className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 space-y-4">
          <div className="space-y-1.5">
            <div className="text-xs font-black tracking-widest text-pink-400 uppercase">
              {t('institutionBadge')}
            </div>
            {envStory.title && (
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug whitespace-pre-line">
                {envStory.title}
              </h2>
            )}
          </div>
          {envStory.text && (
            <p className="text-sm sm:text-base text-slate-300 leading-[1.7] whitespace-pre-line font-medium">
              {envStory.text}
            </p>
          )}
        </section>
      )}

      {/* 5. 4 Core Support Impacts (01 - 04) */}
      {impacts.length > 0 && (
        <section className="space-y-6 pt-2">
          <div className="space-y-1.5 border-b border-slate-200 pb-3">
            <div className="text-xs font-black tracking-widest text-[#E6007E] uppercase">
              {t('donatePurposeBadge')}
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              {t('donatePurpose')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {impacts.map((impact, index) => {
              const numStr = String(index + 1).padStart(2, '0');
              const impactTitle = language === 'en' ? (impact.titleEn || impact.title) : impact.title;
              const impactText = language === 'en' ? (impact.textEn || impact.text) : impact.text;

              return (
                <div key={impact.label || index} className="border border-slate-200 rounded-xl p-5 sm:p-7 bg-white space-y-3.5 shadow-2xs">
                  <div className="flex items-baseline justify-between border-b border-slate-100 pb-2.5">
                    <span className="text-2xl sm:text-3xl font-black text-[#E6007E]">
                      {numStr}
                    </span>
                    {impact.label && (
                      <span className="text-xs font-black text-slate-400 tracking-wider uppercase">
                        {impact.label}
                      </span>
                    )}
                  </div>
                  {impactTitle && (
                    <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                      {impactTitle}
                    </h3>
                  )}
                  {impactText && (
                    <p className="text-xs sm:text-sm text-slate-600 leading-[1.7] whitespace-pre-line font-medium">
                      {impactText}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 6. Pre-Form Message */}
      {(preformStory.title || preformStory.text) && (
        <section className="border-t border-slate-200 pt-10 sm:pt-12 space-y-4">
          <div className="text-xs font-black tracking-widest text-[#E6007E] uppercase">
            {t('preFormBadge')}
          </div>
          {preformStory.title && (
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug whitespace-pre-line">
              {preformStory.title}
            </h2>
          )}
          {preformStory.text && (
            <p className="text-sm sm:text-base text-slate-700 leading-[1.7] whitespace-pre-line font-medium">
              {preformStory.text}
            </p>
          )}
        </section>
      )}

      {/* 7. Online Donation Form via Stripe */}
      <section className="bg-white border-2 border-slate-900 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="space-y-1">
          <h3 className="text-xl sm:text-2xl font-black text-slate-900">
            {t('onlineDonationTitle')}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
            {t('onlineDonationSub')}
          </p>
        </div>

        <form onSubmit={handleCheckout} className="space-y-6">
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
                    className={`relative flex items-center justify-center p-3.5 rounded-xl border-2 font-black transition-all text-base sm:text-lg cursor-pointer ${
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
                className={`relative flex items-center justify-center p-3.5 rounded-xl border-2 font-black transition-all text-sm sm:text-base cursor-pointer ${
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
      <section className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-5">
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

        <div className="p-5 sm:p-6 rounded-xl bg-white border border-slate-200 space-y-3">
          <pre className="text-xs sm:text-sm font-bold text-slate-800 whitespace-pre-wrap font-mono leading-relaxed">
            {bankInfo || `金融機関名：大阪シティ信用金庫\n支店名：阿倍野支店\n口座種別：普通預金\n口座番号：8173108\n口座名義：オオサカブンカフリンジキコウセツリツジュンビシツ\n（大阪文化フリンジ機構設立準備室）`}
          </pre>
        </div>

        <p className="text-xs text-slate-500 font-medium leading-[1.7] whitespace-pre-line">
          {bankNote || t('bankTransferNotice')}
        </p>
      </section>

      {/* 9. Page Closing Statement */}
      {(closingStory.title || closingStory.text) && (
        <section className="border-t border-slate-200 pt-10 sm:pt-12 pb-6 space-y-5 text-center max-w-2xl mx-auto">
          <div className="text-xs font-black tracking-widest text-[#E6007E] uppercase">
            {t('closingBadge')}
          </div>
          {closingStory.title && (
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug whitespace-pre-line">
              {closingStory.title}
            </h2>
          )}
          {closingStory.text && (
            <p className="text-sm sm:text-base text-slate-600 leading-[1.7] whitespace-pre-line font-medium text-left sm:text-center">
              {closingStory.text}
            </p>
          )}
          <div className="pt-2 text-xs font-black tracking-widest text-slate-400 uppercase">
            {t('closingSign')}
          </div>
        </section>
      )}

    </div>
  );
}