'use client';

import React from 'react';
import Image from 'next/image';
import { Partner } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { ExternalLink } from 'lucide-react';

interface PartnerSectionProps {
  partners: Partner[];
}

export default function PartnerSection({ partners }: PartnerSectionProps) {
  const { getText } = useLanguage();

  if (!partners || partners.length === 0) {
    return null;
  }

  return (
    <section className="space-y-6">
      <div className="text-center space-y-1.5">
        <div className="text-[#E6007E] font-black text-xs uppercase tracking-widest">
          PARTNERS & COLLABORATIONS
        </div>
        <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          パートナー・連携フェスティバル
        </h3>
        <p className="text-xs text-slate-500 font-medium max-w-xl mx-auto">
          大阪フリンジを共に創る連携団体・地域パートナーです。
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {partners.map((partner) => {
          const name = getText(partner.name, partner.nameEn);
          const desc = getText(partner.description, partner.descriptionEn);

          return (
            <a
              key={partner.id}
              href={partner.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block bg-white rounded-2xl border border-pink-100 hover:border-pink-300 overflow-hidden shadow-sm hover:shadow-md transition-all p-4 space-y-3"
            >
              <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden bg-slate-100">
                {partner.image ? (
                  <Image
                    src={partner.image}
                    alt={name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-xs">
                    {name}
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-black text-sm text-slate-900 group-hover:text-[#E6007E] transition-colors line-clamp-1">
                    {name}
                  </h4>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#E6007E] flex-shrink-0 transition-colors" />
                </div>
                {desc && (
                  <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-2">
                    {desc}
                  </p>
                )}
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}
