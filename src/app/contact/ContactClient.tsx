'use client';

import React, { useState } from 'react';
import { SiteInfo } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { Mail, Send, CheckCircle2, AlertCircle, RefreshCw, MessageSquare } from 'lucide-react';

interface ContactClientProps {
  siteInfo: SiteInfo;
}

export default function ContactClient({ siteInfo }: ContactClientProps) {
  const { t } = useLanguage();

  const [formState, setFormState] = useState<{
    name: string;
    email: string;
    type: string;
    subject: string;
    message: string;
  }>({
    name: '',
    email: '',
    type: 'general',
    subject: '',
    message: '',
  });

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const endpoint = 'https://formspree.io/f/mrpgbnkg';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormState({
      ...formState,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage('');

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          name: formState.name,
          email: formState.email,
          inquiryType: formState.type,
          subject: formState.subject || '（未入力）',
          message: formState.message,
          _subject: `[Osaka Fringe 2026] お問い合わせ: ${formState.subject || formState.name}`,
        }),
      });

      if (response.ok) {
        setStatus('success');
        setFormState({
          name: '',
          email: '',
          type: 'general',
          subject: '',
          message: '',
        });
      } else {
        const data = await response.json();
        setStatus('error');
        if (data.errors && data.errors.length > 0) {
          setErrorMessage(data.errors.map((err: { message: string }) => err.message).join(', '));
        } else {
          setErrorMessage(t('formErrorDesc'));
        }
      }
    } catch (err: unknown) {
      console.error(err);
      setStatus('error');
      setErrorMessage(t('formErrorDesc'));
    }
  };

  const handleReset = () => {
    setStatus('idle');
    setErrorMessage('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-50 border border-pink-200 text-pink-600 text-xs font-black uppercase tracking-wider">
          <Mail className="w-3.5 h-3.5" />
          <span>{t('contactPageBadge')}</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">{t('contactPageTitle')}</h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-xl mx-auto">
          {t('contactPageSubtitle')}
        </p>
      </div>

      <div className="bg-white border border-pink-100 rounded-3xl p-6 sm:p-12 shadow-sm space-y-8">
        {/* Info Box */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-pink-50/50 rounded-2xl border border-pink-100">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-6 h-6 text-pink-600 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-black text-slate-900">{t('contactFormTitle')}</h3>
              <p className="text-xs text-slate-500 font-medium">{t('contactFormDesc')}</p>
            </div>
          </div>
          <div className="text-xs text-slate-600 font-bold flex items-center gap-2 self-start sm:self-center">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{siteInfo.contactEmail || 'info@osakafringe.com'}</span>
          </div>
        </div>

        {/* Formspree State Feedback or Form */}
        {status === 'success' ? (
          <div className="py-12 px-6 text-center space-y-6 bg-emerald-50/50 rounded-2xl border border-emerald-200 animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-600 mx-auto shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-2 max-w-md mx-auto">
              <h3 className="text-2xl font-black text-slate-900">{t('formSuccessTitle')}</h3>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                {t('formSuccessDesc')}
              </p>
            </div>
            <button
              onClick={handleReset}
              className="py-3 px-6 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-black text-xs transition-colors shadow-sm"
            >
              {t('formSendAnother')}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {status === 'error' && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-800 text-xs font-bold">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-500 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-black">{t('formErrorTitle')}</p>
                  <p>{errorMessage || t('formErrorDesc')}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Name */}
              <div className="space-y-2">
                <label htmlFor="name" className="text-xs font-black text-slate-700 flex items-center justify-between">
                  <span>{t('formName')}</span>
                  <span className="text-[10px] bg-pink-50 text-pink-600 border border-pink-200 px-2 py-0.5 rounded font-black">
                    {t('formRequired')}
                  </span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formState.name}
                  onChange={handleChange}
                  placeholder="山田 太郎 / Taro Yamada"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all shadow-2xs"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-xs font-black text-slate-700 flex items-center justify-between">
                  <span>{t('formEmail')}</span>
                  <span className="text-[10px] bg-pink-50 text-pink-600 border border-pink-200 px-2 py-0.5 rounded font-black">
                    {t('formRequired')}
                  </span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formState.email}
                  onChange={handleChange}
                  placeholder="example@osakafringe.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all shadow-2xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Inquiry Type */}
              <div className="space-y-2">
                <label htmlFor="type" className="text-xs font-black text-slate-700 flex items-center justify-between">
                  <span>{t('formType')}</span>
                  <span className="text-[10px] bg-pink-50 text-pink-600 border border-pink-200 px-2 py-0.5 rounded font-black">
                    {t('formRequired')}
                  </span>
                </label>
                <select
                  id="type"
                  name="type"
                  value={formState.type}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all shadow-2xs"
                >
                  <option value="general">{t('formTypeGeneral')}</option>
                  <option value="shows">{t('formTypeShow')}</option>
                  <option value="venue_partner">{t('formTypeVenue')}</option>
                  <option value="artist_call">{t('formTypeArtist')}</option>
                  <option value="press_media">{t('formTypeMedia')}</option>
                  <option value="volunteer">{t('formTypeVolunteer')}</option>
                  <option value="other">{t('formTypeOther')}</option>
                </select>
              </div>

              {/* Subject */}
              <div className="space-y-2">
                <label htmlFor="subject" className="text-xs font-black text-slate-700 flex items-center justify-between">
                  <span>{t('formSubject')}</span>
                  <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-bold">
                    {t('formOptional')}
                  </span>
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formState.subject}
                  onChange={handleChange}
                  placeholder="件名・タイトルをご記入ください"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all shadow-2xs"
                />
              </div>
            </div>

            {/* Message */}
            <div className="space-y-2">
              <label htmlFor="message" className="text-xs font-black text-slate-700 flex items-center justify-between">
                <span>{t('formMessage')}</span>
                <span className="text-[10px] bg-pink-50 text-pink-600 border border-pink-200 px-2 py-0.5 rounded font-black">
                  {t('formRequired')}
                </span>
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={6}
                value={formState.message}
                onChange={handleChange}
                placeholder="お問い合わせ内容を詳しくご記入ください..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all shadow-2xs leading-relaxed"
              ></textarea>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={status === 'submitting'}
                className="w-full py-4 px-8 rounded-2xl bg-gradient-to-r from-pink-600 via-rose-500 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-black text-sm tracking-wide shadow-lg shadow-pink-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {status === 'submitting' ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{t('formSending')}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>{t('formSubmit')}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}