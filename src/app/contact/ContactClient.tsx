'use client';

import React from 'react';
import { SiteInfo } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { Mail, ExternalLink, MessageSquare } from 'lucide-react';

interface ContactClientProps {
  siteInfo: SiteInfo;
}

export default function ContactClient({ siteInfo }: ContactClientProps) {
  const { t } = useLanguage();

  const googleFormUrl =
    siteInfo.googleFormUrl ||
    'https://docs.google.com/forms/d/e/1FAIpQLScX_ExampleFormId/viewform?embedded=true';

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

      <div className="bg-slate-900 border border-purple-900/40 rounded-3xl p-6 sm:p-10 space-y-8 shadow-2xl">
        {/* Info Box */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 bg-slate-950 rounded-2xl border border-purple-800/40">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-6 h-6 text-pink-400 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-white">{t('contactFormTitle')}</h3>
              <p className="text-xs text-slate-400">{t('contactFormDesc')}</p>
            </div>
          </div>
          <a
            href={googleFormUrl.replace('?embedded=true', '')}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md flex-shrink-0"
          >
            <span>{t('openInNewTab')}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Google Form Embed Container */}
        <div className="w-full bg-white rounded-2xl overflow-hidden shadow-inner min-h-[600px] border border-slate-700">
          <iframe
            src={googleFormUrl}
            width="100%"
            height="700"
            frameBorder="0"
            marginHeight={0}
            marginWidth={0}
            className="w-full h-[700px]"
            title="Google Contact Form"
          >
            Loading...
          </iframe>
        </div>
      </div>
    </div>
  );
}