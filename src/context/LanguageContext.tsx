'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from '@/types';

interface Dictionary {
  [key: string]: {
    ja: string;
    en: string;
  };
}

export const translations: Dictionary = {
  // Navigation
  navHome: { ja: 'ホーム', en: 'Home' },
  navAudience: { ja: 'Audience App', en: 'Audience App' },
  navAbout: { ja: 'Osaka Fringeとは', en: 'About' },
  navVenues: { ja: '会場一覧', en: 'Venues' },
  navArtists: { ja: 'アーティスト', en: 'Artists' },
  navAwards: { ja: 'Award', en: 'Awards' },
  navDonate: { ja: '寄付・応援', en: 'Support & Donate' },
  navContact: { ja: 'お問い合わせ', en: 'Contact' },
  
  // Hero & Home
  heroTagline: { ja: '熱気と驚きが交差する、大阪の街角ステージ', en: 'Where Energy Meets Wonder: Osaka Street Stage' },
  heroSubtitle: { ja: '世界中から集まるアーティストと観客が創るオープンアートフェスティバル', en: 'An open-access performing arts festival created by global artists & audience' },
  heroOpenAudience: { ja: 'Audience Appで公演を探す', en: 'Find Shows on Audience App' },
  heroVenuesMap: { ja: '会場マップ・一覧', en: 'Venues & Map' },
  heroLocationSummary: { ja: '大阪市内各所（中崎町・心斎橋・中之島・天王寺）', en: 'Various Osaka Venues (Nakazakicho, Shinsaibashi, Nakanoshima, Tennoji)' },
  pickUpShows: { ja: 'PICK UP SHOWS', en: 'PICK UP SHOWS' },
  pickUpTitle: { ja: '注目のハイライト公演', en: 'Featured Highlight Shows' },
  pickUpSubtitle: { ja: '見逃せないフェスティバル厳選パフォーマンス', en: 'Selected festival performances you cannot miss' },
  viewAllAudience: { ja: 'Audience Appで全公演を検索', en: 'Search all shows in Audience App' },
  appCtaBadge: { ja: '観客専用ウェブアプリ', en: 'Official Audience Web App' },
  appCtaTitle: { ja: '大阪の街を歩きながら、次の公演を今すぐ見つけよう', en: 'Explore the streets of Osaka and find your next show right now' },
  appCtaDesc: { ja: '「いま見られる公演（WHAT）」「近くの会場（WHERE）」「今日の上演（WHEN）」をスマホで直感検索。Google Maps連携で会場まで迷わずナビゲーション。', en: 'Search intuitively on your smartphone by WHAT (shows), WHERE (nearby venues), and WHEN (today’s schedule). Navigate effortlessly with direct Google Maps integration.' },
  launchApp: { ja: 'Audience App を起動する', en: 'Launch Audience App' },
  aboutPreviewBadge: { ja: 'ABOUT OSAKA FRINGE', en: 'ABOUT OSAKA FRINGE' },
  readMore: { ja: '詳しく読む', en: 'Read More' },
  awardsPreviewBadge: { ja: 'OSAKA FRINGE AWARDS', en: 'OSAKA FRINGE AWARDS' },
  awardsPreviewTitle: { ja: 'Osaka Fringe Awards', en: 'Osaka Fringe Awards' },
  awardsPreviewSubtitle: { ja: '観客と審査員が選ぶ、未来を拓く最優秀作品', en: 'Honoring breakthrough works chosen by audience and jury' },
  viewPastWinners: { ja: '歴代受賞者を見る', en: 'View Past Winners' },
  
  // Audience App
  audienceTitle: { ja: 'Audience App（観客向け公演ガイド）', en: 'Audience App (Festival Guide)' },
  audienceSubtitle: { ja: 'WHAT / WHERE / WHEN から探す・地図で巡る', en: 'Explore by WHAT / WHERE / WHEN & Map' },
  tabSearch: { ja: '公演を探す (Search)', en: 'Find Shows' },
  tabMap: { ja: '会場マップ (Map)', en: 'Venue Map' },
  tabFavorites: { ja: 'お気に入り (My List)', en: 'My Favorites' },
  
  // Filters
  filterWhat: { ja: 'WHAT (何を見る？)', en: 'WHAT (Genre & Keyword)' },
  filterWhere: { ja: 'WHERE (どこで見る？)', en: 'WHERE (Venues & Areas)' },
  filterWhen: { ja: 'WHEN (いつ見る？)', en: 'WHEN (Dates & Today)' },
  searchPlaceholder: { ja: '公演名、アーティスト名、キーワードで検索...', en: 'Search by title, artist, keyword...' },
  allGenres: { ja: '全ジャンル', en: 'All Genres' },
  allVenues: { ja: '全会場・全エリア', en: 'All Venues & Areas' },
  allDates: { ja: '全日程', en: 'All Dates' },
  todaysShows: { ja: '🔥 本日の公演 (Today)', en: '🔥 Today’s Shows' },
  resetFilters: { ja: 'フィルターをリセット', en: 'Reset Filters' },
  showingTodayOnly: { ja: '🔥 本日の公演のみを表示中', en: '🔥 Showing today’s shows only' },
  showingAllDates: { ja: '全期間中から絞り込み', en: 'Filtering from entire schedule' },
  resultsCount: { ja: '該当公演', en: 'Matching Shows' },
  showsUnit: { ja: '件', en: 'shows' },
  viewingFavorites: { ja: 'お気に入りリストを表示中', en: 'Viewing My Favorites List' },
  noResults: { ja: '条件に一致する公演が見つかりませんでした。', en: 'No performances match your search criteria.' },
  showAllShows: { ja: 'すべての公演を表示する', en: 'Show All Performances' },
  
  // 8 Major Genres (User Specified)
  genre_street: { ja: '大道芸', en: 'Street Performance' },
  genre_dance: { ja: 'ダンス', en: 'Dance' },
  genre_music: { ja: '音楽', en: 'Music' },
  genre_theater: { ja: '演劇・パフォーマンス', en: 'Theater & Performance' },
  genre_traditional: { ja: '古典芸能', en: 'Traditional Arts' },
  genre_kamishibai: { ja: '紙芝居', en: 'Kamishibai' },
  genre_exhibition: { ja: '作品展示', en: 'Art Exhibition' },
  genre_other: { ja: 'その他', en: 'Other' },
  
  // Performance Card & Modal
  viewDetails: { ja: '詳細を見る', en: 'View Details' },
  directions: { ja: 'Google Mapでナビ', en: 'Directions (Google Maps)' },
  tickets: { ja: 'チケット・予約', en: 'Tickets & Info' },
  bookTickets: { ja: 'チケット予約・購入', en: 'Book / Reserve Tickets' },
  scheduleList: { ja: '公演日時・会場', en: 'Schedule & Venue' },
  venueLabel: { ja: '会場', en: 'Venue' },
  durationLabel: { ja: '上演時間', en: 'Duration' },
  minutes: { ja: '分', en: 'min' },
  priceLabel: { ja: '料金 / Ticket Price', en: 'Ticket Price' },
  inquirePrice: { ja: '要問合せ', en: 'Inquire' },
  aboutTheShow: { ja: '公演について / ABOUT THE SHOW', en: 'ABOUT THE SHOW' },
  officialLinks: { ja: '公式リンク & SNS', en: 'Official Links & Social' },
  
  // Venues Page
  venuesPageBadge: { ja: 'FESTIVAL VENUES & MAP', en: 'FESTIVAL VENUES & MAP' },
  venuesPageTitle: { ja: '会場一覧 & アクセスマップ', en: 'Venues & Access Map' },
  venuesPageSubtitle: { ja: '大阪の個性豊かなスペースが劇場に。ピンをタップして経路案内を確認できます。', en: 'Unique Osaka spaces transformed into stages. Tap pins for direct navigation.' },
  allVenuesTitle: { ja: '全会場詳細', en: 'All Festival Venues' },
  venuesCountUnit: { ja: 'カ所', en: 'venues' },
  showsAtVenue: { ja: 'この会場での公演', en: 'Shows at this venue' },
  goToMaps: { ja: 'Google Maps でここへ行く', en: 'Get Directions on Google Maps' },
  selectVenue: { ja: '会場を選択:', en: 'Select Venue:' },
  tapPinHint: { ja: 'ピンをタップして会場情報を確認', en: 'Tap pins to view venue info' },
  noShowsScheduled: { ja: '現在予定されている公演はありません', en: 'No scheduled shows at this venue' },
  photosCount: { ja: '枚の写真', en: 'photos' },
  
  // Artists Page
  artistsPageBadge: { ja: 'ARTISTS & SHOWS', en: 'ARTISTS & SHOWS' },
  artistsPageTitle: { ja: 'アーティスト・公演一覧', en: 'Artists & Performances' },
  artistsPageSubtitle: { ja: '世界と日本から集まった情熱あふれる表現者たち。', en: 'Passionate performing artists from Japan and across the globe.' },
  schedulesCount: { ja: '公演スケジュール', en: 'Schedules' },
  viewOnAudienceApp: { ja: 'Audience App で詳しく見る', en: 'View Details on Audience App' },
  
  // Awards Page
  awardsPageBadge: { ja: 'OSAKA FRINGE AWARDS', en: 'OSAKA FRINGE AWARDS' },
  awardsPageTitle: { ja: 'Osaka Fringe Awards', en: 'Osaka Fringe Awards' },
  awardsPageSubtitle: { ja: '挑戦的な表現を称え、次なる世界舞台へと送り出すフリンジアワード。', en: 'Celebrating daring artistic expression and launching creators to international stages.' },
  awardsOverview: { ja: 'アワード概要 & 特典', en: 'Awards Overview & Honors' },
  grandPrixTitle: { ja: 'Osaka Fringe Grand Prix', en: 'Osaka Fringe Grand Prix' },
  grandPrixDesc: { ja: '審査員および海外フリンジディレクターにより選出される最優秀作品賞。副賞として海外主要フリンジ（エディンバラ等）への渡航・登録サポートが授与されます。', en: 'The top prize awarded by the jury and international fringe directors. Includes travel and registration grants for major overseas fringe festivals.' },
  audienceChoiceTitle: { ja: 'Audience Choice Award', en: 'Audience Choice Award' },
  audienceChoiceDesc: { ja: 'Audience Appを通じて観客から最も多くの票を集めた作品に贈られる観客賞。観客の「一番心に残った」をダイレクトに反映します。', en: 'Voted directly by festival audiences via the Audience App to honor the show that captured hearts the most.' },
  innovationTitle: { ja: 'Innovation in Arts Award', en: 'Innovation in Arts Award' },
  innovationDesc: { ja: '従来のジャンルや枠組みを大胆に打ち破る革新的な表現・演出を讃える審査員特別賞。', en: 'Special jury prize honoring ground-breaking, unconventional works pushing performance boundaries.' },
  pastWinnersTitle: { ja: '歴代受賞作品一覧', en: 'Award Winners Archive' },
  awardsComingSoon: { ja: '現在、第1回 Osaka Fringe Awards の審査準備中です。フェスティバル期間中に観客投票・審査が行われます。', en: 'Preparations are underway for the 1st Osaka Fringe Awards. Voting will open during the festival.' },
  
  // Donate Page
  donatePageBadge: { ja: 'SUPPORT & DONATE', en: 'SUPPORT & DONATE' },
  donatePageTitle: { ja: '大阪フリンジを育てる寄付・サポーター募集', en: 'Support Osaka Fringe: Donations & Partnership' },
  donatePageSubtitle: { ja: '自由な舞台芸術の発展と、大阪の文化を世界へ発信するためのご支援をお願いいたします。', en: 'Join us in empowering independent artists and sharing Osaka’s vibrant culture with the world.' },
  donatePurpose: { ja: '寄付の目的と活用方法', en: 'Purpose & Impact of Your Support' },
  impact1Title: { ja: '若手・実験的アーティスト支援', en: 'Emerging & Experimental Artist Grants' },
  impact1Desc: { ja: '参加費用の軽減や会場設備サポート', en: 'Reducing participation costs and providing technical equipment support' },
  impact2Title: { ja: '多言語・アクセシビリティ環境整備', en: 'Multilingual & Accessibility Initiatives' },
  impact2Desc: { ja: '海外からの観客・パフォーマー対応の強化', en: 'Enhancing multilingual guides and accessible venue environments' },
  donateMethods: { ja: 'ご支援の方法', en: 'Ways to Support' },
  crowdfundingTitle: { ja: 'クラウドファンディングで応援', en: 'Support via Crowdfunding' },
  crowdfundingDesc: { ja: '限定グッズやリワード付きのプロジェクトを実施しています。', en: 'Support ongoing campaigns with exclusive festival merchandise and rewards.' },
  viewProject: { ja: 'プロジェクトを見る', en: 'View Campaign' },
  bankTransferTitle: { ja: '銀行振込によるご寄付', en: 'Direct Bank Transfer' },
  bankTransferNotice: { ja: '※お振込後、お問い合わせフォームよりご一報いただけますと幸いです。', en: '* Please notify us via the contact form after making a transfer.' },
  
  // About Page
  aboutPageBadge: { ja: 'ABOUT FESTIVAL', en: 'ABOUT FESTIVAL' },
  feature1Title: { ja: 'オープンアクセス', en: 'Open Access' },
  feature1Desc: { ja: '審査や選考を排し、誰もが自由に表現を発表・挑戦できる舞台です。', en: 'Non-curated and democratic: an open stage for anyone with artistic passion.' },
  feature2Title: { ja: '街全体がステージ', en: 'City-wide Stage' },
  feature2Desc: { ja: '劇場だけでなく、カフェ、古民家、公園など大阪角々が劇場に変わります。', en: 'Transforming traditional houses, cafes, parks, and warehouses into vibrant stages.' },
  feature3Title: { ja: '観客との共創', en: 'Co-created with Audience' },
  feature3Desc: { ja: '観客の投票によってアワードが決まり、次世代アーティストを共に育てます。', en: 'Audience votes directly decide awards, nurturing tomorrow’s stage stars together.' },
  
  // Contact Page
  contactPageBadge: { ja: 'CONTACT US', en: 'CONTACT US' },
  contactPageTitle: { ja: 'お問い合わせ', en: 'Contact Us' },
  contactPageSubtitle: { ja: '公演へのご質問、取材・取材申請、ボランティア参加などお気軽にお寄せください。', en: 'Feel free to contact us regarding shows, media inquiries, or volunteering.' },
  contactFormTitle: { ja: 'Googleフォームからのお問い合わせ', en: 'Inquiry via Google Forms' },
  contactFormDesc: { ja: '通常2〜3営業日以内に担当者よりご返信いたします。', en: 'We typically respond within 2-3 business days.' },
  openInNewTab: { ja: '別タブで開く', en: 'Open in New Tab' },
  
  // Banners & Footer
  instagramBannerTitle: { ja: '公式Instagramでフェスティバルの熱気をチェック！', en: 'Catch the Festival Vibe on Official Instagram!' },
  tourismBannerTitle: { ja: '大阪観光局 公式ポータルサイト', en: 'Osaka Convention & Tourism Bureau' },
  footerTagline: { ja: '大阪フリンジフェスティバル実行委員会', en: 'Osaka Fringe Festival Executive Committee' },
  footerDesc: { ja: '大阪の街全体が舞台になるオープンアクセス芸術祭。演劇、ダンス、コメディ、音楽、アートがジャンルを超えて交差するフェスティバル。', en: 'An open-access performing arts festival turning all of Osaka into a vibrant stage across theater, dance, comedy, music, and art.' },
  poweredByMicroCMS: { ja: 'Data powered by MicroCMS & Gemini AI Translation', en: 'Data powered by MicroCMS & Gemini AI Translation' },
  allRightsReserved: { ja: '© 2026 Osaka Fringe Festival Executive Committee. All rights reserved.', en: '© 2026 Osaka Fringe Festival Executive Committee. All rights reserved.' }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  getText: (jaText?: string, enText?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('ja');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('osaka_fringe_lang') as Language;
      if (saved && (saved === 'ja' || saved === 'en')) {
        setLanguage(saved);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    try {
      localStorage.setItem('osaka_fringe_lang', lang);
    } catch (e) {
      console.error(e);
    }
  };

  const t = (key: string): string => {
    if (!translations[key]) return key;
    return translations[key][language] || translations[key].ja;
  };

  const getText = (jaText?: string, enText?: string): string => {
    if (language === 'en') {
      return enText || jaText || '';
    }
    return jaText || enText || '';
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t, getText }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}