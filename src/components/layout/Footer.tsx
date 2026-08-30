'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { Sparkles, Heart, Mail, ExternalLink, Camera, Share2 } from 'lucide-react';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-purple-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & About summary */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-500 via-purple-600 to-amber-400 p-0.5">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-pink-400" />
                </div>
              </div>
              <span className="font-extrabold tracking-tight text-lg text-white">
                OSAKA FRINGE FESTIVAL
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-md">
              大阪の街全体が舞台になるオープンアクセス芸術祭。演劇、ダンス、コメディ、音楽、アートがジャンルを超えて交差するフェスティバル。
            </p>
            <div className="flex items-center space-x-3 pt-2">
              <a
                href="https://instagram.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-slate-900 border border-purple-800/40 flex items-center justify-center text-slate-300 hover:text-pink-400 hover:border-pink-500 transition-colors"
                aria-label="Instagram"
              >
                <Camera className="w-4 h-4" />
              </a>
              <a
                href="https://x.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-slate-900 border border-purple-800/40 flex items-center justify-center text-slate-300 hover:text-cyan-400 hover:border-cyan-500 transition-colors"
                aria-label="X"
              >
                <Share2 className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Navigation</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/audience" className="text-pink-400 hover:text-pink-300 font-semibold flex items-center gap-1">
                  <span>Audience App (公演検索)</span>
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  Osaka Fringeとは
                </Link>
              </li>
              <li>
                <Link href="/venues" className="hover:text-white transition-colors">
                  会場一覧 & 地図
                </Link>
              </li>
              <li>
                <Link href="/artists" className="hover:text-white transition-colors">
                  アーティスト一覧
                </Link>
              </li>
              <li>
                <Link href="/awards" className="hover:text-white transition-colors">
                  Award (受賞情報)
                </Link>
              </li>
            </ul>
          </div>

          {/* Support & Contact */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Support & Contact</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/donate" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-pink-500" />
                  <span>寄付・サポーター募集</span>
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-purple-400" />
                  <span>お問い合わせ (Google Form)</span>
                </Link>
              </li>
              <li>
                <a
                  href="https://osaka-info.jp/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                  <span>大阪観光局ポータル</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-purple-900/30 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 Osaka Fringe Festival Executive Committee. All rights reserved.</p>
          <p className="flex items-center gap-2">
            <span>Powered by MicroCMS & Google Gemini AI</span>
          </p>
        </div>
      </div>
    </footer>
  );
}