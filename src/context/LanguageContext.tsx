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
  navAudience: { ja: '公演を探す', en: 'Find Shows' },
  navAbout: { ja: 'Osaka Fringeとは', en: 'About' },
  navVenues: { ja: '会場', en: 'Venues' },
  navArtists: { ja: 'アーティスト', en: 'Artists' },
  navDonate: { ja: '応援・連携', en: 'Support' },
  navContact: { ja: 'お問い合わせ', en: 'Contact' },
  
  // Hero & Home
  heroBrandTitle: { ja: '大阪文化万博Osaka Fringe 2026', en: 'Osaka Fringe 2026' },
  heroSpillOver: { ja: 'spill over', en: 'spill over' },
  heroSpillOverSub: { ja: '文化芸術が街にあふれだす', en: 'Arts and Culture Spill Over the City' },
  heroTagline: { ja: '街の一角を、世界の舞台へ。', en: 'Turning Every Corner of Osaka into a World Stage.' },
  heroSubtitle: { 
    ja: '大阪の街じゅうが、舞台になる。\n\n劇場、広場、歴史的建築、カフェ、商店街。\n大阪各地の会場とイベントをめぐりながら、さまざまな表現に出会う1か月。', 
    en: 'The entire city of Osaka becomes a stage.\n\nFrom theaters and public plazas to heritage spaces and local cafes, explore dynamic performances across the city.' 
  },
  heroOpenAudience: { ja: '公演を探す', en: 'Find Shows' },
  heroVenuesMap: { ja: '会場マップ・一覧', en: 'Venues & Map' },
  heroLocationSummary: { ja: '大阪市内・大阪近郊各所', en: 'Across Osaka and surrounding areas' },
  pickUpShows: { ja: 'PICK UP SHOWS', en: 'PICK UP SHOWS' },
  pickUpTitle: { ja: '今週の注目公演', en: 'Shows to Watch' },
  pickUpSubtitle: { ja: 'まもなく開催される注目のパフォーマンス', en: 'Upcoming performances to check out across the city' },
  viewAllAudience: { ja: 'すべての公演を探す', en: 'Find All Shows' },
  appCtaBadge: { ja: '公演ガイド', en: 'Show Guide' },
  appCtaTitle: { ja: '大阪の街を歩きながら、次の公演を今すぐ見つけよう', en: 'Explore the streets of Osaka and find your next show' },
  appCtaDesc: { 
    ja: 'ジャンル（WHAT）、場所（WHERE）、日時（WHEN）から、今の気分に合う公演をスマホで直感検索。Google Maps連携で会場まで迷わずナビゲーション。', 
    en: 'Find shows tailored to your mood by WHAT (genre), WHERE (venues), and WHEN (dates). Navigate effortlessly with direct Google Maps integration.' 
  },
  launchApp: { ja: '公演を探す', en: 'Find Shows' },
  aboutPreviewBadge: { ja: 'ABOUT OSAKA FRINGE', en: 'ABOUT OSAKA FRINGE' },
  readMore: { ja: '詳しく読む', en: 'Read More' },
  
  // Connected Events (連携イベント)
  connectedEventsSectionTitle: { ja: '大阪のイベントとつながる', en: 'Connecting with Osaka Events' },
  connectedEventsSectionDesc: { 
    ja: 'Osaka Fringeは、大阪各地で開催されるイベントとも連携。街のあちこちにFringeプログラムが現れます。', 
    en: 'Osaka Fringe collaborates with diverse festivals and events across Osaka, popping up all over the city.' 
  },
  partnerEventLabel: { ja: '連携イベント', en: 'Partner Event' },
  partnerEventDesc: { ja: 'この公演は連携イベント内のOsaka Fringeプログラムとして開催されます。', en: 'This performance is presented as an Osaka Fringe program within a partner event.' },
  partnerEventWebsite: { ja: '連携イベント公式サイト', en: 'Official Partner Event Site' },
  
  // Partner Categories (4区分 & PartnerSection)
  partnerCategorySupport: { ja: '後援・協力', en: 'Endorsement & Cooperation' },
  partnerCategorySponsor: { ja: 'スポンサー', en: 'Sponsors' },
  partnerCategoryVenue: { ja: '会場協力', en: 'Venue Partners' },
  partnerCategoryEvent: { ja: '連携イベント・フェス', en: 'Partner Events & Festivals' },
  partnerSectionBadge: { ja: 'PARTNERS & SUPPORTERS', en: 'PARTNERS & SUPPORTERS' },
  partnerSectionTitle: { ja: 'パートナー・後援・連携イベント', en: 'Partners, Supporters & Collaborative Festivals' },
  partnerSectionSubtitle: { ja: 'Osaka Fringe 2026 を共に創り、街にあふれだす文化芸術を支える皆さまです。', en: 'Organizations, venues, and festivals co-creating Osaka Fringe 2026 and supporting arts spilling into the city.' },
  partnerCategoryOrg: { ja: '後援・協力団体', en: 'Endorsement & Cooperation' },
  partnerCategoryOrgDesc: { ja: 'Osaka Fringe 2026 を支援・推進する公的機関および文化芸術団体', en: 'Public institutions and cultural organizations supporting Osaka Fringe 2026.' },
  partnerCategoryFest: { ja: '連携イベント・フェスティバル', en: 'Partner Events & Festivals' },
  partnerCategoryFestDesc: { ja: '同時期に大阪・関西各地で開催される連携カルチャーフェスティバル', en: 'Collaborative culture festivals held across Osaka and Kansai.' },
  partnerCategoryVenueLabel: { ja: '会場協力', en: 'Venue Partners' },
  partnerCategoryVenueDesc: { ja: '舞台・空間を提供しフェスティバルを共創する会場パートナー', en: 'Venue partners offering spaces and co-creating festival stages.' },
  partnerCategorySponsorLabel: { ja: 'オフィシャルスポンサー', en: 'Official Sponsors' },
  partnerCategorySponsorDesc: { ja: 'フェスティバルの挑戦と発展を支える協賛企業・団体', en: 'Corporate sponsors and partners supporting festival growth.' },
  partnerSectionEmptyTitle: { ja: '掲載準備中', en: 'Coming Soon' },
  partnerSectionEmptyDesc: { ja: 'パートナー・後援情報は順次公開いたします。', en: 'Partner and supporter information will be announced sequentially.' },
  
  // Venue Types (3分類)
  venueTypeCore: { ja: 'CORE', en: 'CORE' },
  venueTypeCoreTitle: { ja: '公共空間・広場・商業施設', en: 'Public Plazas & Transit Hubs' },
  venueTypeCoreDesc: { ja: '人が集まる広場・商業施設・交通結節点など、フェスティバルの賑わいをつくる会場', en: 'Public plazas, shopping complexes, and transit hubs creating festival energy.' },
  venueTypeHistorical: { ja: 'HISTORICAL', en: 'HISTORICAL' },
  venueTypeHistoricalTitle: { ja: '近代建築・文化財・歴史空間', en: 'Heritage & Historic Architecture' },
  venueTypeHistoricalDesc: { ja: '近代建築・文化財など、大阪の歴史的空間を舞台にした会場', en: 'Modern heritage architectures and cultural properties hosting unique performances.' },
  venueTypeLocal: { ja: 'LOCAL', en: 'LOCAL' },
  venueTypeLocalTitle: { ja: 'カフェ・小劇場・日常空間', en: 'Cafes & Neighborhood Spaces' },
  venueTypeLocalDesc: { ja: 'カフェ、バー、倉庫、小劇場など、街の日常の中にある会場', en: 'Cafes, bars, warehouses, and independent spaces embedded in daily city life.' },
  
  // Audience App
  audienceTitle: { ja: '公演を探す（公演ガイド）', en: 'Find Shows (Festival Guide)' },
  audienceSubtitle: { ja: 'ジャンル、場所、日時から今の気分に合う公演を探せます', en: 'Find performances tailored to your mood by genre, venue, and date' },
  tabSearch: { ja: '公演を探す', en: 'Find Shows' },
  tabMap: { ja: '会場マップ', en: 'Venue Map' },
  tabFavorites: { ja: 'お気に入り', en: 'My Favorites' },
  
  // Filters (WHAT / WHERE / WHEN)
  filterWhat: { ja: 'WHAT — 何を見る？', en: 'WHAT — What to Watch' },
  filterWhere: { ja: 'WHERE — どこで見る？', en: 'WHERE — Venues & Areas' },
  filterWhen: { ja: 'WHEN — いつ見る？', en: 'WHEN — Dates & Today' },
  filterGuide: { ja: 'ジャンル、場所、日時から、今の気分に合う公演を探せます。', en: 'Find performances tailored to your mood by genre, location, and date.' },
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
  cardDetails: { ja: '詳細を見る', en: 'View Details' },
  viewDetails: { ja: '詳細を見る', en: 'View Details' },
  freePrice: { ja: '無料', en: 'Free' },
  directions: { ja: 'Google Mapでナビ', en: 'Directions (Google Maps)' },
  tickets: { ja: 'チケット・予約', en: 'Tickets & Info' },
  bookTickets: { ja: 'チケット予約・購入', en: 'Book / Reserve Tickets' },
  scheduleList: { ja: '公演日時・会場', en: 'Schedule & Venue' },
  venueLabel: { ja: '会場', en: 'Venue' },
  venueTypeLabel: { ja: '会場タイプ', en: 'Venue Type' },
  areaLabel: { ja: 'エリア', en: 'Area' },
  durationLabel: { ja: '上演時間', en: 'Duration' },
  minutes: { ja: '分', en: 'min' },
  priceLabel: { ja: '料金 / Ticket Price', en: 'Ticket Price' },
  inquirePrice: { ja: '要問合せ', en: 'Inquire' },
  aboutTheShow: { ja: '公演概要 / ABOUT THE SHOW', en: 'ABOUT THE SHOW' },
  aboutTheArtist: { ja: 'アーティスト紹介 / ABOUT THE ARTIST', en: 'ABOUT THE ARTIST' },
  artistOrigin: { ja: '拠点・出身', en: 'Origin / Base' },
  officialLinks: { ja: '公式リンク & SNS', en: 'Official Links & Social' },
  performancePhotos: { ja: '公演写真・ギャラリー', en: 'Performance Photos' },
  
  // Venues Page
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
  artistsPageTitle: { ja: 'アーティスト・劇団一覧', en: 'Festival Artists & Companies' },
  artistsPageSubtitle: { ja: '日本全国・世界各地から集結した、情熱と独創性あふれる表現者たち。', en: 'Passionate and visionary performing artists gathered from Osaka, Japan, and worldwide.' },
  artistsCountUnit: { ja: '組のアーティスト', en: 'artists' },
  artistProfileTitle: { ja: 'プロフィール・略歴', en: 'Profile / Bio' },
  artistShowsTitle: { ja: 'フェスティバル上演作品', en: 'Festival Performances' },
  schedulesCount: { ja: '公演スケジュール', en: 'Schedules' },
  viewOnAudienceApp: { ja: '公演の詳細を見る', en: 'View Show Details' },
  noShowsForArtist: { ja: '現在登録されている公演はありません', en: 'No performances currently listed' },
  
  // Donate Page UI Labels
  donateSectionBadge: { ja: 'SUPPORT OSAKA FRINGE', en: 'SUPPORT OSAKA FRINGE' },
  historyTypography: { ja: '1980s — 1990s', en: '1980s — 1990s' },
  historyBadge: { ja: 'OSAKA CULTURAL MEMORY', en: 'OSAKA CULTURAL MEMORY' },
  messageBadge: { ja: 'MAKE SPACE FOR THE NEXT', en: 'MAKE SPACE FOR THE NEXT' },
  institutionBadge: { ja: 'SUSTAINABLE CULTURE', en: 'SUSTAINABLE CULTURE' },
  donatePurposeBadge: { ja: 'WHAT YOUR SUPPORT MAKES POSSIBLE', en: 'WHAT YOUR SUPPORT MAKES POSSIBLE' },
  donatePurpose: { ja: '寄付が支えるOsaka Fringeの取り組み', en: 'What Your Support Makes Possible' },
  preFormBadge: { ja: 'SUPPORT THE NEXT', en: 'SUPPORT THE NEXT' },
  
  // Donation Form UI
  onlineDonationTitle: { ja: 'オンラインで寄付する', en: 'Donate Online' },
  onlineDonationSub: { ja: '500円から、任意の金額でご支援いただけます。クレジットカード等で安全にお手続きいただけます。', en: 'Support from ¥500 with any amount. Processed securely via credit card and mobile pay.' },
  selectAmount: { ja: '寄付金額を選択', en: 'Select Donation Amount' },
  customAmount: { ja: '自由金額（カスタム）', en: 'Custom Amount' },
  customAmountPlaceholder: { ja: '金額を入力（500円以上）', en: 'Enter amount (min. ¥500)' },
  customAmountMinError: { ja: '寄付金額は500円以上を入力してください。', en: 'Please enter an amount of ¥500 or more.' },
  donorName: { ja: 'お名前・ニックネーム（任意）', en: 'Name / Nickname (Optional)' },
  donorNameHint: { ja: '※ 匿名でのご寄付も可能です。', en: '* Anonymous donations are welcome.' },
  donorNamePlaceholder: { ja: '例: 大阪 フリンジ太郎 / Osaka Supporter', en: 'e.g. Osaka Art Supporter' },
  donorEmail: { ja: 'メールアドレス（任意）', en: 'Email Address (Optional)' },
  donorEmailHint: { ja: '※ 決済確認・受領に関するご連絡に使用します。', en: '* Used solely to send payment receipts.' },
  donorEmailPlaceholder: { ja: 'example@domain.com', en: 'example@domain.com' },
  donorMessage: { ja: 'Osaka Fringeへのメッセージ（任意）', en: 'Message to Osaka Fringe (Optional)' },
  donorMessagePlaceholder: { ja: 'アーティストやフェスティバルへの応援メッセージをお寄せください。', en: 'Leave a message of encouragement for the artists & festival.' },
  proceedToPayment: { ja: 'この金額でOsaka Fringeを支える', en: 'Support Osaka Fringe' },
  processing: { ja: '処理中...', en: 'Processing...' },
  securePaymentNotice: { ja: 'Stripeの高度な暗号化通信により、安全に決済処理が行われます。クレジットカード情報が当サーバーに保存されることはありません。', en: 'Encrypted and securely processed by Stripe. Card details are never stored on our servers.' },

  // Bank Transfer
  bankTransferTitle: { ja: '銀行振込で支援する', en: 'Donate via Bank Transfer' },
  bankTransferSub: { ja: 'クレジットカード以外に、銀行振込でもご寄付いただけます。', en: 'Direct domestic bank transfers are also gratefully accepted.' },
  bankTransferNotice: { 
    ja: 'お振込名義の前に「フリンジ」とご記載いただけると、確認がスムーズです。', 
    en: 'Please include "Fringe" before your transfer name if possible.' 
  },

  // Closing Statement
  closingBadge: { ja: 'CULTURE SPILLS OVER', en: 'CULTURE SPILLS OVER' },
  closingSign: { ja: '大阪文化万博Osaka Fringe 2026', en: 'Osaka Fringe 2026' },
  closeModal: { ja: '閉じる', en: 'Close' },
  pressEscToClose: { ja: 'ESCで閉じる', en: 'Press ESC to close' },
  
  // Donation Success Page
  successBadge: { ja: 'THANK YOU', en: 'THANK YOU' },
  successTitle: { ja: '温かいご支援ありがとうございます！', en: 'Thank You for Your Generous Support!' },
  successSubtitle: { ja: '大阪文化万博Osaka Fringe 2026へのご寄付を受け付けました。', en: 'Your donation to Osaka Fringe 2026 has been processed.' },
  successDesc: { ja: 'いただいたご寄付は、若手アーティストの参加支援、アクセシビリティ向上、舞台環境の充実などに大切に活用させていただきます。街と表現者が輝く最高の芸術祭を共に創り上げてまいります。', en: 'Your contribution directly supports emerging artists, multilingual guides, and festival production. Thank you for making Osaka a vibrant stage for world-class creativity.' },
  successReceiptNote: { ja: 'ご登録いただいたメールアドレス宛にStripeより決済受領メールが送信されます。別途領収証や公式サポーターに関するお問い合わせは、お問い合わせページよりご連絡ください。', en: 'A payment confirmation receipt has been sent via Stripe. For inquiries regarding formal certificates or sponsorship, please contact our team.' },
  successBackHome: { ja: 'トップページへ戻る', en: 'Back to Home' },
  successExploreShows: { ja: '公演スケジュールを探す', en: 'Explore Performances' },
  
  // About Page
  feature1Title: { ja: '誰もが参加できる', en: 'Open Access' },
  feature1Desc: { ja: 'ジャンル、国籍、キャリアを問わず参加を受け付ける、オープンアクセス型の芸術祭です。', en: 'Non-curated and democratic: an open stage for performers across genres, nationalities, and backgrounds.' },
  feature2Title: { ja: '街そのものが舞台になる', en: 'The City is the Stage' },
  feature2Desc: { ja: '劇場だけでなく、広場、歴史的建築、カフェ、商店街など大阪各地が舞台に変わります。', en: 'Transforming public plazas, historic heritage buildings, cafes, and shopping arcades into vibrant stages.' },
  feature3Title: { ja: '大阪と世界が交わる', en: 'Osaka Meets the World' },
  feature3Desc: { ja: '国内外の多彩なアーティストと観客が出会い、街全体で熱気と創造性を育みます。', en: 'Diverse artists and audiences from Osaka and around the globe connect to spark spontaneous creativity.' },
  aboutAreasTitle: { ja: '大阪の街を巡るエリア', en: 'Explore the Areas of Osaka' },
  aboutAreasDesc: { ja: '個性豊かな大阪の街を舞台に、多様な表現に出会う体験。', en: 'Discover dynamic performing arts across the vibrant districts of Osaka.' },
  aboutVenueTypesTitle: { ja: '3つのベニューカテゴリ', en: '3 Venue Categories' },
  aboutVenueTypesDesc: { ja: '大阪の街全体が劇場に。それぞれの空間特性を活かした多彩な表現が展開されます。', en: 'The entire city turns into a theater, creating unique experiences across different space types.' },
  
  // Contact Page (Formspree Integrated)
  contactPageTitle: { ja: 'お問い合わせ', en: 'Contact Us' },
  contactPageSubtitle: { ja: '公演へのご質問、会場パートナー・アーティスト参加、取材申請などお気軽にお寄せください。', en: 'Feel free to get in touch regarding shows, venue partnerships, artist registration, or media inquiries.' },
  contactFormTitle: { ja: 'お問い合わせフォーム', en: 'Contact Form' },
  contactFormDesc: { ja: '以下のフォームより送信してください。通常2〜3営業日以内に事務局よりご連絡いたします。', en: 'Please fill in the form below. We will get back to you within 2-3 business days.' },
  formName: { ja: 'お名前', en: 'Your Name' },
  formEmail: { ja: 'メールアドレス', en: 'Email Address' },
  formType: { ja: 'お問い合わせ種別', en: 'Inquiry Type' },
  formTypeGeneral: { ja: '一般・フェスティバル全般について', en: 'General / Festival Inquiries' },
  formTypeShow: { ja: '公演・チケットについて', en: 'Shows & Tickets' },
  formTypeVenue: { ja: '会場パートナーについて', en: 'Venue Partnership' },
  formTypeArtist: { ja: '参加アーティスト・応募について', en: 'Artist Open Call & Participation' },
  formTypeMedia: { ja: '取材・メディア掲載について', en: 'Press & Media Inquiries' },
  formTypeVolunteer: { ja: 'ボランティア・サポーターについて', en: 'Volunteering & Support' },
  formTypeOther: { ja: 'その他', en: 'Other' },
  formSubject: { ja: '件名', en: 'Subject' },
  formMessage: { ja: 'お問い合わせ内容', en: 'Message' },
  formSubmit: { ja: 'メッセージを送信する', en: 'Send Message' },
  formSending: { ja: '送信中...', en: 'Sending...' },
  formSuccessTitle: { ja: 'お問い合わせを送信しました', en: 'Message Sent Successfully!' },
  formSuccessDesc: { ja: 'お問い合わせありがとうございます。内容を確認のうえ、担当者より折り返しご連絡いたします。', en: 'Thank you for reaching out. Our team will review your inquiry and respond shortly.' },
  formSendAnother: { ja: '新しいメッセージを送信する', en: 'Send Another Message' },
  formErrorTitle: { ja: '送信に失敗しました', en: 'Failed to Send' },
  formErrorDesc: { ja: '申し訳ありません。送信中にエラーが発生しました。時間をおいて再送信いただくか、直接 info@osakafringe.com までご連絡ください。', en: 'An error occurred while sending. Please try again or email us directly at info@osakafringe.com.' },
  formRequired: { ja: '必須', en: 'Required' },
  formOptional: { ja: '任意', en: 'Optional' },
  
  // Banners & Footer
  instagramBannerTitle: { ja: '公式Instagramでフェスティバルの熱気をチェック！', en: 'Catch the Festival Vibe on Official Instagram!' },
  tourismBannerTitle: { ja: '大阪観光局 公式ポータルサイト', en: 'Osaka Convention & Tourism Bureau' },
  footerTagline: { ja: '大阪文化万博Osaka Fringe 2026 実行委員会', en: 'Osaka Fringe 2026 Executive Committee' },
  footerDesc: { ja: '大阪の街全体が舞台になるオープンアクセス芸術祭。演劇、ダンス、大道芸、音楽、古典芸能、紙芝居、作品展示がジャンルを超えて交差するフェスティバル。', en: 'An open-access performing arts festival turning all of Osaka into a vibrant stage across theater, dance, street circus, music, traditional arts, and art exhibitions.' },
  poweredByMicroCMS: { ja: 'Data powered by MicroCMS & Gemini AI Translation', en: 'Data powered by MicroCMS & Gemini AI Translation' },
  allRightsReserved: { ja: '© Osaka Fringe 2026 All Rights Reserved.', en: '© Osaka Fringe 2026 All Rights Reserved.' }
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