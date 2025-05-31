# Gmail Fetcher

GmailからFAQ用のメールを取得し、Google Sheetsに保存するGoogle Apps Scriptプロジェクトです。

## 事前準備

### 1. 必要なツールのインストール

```bash
# Google Apps Script CLI (clasp) のインストール
npm install -g @google/clasp
```

### 2. Google Apps Script APIの有効化

1. [Google Apps Script API](https://script.google.com/home/usersettings) にアクセス
2. 「Google Apps Script API」をオンにする

### 3. claspの認証設定

```bash
# Googleアカウントでログイン
clasp login
```

ブラウザが開くので、Google Apps Scriptを使用するアカウントでログインし、アクセスを許可してください。

### 4. プロジェクトの依存関係をインストール

```bash
cd gmail-fetcher
pnpm install
```

## セットアップ手順

### 1. Google Apps Scriptプロジェクトの作成

```bash
# 新しいスプレッドシートとバインドされたスクリプトを作成
clasp create --type sheets --title "Gmail Fetcher"
```

Apps ScriptのIDを`.clasp.json`ファイルに保存します。

```json
{
  "scriptId": "YOUR_SCRIPT_ID",
}
```

Apps ScriptのIDは、以下の部分です。

```
https://script.google.com/home/projects/<Project ID>/edit
```

### 2. 設定ファイルの更新

`src/config.ts`ファイルを編集して、あなたの環境に合わせて設定を変更してください：

```typescript
// 取り込みたいスレッドについているラベル名
const IncludeLabel = "お問い合わせ";

// 処理済みのスレッドに付けるラベル名
const ExcludeLabel = "processed";

// FAQ加工用ColabのURL（使用する場合）
const colabUrl = '<Your Colab URL here>';
```

### 3. Gmailへのラベル付与

指定したラベルを取り込みたいスレッドに付与してください。

### 4. スプレッドシートの設定

作成されたスプレッドシートに以下のシートを追加してください：

- **FAQ**: 取得したメールのスレッド情報を保存するシート
- **processed**: Google Colabで加工したデータを保存するシート
- ヘッダー行: `thread_link`, `thread_id`, `created_at`, `body`

### 5. デプロイ

```bash
# TypeScriptファイルをコンパイルしてGoogle Apps Scriptにプッシュ
clasp push
```

### 6. スクリプトエディタでの設定

1. `clasp open` でスクリプトエディタを開く
2. 必要な権限（Gmail、Sheets）を承認する
3. `main` 関数を実行してテストする

## 使用方法

### 手動実行

1. Google Apps Scriptエディタで `main` 関数を実行
2. または、スプレッドシートのメニューから実行（`onOpen.ts`で設定されている場合）

## 注意事項

- Gmail APIには利用制限があります。大量のメールを一度に処理する場合は注意してください
- スプレッドシートの行数制限（最大1000万セル）にご注意ください
- 個人情報を含むメールを扱う場合は、適切なセキュリティ対策を講じてください