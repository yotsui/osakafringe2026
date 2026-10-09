'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { SiteInfo, AwardSection, AwardPerson } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Info, 
  Search, 
  Eye, 
  PenTool, 
  Ticket 
} from 'lucide-react';

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

  // セクションの分類（既存CMSデータを安全に判定）
  const aboutSection = sections.find(s => 
    (s.title && s.title.includes('順位ではなく')) || 
    (s.titleEn && s.titleEn.toLowerCase().includes('value'))
  ) || sections[0];

  const artistSection = sections.find(s => 
    (s.title && s.title.includes('アーティスト')) || 
    (s.titleEn && s.titleEn.toLowerCase().includes('artist'))
  ) || sections[1];

  const audienceSection = sections.find(s => 
    (s.title && s.title.includes('観客')) || 
    (s.titleEn && s.titleEn.toLowerCase().includes('audience'))
  ) || sections[2];

  const independenceSection = sections.find(s => 
    (s.title && s.title.includes('独立性')) || 
    (s.titleEn && s.titleEn.toLowerCase().includes('independen'))
  ) || sections[3];

  // 上記以外で分類されなかったその他のカスタムセクション
  const otherSections = sections.filter(s => 
    s !== aboutSection && 
    s !== artistSection && 
    s !== audienceSection && 
    s !== independenceSection
  );

  // 1. About セクションの動的カード分割レンダラー
  const renderAboutContent = (rawText: string) => {
    if (!rawText) return null;

    if (rawText.includes('DISCOVER') || rawText.includes('WATCH') || rawText.includes('EDIT')) {
      const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
      const introLines: string[] = [];
      const actionItems: { title: string; subtitle: string; icon: 'discover' | 'watch' | 'edit' }[] = [];
      const outroLines: string[] = [];
      let state: 'intro' | 'actions' | 'outro' = 'intro';

      for (const line of lines) {
        if (line.includes('DISCOVER') || line.includes('WATCH') || line.includes('EDIT')) {
          state = 'actions';
          const parts = line.split(/[｜|]/).map(p => p.trim());
          const title = parts[0];
          const subtitle = parts[1] || '';
          const icon = line.includes('DISCOVER') ? 'discover' : line.includes('WATCH') ? 'watch' : 'edit';
          actionItems.push({ title, subtitle, icon });
        } else if (state === 'actions') {
          state = 'outro';
          outroLines.push(line);
        } else if (state === 'intro') {
          introLines.push(line);
        } else {
          outroLines.push(line);
        }
      }

      return (
        <div className="space-y-8 max-w-3xl">
          {introLines.length > 0 && (
            <p className="text-base sm:text-lg text-slate-700 font-normal leading-relaxed whitespace-pre-line">
              {introLines.join('\n')}
            </p>
          )}

          {actionItems.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              {actionItems.map((item, i) => (
                <div key={i} className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-pink-100 text-[#E6007E] flex items-center justify-center">
                    {item.icon === 'discover' && <Search className="w-5 h-5" />}
                    {item.icon === 'watch' && <Eye className="w-5 h-5" />}
                    {item.icon === 'edit' && <PenTool className="w-5 h-5" />}
                  </div>
                  <div className="text-xs font-black text-[#E6007E] uppercase tracking-wider">
                    0{i + 1}. {item.title}
                  </div>
                  <div className="text-base font-bold text-slate-900">
                    {item.subtitle}
                  </div>
                </div>
              ))}
            </div>
          )}

          {outroLines.length > 0 && (
            <div className="pt-2 border-t border-slate-100">
              <p className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed whitespace-pre-line">
                {outroLines.join('\n')}
              </p>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="max-w-3xl">
        <p className="text-base sm:text-lg text-slate-700 font-normal leading-relaxed whitespace-pre-line">
          {rawText}
        </p>
      </div>
    );
  };

  // 2. Artist セクションの動的ステップカード分割レンダラー
  const renderArtistContent = (rawText: string) => {
    if (!rawText) return null;
    const paragraphs = rawText.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
    const noteParagraph = paragraphs.find(p => p.startsWith('※') || p.startsWith('*'));
    const contentParagraphs = paragraphs.filter(p => p !== noteParagraph);

    if (contentParagraphs.length >= 3) {
      const lead = contentParagraphs[0];
      const steps = contentParagraphs.slice(1).map((p, idx) => {
        const pLines = p.split('\n').map(l => l.trim()).filter(Boolean);
        return {
          stepNum: idx + 1,
          title: pLines[0],
          desc: pLines.slice(1).join('\n') || '',
        };
      });

      return (
        <div className="space-y-8">
          <p className="text-base sm:text-lg text-slate-700 leading-relaxed font-normal max-w-3xl whitespace-pre-line">
            {lead}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map(step => (
              <div key={step.stepNum} className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 space-y-3">
                <div className="w-8 h-8 rounded-xl bg-pink-100 text-[#E6007E] flex items-center justify-center font-black text-sm">
                  {step.stepNum}
                </div>
                <h4 className="text-lg font-black text-slate-900">{step.title}</h4>
                {step.desc && (
                  <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                    {step.desc}
                  </p>
                )}
              </div>
            ))}
          </div>

          {noteParagraph && (
            <div className="bg-slate-50/80 border border-slate-200/60 rounded-2xl p-4 sm:p-5 text-xs sm:text-sm text-slate-500 leading-relaxed max-w-3xl whitespace-pre-line">
              {noteParagraph}
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="max-w-3xl space-y-4">
        <p className="text-base sm:text-lg text-slate-700 font-normal leading-relaxed whitespace-pre-line">
          {rawText}
        </p>
      </div>
    );
  };

  // 3. Audience セクションのハイライトレンダラー
  const renderAudienceContent = (rawText: string) => {
    if (!rawText) return null;
    const paragraphs = rawText.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);

    return (
      <div className="space-y-4 text-base sm:text-lg text-slate-700 font-normal leading-relaxed max-w-3xl">
        {paragraphs.map((p, i) => {
          if (p.includes('#osakafringe')) {
            return (
              <div key={i} className="bg-pink-50/60 border border-pink-100 rounded-2xl p-5 text-slate-800 font-medium">
                <p className="whitespace-pre-line">{p}</p>
              </div>
            );
          }
          return (
            <p key={i} className="whitespace-pre-line">
              {p}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 sm:py-20 lg:py-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 sm:space-y-20 lg:space-y-28">

        {/* ========================================================= */}
        {/* 1. HERO: シンプル＆洗練された冒頭                          */}
        {/* ========================================================= */}
        <header className="bg-gradient-to-br from-white via-white to-pink-50/40 text-slate-900 rounded-3xl p-8 sm:p-12 lg:p-16 border border-slate-200/90 shadow-sm space-y-6 sm:space-y-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-pink-50 text-[#E6007E] text-xs font-black tracking-widest uppercase border border-pink-200/60">
            <Sparkles className="w-3.5 h-3.5" />
            <span>OSAKA FRINGE AWARDS 2026</span>
          </div>

          <div className="space-y-3 sm:space-y-4 max-w-3xl">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
              {title}
            </h1>
            {tagline && (
              <p className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-[#E6007E] tracking-tight leading-snug">
                {tagline}
              </p>
            )}
          </div>

          {summary && (
            <div className="max-w-2xl pt-4 sm:pt-6 border-t border-slate-200/80">
              <p className="text-base sm:text-lg text-slate-700 leading-relaxed font-normal whitespace-pre-line">
                {summary}
              </p>
            </div>
          )}
        </header>

        {/* ========================================================= */}
        {/* 2. 推薦CTA: HERO直後、1〜1.5スクロール内で目立たせる      */}
        {/* ========================================================= */}
        <section
          id="nominate"
          className="bg-white text-slate-900 rounded-3xl p-8 sm:p-12 lg:p-14 border-2 border-pink-200/90 shadow-xl shadow-pink-500/5 space-y-8"
          aria-label={t('awardsNominateHeading')}
        >
          <div className="space-y-4 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-50 text-[#E6007E] text-xs font-black tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>NOMINATION OPEN</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight border-l-4 border-[#E6007E] pl-4 leading-snug">
              {t('awardsNominateHeading')}
            </h2>

            <div className="space-y-3 text-base sm:text-lg text-slate-700 font-normal leading-relaxed">
              <p className="whitespace-pre-line font-medium text-slate-800">
                {t('awardsNominateP1')}
              </p>
              <p className="font-bold text-[#E6007E]">
                {t('awardsNominateP2')}
              </p>
            </div>
          </div>

          {/* CTA ボタン */}
          <div>
            <Link
              href="/vote"
              className="inline-flex items-center justify-center gap-3 w-full sm:w-auto px-8 sm:px-12 py-4 sm:py-5 rounded-2xl bg-[#E6007E] hover:bg-[#c4006b] text-white font-black text-base sm:text-xl tracking-wide shadow-xl shadow-pink-500/25 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer group text-center"
            >
              <span>{t('awardsNominateBtn')}</span>
              <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* 注意書きボックス（強調カードの下に薄い背景で控えめに配置） */}
          <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-5 sm:p-6 text-xs sm:text-sm text-slate-600 leading-relaxed space-y-2 max-w-3xl">
            <p className="font-bold text-slate-800">
              {t('awardsNominateNoteHeading')}
            </p>
            <p className="whitespace-pre-line">
              {t('awardsNominateP3')}
            </p>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 3. アワード編集長・審査に関わる人物                      */}
        {/* ========================================================= */}
        <section className="space-y-10 sm:space-y-12">
          <div className="space-y-2 border-b border-slate-800 pb-4">
            <div className="text-xs font-black text-[#E6007E] uppercase tracking-widest">
              PEOPLE / EDITORIAL TEAM
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              {t('awardsDirectorSectionTitle')}
            </h2>
          </div>

          {/* 3-A. 玉置泰紀さん（大きなEditorial Directorセクション） */}
          {editor && (editor.name || editor.role) && (
            <article className="bg-white text-slate-900 rounded-3xl p-8 sm:p-12 lg:p-14 border border-slate-200/90 shadow-md">
              <div className="flex flex-col md:flex-row gap-8 lg:gap-12 items-center md:items-start">
                {/* 写真：PC 280〜380px、SP 横幅80〜100% */}
                {editor.photo && (
                  <div className="w-full sm:w-[320px] md:w-[320px] lg:w-[360px] shrink-0">
                    <div className="relative aspect-[4/5] w-full max-w-sm mx-auto md:max-w-none rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm">
                      <Image
                        src={editor.photo}
                        alt={getText(editor.name, editor.nameEn) || t('awardsPhotoAltEditor')}
                        fill
                        sizes="(max-width: 640px) 90vw, (max-width: 1024px) 320px, 360px"
                        className="object-cover object-center"
                        unoptimized
                        priority
                      />
                    </div>
                  </div>
                )}

                {/* 右側情報（役職・名前・肩書・プロフィール） */}
                <div className="flex-1 space-y-5 text-left w-full">
                  <div className="space-y-1">
                    <div className="text-xs sm:text-sm font-black text-[#E6007E] tracking-widest uppercase">
                      AWARDS EDITORIAL DIRECTOR
                    </div>
                    <div className="text-sm sm:text-base font-bold text-slate-600">
                      {getText(editor.role, editor.roleEn) || t('awardsEditorialDirectorRole')}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                      {getText(editor.name, editor.nameEn)}
                    </h3>
                    {editor.title && (
                      <p className="text-base sm:text-lg font-bold text-slate-600 mt-1">
                        {getText(editor.title, editor.titleEn)}
                      </p>
                    )}
                  </div>

                  {editor.profile && (
                    <div className="pt-4 border-t border-slate-100">
                      <p className="text-base sm:text-lg text-slate-700 leading-relaxed font-normal whitespace-pre-line max-w-2xl">
                        {getText(editor.profile, editor.profileEn)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </article>
          )}

          {/* 3-B. 編集部メンバー・審査員（人物カードグリッド） */}
          {members.length > 0 && (
            <div className="space-y-6 pt-4">
              <div className="space-y-1">
                <div className="text-xs font-black text-slate-400 uppercase tracking-widest">
                  MEMBERS
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {t('awardsMembersTitle')}
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                {members.map((member, idx) => {
                  const memName = getText(member.name, member.nameEn);
                  const memRole = getText(member.role, member.roleEn);
                  const memTitle = getText(member.title, member.titleEn);
                  const memProfile = getText(member.profile, member.profileEn);

                  return (
                    <article
                      key={`award-member-${idx}`}
                      className="bg-white text-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm flex flex-col space-y-5"
                    >
                      {/* 1. 人物写真 */}
                      {member.photo && (
                        <div className="relative aspect-[4/3] sm:aspect-square w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                          <Image
                            src={member.photo}
                            alt={memName || t('awardsPhotoAltMember')}
                            fill
                            sizes="(max-width: 768px) 100vw, 450px"
                            className="object-cover object-center"
                            unoptimized
                          />
                        </div>
                      )}

                      {/* 2. ROLE, 3. 氏名, 4. 所属・肩書 */}
                      <div className="space-y-1">
                        {memRole && (
                          <div className="text-xs font-black text-[#E6007E] uppercase tracking-wide">
                            {memRole}
                          </div>
                        )}
                        <h4 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                          {memName}
                        </h4>
                        {memTitle && (
                          <p className="text-sm font-semibold text-slate-600">
                            {memTitle}
                          </p>
                        )}
                      </div>

                      {/* 5. 短いプロフィール */}
                      {memProfile && (
                        <div className="pt-3 border-t border-slate-100 flex-1">
                          <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-normal whitespace-pre-line">
                            {memProfile}
                          </p>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {/* ========================================================= */}
        {/* 4. OSAKA FRINGE AWARDSとは（理念・活動の可視化）          */}
        {/* ========================================================= */}
        {aboutSection && (
          <section className="bg-white text-slate-900 rounded-3xl p-8 sm:p-12 lg:p-14 border border-slate-200/90 shadow-sm space-y-8">
            <div className="space-y-3 max-w-3xl">
              <div className="text-xs font-black text-[#E6007E] uppercase tracking-widest">
                ABOUT AWARDS
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight border-l-4 border-[#E6007E] pl-4 leading-snug">
                {getText(aboutSection.title, aboutSection.titleEn) || t('awardsAboutTitle')}
              </h2>
            </div>

            {/* 本文のスマート分割表示 */}
            {renderAboutContent(getText(aboutSection.text, aboutSection.textEn))}
          </section>
        )}

        {/* ========================================================= */}
        {/* 5. 審査・選考について（選考の独立性）                     */}
        {/* ========================================================= */}
        {independenceSection && (
          <section className="bg-white text-slate-900 rounded-3xl p-8 sm:p-12 border border-slate-200/90 shadow-sm space-y-6">
            <div className="flex items-center gap-2 text-xs font-black text-[#E6007E] uppercase tracking-widest">
              <ShieldCheck className="w-4 h-4" />
              <span>INDEPENDENCE & INTEGRITY</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight border-l-4 border-[#E6007E] pl-4 leading-snug">
              {getText(independenceSection.title, independenceSection.titleEn) || t('awardsSelectionTitle')}
            </h2>

            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 sm:p-8 space-y-3 max-w-3xl">
              <p className="text-base sm:text-lg text-slate-800 font-medium leading-relaxed whitespace-pre-line">
                {getText(independenceSection.text, independenceSection.textEn)}
              </p>
            </div>
          </section>
        )}

        {/* ========================================================= */}
        {/* 6. アワードの考え方・特徴（アーティストへ / 観客へ）       */}
        {/* ========================================================= */}
        <section className="space-y-8">
          <div className="space-y-2 border-b border-slate-800 pb-4">
            <div className="text-xs font-black text-[#E6007E] uppercase tracking-widest">
              PERSPECTIVES
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              {t('awardsPerspectivesTitle')}
            </h2>
          </div>

          {/* 6-A. アーティストの皆さまへ */}
          {artistSection && (
            <article className="bg-white text-slate-900 rounded-3xl p-8 sm:p-12 lg:p-14 border border-slate-200/90 shadow-sm space-y-8">
              <div className="space-y-3 max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                  FOR ARTISTS
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight border-l-4 border-[#E6007E] pl-4 leading-snug">
                  {getText(artistSection.title, artistSection.titleEn)}
                </h3>
              </div>

              {renderArtistContent(getText(artistSection.text, artistSection.textEn))}
            </article>
          )}

          {/* 6-B. 観客の皆さまへ */}
          {audienceSection && (
            <article className="bg-white text-slate-900 rounded-3xl p-8 sm:p-12 lg:p-14 border border-slate-200/90 shadow-sm space-y-6">
              <div className="space-y-3 max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                  FOR AUDIENCES
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight border-l-4 border-[#E6007E] pl-4 leading-snug">
                  {getText(audienceSection.title, audienceSection.titleEn)}
                </h3>
              </div>

              {renderAudienceContent(getText(audienceSection.text, audienceSection.textEn))}
            </article>
          )}

          {/* その他のカスタムセクションが存在する場合の安全な表示 */}
          {otherSections.map((sec, idx) => {
            const secTitle = getText(sec.title, sec.titleEn);
            const secText = getText(sec.text, sec.textEn);
            if (!secTitle && !secText) return null;

            return (
              <article
                key={`other-award-sec-${idx}`}
                className="bg-white text-slate-900 rounded-3xl p-8 sm:p-12 border border-slate-200/90 shadow-sm space-y-4"
              >
                {secTitle && (
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight border-l-4 border-[#E6007E] pl-4 leading-snug">
                    {secTitle}
                  </h3>
                )}
                {secText && (
                  <p className="text-base sm:text-lg text-slate-700 font-normal leading-relaxed whitespace-pre-line max-w-3xl">
                    {secText}
                  </p>
                )}
              </article>
            );
          })}
        </section>

        {/* ========================================================= */}
        {/* 7. その他の詳細情報（今後のご案内・お知らせ）              */}
        {/* ========================================================= */}
        {notice && (
          <aside className="bg-slate-900 text-slate-100 border border-slate-800 rounded-3xl p-8 sm:p-10 space-y-4">
            <div className="flex items-center gap-2 text-xs font-black text-[#E6007E] uppercase tracking-widest">
              <Info className="w-4 h-4" />
              <span>{t('awardsUpcomingTitle')}</span>
            </div>
            <p className="text-base sm:text-lg text-slate-200 leading-relaxed font-medium whitespace-pre-line max-w-3xl">
              {notice}
            </p>
          </aside>
        )}

        {/* ========================================================= */}
        {/* 8. ページ最下部：簡易推薦CTA & 公演を探す                */}
        {/* ========================================================= */}
        <section className="bg-gradient-to-br from-white via-slate-50 to-pink-50/30 text-slate-900 rounded-3xl p-8 sm:p-12 border border-slate-200/90 shadow-sm text-center space-y-6">
          <div className="max-w-xl mx-auto space-y-2">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900">
              {t('awardsBottomNominatePrompt')}
            </h3>
            <p className="text-sm sm:text-base text-slate-600 font-normal">
              自薦・他薦を問わず、あなたの声が新しい表現を見つける力になります。
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/vote"
              className="inline-flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#E6007E] hover:bg-[#c4006b] text-white font-black text-base sm:text-lg tracking-wide shadow-lg shadow-pink-500/20 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer group text-center"
            >
              <span>{t('awardsNominateBtn')}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/audience"
              className="inline-flex items-center justify-center gap-2.5 w-full sm:w-auto px-8 py-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-base border border-slate-200 shadow-sm hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer group text-center"
            >
              <Ticket className="w-4 h-4 text-[#E6007E]" />
              <span>{t('awardsFindShowsBtn')}</span>
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}
