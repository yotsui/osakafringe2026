'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import BrandLogo from '@/components/common/BrandLogo';
import { SparkleIcon } from '@/components/common/CustomIcons';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { language, setLanguage, t } = useLanguage();

  const navItems = [
    { href: '/', label: t('navHome') },
    { href: '/audience', label: t('navAudience'), highlight: true },
    { href: '/venues', label: t('navVenues') },
    { href: '/artists', label: t('navArtists') },
    { href: '/about', label: t('navAbout') },
    { href: '/donate', label: t('navDonate') },
    { href: '/contact', label: t('navContact') },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-[#E6007E] text-white shadow-md transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Main Vector Logo (White On Pink Background) */}
          <div className="flex items-center">
            <div className="w-48 sm:w-56 md:w-64 filter brightness-0 invert">
              <BrandLogo variant="main-date" />
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              
              if (item.highlight) {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="px-4 py-2 rounded-xl bg-white text-[#E6007E] hover:bg-[#FFF100] hover:text-black font-black text-xs transition-all duration-200 ml-2 mr-1 cursor-pointer shadow-md"
                  >
                    <span>{item.label}</span>
                  </Link>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-white/20 text-white font-black shadow-inner'
                      : 'text-white hover:text-white hover:bg-white/10'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}

            {/* Language Switcher */}
            <div className="flex items-center bg-black/25 p-1 rounded-xl ml-3 border border-white/20">
              <button
                onClick={() => setLanguage('ja')}
                className={`px-3 py-1 rounded-lg text-xs font-black transition-all ${
                  language === 'ja'
                    ? 'bg-white text-black shadow-sm'
                    : 'text-white hover:text-[#FFF100]'
                }`}
              >
                JP
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-1 rounded-lg text-xs font-black transition-all ${
                  language === 'en'
                    ? 'bg-white text-black shadow-sm'
                    : 'text-white hover:text-[#FFF100]'
                }`}
              >
                EN
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2.5 rounded-xl bg-white text-[#E6007E] font-bold shadow-sm transition-all cursor-pointer"
              aria-label="Toggle Menu"
            >
              {isOpen ? <X className="w-6 h-6 stroke-[2.5]" /> : <Menu className="w-6 h-6 stroke-[2.5]" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="lg:hidden border-t border-white/20 bg-[#E6007E] px-4 pt-4 pb-6 space-y-2.5 animate-fadeIn">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-colors ${
                item.highlight
                  ? 'bg-white text-[#E6007E] font-black shadow-sm'
                  : pathname === item.href
                  ? 'bg-white/20 text-white font-black'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <span>{item.label}</span>
            </Link>
          ))}

          <div className="pt-3 flex items-center justify-center gap-3 border-t border-white/20">
            <button
              onClick={() => { setLanguage('ja'); setIsOpen(false); }}
              className={`flex-1 py-2.5 rounded-xl font-black text-xs ${
                language === 'ja' ? 'bg-white text-black' : 'bg-white/20 text-white'
              }`}
            >
              日本語 (JP)
            </button>
            <button
              onClick={() => { setLanguage('en'); setIsOpen(false); }}
              className={`flex-1 py-2.5 rounded-xl font-black text-xs ${
                language === 'en' ? 'bg-white text-black' : 'bg-white/20 text-white'
              }`}
            >
              English (EN)
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}