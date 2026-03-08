# Shift Notes MVP

中立表示・削除対応・管理者承認を前提にした、アルバイト体験談口コミプラットフォームのMVPです。  
既存のPython CLIとは別に、このWebアプリは `web/` 配下へ追加しています。

## 実装方針

- ページ構成: `地図 / 一覧 / 詳細 / 投稿 / 通報 / 削除申請 / 当事者コメント / 管理画面 / 規約 / ガイドライン / 免責`
- 投稿設計: 体験談は主観として入力させ、断定表現や個人特定を避ける文言とチェックを必須化
- 公開フロー: 勤務先・口コミ・当事者コメントはすべて `pending` で保存し、管理者承認後に公開
- 対応フロー: 通報、削除申請、当事者コメントを管理画面で処理し、監査ログへ記録
- セキュリティ: IPベース rate limit、プレーンテキストサニタイズ、Supabase RLS、IP/UA/内部識別子保持

## ディレクトリ

```text
web/
  src/app/                  Next.js App Router
  src/components/           UI コンポーネント
  src/lib/                  Supabase, validation, rate-limit, actions
../supabase/
  migrations/               スキーマ・RLS
  functions/moderation-notify/
                            管理者通知 Edge Function
```

## 必要な環境変数

`web/.env.example` を元に `web/.env.local` を作成してください。

最低限必要なもの:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_MODERATION_NOTIFY_URL`
- `RESEND_API_KEY`
- `MODERATION_FROM_EMAIL`
- `MODERATION_TO_EMAILS`

## Supabase セットアップ

1. Supabase プロジェクトを作成
2. `supabase/migrations/` の SQL を適用
3. `supabase/functions/moderation-notify/` をデプロイ
4. `admins` テーブルへ管理者ユーザーの `user_id` を登録
5. `web/.env.local` を設定

## ローカル起動

```bash
cd web
npm install
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

## 管理者ログイン

- Supabase Auth に管理者アカウントを作成
- 対応する `user_id` を `admins` テーブルへ登録
- `/admin/login` からログイン

## 主要フロー

### 公開側

- `/submit`: 勤務先付きの体験談投稿
- `/report`: 投稿 / 勤務先の通報
- `/takedown`: 削除申請
- `/official-response`: 当事者コメント送信
- `/map`, `/places`, `/places/[id]`: approved のみ表示

### 管理側

- `/admin`: 承認待ち、通報、削除申請、当事者コメント、監査ログを集約
- 公開 / 非公開 / 編集依頼 / 調査中 / 対応済 を更新可能

## 検証コマンド

```bash
cd web
npm run lint
npm run typecheck
npm run build
```

## 補足

- PDFや画像アップロードではなく、MVPでは `evidence_url` ベースで証拠提示を扱います
- 地図は OpenStreetMap ベースで、追加の地図APIキーなしで表示されます
- 地図の初期表示は `NEXT_PUBLIC_AREA_*` と `NEXT_PUBLIC_MAP_CENTER_*` で変更できます
- 運営方針の記載は一般的な中立設計の説明であり、法的助言ではありません
