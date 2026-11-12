export interface AwardWinner {
  performanceTitle?: string;
  performanceTitleEn?: string;
  artistName?: string;
  artistNameEn?: string;
  image?: string;
  citation?: string; // 選考理由
  citationEn?: string;
  performanceId?: string; // /performances/[id] へのリンク用
}

export interface FringeAward {
  id: string;
  name: string;
  nameEn: string;
  category: string;
  categoryEn: string;
  target: string;
  targetEn: string;
  selection: string;
  selectionEn: string;
  prize: string;
  prizeEn: string;
  badge: string;
  badgeEn: string;
  color: string;
  winner?: AwardWinner;
}

export const FRINGE_AWARDS_2026: FringeAward[] = [
  {
    id: 'everyones-fringe',
    name: 'みんなのフリンジ賞',
    nameEn: "Everyone's Fringe Award",
    category: '観客投票部門',
    categoryEn: 'Audience Choice Category',
    target: '観客投票で最も多くの支持を集めた公演',
    targetEn: 'The performance that received the highest number of votes from the audience.',
    selection: '観客投票',
    selectionEn: 'Audience Votes',
    prize: '次年度開催時の参加費免除',
    prizeEn: 'Exemption of participation fee for Osaka Fringe 2027',
    badge: 'AUDIENCE CHOICE',
    badgeEn: 'AUDIENCE CHOICE',
    color: '#E6007E',
    // 受賞者データが確定次第、以下にオブジェクトを追加してください
    // winner: {
    //   performanceTitle: '公演名',
    //   performanceTitleEn: 'Performance Title',
    //   artistName: 'アーティスト名',
    //   artistNameEn: 'Artist Name',
    //   image: '/images/awards/winner1.webp',
    //   citation: '選考理由のテキスト...',
    //   citationEn: 'Citation in English...',
    //   performanceId: 'xxx',
    // },
  },
  {
    id: 'beyond-borders',
    name: '国境を越えるで賞',
    nameEn: 'Beyond Borders Award',
    category: '国際・広域交流部門',
    categoryEn: 'International & Regional Exchange Category',
    target: '海外・他地域との交流や展開の可能性を最も感じさせた公演・アーティスト',
    targetEn: 'The performance or artist that demonstrated the greatest potential for international and cross-regional exchange.',
    selection: '実行委員会・特別選考委員',
    selectionEn: 'Executive Committee & Special Jury',
    prize: '海外フリンジ等の紹介・推薦機会の提供',
    prizeEn: 'Introduction and recommendation opportunities to overseas Fringe festivals',
    badge: 'INTERNATIONAL',
    badgeEn: 'INTERNATIONAL',
    color: '#0284c7',
  },
  {
    id: 'open-city',
    name: 'まちをひらく賞',
    nameEn: 'OPEN CITY AWARD',
    category: '空間・都市共生部門',
    categoryEn: 'Urban & Space Co-creation Category',
    target: '会場やまちの空間を活かし、大阪の新しい魅力や表現の場をひらいた公演',
    targetEn: 'The performance that utilized venues and urban spaces to unlock new charm and venues of expression in Osaka.',
    selection: '会場選考・実行委員会',
    selectionEn: 'Venue Selection Committee & Executive Committee',
    prize: '記念品または特別会場での再演優先枠',
    prizeEn: 'Commemorative gift or priority slot for restaging at a special venue',
    badge: 'URBAN SPACE',
    badgeEn: 'URBAN SPACE',
    color: '#16a34a',
  },
  {
    id: 'osaka-tourism-bureau',
    name: '大阪観光局賞',
    nameEn: 'OSAKA TOURISM BUREAU AWARD',
    category: '都市魅力・文化発信部門',
    categoryEn: 'City Promotion & Cultural Impact Category',
    target: '大阪の文化発信や都市の魅力向上に特に貢献した公演',
    targetEn: 'The performance that notably contributed to promoting Osaka’s culture and enhancing urban appeal.',
    selection: '公益財団法人 大阪観光局',
    selectionEn: 'Osaka Convention & Tourism Bureau',
    prize: '大阪観光局による広報・発信支援',
    prizeEn: 'Promotional and public relations support by Osaka Convention & Tourism Bureau',
    badge: 'SPECIAL AWARD',
    badgeEn: 'SPECIAL AWARD',
    color: '#d97706',
  },
];

export interface ScheduleMilestone {
  date: string;
  dateEn: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  targetType: 'venue' | 'artist_venue' | 'program' | 'additional' | 'festival';
  targetLabel: string;
  targetLabelEn: string;
  isMainEvent?: boolean;
}

export const FRINGE_2027_SCHEDULE: ScheduleMilestone[] = [
  {
    date: '2027年2月下旬',
    dateEn: 'Late February 2027',
    title: '会場登録 受付開始',
    titleEn: 'Venue Registration Opens',
    description: '会場となる施設・店舗・スペースの登録を開始します。',
    descriptionEn: 'Registration opens for facilities, shops, and spaces hosting performances.',
    targetType: 'venue',
    targetLabel: '会場向け',
    targetLabelEn: 'For Venues',
  },
  {
    date: '2027年4月下旬',
    dateEn: 'Late April 2027',
    title: 'アーティスト登録・会場エントリー 受付開始',
    titleEn: 'Artist Registration & Venue Matching Open',
    description: '参加アーティストの登録と、会場とのマッチング申請を開始します。',
    descriptionEn: 'Registration begins for participating artists and venue-matching applications.',
    targetType: 'artist_venue',
    targetLabel: 'アーティスト・会場向け',
    targetLabelEn: 'For Artists & Venues',
  },
  {
    date: '2027年8月末',
    dateEn: 'End of August 2027',
    title: '一次締切・公式プログラム掲載確定',
    titleEn: 'First Deadline & Official Program Finalized',
    description: '公式ガイド・初期告知に掲載されるプログラムが確定します。',
    descriptionEn: 'Performances featured in the official guide and initial announcements are finalized.',
    targetType: 'program',
    targetLabel: 'プログラム確定',
    targetLabelEn: 'Program Finalization',
  },
  {
    date: '2027年9月末まで',
    dateEn: 'Through Late September 2027',
    title: '追加マッチング・WEB随時掲載',
    titleEn: 'Additional Matching & Ongoing Web Publication',
    description: '直前まで参加公演の追加登録を受け付けます。',
    descriptionEn: 'Additional registrations and matching updates are accepted right up to the festival.',
    targetType: 'additional',
    targetLabel: '追加募集',
    targetLabelEn: 'Additional Calls',
  },
  {
    date: '2027年10月15日〜11月15日',
    dateEn: 'October 15 – November 15, 2027',
    title: 'Osaka Fringe 2027 開催',
    titleEn: 'Osaka Fringe 2027 Festival',
    description: '大阪のまち全体で、多彩な表現に出会う1か月間。',
    descriptionEn: 'A one-month festival of diverse creative expressions across the city of Osaka.',
    targetType: 'festival',
    targetLabel: 'フェスティバル会期',
    targetLabelEn: 'Festival Period',
    isMainEvent: true,
  },
];
