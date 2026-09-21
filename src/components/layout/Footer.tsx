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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Logo & About */}
          <div className="md:col-span-2 space-y-4">
            <div className="w-52 sm:w-60 filter brightness-0 invert">
              <BrandLogo variant="main-date" />
            </div>
            <div className="text-sm text-white font-bold space-y-2 pt-1">
              <p>主催：大阪文化万博 Osaka Fringe 2026 準備室</p>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                <span className="shrink-0">後援：</span>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">
                  <a href="https://octb.osaka-info.jp/" target="_blank" rel="noopener noreferrer" className="hover:text-gray-200 transition-colors inline-block py-1 sm:py-0">
                    公益財団法人大阪観光局
                  </a>
                  <span className="hidden sm:inline mx-2 text-white/50">｜</span>
                  <a href="https://art-flavor.osaka-info.jp/" target="_blank" rel="noopener noreferrer" className="hover:text-gray-200 transition-colors inline-block py-1 sm:py-0">
                    Art Flavor Osaka
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-xs font-black text-[#FFF100] uppercase tracking-widest border-b border-white/20 pb-2">
              Navigation
            </h4>
            <ul className="space-y-1 text-sm font-bold">
              <li>
                <Link href="/" className="inline-block py-2 text-white/90 hover:text-white transition-colors">
                  {t('navHome')}
                </Link>
              </li>
              <li>
                <Link href="/audience" className="inline-block py-2 text-[#FFF100] hover:text-white font-black">
                  {t('navAudience')}
                </Link>
              </li>
              <li>
                <Link href="/venues" className="inline-block py-2 text-white/90 hover:text-white transition-colors">
                  {t('navVenues')}
                </Link>
              </li>
              <li>
                <Link href="/artists" className="inline-block py-2 text-white/90 hover:text-white transition-colors">
                  {t('navArtists')}
                </Link>
              </li>
              {showAwards && (
                <li>
                  <Link href="/awards" className="inline-block py-2 text-white/90 hover:text-white transition-colors">
                    {t('navAwards')}
                  </Link>
                </li>
              )}
              <li>
                <Link href="/about" className="inline-block py-2 text-white/90 hover:text-white transition-colors">
                  {t('navAbout')}
                </Link>
              </li>

              <li>
                <Link href="/logo_download" className="inline-block py-2 text-white/90 hover:text-white transition-colors">
                  {t('navBrandAssets')}
                </Link>
              </li>
              <li>
                <Link href="/donate" className="inline-block py-2 text-white/90 hover:text-white transition-colors">
                  {t('navDonate')}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="inline-block py-2 text-white/90 hover:text-white transition-colors">
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
                href="https://www.instagram.com/osaka_fringe/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 p-3 min-h-[44px] rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 transition-all group"
              >
                <InstagramIcon className="w-5 h-5 text-[#FFF100]" />
                <span>Instagram @osaka_fringe</span>
                <ExternalLink className="w-4 h-4 ml-auto text-white/60 group-hover:text-white" />
              </a>


            </div>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-white/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-bold text-white/80">
          <p>© 2026 大阪文化万博 Osaka Fringe 2026 準備室 All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs font-black">

          </div>
        </div>

      </div>
    </footer>
  );
}