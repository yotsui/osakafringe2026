'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import BrandLogo from '@/components/common/BrandLogo';
import { InstagramIcon } from '@/components/common/SnsIcons';
import { ExternalLink } from 'lucide-react';

interface FooterProps {
  showAwards?: boolean;
}

export default function Footer({ showAwards = false }: FooterProps) {
  const { t } = useLanguage();

  return (
    <footer className="bg-[#E6007E] text-white transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-14 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-8">
          
          {/* 1. Logo, Organizer & Supporter Information (2 cols on large screen) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="w-52 sm:w-56 filter brightness-0 invert">
              <BrandLogo variant="main-date" />
            </div>
            <div className="text-xs sm:text-sm text-white/95 font-bold space-y-2 pt-1">
              <p>{t('footerOrganizerLabel')}{t('footerOrganizerName')}</p>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs">
                <span className="shrink-0 text-white/80">{t('footerSupporterLabel')}</span>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0">
                  <a 
                    href="https://octb.osaka-info.jp/" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="hover:text-pink-200 underline decoration-white/30 underline-offset-2 transition-colors inline-block py-0.5 sm:py-0"
                  >
                    {t('footerSupporterName')}
                  </a>
                  <span className="hidden sm:inline mx-1.5 text-white/50">｜</span>
                  <a 
                    href="https://art-flavor.osaka-info.jp/" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="hover:text-pink-200 underline decoration-white/30 underline-offset-2 transition-colors inline-block py-0.5 sm:py-0"
                  >
                    Art Flavor Osaka
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Festival Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-[#FFF100] uppercase tracking-widest border-b border-white/20 pb-1.5">
              {t('footerSectionFestival')}
            </h4>
            <ul className="space-y-1 text-sm font-bold">
              <li>
                <Link href="/audience" className="inline-block py-1 text-[#FFF100] hover:text-white font-black transition-colors">
                  {t('navAudience')}
                </Link>
              </li>
              <li>
                <Link href="/venues" className="inline-block py-1 text-white/90 hover:text-white transition-colors">
                  {t('navVenues')}
                </Link>
              </li>
              <li>
                <Link href="/artists" className="inline-block py-1 text-white/90 hover:text-white transition-colors">
                  {t('navArtists')}
                </Link>
              </li>
              <li>
                <Link href="/about" className="inline-block py-1 text-white/90 hover:text-white transition-colors">
                  {t('navAbout')}
                </Link>
              </li>
              {showAwards && (
                <li>
                  <Link href="/awards" className="inline-block py-1 text-white/90 hover:text-white transition-colors">
                    {t('navAwards')}
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* 3. Media & Support Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-[#FFF100] uppercase tracking-widest border-b border-white/20 pb-1.5">
              {t('footerSectionMediaSupport')}
            </h4>
            <ul className="space-y-1 text-sm font-bold">
              <li>
                <Link href="/media" className="inline-block py-1 text-white/90 hover:text-white transition-colors">
                  {t('navMedia')}
                </Link>
              </li>
              <li>
                <Link href="/donate" className="inline-block py-1 text-white/90 hover:text-white transition-colors">
                  {t('navDonate')}
                </Link>
              </li>
              <li>
                <Link href="/logo_download" className="inline-block py-1 text-white/90 hover:text-white transition-colors">
                  {t('navBrandAssets')}
                </Link>
              </li>
            </ul>
          </div>

          {/* 4. Contact & Official SNS */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-[#FFF100] uppercase tracking-widest border-b border-white/20 pb-1.5">
              {t('footerSectionContactSns')}
            </h4>
            <div className="space-y-2.5">
              <Link 
                href="/contact" 
                className="inline-block py-1 text-sm font-bold text-white/90 hover:text-white transition-colors"
              >
                {t('navContact')}
              </Link>
              <div>
                <a
                  href="https://www.instagram.com/osaka_fringe/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all group max-w-xs"
                >
                  <InstagramIcon className="w-4 h-4 text-[#FFF100] shrink-0" />
                  <span className="truncate">Instagram @osaka_fringe</span>
                  <ExternalLink className="w-3.5 h-3.5 ml-auto text-white/60 group-hover:text-white shrink-0" />
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-6 border-t border-white/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-bold text-white/80">
          <p>{t('footerCopyrightText')}</p>
        </div>

      </div>
    </footer>
  );
}