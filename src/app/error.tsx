'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useLanguage();

  useEffect(() => {
    console.error('Application Error:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200/80 shadow-lg text-center space-y-6">
        <div className="w-16 h-16 bg-pink-50 text-[#E6007E] rounded-2xl flex items-center justify-center mx-auto border border-pink-100">
          <AlertCircle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-black text-slate-900">
            {t('errorTitle')}
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            {t('errorDescription')}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#E6007E] text-white text-sm font-bold hover:bg-[#d00072] transition-colors shadow-sm cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{t('errorRetry')}</span>
          </button>

          <Link
            href="/"
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>{t('errorBackToHome')}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
