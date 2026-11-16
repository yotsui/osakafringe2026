export interface AwardWinner {
  title: string;
  titleEn?: string;
  image?: string; // 講評用写真（アップロード写真／会場画像）
  imageAlt?: string;
  imageAltEn?: string;
  imageAspect?: 'portrait' | 'landscape';
  performanceImage?: string; // 公演・会場情報から取得した写真
  citationParagraphs?: string[];
  citationParagraphsEn?: string[];
  citationSign?: string;
  citationSignEn?: string;
  performanceId?: string;
  artistId?: string;
  artistName?: string;
  artistNameEn?: string;
  additionalArtistId?: string;
  additionalArtistName?: string;
  additionalArtistNameEn?: string;
  venueId?: string;
  detailAnchor?: string;
}

export interface FringeAward {
  id: string;
  number: string;
  name: string;
  nameSub?: string; // 補足資料にある言葉遊び等（例：「（show）」）
  nameEn: string;
  presenter: string; // 資料に併記されている氏名
  presenterEn?: string;
  winner?: AwardWinner;
}

export interface AwardEditor {
  role: string;
  roleEn?: string;
  name: string;
  nameEn?: string;
  affiliation: string;
  affiliationEn?: string;
}

export const AWARD_EDITORS_2026: AwardEditor[] = [
  {
    role: 'アワード編集長',
    roleEn: 'Editor-in-Chief, Fringe Awards',
    name: '玉置泰紀',
    nameEn: 'Yasunori Tamaoki',
    affiliation: '編集者／玉置編集事務所',
    affiliationEn: 'Editor / Tamaoki Editorial Office',
  },
  {
    role: 'Awards Editor／国際担当',
    roleEn: 'Awards Editor / International',
    name: '丹典子',
    nameEn: 'Noriko Tan',
    affiliation: '合同会社 齋庭 YuNiwa Experience 代表／プロデューサー',
    affiliationEn: 'Representative & Producer, YuNiwa Experience LLC',
  },
  {
    role: 'Awards Editor',
    roleEn: 'Awards Editor',
    name: '服部滋樹',
    nameEn: 'Shigeki Hattori',
    affiliation: 'graf 代表',
    affiliationEn: 'Representative, graf',
  },
];

export const FRINGE_AWARDS_2026: FringeAward[] = [
  {
    id: 'everyones-fringe',
    number: '01',
    name: 'みんなのフリンジ賞',
    nameEn: "EVERYONE'S FRINGE AWARD",
    presenter: '玉置泰紀',
    presenterEn: 'Yasunori Tamaoki',
    winner: {
      title: "Q's Family Disco",
      titleEn: "Q's Family Disco",
      image: '/images/awards/qs_family_disco.jpg',
      imageAlt: 'ミラーボールの下でDJブースに立つ2人と、Family Discoのネオンサイン',
      imageAltEn: 'Two DJs standing at the DJ booth under a mirror ball with the Family Disco neon sign',
      imageAspect: 'portrait',
      performanceImage: 'https://images.microcms-assets.io/assets/3522ba3d7e5d4edbac1ae79e63ef2f7b/beb6408003634178a85c0012e7ec617f/17884795452bb41e4b89-file-pafo2-IMG_0842.jpeg',
      citationParagraphs: [
        '2024年7月、あべのキューズモールの屋上広場「Qしば」の誕生とともに産声を上げた「Q\'s Family Disco」は、「大人の夜遊び×子どもの音楽体験」を掲げ、令和のヒット曲と親世代の青春ソングを一つのフロアでつないできた。大人が子どもに"付き合う"のではなく、親子が肩を並べて本気で踊る光景は、まさに「みんなのフリンジ」の理念そのものだ。',
        'ハロウィンやクリスマスなど季節ごとに装いを変えながら回を重ね、もりのみやキューズモールBASEへの出張、てんしばへの展開と、その舞台を着実に街へと広げてきた。フリンジ期間中のハロウィンナイトでは、パラソルに吊るされたミラーボールとネオンサインが夕暮れの芝生を彩り、魔女の三角帽子をかぶったDJ桧山良子さんが会場を盛り上げた。思い思いの仮装に身を包んだ子どもたちは音に合わせて踊り、人工芝の築山を駆け回る。商業施設の一角が、世代を超えたコミュニティの熱狂の場へと変わった瞬間だった。',
        '劇場の外、日常の街の中にこそ文化は芽吹く。その可能性を体現する存在として、初開催となる大阪フリンジに参加し、フェスティバルに大きな広がりと明るさをもたらしてくれたことに、心から感謝したい。その素晴らしい実践に敬意を込め、みんなのフリンジ賞を贈る。',
      ],
      citationParagraphsEn: [
        'Born in July 2024 alongside "Q-Shiba," the rooftop lawn plaza of Abeno Q\'s MALL, "Q\'s Family Disco" champions the concept of "Adult Nightlife meets Children\'s Musical Discovery." Connecting contemporary Reiwa chart-toppers with nostalgic anthems from the parents\' youth onto a single dance floor, parents and children dance shoulder to shoulder with pure enthusiasm—a vivid realization of the core philosophy behind "Everyone\'s Fringe."',
        'Evolving across seasons with Halloween and Christmas editions, and expanding its stages across town to Morinomiya Q\'s MALL BASE and Tenshiba Park, the initiative has steadily grown into the city\'s public spaces. During Osaka Fringe on Halloween night, mirror balls suspended beneath parasols and glowing neon signs illuminated the evening lawn as DJ Ryoko Hiyama energized the crowd in a witch\'s pointed hat. Children dressed in diverse costumes danced to the rhythm and sprinted across turf mounds—a moment where a corner of a commercial complex transformed into an exhilarating hub of intergenerational community.',
        'Culture sprouts beyond traditional theater walls, right in the everyday life of the city. As an embodiment of this possibility, we sincerely thank Q\'s Family Disco for joining the inaugural Osaka Fringe and bringing immense vibrancy and warmth to the festival. In honoring this wonderful practice, we proudly present the Everyone\'s Fringe Award.',
      ],
      citationSign: 'アワード編集長　玉置泰紀',
      citationSignEn: 'Yasunori Tamaoki, Editor-in-Chief, Fringe Awards',
      performanceId: 'z5wzmlztnzw',
      artistId: 'xmql4_coqg4',
      detailAnchor: '#award-everyones-fringe',
    },
  },
  {
    id: 'beyond-borders',
    number: '02',
    name: '国境を越えるで賞',
    nameSub: '（show）',
    nameEn: 'BEYOND BORDERS AWARD',
    presenter: '丹典子',
    presenterEn: 'Noriko Tan',
    winner: {
      title: '墨絵ｘ講談　第1回すみっこライブ',
      titleEn: 'Sumie x Kodan: 1st Sumikko Live',
      image: '/images/awards/award_02_sumikko_live.jpg',
      imageAlt: '四代目 玉田玉秀斎の講談と沙門優による墨絵ライブペイント',
      imageAltEn: 'Kodan storytelling by Gyokushusai Tamada IV alongside live Sumi-e ink painting by Shamon Yu',
      imageAspect: 'landscape',
      performanceImage: 'https://images.microcms-assets.io/assets/3522ba3d7e5d4edbac1ae79e63ef2f7b/74acd29bbb40419b8ed5a4d227c9326a/%E3%83%81%E3%83%A9%E3%82%B7%E9%9D%92%E5%B1%B1%E3%83%93%E3%83%AB%E6%A7%98d.jpg',
      citationParagraphs: [
        '神道講釈師である、四代目玉田玉秀斎さんと、愛知県津島市の観音寺副住職・絵師の沙門優さんのユニットである、「第１回すみっこライブ」はまさに、フリンジの精神である融合と革新を追求した素晴らしいパフォーマンスです。最初は真っ白な和紙に、沙門優さんが一筆、一筆とまだ形を成していない線を描いていきます。その筆と呼応しながら、玉田玉秀斎さんの講談が始まり、その熱量が上がっていくにつれ、墨絵がどんどん描き込まれ、物語の世界が立ち上がるとともに、絵の中の人物が今にも飛び出してくるような躍動感と高揚感に包まれ、和紙の中にまさに講談の物語の世界が浮かび上がってくる。',
        '日本の伝統や精神性の真髄を深く知るお二人だからこその異色の才能が交わり、現代のライブエンターテインメントへと昇華されたこのパフォーマンスは、まさにフリンジの精神そのもの。日本の歴史や先人が大切にしてきた精神性を丁寧に重んじながら、決して内向きではなく、日本の歴史や文化の誇りをまっすぐに世界へと開かれたお二人の表現に出会えたことは大きな喜びです。',
        '今回は日本語での上演でしたが、英語講談を手がける玉田さんの国際性があれば、言葉の壁を軽々と越えていけるはず。この二人の化学反応は、まだ世界の観客に見つかっていない原石です。世界の「すみっこ」で彼らの作品が多くの観客に求められる光景がはっきりと目に浮かびました。この稀有なコラボレーションの輝きに一筋の光を当てるべく、心からの敬意とともに、この賞を贈ります。',
      ],
      citationParagraphsEn: [
        'The "1st Sumikko Live"—a collaborative unit formed by Shinto kodan storyteller Gyokushusai Tamada IV and Shamon Yu, vice head priest of Kannonji Temple and painter from Tsushima, Aichi—is a remarkable performance that pursues the fusion and innovation central to the fringe spirit. It begins with pristine white washi paper, where Shamon Yu strokes lines yet unformed. Responding in dialogue with the brush, Gyokushusai Tamada\'s narration begins. As the creative heat rises, the ink painting deepens, summoning the world of the tale into being. Imbued with a dynamic vitality and exhilarating tension as though figures might leap off the paper, the story of the kodan materializes directly within the washi.',
        'Combining their singular talents grounded in deep mastery of Japanese tradition and spirituality, and elevating them into contemporary live entertainment, their performance captures the very essence of fringe. Respectfully upholding Japanese history and ancestral spirituality, their expression is never insular; encountering an art that proudly and directly opens Japan\'s heritage to the world was an immense joy.',
        'While performed in Japanese this time, Tamada-san\'s experience in English kodan promises that language barriers will be easily crossed. The chemistry between these two artists is a hidden gem yet to be discovered by global audiences. One can vividly picture their work being embraced in every "corner" (sumikko) of the world. To illuminate the brilliance of this rare collaboration, we present this award with utmost respect.',
      ],
      citationSign: 'Awards Editor／国際担当　丹典子',
      citationSignEn: 'Noriko Tan, Awards Editor / International',
      performanceId: 'g_hebyeyus6u',
      artistId: 'i6fat3odixy',
      artistName: '玉田 玉秀斎',
      artistNameEn: 'Gyokushusai Tamada',
      additionalArtistId: 'e7nwfqhgao',
      additionalArtistName: '沙門優',
      additionalArtistNameEn: 'Shamon Yu',
      detailAnchor: '#award-beyond-borders',
    },
  },
  {
    id: 'open-city',
    number: '03',
    name: 'まちをひらく賞',
    nameEn: 'OPEN CITY AWARD',
    presenter: '服部滋樹',
    presenterEn: 'Shigeki Hattori',
    winner: {
      title: '川口基督教会',
      titleEn: 'Kawaguchi Christ Church Cathedral',
      image: 'https://images.microcms-assets.io/assets/3522ba3d7e5d4edbac1ae79e63ef2f7b/a8fa5f6066264128b526e08df1662350/17869657855bc672489c-file-25-IMG_7700.jpeg',
      imageAlt: '歴史ある赤煉瓦の聖堂、川口基督教会',
      imageAltEn: 'Historic red-brick cathedral of Kawaguchi Christ Church',
      imageAspect: 'landscape',
      performanceImage: 'https://images.microcms-assets.io/assets/3522ba3d7e5d4edbac1ae79e63ef2f7b/a8fa5f6066264128b526e08df1662350/17869657855bc672489c-file-25-IMG_7700.jpeg',
      citationParagraphs: [
        '場を開くことから、文化は生まれる。',
        '芸術が街にあふれ出すためには、表現する人だけでなく、その表現を迎え入れる「場を開く人」の存在が欠かせません。かつて大阪が世界と出会う玄関口であった川口の地で、100年以上の歴史を持つ聖堂を守り継いできた川口基督教会。今回の大阪フリンジでは、信仰の場である教会に仏教の僧侶を迎え、宗教や文化の違いを越えて、人々が芸術を通じて交わる機会が生まれました。',
        '歴史ある建築を、ただ保存するのではなく、現代の社会に開き、新たな文化や関係性を育む場所として生かしていく。それは、建築の価値を未来へと継承するだけでなく、街そのものの可能性を広げる行為でもあります。文化は、誰かが表現することから生まれる。そして、その表現を誰かが受け入れることで、社会へと広がっていく。川口基督教会が示した「場を開く」という姿勢に敬意を表し、Open City Awardを贈ります。',
      ],
      citationParagraphsEn: [
        'Culture is born from opening spaces.',
        'For art to spill over into the city, we need not only those who express, but those who open spaces to welcome that expression. In Kawaguchi, once the gateway through which Osaka met the world, Kawaguchi Christ Church Cathedral has preserved its sacred hall for over a century. In this Osaka Fringe, the church welcomed Buddhist monks into its place of faith, creating an opportunity for people to connect through art across religious and cultural divides.',
        'Rather than merely preserving historic architecture as a relic, opening it to contemporary society as a living place to nurture new culture and relationships not only passes on architectural heritage to the future, but broadens the possibilities of the city itself. Culture begins with someone expressing themselves, and spreads into society when someone embraces that expression. Honoring the attitude of opening spaces demonstrated by Kawaguchi Christ Church Cathedral, we proudly present the Open City Award.',
      ],
      citationSign: 'Awards Editor　服部滋樹',
      citationSignEn: 'Shigeki Hattori, Awards Editor',
      venueId: 'kawaguchi-church',
      detailAnchor: '#award-open-city',
    },
  },
  {
    id: 'osaka-tourism-bureau',
    number: '04',
    name: '大阪観光局賞',
    nameEn: 'OSAKA TOURISM BUREAU AWARD',
    presenter: '大阪観光局 理事長　溝畑 宏',
    presenterEn: 'Hiroshi Mizohata, President, Osaka Convention & Tourism Bureau',
    winner: {
      title: 'BGM高久知也',
      titleEn: 'BGM Tomoya Takaku',
      image: '/images/awards/award_04_takaku_tomoya.jpg',
      imageAlt: 'なんば広場の野外ステージでヴァイオリンを奏でる高久知也',
      imageAltEn: 'Tomoya Takaku performing violin on the outdoor stage at Namba Plaza',
      imageAspect: 'landscape',
      performanceImage: 'https://images.microcms-assets.io/assets/3522ba3d7e5d4edbac1ae79e63ef2f7b/3067176f523744b8a2ce1524fa7662a2/178848755780bf0e1b66-file-com1-IMG_3410.jpeg',
      citationParagraphs: [
        '多彩なジャンルを高い演奏力で表現し、自作のギター伴奏とヴァイオリンを組み合わせた完成度の高いステージを展開。年齢や国籍を問わず楽しめる親しみやすさがあり、観光客にも訴求力の高いパフォーマンスであった。',
        'なんば広場での「みなみフェス」のクロージングステージを務め、多くの来場者が足を止めて鑑賞し、動画撮影する姿も見られた。大阪を訪れる多様な来場者に音楽の魅力を伝えた点を評価したい。',
      ],
      citationParagraphsEn: [
        'Expressing diverse genres with superb musicianship, Tomoya Takaku delivered a highly polished stage performance combining his own acoustic guitar backing with violin. Approachable across ages and nationalities, it was a captivating performance that strongly resonated with visitors and tourists alike.',
        'Serving as the closing act of "Minami Fes" at Namba Plaza, numerous passersby stopped to listen and film his performance. We highly commend his achievement in conveying the power and joy of music to the diverse visitors arriving in Osaka.',
      ],
      citationSign: '大阪観光局 理事長　溝畑 宏',
      citationSignEn: 'Hiroshi Mizohata, President, Osaka Convention & Tourism Bureau',
      performanceId: '1d9stk1fk2uf',
      artistId: 'ot62nc98blsz',
      detailAnchor: '#award-osaka-tourism-bureau',
    },
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
    title: '参加会場（スペース）募集開始',
    titleEn: 'Call for Participating Venues & Spaces',
    description: '大阪市内の劇場・カフェ・ギャラリー・空きスペース等の登録受付を開始します。',
    descriptionEn: 'Registration opens for theatres, cafes, galleries, and vacant spaces across Osaka.',
    targetType: 'venue',
    targetLabel: '会場募集',
    targetLabelEn: 'Call for Venues',
  },
  {
    date: '2027年4月下旬',
    dateEn: 'Late April 2027',
    title: 'アーティスト第1次募集開始',
    titleEn: 'Artist Registration Phase 1 (With Venues)',
    description: '決定した会場情報をもとに、第1次の参加アーティスト募集を開始します。',
    descriptionEn: 'First phase of artist registrations opens based on confirmed venue listings.',
    targetType: 'artist_venue',
    targetLabel: 'アーティスト募集',
    targetLabelEn: 'Artist Call Phase 1',
  },
  {
    date: '2027年6月下旬',
    dateEn: 'Late June 2027',
    title: 'アーティスト第2次募集開始',
    titleEn: 'Artist Registration Phase 2 (Open Matching)',
    description: '新規会場の追加やマッチング機会を広げる第2次募集を実施します。',
    descriptionEn: 'Second round of calls expanding new spaces and open matching opportunities.',
    targetType: 'artist_venue',
    targetLabel: 'アーティスト募集',
    targetLabelEn: 'Artist Call Phase 2',
  },
  {
    date: '2027年8月下旬',
    dateEn: 'Late August 2027',
    title: 'プログラム発表・チケット発売開始',
    titleEn: 'Full Program Announcement & Ticket Sales',
    description: '全参加公演のタイムテーブル・プログラム公開と同時にチケット販売を順次開始します。',
    descriptionEn: 'Official festival timetable release and sequential opening of ticket sales.',
    targetType: 'program',
    targetLabel: 'プログラム公開',
    targetLabelEn: 'Program & Tickets',
  },
  {
    date: '2027年9月〜10月',
    dateEn: 'September – October 2027',
    title: '追加登録・マッチング／随時情報公開',
    titleEn: 'Additional Matching & Ongoing Web Publication',
    description: '直前まで参加公演の追加登録を受け付けます。',
    descriptionEn: 'Additional registrations and matching updates are accepted right up to the festival.',
    targetType: 'additional',
    targetLabel: '追加募集',
    targetLabelEn: 'Additional Calls',
  },
  {
    date: '2027年10月15日〜11月14日',
    dateEn: 'October 15 – November 14, 2027',
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
