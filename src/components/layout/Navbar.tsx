'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import BrandLogo from '@/components/common/BrandLogo';
import { 
  Sparkles, 
  Menu, 
  X, 
  Globe, 
  Heart, 
  MapPin, 
  Compass, 
  Mail, 
  Trophy,
  Users
} from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { language, setLanguage, t } = useLanguage();

  const navItems = [
    { href: '/', label: t('navHome'), icon: Compass },
    { href: '/audience', label: t('navAudience'), icon: Sparkles, highlight: true },
    { href: '/venues', label: t('navVenues'), icon: MapPin },
    { href: '/artists', label: t('navArtists'), icon: Users },
    { href: '/about', label: t('navAbout'), icon: Sparkles },
    { href: '/donate', label: t('navDonate'), icon: Heart },
    { href: '/contact', label: t('navContact'), icon: Mail },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-pink-100 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Main Official Vector Logo (OCT8 - NOV8, 2026 大阪文化万博 | osaka fringe) */}
          <div className="w-48 sm:w-56 md:w-64 py-1">
            <BrandLogo variant="main-date" />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              
              if (item.highlight) {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-pink-600 via-rose-500 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold text-xs shadow-md shadow-pink-500/20 hover:shadow-pink-500/30 transition-all ml-1 mr-1"
                  >
                    <Icon className="w-3.5 h-3.5 animate-pulse" />
                    <span>{item.label}</span>
                  </Link>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-pink-50 text-pink-600 font-extrabold'
                      : 'text-slate-600 hover:text-pink-600 hover:bg-pink-50/50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-pink-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {/* Language Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-full border border-slate-200 ml-2">
              <button
                onClick={() => setLanguage('ja')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  language === 'ja'
                    ? 'bg-pink-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                JP
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  language === 'en'
                    ? 'bg-pink-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                EN
              </button>
            </div>
          </div>

          {/* Mobile menu and Lang button */}
          <div className="flex lg:hidden items-center gap-2">
            {/* Quick Lang Switch */}
            <button
              onClick={() => setLanguage(language === 'ja' ? 'en' : 'ja')}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-pink-50 border border-pink-200 text-pink-600 text-xs font-bold"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{language.toUpperCase()}</span>
            </button>

            {/* Hamburger button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:text-pink-600 hover:bg-pink-50 transition-colors"
              aria-label="Toggle Menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="lg:hidden bg-white border-b border-pink-100 px-4 pt-2 pb-6 space-y-2 shadow-xl animate-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-1 gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                    item.highlight
                      ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white font-black my-1'
                      : isActive
                      ? 'bg-pink-50 text-pink-600 font-extrabold'
                      : 'text-slate-700 hover:bg-pink-50/50 hover:text-pink-600'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${item.highlight ? 'text-white' : isActive ? 'text-pink-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between px-2">
            <span className="text-xs font-bold text-slate-500">Language / 表示言語:</span>
            <div className="flex items-center bg-slate-100 p-1 rounded-full border border-slate-200">
              <button
                onClick={() => setLanguage('ja')}
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  language === 'ja' ? 'bg-pink-600 text-white shadow-sm' : 'text-slate-600'
                }`}
              >
                日本語 (JP)
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  language === 'en' ? 'bg-pink-600 text-white shadow-sm' : 'text-slate-600'
                }`}
              >
                English (EN)
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}