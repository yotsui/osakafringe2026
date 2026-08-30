'use client';

import React, { useState } from 'react';
import { SiteInfo } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { Mail, Send, CheckCircle2, AlertCircle, RefreshCw, MessageSquare, PhoneCall } from 'lucide-react';

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
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950 border border-purple-700/50 text-purple-300 text-xs font-bold">
          <Mail className="w-3.5 h-3.5" />
          <span>{t('contactPageBadge')}</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white">{t('contactPageTitle')}</h1>
        <p className="text-sm text-slate-400 max-w-xl mx-auto">
          {t('contactPageSubtitle')}
        </p>
      </div>

      <div className="bg-slate-900 border border-purple-900/40 rounded-3xl p-6 sm:p-12 shadow-2xl space-y-8">
        {/* Info Box */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-slate-950 rounded-2xl border border-purple-800/40">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-6 h-6 text-pink-400 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-white">{t('contactFormTitle')}</h3>
              <p className="text-xs text-slate-400">{t('contactFormDesc')}</p>
            </div>
          </div>
          <div className="text-xs text-slate-400 flex items-center gap-2 self-start sm:self-center">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{siteInfo.contactEmail || 'info@osakafringe.com'}</span>
          </div>
        </div>

        {/* Formspree State Feedback or Form */}
        {status === 'success' ? (
          <div className="py-12 px-6 text-center space-y-6 bg-slate-950/80 rounded-2xl border border-emerald-500/30 animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 rounded-full bg-emerald-950 border border-emerald-500/50 flex items-center justify-center text-emerald-400 mx-auto shadow-lg shadow-emerald-900/30">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-2 max-w-md mx-auto">
              <h3 className="text-2xl font-black text-white">{t('formSuccessTitle')}</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                {t('formSuccessDesc')}
              </p>
            </div>
            <button
              onClick={handleReset}
              className="py-3 px-6 rounded-xl bg-purple-900/50 hover:bg-purple-800 border border-purple-600/50 text-white font-bold text-xs transition-colors"
            >
              {t('formSendAnother')}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {status === 'error' && (
              <div className="p-4 bg-rose-950/80 border border-rose-700/50 rounded-xl flex items-start gap-3 text-rose-200 text-xs">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold">{t('formErrorTitle')}</p>
                  <p>{errorMessage || t('formErrorDesc')}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Name */}
              <div className="space-y-2">
                <label htmlFor="name" className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>{t('formName')}</span>
                  <span className="text-[10px] bg-pink-950 text-pink-400 border border-pink-700/50 px-2 py-0.5 rounded font-bold">
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
                  className="w-full bg-slate-950 border border-purple-900/50 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-colors"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>{t('formEmail')}</span>
                  <span className="text-[10px] bg-pink-950 text-pink-400 border border-pink-700/50 px-2 py-0.5 rounded font-bold">
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
                  className="w-full bg-slate-950 border border-purple-900/50 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Inquiry Type */}
              <div className="space-y-2">
                <label htmlFor="type" className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>{t('formType')}</span>
                  <span className="text-[10px] bg-purple-950 text-purple-300 border border-purple-700/50 px-2 py-0.5 rounded font-bold">
                    {t('formRequired')}
                  </span>
                </label>
                <select
                  id="type"
                  name="type"
                  value={formState.type}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-purple-900/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-colors"
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
                <label htmlFor="subject" className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>{t('formSubject')}</span>
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-bold">
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
                  className="w-full bg-slate-950 border border-purple-900/50 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-colors"
                />
              </div>
            </div>

            {/* Message */}
            <div className="space-y-2">
              <label htmlFor="message" className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>{t('formMessage')}</span>
                <span className="text-[10px] bg-pink-950 text-pink-400 border border-pink-700/50 px-2 py-0.5 rounded font-bold">
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
                className="w-full bg-slate-950 border border-purple-900/50 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-colors leading-relaxed"
              ></textarea>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={status === 'submitting'}
                className="w-full py-4 px-8 rounded-2xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:via-purple-500 hover:to-indigo-500 text-white font-black text-sm tracking-wide shadow-xl shadow-pink-950/50 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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