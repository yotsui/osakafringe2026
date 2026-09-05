'use client';

import React, { useState } from 'react';
import { SiteInfo } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import {
  Heart,
  Landmark,
  Sparkles,
  ShieldCheck,
  CreditCard,
  Lock,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle
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
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error redirecting to payment. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-50 border border-pink-200 text-[#E6007E] text-xs font-black uppercase tracking-wider">
          <Heart className="w-3.5 h-3.5" />
          <span>{t('donatePageBadge')}</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          {title || t('donatePageTitle')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-xl mx-auto">
          {t('donatePageSubtitle')}
        </p>
      </div>

      {/* Philosophy Card */}
      <div className="bg-gradient-to-r from-[#E6007E] via-rose-500 to-purple-600 rounded-3xl p-8 sm:p-12 text-white shadow-xl shadow-pink-500/15 space-y-6">
        <div className="max-w-3xl space-y-4">
          <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-black">
            MESSAGE
          </span>
          <h2 className="text-2xl sm:text-3xl font-black">
            {t('donateMessageHeader')}
          </h2>
          <p className="text-sm sm:text-base text-pink-100 leading-relaxed font-medium whitespace-pre-line">
            {text}
          </p>
        </div>
      </div>

      {/* Purpose of donations */}
      <div className="space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">{t('donatePurpose')}</h2>
          <p className="text-xs text-slate-500 font-medium">{t('donatePurposeSub')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-pink-100 rounded-3xl p-6 sm:p-8 space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-pink-50 border border-pink-200 flex items-center justify-center text-[#E6007E]">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-slate-900">{t('impact1Title')}</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">{t('impact1Desc')}</p>
          </div>

          <div className="bg-white border border-purple-100 rounded-3xl p-6 sm:p-8 space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-slate-900">{t('impact2Title')}</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">{t('impact2Desc')}</p>
          </div>
        </div>
      </div>

      {/* Online Donation via Stripe */}
      <div className="space-y-6">
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 text-xs font-black uppercase tracking-wider mb-1">
            <Lock className="w-3.5 h-3.5" />
            <span>INSTANT & SECURE</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">{t('onlineDonationTitle')}</h2>
          <p className="text-xs text-slate-500 font-medium">{t('onlineDonationSub')}</p>
        </div>

        <div className="max-w-3xl mx-auto bg-white border-2 border-pink-200 rounded-3xl p-6 sm:p-10 shadow-xl shadow-pink-500/5 space-y-8">
          <form onSubmit={handleCheckout} className="space-y-8">
            {/* Amount Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-black text-slate-900">
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
                      className={`relative flex items-center justify-center p-4 rounded-2xl border-2 font-black transition-all text-base sm:text-lg cursor-pointer ${
                        isSelected
                          ? 'border-[#E6007E] bg-pink-50/70 text-[#E6007E] shadow-sm shadow-pink-200'
                          : 'border-slate-200 bg-white hover:border-pink-200 text-slate-700 hover:bg-slate-50'
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
                  className={`relative flex items-center justify-center p-4 rounded-2xl border-2 font-black transition-all text-sm sm:text-base cursor-pointer ${
                    selectedAmount === 'custom'
                      ? 'border-[#E6007E] bg-pink-50/70 text-[#E6007E] shadow-sm shadow-pink-200'
                      : 'border-slate-200 bg-white hover:border-pink-200 text-slate-700 hover:bg-slate-50'
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
                      className="w-full pl-9 pr-4 py-3 rounded-xl border-2 border-pink-200 focus:border-[#E6007E] focus:ring-2 focus:ring-pink-100 outline-none font-bold text-slate-900 text-base"
                      required
                      autoFocus
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 pl-1 font-medium">
                    {t('customAmountMinError')}
                  </p>
                </div>
              )}
            </div>

            {/* Donor Information (Optional) */}
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Donor Name */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    {t('donorName')}
                  </label>
                  <input
                    type="text"
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    placeholder={t('donorNamePlaceholder')}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#E6007E] focus:ring-2 focus:ring-pink-100 outline-none text-xs sm:text-sm text-slate-800"
                  />
                </div>

                {/* Donor Email */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    {t('donorEmail')}
                  </label>
                  <input
                    type="email"
                    value={donorEmail}
                    onChange={(e) => setDonorEmail(e.target.value)}
                    placeholder={t('donorEmailPlaceholder')}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#E6007E] focus:ring-2 focus:ring-pink-100 outline-none text-xs sm:text-sm text-slate-800"
                  />
                </div>
              </div>

              {/* Donor Message */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  {t('donorMessage')}
                </label>
                <textarea
                  rows={3}
                  value={donorMessage}
                  onChange={(e) => setDonorMessage(e.target.value)}
                  placeholder={t('donorMessagePlaceholder')}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#E6007E] focus:ring-2 focus:ring-pink-100 outline-none text-xs sm:text-sm text-slate-800 resize-none"
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
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#E6007E] to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-black text-base sm:text-lg flex items-center justify-center gap-3 shadow-lg shadow-pink-500/25 transition-all transform active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
                      {t('proceedToPayment')}
                      {currentAmount > 0 && `（¥${currentAmount.toLocaleString()}）`}
                    </span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-slate-400 text-xs font-medium text-center">
                <Lock className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                <span>{t('securePaymentNotice')}</span>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Bank Transfer Section */}
      <div className="space-y-6 pt-6 border-t border-slate-200">
        <div className="text-center space-y-1">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">{t('bankTransferTitle')}</h2>
          <p className="text-xs text-slate-500 font-medium">{t('bankTransferSub')}</p>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 sm:p-10 space-y-6 shadow-xs max-w-3xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 text-white flex items-center justify-center shadow-sm">
              <Landmark className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">{t('bankTransferTitle')}</h3>
              <p className="text-xs text-slate-500">{t('bankTransferSub')}</p>
            </div>
          </div>

          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-xs">
            <pre className="text-xs sm:text-sm font-bold text-slate-800 whitespace-pre-wrap font-mono leading-relaxed">
              {bankInfo || `金融機関名：大阪シティ信用金庫\n支店名：阿倍野支店\n口座種別：普通預金\n口座番号：8173108\n口座名義：オオサカブンカフリンジキコウセツリツジュンビシツ\n（大阪文化フリンジ機構設立準備室）`}
            </pre>
          </div>

          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            {t('bankTransferNotice')}
          </p>
        </div>
      </div>
    </div>
  );
}