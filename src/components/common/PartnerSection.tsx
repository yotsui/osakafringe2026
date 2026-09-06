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

export default function PartnerSection({ partners = [] }: PartnerSectionProps) {
  const { getText } = useLanguage();

  const safePartners = Array.isArray(partners) ? partners : [];

  // カテゴリごとにグループ化（未分類や未知のカテゴリも漏れなく救済）
  const knownKeys = new Set(CATEGORY_ORDER.map((c) => c.key));
  
  const groupedPartners = CATEGORY_ORDER.map((cat) => {
    const list = safePartners.filter((p) => {
      if (!p.category || !knownKeys.has(p.category)) {
        // 未設定・未知カテゴリは「組織（後援・協力）」へフォールバック
        return cat.key === '組織（後援・協力）';
      }
      return p.category === cat.key;
    });
    return { ...cat, list };
  }).filter((group) => group.list.length > 0);

  const hasAnyPartner = groupedPartners.length > 0;

  return (
    <section className="bg-white/90 border border-pink-100 rounded-3xl p-6 sm:p-12 lg:p-16 space-y-12 shadow-xs">
      {/* Editorial Header */}
      <div className="space-y-3">
        <div className="text-[#E6007E] font-black text-xs tracking-widest uppercase">
          PARTNERS & SUPPORTERS
        </div>
        <div className="w-12 h-1 bg-[#E6007E]" />
        <h3 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          パートナー・後援・連携イベント
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-2xl leading-relaxed">
          Osaka Fringe 2026 を共に創り、街にあふれだす文化芸術を支える皆さまです。
        </p>
      </div>

      {hasAnyPartner ? (
        <div className="space-y-12">
          {groupedPartners.map((group) => (
            <div key={group.key} className="space-y-5">
              <div className="border-b border-slate-200/80 pb-2 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                <h4 className="text-base sm:text-lg font-black text-slate-900">
                  {group.label}
                </h4>
                <span className="text-[11px] text-slate-500 font-medium">
                  {group.desc}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {group.list.map((partner) => {
                  const name = getText(partner.name, partner.nameEn);
                  const desc = getText(partner.description, partner.descriptionEn);
                  const targetUrl = partner.websiteUrl || partner.url;
                  const isExternal = Boolean(targetUrl && targetUrl !== '#' && targetUrl !== '/');

                  const CardContent = (
                    <div className="group bg-white rounded-xl border border-slate-200/90 hover:border-[#E6007E] transition-all p-4 space-y-3 h-full flex flex-col justify-between shadow-2xs hover:shadow-sm">
                      <div className="space-y-3">
                        {/* Logo Image Area */}
                        <div className="relative aspect-16/9 w-full rounded-lg bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center p-2">
                          {partner.image ? (
                            <Image
                              src={partner.image}
                              alt={name}
                              fill
                              className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                              unoptimized
                            />
                          ) : (
                            <div className="text-center font-bold text-xs text-slate-500 px-2 line-clamp-2">
                              {name}
                            </div>
                          )}
                        </div>

                        {/* Partner Name & Desc */}
                        <div className="space-y-1">
                          <div className="flex items-start justify-between gap-1.5">
                            <h5 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-[#E6007E] transition-colors line-clamp-2 leading-snug">
                              {name}
                            </h5>
                            {isExternal && (
                              <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-[#E6007E] shrink-0 mt-0.5 transition-colors" />
                            )}
                          </div>
                          {desc && (
                            <p className="text-[11px] text-slate-500 font-medium leading-relaxed line-clamp-2">
                              {desc}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );

                  if (isExternal && targetUrl) {
                    return (
                      <a
                        key={partner.id}
                        href={targetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block h-full cursor-pointer"
                      >
                        {CardContent}
                      </a>
                    );
                  }

                  return <div key={partner.id} className="h-full">{CardContent}</div>;
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 sm:p-12 text-center rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
          <p className="text-sm font-bold text-slate-600">掲載準備中</p>
          <p className="text-xs text-slate-400">パートナー・後援情報は順次公開いたします。</p>
        </div>
      )}
    </section>
  );
}
