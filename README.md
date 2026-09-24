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
  - **インタラクティブ地図表示 (MapLibre GL)**: 会場ピンをタップして詳細確認
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
- **寄付・サポート (/donate)**: クラウドファンディング・振込先案内
- **お問い合わせ (/contact)**: お問い合わせフォーム
- **ロゴデータ (/logo_download)**: 公式ロゴダウンロード
- **公式バナー (/components/common/BannerSection)**: Instagram、大阪観光局ポータル等

### 3. 多言語対応 (日本語 / 英語)
- ヘッダー右上の言語切替（JP / EN）で即座に切り替え可能
- コンテンツは microCMS に登録された英語テキストを表示（未登録の場合は日本語を表示し、閲覧リクエスト時の自動翻訳呼び出しは行いません）
- 管理・運用スクリプト `npm run translate:backfill` をローカル実行することで、未翻訳項目のみを Google Gemini API で翻訳し、microCMS へ反映可能

---

## 🚀 起動方法

### 開発サーバーの起動
```bash
npm run dev
```
ブラウザで `http://localhost:3000` を開きます。

### テストの実行
```bash
npm test
```

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
# MicroCMS 連携設定（本番・開発共通）
MICROCMS_SERVICE_DOMAIN=your-service-domain
MICROCMS_API_KEY=your-microcms-api-key

# Google Gemini API 設定（ローカルの翻訳バックフィルスクリプト npm run translate:backfill 実行時のみ使用）
# ※ Vercel などの本番環境への設定は不要です。
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

### 3. `site_info` (単一コンテンツ形式)
- `aboutTitle`, `aboutText`: Osaka Fringeについてのタイトルと本文
- `festivalPeriod`: 開催期間
- `donationTitle`, `donationText`: 寄付についての案内
- `donationBankInfo`: 銀行振込先
- `donationCrowdfundingUrl`: クラウドファンディングURL
- `googleFormUrl`: Google Formsお問い合わせURL

---

## 🔍 microCMS 公演下書きプレビュー設定 & 運用ガイド

本サイトでは、microCMS Hobbyプランのまま、公開中の公演を下書き編集した際や新規の未公開公演を、本番公開前に安全に画面上でプレビュー確認できる「公演下書きプレビュー」機能を備えています。

### 1. microCMS 管理画面でのプレビューURL設定
microCMSの管理画面（API設定）で画面プレビューを設定します。

1. microCMS管理画面を開き、左メニューから **`performances` (公演)** APIを選択します。
2. 右上の **「API設定」** > **「画面プレビュー」** を開きます。
3. **「プレビューを追加」** をクリックし、以下を入力・保存します：
   - **識別名**: `本番プレビュー`（または任意の名称）
   - **プレビューURL**:
     ```text
     https://www.osakafringe.com/preview/performances/{CONTENT_ID}?draftKey={DRAFT_KEY}
     ```
   ※ ローカル環境で確認する場合のプレビューURL：
     ```text
     http://localhost:3000/preview/performances/{CONTENT_ID}?draftKey={DRAFT_KEY}
     ```

### 2. 環境変数の設定（本番・ステージング・ローカル）
プレビューを利用するには、以下の環境変数を設定します（VercelのEnvironment Variablesまたは `.env.local`）。

| 環境変数名 | 推奨値 / 設定内容 | 必須条件・説明 |
| :--- | :--- | :--- |
| `TEST_SITE_PROTECTION_ENABLED` | `false` | 本番公開サイトでは必ず `false`。プレビュー機能は全体保護が `false` でもプレビューのみ独立して保護されます。 |
| `MICROCMS_PREVIEW_ENABLED` | `true` | `true` の場合のみ `/preview` 配下が有効化されます。未設定または `false` の場合は 404 となります。 |
| `TEST_SITE_PASSWORD` | （安全なパスワード） | プレビュー画面の閲覧に要求される共通パスワード。明示設定が必須です。 |
| `TEST_SITE_AUTH_SECRET` | （32文字以上のランダム文字列） | 署名付きCookie（HMAC-SHA256）検証用の秘密鍵。明示設定が必須です（代用不可）。 |

### 3. プレビュー確認の流れ（本番での運用手順）
1. **下書き編集**: microCMSの `performances` で公演情報を編集し、「下書き保存」します（新規未公開公演でも可）。
2. **プレビュー起動**: 編集画面右上の **「画面プレビュー」** ボタンをクリックします。
3. **パスワード認証**:
   - 初回またはセッション期限切れ時は、自動的にパスワード入力画面（`/password`）へリダイレクトされます。
   - `TEST_SITE_PASSWORD` に設定したパスワードを入力して認証します。
   - 認証完了後、元のプレビューURL（`draftKey` 付き）へ自動で復帰します。
4. **プレビュー画面の確認**:
   - 画面上部に **「【プレビュー】変更内容は公開操作まで本番の通常ページには反映されません」** と案内バーが表示され、下書き編集内容が確認できます。
   - 通常詳細画面と同じく、画像、複数日程、開場時刻、会場情報、フライヤー、料金、日英切替（JP/EN）が正常に確認可能です。
   - 関連する会場やアーティストが未公開の場合は、安全な代替テキスト（名前等）で表示され画面がクラッシュすることはありません。
5. **公開反映**:
   - 内容に問題がなければ、microCMS管理画面で「公開」ボタンを押します。公開操作を行うと、本番の通常ページ（`/performances/[id]`）に即時反映されます。

### 4. セキュリティ・キャッシュ・検索エンジン対策の仕様
- **完全なアクセス保護**: `TEST_SITE_PROTECTION_ENABLED=false`（一般公開サイト）の環境でも、`/preview/*` へのアクセスは常にパスワード認証が要求されます。
- **検索エンジン除外**: プレビュー画面および認証関連画面には `X-Robots-Tag: noindex, nofollow, noarchive` が自動付与され、検索エンジンにインデックスされません。またサイトマップ（`sitemap.xml`）にもプレビューURLは含まれません。
- **リファラー抑止**: `Referrer-Policy: no-referrer` が設定されており、外部リンク遷移時に `draftKey` やプレビューURLが漏洩しません。
- **キャッシュ分離**: プレビューレスポンスは `Cache-Control: private, no-store` で返却され、ブラウザやCDN、Next.jsのISR（300秒）キャッシュと混ざることはありません。再読込すると常に最新の下書き保存内容を取得します。
- **解析除外**: Vercel Analytics はプレビュー画面およびパスワード認証画面からのイベント送信を自動的に遮断します。