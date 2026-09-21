'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { SiteInfo, AwardSection, AwardPerson } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { ArrowRight, Sparkles, User, Info } from 'lucide-react';

interface AwardsClientProps {
  siteInfo: SiteInfo;
}

export default function AwardsClient({ siteInfo }: AwardsClientProps) {
  const { getText, t } = useLanguage();
  const awardsInfo = siteInfo.awardsInfo;
  const sections: AwardSection[] = siteInfo.awardsSections || [];
  const editor: AwardPerson | undefined = siteInfo.awardsEditor;
  const members: AwardPerson[] = siteInfo.awardsMembers || [];

  if (!awardsInfo) {
    return null;
  }

  const title = getText(awardsInfo.title, awardsInfo.titleEn);
  const tagline = getText(awardsInfo.tagline, awardsInfo.taglineEn);
  const summary = getText(awardsInfo.summary, awardsInfo.summaryEn);
  const notice = getText(awardsInfo.notice, awardsInfo.noticeEn);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">

        {/* 1. Header / Hero: Title, Tagline, Summary */}
        <header className="bg-gradient-to-br from-white via-slate-50 to-pink-50/40 text-slate-900 rounded-3xl p-8 sm:p-12 md:p-14 border border-pink-100/80 shadow-sm space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-pink-100/80 text-[#E6007E] text-xs font-black tracking-widest uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>OSAKA FRINGE AWARDS 2026</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            {title}
          </h1>

          {tagline && (
            <p className="text-lg sm:text-2xl font-bold text-[#E6007E] leading-snug">
              {tagline}
            </p>
          )}

          {summary && (
            <p className="text-base sm:text-lg text-slate-700 font-normal leading-relaxed whitespace-pre-line pt-2 border-t border-pink-100">
              {summary}
            </p>
          )}
        </header>

        {/* 2. Introduction Sections */}
        {sections.length > 0 && (
          <section className="space-y-8" aria-label="Awards Introduction Sections">
            {sections.map((sec, idx) => {
              const secTitle = getText(sec.title, sec.titleEn);
              const secText = getText(sec.text, sec.textEn);
              if (!secTitle && !secText) return null;

              return (
                <article
                  key={`award-section-${idx}`}
                  className="bg-white text-slate-900 rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-xs space-y-4"
                >
                  {secTitle && (
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight border-l-4 border-[#E6007E] pl-4 leading-snug">
                      {secTitle}
                    </h2>
                  )}
                  {secText && (
                    <p className="text-base sm:text-lg text-slate-700 font-normal leading-relaxed whitespace-pre-line">
                      {secText}
                    </p>
                  )}
                </article>
              );
            })}
          </section>
        )}

        {/* 3. Editor-in-Chief Introduction */}
        {editor && (editor.name || editor.role) && (
          <section className="bg-white text-slate-900 rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex items-center gap-2 text-xs font-black text-[#E6007E] uppercase tracking-widest border-b border-slate-100 pb-3">
              <User className="w-4 h-4" />
              <span>{t('awardsEditorBadge')}</span>
            </div>

            <div className={`flex flex-col ${editor.photo ? 'md:flex-row gap-8 items-start' : 'gap-4'}`}>
              {editor.photo && (
                <div className="relative w-36 h-36 sm:w-44 sm:h-44 shrink-0 rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100 mx-auto md:mx-0">
                  <Image
                    src={editor.photo}
                    alt={getText(editor.name, editor.nameEn) || 'Editor'}
                    fill
                    sizes="(max-width: 640px) 144px, 176px"
                    className="object-cover object-center"
                    unoptimized
                  />
                </div>
              )}

              <div className="flex-1 space-y-4 text-center md:text-left">
                <div className="space-y-1">
                  {editor.role && (
                    <div className="text-xs sm:text-sm font-black text-[#E6007E] tracking-wide uppercase">
                      {getText(editor.role, editor.roleEn)}
                    </div>
                  )}
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {getText(editor.name, editor.nameEn)}
                  </h3>
                  {editor.title && (
                    <p className="text-sm sm:text-base font-bold text-slate-600">
                      {getText(editor.title, editor.titleEn)}
                    </p>
                  )}
                </div>

                {editor.profile && (
                  <p className="text-base sm:text-lg text-slate-700 font-normal leading-relaxed whitespace-pre-line text-left pt-2 border-t border-slate-100">
                    {getText(editor.profile, editor.profileEn)}
                  </p>
                )}
              </div>
            </div>
          </section>
        )}

        {/* 4. Editorial Team Members (Only rendered if members > 0) */}
        {members.length > 0 && (
          <section className="bg-white text-slate-900 rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-xs space-y-8">
            <div className="space-y-2 border-b border-slate-100 pb-4">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {t('awardsMembersTitle')}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              {members.map((member, idx) => {
                const memName = getText(member.name, member.nameEn);
                const memRole = getText(member.role, member.roleEn);
                const memTitle = getText(member.title, member.titleEn);
                const memProfile = getText(member.profile, member.profileEn);

                return (
                  <div
                    key={`award-member-${idx}`}
                    className="bg-slate-50/70 border border-slate-200/70 rounded-2xl p-6 space-y-4 flex flex-col"
                  >
                    <div className={`flex ${member.photo ? 'items-start gap-4' : 'items-start'}`}>
                      {member.photo && (
                        <div className="relative w-20 h-20 shrink-0 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                          <Image
                            src={member.photo}
                            alt={memName || 'Member'}
                            fill
                            sizes="80px"
                            className="object-cover object-center"
                            unoptimized
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0 space-y-1">
                        {memRole && (
                          <div className="text-xs font-black text-[#E6007E] uppercase tracking-wide">
                            {memRole}
                          </div>
                        )}
                        <h3 className="text-lg sm:text-xl font-black text-slate-900 truncate">
                          {memName}
                        </h3>
                        {memTitle && (
                          <p className="text-xs sm:text-sm font-semibold text-slate-600 line-clamp-2">
                            {memTitle}
                          </p>
                        )}
                      </div>
                    </div>

                    {memProfile && (
                      <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-normal whitespace-pre-line pt-2 border-t border-slate-200/60 flex-1">
                        {memProfile}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* 5. Upcoming Notice (If available) */}
        {notice && (
          <aside className="bg-pink-50/60 border border-pink-200/80 rounded-3xl p-8 sm:p-10 text-slate-900 space-y-4">
            <div className="flex items-center gap-2 text-xs font-black text-[#E6007E] uppercase tracking-widest">
              <Info className="w-4 h-4" />
              <span>{t('awardsUpcomingTitle')}</span>
            </div>
            <p className="text-base sm:text-lg text-slate-800 leading-relaxed font-medium whitespace-pre-line">
              {notice}
            </p>
          </aside>
        )}

        {/* 6. CTA: Find Shows */}
        <div className="text-center pt-4">
          <Link
            href="/audience"
            className="inline-flex items-center gap-3 px-8 sm:px-10 py-4 sm:py-5 rounded-2xl bg-[#E6007E] hover:bg-[#c4006b] text-white font-black text-base sm:text-lg tracking-wide shadow-xl shadow-pink-500/20 hover:-translate-y-0.5 transition-all cursor-pointer group"
          >
            <span>{t('awardsFindShowsBtn')}</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

      </div>
    </div>
  );
}
