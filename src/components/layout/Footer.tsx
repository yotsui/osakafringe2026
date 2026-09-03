'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import BrandLogo from '@/components/common/BrandLogo';
import { SparkleIcon } from '@/components/common/CustomIcons';
import { InstagramIcon } from '@/components/common/SnsIcons';
import { ExternalLink } from 'lucide-react';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-[#E6007E] text-white transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Logo & About */}
          <div className="md:col-span-2 space-y-4">
            <div className="w-52 sm:w-60 filter brightness-0 invert">
              <BrandLogo variant="main-date" />
            </div>
            <p className="text-xs text-white/90 max-w-md leading-relaxed font-medium bg-black/10 p-4 rounded-2xl border border-white/20">
              {t('footerDesc')}
            </p>
            <div className="text-xs text-white font-bold space-y-1 pt-1">
              <p>主催：大阪文化万博 Osaka Fringe 2026 実行委員会</p>
              <p>（大阪文化フリンジ機構設立準備室）</p>
              <p className="text-[#FFF100] font-black text-sm">info@osakafringe.com</p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-xs font-black text-[#FFF100] uppercase tracking-widest border-b border-white/20 pb-2">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-xs font-bold">
              <li>
                <Link href="/" className="text-white/90 hover:text-white transition-colors">
                  {t('navHome')}
                </Link>
              </li>
              <li>
                <Link href="/audience" className="text-[#FFF100] hover:text-white font-black">
                  {t('navAudience')}
                </Link>
              </li>
              <li>
                <Link href="/venues" className="text-white/90 hover:text-white transition-colors">
                  {t('navVenues')}
                </Link>
              </li>
              <li>
                <Link href="/artists" className="text-white/90 hover:text-white transition-colors">
                  {t('navArtists')}
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-white/90 hover:text-white transition-colors">
                  {t('navAbout')}
                </Link>
              </li>
              <li>
                <Link href="/donate" className="text-white/90 hover:text-white transition-colors">
                  {t('navDonate')}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-white/90 hover:text-white transition-colors">
                  {t('navContact')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Social & Official */}
          <div className="space-y-4">
            <h4 className="text-xs font-black text-[#FFF100] uppercase tracking-widest border-b border-white/20 pb-2">
              Official Channels
            </h4>
            <div className="space-y-3">
              <a
                href="https://www.instagram.com/osakafringe"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 p-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all group"
              >
                <InstagramIcon className="w-4 h-4 text-[#FFF100]" />
                <span>Instagram @osakafringe</span>
                <ExternalLink className="w-3.5 h-3.5 ml-auto text-white/60 group-hover:text-white" />
              </a>

              <a
                href="https://osakafringe.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 p-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all group"
              >
                <SparkleIcon className="w-4 h-4" fill="#FFF100" />
                <span>osakafringe.com</span>
                <ExternalLink className="w-3.5 h-3.5 ml-auto text-white/60 group-hover:text-white" />
              </a>
            </div>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-white/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-bold text-white/80">
          <p>© 2026 Osaka Fringe Festival Executive Committee. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs font-black">
            <span className="bg-[#FFF100] text-black px-3 py-1 rounded-full shadow-xs">
              Spill Over 2026
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}