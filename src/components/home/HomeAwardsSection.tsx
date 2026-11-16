'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Performance } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import {
  FRINGE_AWARDS_2026,
  AWARD_EDITORS_2026,
  FringeAward,
} from '@/data/postEventData';
import { ArrowDown, ArrowUpRight, ChevronDown } from 'lucide-react';

interface HomeAwardsSectionProps {
  awards?: FringeAward[];
  performances?: Performance[];
}

export default function HomeAwardsSection({
  awards = FRINGE_AWARDS_2026,
  performances = [],
}: HomeAwardsSectionProps) {
  const { language } = useLanguage();
  const isEn = language === 'en';

  return (
    <section
      id="awards"
      className="scroll-mt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16"
    >
      {/* ====================================================================
          1. アワードのタイトルと紹介（コンパクト化）
          ==================================================================== */}
      <div className="border-t-4 border-[#E6007E] pt-8 sm:pt-10 space-y-4">
        <div className="space-y-2">
          <span className="text-sm sm:text-base font-black tracking-widest text-[#E6007E] uppercase block">
            OSAKA FRINGE AWARDS 2026
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            {isEn ? 'Carrying Expressions to the Next Stage.' : 'その表現を、次の舞台へ。'}
          </h2>
        </div>

        <p className="max-w-3xl text-slate-700 text-base sm:text-lg leading-relaxed font-medium">
          {isEn
            ? 'Discovering new charms in artists and performances, connecting them to future stages. The expressions encountered at Osaka Fringe are carried forward to new audiences, venues, and international platforms.'
            : '作品やアーティストの新たな魅力を発見し、次の機会へつなぐアワード。大阪フリンジで出会った表現を、新しい観客や国内外の舞台へと届けていきます。'}
        </p>
      </div>

      {/* ====================================================================
          2. 4つの賞の目次（細い区切り線と余白で整理・公演写真サムネイル付）
          ==================================================================== */}
      <div className="border-t border-slate-200 pt-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 lg:gap-x-14 gap-y-8 sm:gap-y-10">
          {awards.map((award) => {
            const hasWinner = Boolean(award.winner);
            const winner = award.winner;

            const awardName = isEn ? award.nameEn : award.name;
            const presenter = isEn ? (award.presenterEn || award.presenter) : award.presenter;
            const winnerTitle = isEn ? (winner?.titleEn || winner?.title) : winner?.title;

            // 公演情報または会場・アップロード画像からサムネイルを抽出
            const winnerPerformance = winner?.performanceId
              ? performances.find((p) => p.id === winner.performanceId)
              : undefined;
            const listPerformanceImage =
              winnerPerformance?.image ||
              winner?.performanceImage ||
              winner?.image;

            return (
              <div
                key={award.id}
                className="border-b border-slate-200/80 pb-6 sm:pb-8 space-y-3.5"
              >
                {/* Upper: Number and Person */}
                <div className="flex items-center justify-between">
                  <span className="text-2xl sm:text-3xl font-black text-[#E6007E] tracking-tighter">
                    {award.number}
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-slate-600">
                    {presenter}
                  </span>
                </div>

                {/* Award Title and English Name */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="w-1.5 h-4 bg-[#E6007E] inline-block shrink-0 rounded-full" />
                    <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                      {awardName}
                    </h3>
                    {!isEn && award.nameSub && (
                      <span className="text-sm font-black text-[#E6007E]">
                        {award.nameSub}
                      </span>
                    )}
                  </div>
                  {!isEn && (
                    <p className="text-xs font-bold text-slate-400 tracking-wider uppercase pl-3.5">
                      {award.nameEn}
                    </p>
                  )}
                </div>

                {/* Confirmed Winner Information（写真を大きく見やすいレイアウトへ変更） */}
                {hasWinner && winner && (
                  <div className="pt-2 space-y-3">
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 items-start">
                      {listPerformanceImage && (
                        <a
                          href={winner.detailAnchor || '#awards'}
                          className="relative w-full sm:w-52 md:w-48 lg:w-56 aspect-[16/10] rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200/80 shadow-sm block group focus:outline-none focus:ring-2 focus:ring-[#E6007E]"
                          aria-label={`${winnerTitle}の受賞理由へ移動`}
                        >
                          <Image
                            src={listPerformanceImage}
                            alt={winnerTitle || '受賞作品写真'}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 210px, 240px"
                          />
                        </a>
                      )}
                      <div className="space-y-2 min-w-0 flex-1">
                        <p className="text-xs font-black text-[#E6007E] uppercase tracking-wider">
                          {isEn ? 'Award Winner' : '受賞作品 / 受賞者'}
                        </p>
                        <p className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                          {winnerTitle}
                        </p>
                        {winner.detailAnchor && (
                          <div className="pt-1">
                            <a
                              href={winner.detailAnchor}
                              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-black text-[#E6007E] hover:text-[#c4006b] transition-colors border-b-2 border-[#E6007E] pb-0.5"
                            >
                              <span>{isEn ? 'Read Citation' : '受賞理由を読む'}</span>
                              <ArrowDown className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ====================================================================
          3. 受賞紹介（全4賞：写真と文字が主役になる構成 / 外枠を外し写真・受賞理由を直結）
          ==================================================================== */}
      <div className="space-y-16 sm:space-y-24">
        {awards
          .filter((award) => Boolean(award.winner))
          .map((award) => {
            const winner = award.winner!;
            const awardName = isEn ? award.nameEn : award.name;
            const presenter = isEn ? (award.presenterEn || award.presenter) : award.presenter;
            const winnerTitle = isEn ? (winner.titleEn || winner.title) : winner.title;

            // 講評部分の画像：アップロードされた画像（または会場画像）を使用し、無い場合は公演情報から抽出
            const awardPerformance = winner.performanceId
              ? performances.find((p) => p.id === winner.performanceId)
              : undefined;
            const citationImage =
              winner.image ||
              awardPerformance?.image ||
              winner.performanceImage;
            const citationImageAlt = isEn
              ? (winner.imageAltEn || winner.titleEn || winner.title)
              : (winner.imageAlt || winner.title);

            const paragraphs = isEn && winner.citationParagraphsEn
              ? winner.citationParagraphsEn
              : (winner.citationParagraphs || []);

            const citationSign = isEn
              ? (winner.citationSignEn || winner.citationSign || presenter)
              : (winner.citationSign || presenter);

            const anchorId = (winner.detailAnchor || `#award-${award.id}`).replace(/^#/, '');
            const isPortrait = winner.imageAspect === 'portrait';

            return (
              <div
                key={award.id}
                id={anchorId}
                className="scroll-mt-24 border-t-2 border-slate-900 pt-10 sm:pt-14 space-y-8"
              >
                {/* Header sequence: Award Category -> Winner Name */}
                <div className="space-y-2 border-b border-slate-200 pb-5">
                  <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
                    <span className="w-2.5 h-2.5 bg-[#E6007E] inline-block rounded-full shrink-0" />
                    <span className="text-sm sm:text-base font-black text-[#E6007E] tracking-wider uppercase">
                      {award.number} {awardName}
                    </span>
                    {!isEn && award.nameSub && (
                      <span className="text-sm sm:text-base font-black text-[#E6007E]">
                        {award.nameSub}
                      </span>
                    )}
                    <span className="text-xs sm:text-sm font-bold text-slate-500">
                      / {presenter}
                    </span>
                  </div>

                  {/* 受賞名: セクション内で最も大きな文字 */}
                  <h3 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                    {winnerTitle}
                  </h3>
                </div>

                {/* Photo and Citation text */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                  {/* Left: Photo（縦長・横長の双方で見栄えする適応レイアウト） */}
                  {citationImage && (
                    <div className={isPortrait ? 'lg:col-span-5 space-y-2' : 'lg:col-span-6 space-y-2'}>
                      <div
                        className={`relative w-full overflow-hidden bg-slate-900 rounded-2xl border border-slate-200/80 shadow-md ${
                          isPortrait
                            ? 'aspect-[3/4]'
                            : 'aspect-[16/10] sm:aspect-[16/9]'
                        }`}
                      >
                        <Image
                          src={citationImage}
                          alt={citationImageAlt}
                          fill
                          sizes="(max-width: 1024px) 100vw, 560px"
                          className={isPortrait ? 'object-contain sm:object-cover' : 'object-cover'}
                        />
                      </div>
                      <p className="text-xs text-slate-500 leading-normal px-1">
                        {citationImageAlt}
                      </p>
                    </div>
                  )}

                  {/* Right: Citation content */}
                  <div
                    className={
                      citationImage
                        ? isPortrait
                          ? 'lg:col-span-7 space-y-6'
                          : 'lg:col-span-6 space-y-6'
                        : 'lg:col-span-12 space-y-6'
                    }
                  >
                    {/* 受賞理由: 本文の小見出し */}
                    <h4 className="text-lg sm:text-xl font-black text-slate-900 border-b border-slate-200 pb-2">
                      {isEn ? 'Citation' : '受賞理由'}
                    </h4>

                    <div className="space-y-5 text-slate-800 text-base sm:text-lg leading-relaxed font-normal">
                      {paragraphs.map((paragraph, idx) => (
                        <p key={idx} className="leading-relaxed">
                          {paragraph}
                        </p>
                      ))}
                    </div>

                    {/* Sign-off / Presenter */}
                    {citationSign && (
                      <p className="text-right text-sm sm:text-base font-bold text-slate-700 pt-2 border-t border-slate-100">
                        {citationSign}
                      </p>
                    )}

                    {/* Links to existing performance / artist / venue archive pages */}
                    <div className="pt-6 border-t border-slate-200 flex flex-wrap gap-3.5 sm:gap-4">
                      {winner.performanceId && (
                        <Link
                          href={`/performances/${winner.performanceId}`}
                          className="inline-flex items-center gap-1.5 px-5 py-3 bg-slate-900 text-white text-xs sm:text-sm font-black hover:bg-[#E6007E] transition-colors rounded-xl"
                        >
                          <span>{isEn ? 'View 2026 Performance' : '2026年 公演詳細を見る'}</span>
                          <ArrowUpRight className="w-4 h-4" />
                        </Link>
                      )}
                      {winner.artistId && (
                        <Link
                          href={`/artists/${winner.artistId}`}
                          className="inline-flex items-center gap-1.5 px-5 py-3 bg-white text-slate-900 border-2 border-slate-900 text-xs sm:text-sm font-black hover:border-[#E6007E] hover:text-[#E6007E] transition-colors rounded-xl"
                        >
                          <span>
                            {winner.artistName
                              ? isEn
                                ? `View Artist (${winner.artistNameEn || winner.artistName})`
                                : `参加アーティスト情報を見る（${winner.artistName}）`
                              : isEn
                                ? 'View Participating Artist'
                                : '参加アーティスト情報を見る'}
                          </span>
                          <ArrowUpRight className="w-4 h-4" />
                        </Link>
                      )}
                      {winner.additionalArtistId && (
                        <Link
                          href={`/artists/${winner.additionalArtistId}`}
                          className="inline-flex items-center gap-1.5 px-5 py-3 bg-white text-slate-900 border-2 border-slate-900 text-xs sm:text-sm font-black hover:border-[#E6007E] hover:text-[#E6007E] transition-colors rounded-xl"
                        >
                          <span>
                            {isEn
                              ? `View Artist (${winner.additionalArtistNameEn || winner.additionalArtistName})`
                              : `参加アーティスト情報を見る（${winner.additionalArtistName}）`}
                          </span>
                          <ArrowUpRight className="w-4 h-4" />
                        </Link>
                      )}
                      {winner.venueId && (
                        <Link
                          href={`/venues/${winner.venueId}`}
                          className="inline-flex items-center gap-1.5 px-5 py-3 bg-slate-900 text-white text-xs sm:text-sm font-black hover:bg-[#E6007E] transition-colors rounded-xl"
                        >
                          <span>{isEn ? 'View Venue Details' : '会場詳細を見る'}</span>
                          <ArrowUpRight className="w-4 h-4" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {/* ====================================================================
          4. アワードについて（理念・編集部を開閉領域にまとめてコンパクト化）
          ==================================================================== */}
      <div className="border-t border-slate-200 pt-6">
        <details className="group border border-slate-200 rounded-2xl bg-white p-5 sm:p-7 shadow-sm">
          <summary className="flex items-center justify-between cursor-pointer list-none select-none text-slate-900 font-black text-base sm:text-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E6007E] rounded-lg">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-[#E6007E] inline-block rounded-full" />
              <span>
                {isEn ? 'About Fringe Awards & Editorial Board' : 'アワードの考え方・編集部について'}
              </span>
            </span>
            <ChevronDown className="w-5 h-5 text-slate-500 group-open:rotate-180 transition-transform duration-200 shrink-0" />
          </summary>

          <div className="pt-8 space-y-10 border-t border-slate-100 mt-5">
            {/* アワードの考え方 */}
            <div className="space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-black text-[#E6007E] tracking-widest uppercase block">
                  PHILOSOPHY
                </span>
                <h4 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {isEn ? 'Not ranking, but discovering yet-unnamed value.' : '順位ではなく、まだ名前のない価値を見つける。'}
                </h4>
              </div>

              <div className="max-w-3xl space-y-3 text-slate-700 text-sm sm:text-base leading-relaxed font-medium">
                {isEn ? (
                  <>
                    <p>
                      Discovering works and talents encountered at Osaka Fringe, giving their appeal words, and introducing them to society. OSAKA FRINGE AWARDS 2026 is an award dedicated to such discovery.
                    </p>
                    <p>
                      Attending performances in person, holding dialogues, reflecting on what moved hearts, and considering whom to deliver these works to. The Awards Editorial Board observes the potential of works and artists from diverse perspectives.
                    </p>
                  </>
                ) : (
                  <>
                    <p>
                      大阪フリンジで出会う作品や才能を見つけ、その魅力を言葉にして、社会へ紹介する。
                      OSAKA FRINGE AWARDS 2026は、そんな「発見」のためのアワードです。
                    </p>
                    <p>
                      作品を実際に観て、対話を重ね、その表現のどこに心が動いたのか、誰に届けたいのかを考える。アワード編集部が、多様な視点から作品やアーティストの可能性を見つめます。
                    </p>
                  </>
                )}
              </div>

              {/* 3つの言葉（文字と罫線を中心に簡潔に） */}
              <div className="border-y border-slate-200 divide-y divide-slate-100">
                <div className="py-3 sm:py-4 flex flex-col sm:flex-row sm:items-baseline sm:gap-6">
                  <span className="text-sm sm:text-base font-black text-[#E6007E] tracking-wider w-32">
                    DISCOVER
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-slate-900">
                    {isEn ? 'Discover' : '発見する'}
                  </span>
                </div>
                <div className="py-3 sm:py-4 flex flex-col sm:flex-row sm:items-baseline sm:gap-6">
                  <span className="text-sm sm:text-base font-black text-[#E6007E] tracking-wider w-32">
                    WATCH
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-slate-900">
                    {isEn ? 'Watch & Converse' : '観る・対話する'}
                  </span>
                </div>
                <div className="py-3 sm:py-4 flex flex-col sm:flex-row sm:items-baseline sm:gap-6">
                  <span className="text-sm sm:text-base font-black text-[#E6007E] tracking-wider w-32">
                    EDIT
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-slate-900">
                    {isEn ? 'Edit & Introduce to Society' : '言葉にし、社会へ紹介する'}
                  </span>
                </div>
              </div>

              <p className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed max-w-3xl">
                {isEn
                  ? 'Rather than concluding with bestowing an award, we aim for the expressions discovered here to meet next audiences, next places, and next opportunities.'
                  : '賞を贈って終わりではなく、ここで見つけた表現が、次の観客、次の場所、次の機会に出会うことを目指します。'}
              </p>
            </div>

            {/* アワード編集部 */}
            <div className="space-y-6 pt-6 border-t border-slate-100">
              <div className="space-y-1">
                <span className="text-xs font-black text-[#E6007E] tracking-widest uppercase block">
                  EDITORIAL BOARD
                </span>
                <h4 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {isEn ? 'Awards Editorial Board' : 'アワード編集部'}
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                {AWARD_EDITORS_2026.map((editor, idx) => (
                  <div key={idx} className="space-y-1.5 border-l-2 border-[#E6007E] pl-3.5 py-1">
                    <span className="text-xs font-black text-[#E6007E] tracking-wider uppercase block">
                      {isEn ? (editor.roleEn || editor.role) : editor.role}
                    </span>
                    <p className="text-lg sm:text-xl font-black text-slate-900">
                      {isEn ? (editor.nameEn || editor.name) : editor.name}
                    </p>
                    <p className="text-xs sm:text-sm font-medium text-slate-600 leading-relaxed">
                      {isEn ? (editor.affiliationEn || editor.affiliation) : editor.affiliation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </details>
      </div>
    </section>
  );
}
