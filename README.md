# 大阪フリンジフェスティバル 公式ウェブサイト & Audience App

大阪フリンジ（Osaka Fringe Festival）の公式ポータルサイトおよび観客向けウェブアプリ（Audience App）です。
Next.js (App Router)、Tailwind CSS、MicroCMS、Google Gemini API（自動翻訳）により構築されています。

---

## 🌟 主な機能と特徴

### 1. Audience App（観客向け総合検索・マップ）
- **WHAT (何を見る？)**:
  - ジャンル別絞り込み（演劇、ダンス、お笑い、音楽、大道芸、アート、その他）
  - キーワード・アーティスト名リアルタイム検索
- **WHERE (どこで見る？)**:
  - 会場・エリア別絞り込み
  - **インタラクティブ地図表示 (Leaflet)**: 会場ピンをタップして詳細確認
  - **Google Maps 経路ナビ直結**: ワンタップで現在地から会場への道順をGoogle Mapsで起動
- **WHEN (いつ見る？)**:
  - **「🔥 本日の公演 (Today's Shows)」ワンタップフィルター**
  - 日付セレクター
- **お気に入り機能（★ My List）**:
  - 気になる公演をローカル保存

### 2. 充実したコンテンツ構成
- **トップページ**: 注目公演ハイライト、開催情報、バナー、クイックナビ
- **Osaka Fringeについて (/about)**: フェスティバルの理念、歴史、楽しみ方
- **会場一覧 & マップ (/venues)**: 全会場の詳細、アクセス、上演作品一覧
- **アーティスト一覧 (/artists)**: 出演パフォーマー・作品情報
- **Award (/awards)**: グランプリ、観客賞、歴代受賞者一覧
- **寄付・サポート (/donate)**: クラウドファンディング・振込先案内
- **お問い合わせ (/contact)**: Google Forms 連携（レスポンシブ埋め込み & 直接リンク）
- **公式バナー (/components/common/BannerSection)**: Instagram、大阪観光局ポータル等

### 3. 多言語対応 (日本語 / 英語) & Gemini API 自動翻訳
- ヘッダー右上の言語切替（JP / EN）で即座に切り替え可能
- コンテンツに英語が未登録の場合でも、Google Gemini API (`gemini-2.5-flash`) を通じて自然な演劇・芸術用語に自動翻訳

---

## 🚀 起動方法

### 開発サーバーの起動
```bash
npm run dev
```
ブラウザで `http://localhost:3000` を開きます。

### プロダクションビルド
```bash
npm run build
npm run start
```

---

## ⚙️ 環境変数の設定 (`.env.local`)

`.env.example` をコピーして `.env.local` を作成し、必要に応じて設定してください。
※APIキーが未設定の場合でも、内蔵されたリアルなモックデータで全機能が完全に動作します。

```env
# MicroCMS 連携設定
MICROCMS_SERVICE_DOMAIN=your-service-domain
MICROCMS_API_KEY=your-microcms-api-key

# Google Gemini API 連携設定（自動翻訳用）
GEMINI_API_KEY=your-google-gemini-api-key
```

---

## 📋 MicroCMS スキーマ設定ガイド

MicroCMS管理画面で以下のエンドポイントを作成することで、データを動的に管理できます。

### 1. `venues` (リスト形式)
- `name` (テキストフィールド): 会場名
- `nameEn` (テキストフィールド・任意): 英語会場名
- `area` (テキストフィールド): エリア（例: 中崎町・梅田）
- `address` (テキストフィールド): 住所
- `access` (テキストエリア): アクセス案内
- `description` (テキストエリア): 会場概要
- `location` (カスタムまたはJSON): `{ "lat": 34.7081, "lng": 135.5034 }`
- `websiteUrl` (テキストフィールド・任意): WEBサイト
- `image` (画像フィールド): 会場写真

### 2. `performances` (リスト形式)
- `title` (テキストフィールド): 公演タイトル
- `artistName` (テキストフィールド): アーティスト名
- `genre` (セレクト): `theater` | `dance` | `comedy` | `music` | `circus` | `art` | `other`
- `genreCustom` (テキストフィールド): カスタムジャンル名
- `description` (テキストエリア): 公演概要
- `synopsis` (テキストエリア・任意): あらすじ
- `venueId` (テキストフィールド または venuesへの参照): 会場ID
- `schedules` (繰り返しフィールド): 日付、開始時間、終了時間
- `ticketPrice` (テキストフィールド): チケット料金
- `ticketUrl` (テキストフィールド・任意): チケット予約URL
- `image` (画像フィールド): メインビジュアル
- `isFeatured` (真偽値): 注目公演フラグ

### 3. `awards` (リスト形式)
- `year` (数値): 受賞年
- `title` (テキストフィールド): 賞名
- `category` (テキストフィールド): 部門
- `winner` (テキストフィールド): 受賞者
- `workTitle` (テキストフィールド): 受賞作品名
- `comment` (テキストエリア): 講評
- `image` (画像フィールド): 写真

### 4. `site_info` (単一コンテンツ形式)
- `aboutTitle`, `aboutText`: Osaka Fringeについてのタイトルと本文
- `festivalPeriod`: 開催期間
- `donationTitle`, `donationText`: 寄付についての案内
- `donationBankInfo`: 銀行振込先
- `donationCrowdfundingUrl`: クラウドファンディングURL
- `googleFormUrl`: Google Formsお問い合わせURL