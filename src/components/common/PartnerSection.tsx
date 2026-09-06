'use client';

import React from 'react';
import Image from 'next/image';
import { Partner } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { ExternalLink } from 'lucide-react';

interface PartnerSectionProps {
  partners: Partner[];
}

const CATEGORY_ORDER: Array<{ key: string; label: string; desc: string }> = [
  { key: '組織（後援・協力）', label: '後援・協力団体', desc: 'Osaka Fringe 2026 を支援・推進する公的機関および文化芸術団体' },
  { key: '連携イベント・フェス', label: '連携イベント・フェスティバル', desc: '同時期に大阪・関西各地で開催される連携カルチャーフェスティバル' },
  { key: '会場協力', label: '会場協力', desc: '舞台・空間を提供しフェスティバルを共創する会場パートナー' },
  { key: 'スポンサー', label: 'オフィシャルスポンサー', desc: 'フェスティバルの挑戦と発展を支える協賛企業・団体' },
];

export default function PartnerSection({ partners }: PartnerSectionProps) {
  const { getText } = useLanguage();

  if (!partners || partners.length === 0) {
    return null;
  }

  // カテゴリごとにグループ化
  const groupedPartners = CATEGORY_ORDER.map((cat) => {
    const list = partners.filter((p) => {
      // microCMS の category 値にマッチ、またはデフォルトで組織
      if (p.category) {
        return p.category === cat.key;
      }
      return cat.key === '組織（後援・協力）';
    });
    return { ...cat, list };
  }).filter((group) => group.list.length > 0);

  return (
    <section className="space-y-12">
      <div className="text-center space-y-1.5">
        <div className="text-[#E6007E] font-black text-xs uppercase tracking-widest">
          PARTNERS & SUPPORTERS
        </div>
        <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          パートナー・後援・連携イベント
        </h3>
        <p className="text-xs text-slate-500 font-medium max-w-xl mx-auto">
          Osaka Fringe 2026 を共に創り、街にあふれだす文化芸術を支える皆さまです。
        </p>
      </div>

      <div className="space-y-10">
        {groupedPartners.map((group) => (
          <div key={group.key} className="space-y-4">
            <div className="border-b border-pink-100 pb-2">
              <h4 className="text-base sm:text-lg font-black text-slate-900">
                {group.label}
              </h4>
              <p className="text-[11px] text-slate-500 font-medium">
                {group.desc}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {group.list.map((partner) => {
                const name = getText(partner.name, partner.nameEn);
                const desc = getText(partner.description, partner.descriptionEn);
                const targetUrl = partner.websiteUrl || partner.url;

                const CardContent = (
                  <div className="group bg-white rounded-2xl border border-pink-100 hover:border-pink-300 overflow-hidden shadow-2xs hover:shadow-md transition-all p-4 space-y-3 h-full flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="relative aspect-16/9 w-full rounded-xl overflow-hidden bg-slate-100">
                        {partner.image ? (
                          <Image
                            src={partner.image}
                            alt={name}
                            fill
                            className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-xs p-2 text-center">
                            {name}
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <h5 className="font-black text-sm text-slate-900 group-hover:text-[#E6007E] transition-colors line-clamp-1">
                            {name}
                          </h5>
                          {targetUrl && (
                            <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#E6007E] flex-shrink-0 transition-colors" />
                          )}
                        </div>
                        {desc && (
                          <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-2">
                            {desc}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );

                if (targetUrl) {
                  return (
                    <a
                      key={partner.id}
                      href={targetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      {CardContent}
                    </a>
                  );
                }

                return <div key={partner.id}>{CardContent}</div>;
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
