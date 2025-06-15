# VoiceStudio 🎵

Next.jsとElevenLabs APIを使用したモダンなAI音声合成・認識アプリケーション

## ✨ 機能

- **🔊 テキスト読み上げ (TTS)** - ElevenLabs AIを使用してテキストを自然な音声に変換
- **🎤 音声認識 (STT)** - 音声を録音してリアルタイムでテキストに変換
- **🌍 日本語対応** - 日本語テキスト入力と音声認識を完全サポート
- **🎨 モダンダークUI** - グラデーション背景とスムーズアニメーションの洗練されたレスポンシブインターフェース
- **⚡ リアルタイム処理** - 高速音声生成と音声認識
- **🔄 双方向インタラクション** - 音声からテキスト、テキストから音声への完全なワークフロー

## 🚀 はじめに

### 前提条件

- Node.js 18+ 
- ElevenLabs APIキー

### インストール

1. リポジトリをクローン:
```bash
git clone <repository-url>
cd eleven-labs
```

2. 依存関係をインストール:
```bash
npm install
```

3. 環境変数を設定:
```bash
cp .env.local.example .env.local
```

`.env.local`にElevenLabs APIキーを追加:
```env
ELEVENLABS_API_KEY=your_api_key_here
```

### ElevenLabs APIキーの取得

1. [ElevenLabs](https://elevenlabs.io)にアクセス
2. アカウントを作成
3. プロフィール設定に移動
4. 以下の権限でAPIキーを生成:
   - Text to Speech: `Has access`
   - Speech to Text: `Has access` 
   - Voices: `Read only`

### アプリケーションの実行

開発サーバーを起動:
```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

## 🎛️ 使用方法

### テキスト読み上げ
1. 入力エリアにテキストを入力
2. 「Generate Speech」をクリック
3. 生成された音声を再生

### 音声認識
1. 「Voice Input」をクリックして録音開始
2. マイクに向かって話す
3. 「Stop Recording」をクリック
4. 認識されたテキストを確認

### 音声ワークフロー
1. 音声録音 → 自動的にテキストへ変換
2. 必要に応じてテキストを編集
3. テキストから音声を生成
4. 音声から音声への完全なインタラクション

## 🏗️ プロジェクト構造

```
src/
├── app/
│   ├── api/
│   │   ├── tts/route.ts      # テキスト読み上げエンドポイント
│   │   ├── stt/route.ts      # 音声認識エンドポイント
│   │   └── voices/route.ts   # 音声リストエンドポイント
│   ├── page.tsx              # メインアプリケーションUI
│   └── layout.tsx            # アプリレイアウト
├── components/               # 再利用可能コンポーネント
└── lib/                     # ユーティリティ関数
```

## 🔧 APIエンドポイント

- `POST /api/tts` - テキストを音声に変換
- `POST /api/stt` - 音声をテキストに変換
- `GET /api/voices` - 利用可能な音声リストを取得

## 🛠️ 使用技術

- **フレームワーク**: Next.js 15
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **AIサービス**: ElevenLabs API
- **音声処理**: Web Audio API, MediaRecorder API

## 🌐 ブラウザ対応

- Chrome/Edge 85+
- Firefox 82+
- Safari 14+

*注意: 音声認識機能にはマイクアクセスが必要です*

## 📝 設定

### 音声設定

アプリは日本語音声に最適化された固定の女性音声（`4lOQ7A2l7HPuG7UIHiKA`）を使用しています。音声を変更する場合:

1. `src/app/api/tts/route.ts`でボイスIDを更新
2. `src/app/page.tsx`でデフォルト選択を変更

### モデル設定

- **TTSモデル**: `eleven_multilingual_v2` (日本語対応)
- **STTモデル**: `scribe_v1` (多言語音声認識)

## 🚀 デプロイ

### Vercel（推奨）

1. コードをGitHubにプッシュ
2. [Vercel](https://vercel.com)にリポジトリを接続
3. `ELEVENLABS_API_KEY`環境変数を追加
4. 自動デプロイ

### その他のプラットフォーム

Node.jsをサポートする任意のプラットフォームにデプロイ可能:
- Netlify
- Railway
- Heroku
- AWS/GCP/Azure

## 🔒 セキュリティ

- APIキーは環境変数で安全に保存
- クライアントサイドでのAPIキー露出なし
- 音声データはサーバーサイドで処理

## 🤝 貢献

1. リポジトリをフォーク
2. フィーチャーブランチを作成
3. 変更を実装
4. 該当する場合はテストを追加
5. プルリクエストを送信

## 📄 ライセンス

このプロジェクトはMITライセンスの下でライセンスされています。

## 🙏 謝辞

- [ElevenLabs](https://elevenlabs.io) - AI音声技術の提供
- [Next.js](https://nextjs.org) - Reactフレームワーク
- [Tailwind CSS](https://tailwindcss.com) - スタイリングユーティリティ

---

Claude Codeで ❤️ を込めて構築