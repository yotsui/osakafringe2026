'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';
import { Sparkles, Heart, Mail, Globe, MapPin, Instagram, ExternalLink } from 'lucide-react';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-slate-50 border-t border-pink-100 text-slate-600 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Logo & About */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="inline-block">
              <div className="relative h-12 w-56">
                <Image
                  src="/images/logo_date_main_trans.png"
                  alt="OCT8 - NOV8, 2026 大阪文化万博 | osaka fringe"
                  fill
                  className="object-contain object-left"
                />
              </div>
            </Link>
            <p className="text-xs text-slate-500 max-w-md leading-relaxed font-medium">
              {t('footerDesc')}
            </p>
            <div className="text-xs text-slate-700 font-bold space-y-1 pt-1">
              <p>主催：大阪文化万博 Osaka Fringe 2026 実行委員会</p>
              <p>（大阪文化フリンジ機構設立準備室）</p>
              <p className="text-pink-600 font-semibold">info@osakafringe.com</p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-pink-100 pb-2">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-xs font-bold">
              <li>
                <Link href="/" className="text-slate-600 hover:text-pink-600 transition-colors">
                  {t('navHome')}
                </Link>
              </li>
              <li>
                <Link href="/audience" className="text-pink-600 hover:text-pink-700 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>{t('navAudience')}</span>
                </Link>
              </li>
              <li>
                <Link href="/venues" className="text-slate-600 hover:text-pink-600 transition-colors">
                  {t('navVenues')}
                </Link>
              </li>
              <li>
                <Link href="/artists" className="text-slate-600 hover:text-pink-600 transition-colors">
                  {t('navArtists')}
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-slate-600 hover:text-pink-600 transition-colors">
                  {t('navAbout')}
                </Link>
              </li>
              <li>
                <Link href="/donate" className="text-slate-600 hover:text-pink-600 transition-colors">
                  {t('navDonate')}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-slate-600 hover:text-pink-600 transition-colors">
                  {t('navContact')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Social & Official */}
          <div className="space-y-4">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-pink-100 pb-2">
              Official Channels
            </h4>
            <div className="space-y-3">
              <a
                href="https://www.instagram.com/osakafringe"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white border border-pink-100 hover:border-pink-300 text-xs font-bold text-slate-700 hover:text-pink-600 transition-all shadow-2xs group"
              >
                <Instagram className="w-4 h-4 text-pink-600" />
                <span>Instagram @osakafringe</span>
                <ExternalLink className="w-3 h-3 ml-auto text-slate-400 group-hover:text-pink-600" />
              </a>

              <a
                href="https://osakafringe.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white border border-pink-100 hover:border-pink-300 text-xs font-bold text-slate-700 hover:text-pink-600 transition-all shadow-2xs group"
              >
                <Globe className="w-4 h-4 text-pink-600" />
                <span>Official Web Portal</span>
                <ExternalLink className="w-3 h-3 ml-auto text-slate-400 group-hover:text-pink-600" />
              </a>
            </div>
          </div>

        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-medium">
          <p>© osaka fringe2026 All Rights Reserved.</p>
          <p className="flex items-center gap-1">
            <span>Powered by</span>
            <span className="font-bold text-pink-600">MicroCMS</span>
            <span>&</span>
            <span className="font-bold text-purple-600">Gemini AI</span>
          </p>
        </div>
      </div>
    </footer>
  );
}