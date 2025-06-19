# CLAUDE.md - VoiceStudio 開発記録

このファイルは、Claude Code AIアシスタントとの開発プロセスと技術的決定を記録しています。

## 📋 プロジェクト概要

**プロジェクト名**: VoiceStudio + VoiceChat  
**開発期間**: 2025年6月15日 - 2025年6月19日  
**技術スタック**: Next.js 15, TypeScript, ElevenLabs API, OpenAI API, Tailwind CSS  
**目的**: AI音声合成・認識 + リアルタイム音声チャットボット構築

## 🚀 開発プロセス

### フェーズ1: 基盤構築
- Next.js 15プロジェクトの初期セットアップ
- ElevenLabs JavaScript SDKの導入 (`@elevenlabs/elevenlabs-js`)
- 環境変数設定 (`.env.local`)

### フェーズ2: Text-to-Speech実装
- `/api/tts/route.ts`エンドポイント作成
- ElevenLabs APIとの統合
- 音声生成機能の実装

#### 技術的課題と解決策
**課題**: ElevenLabs SDKでコンストラクタエラー
```
この式はコンストラクト可能ではありません
```

**解決策**: SDKの代わりに直接REST APIを使用
```typescript
// 変更前: SDK使用
const elevenlabs = new ElevenLabs({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

// 変更後: 直接API呼び出し
const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}`, {
  method: 'POST',
  headers: {
    'Accept': 'audio/mpeg',
    'Content-Type': 'application/json',
    'xi-api-key': process.env.ELEVENLABS_API_KEY,
  },
  body: JSON.stringify({
    text: text,
    model_id: 'eleven_multilingual_v2',
    voice_settings: {
      stability: 0.5,
      similarity_boost: 0.5
    }
  }),
});
```

### フェーズ3: Speech-to-Text実装
- `/api/stt/route.ts`エンドポイント作成
- マイク録音機能の実装 (MediaRecorder API)
- 音声認識機能の実装

#### 技術的課題と解決策
**課題**: APIパラメータエラー
```
Must provide either file or cloud_storage_url parameter
```

**解決策**: ElevenLabs STT APIドキュメントを参照し、正しいパラメータを使用
```typescript
// 修正されたパラメータ
const elevenLabsFormData = new FormData();
elevenLabsFormData.append('file', audioFile);           // 'audio' → 'file'
elevenLabsFormData.append('model_id', 'scribe_v1');     // 正しいSTTモデル
elevenLabsFormData.append('language_code', 'ja');       // 日本語指定
```

### フェーズ4: 音声設定最適化
- デフォルト音声IDの固定化
- 日本語対応モデルへの変更
- 音声選択UIの除去（固定音声使用）

#### 設定詳細
```typescript
// 固定音声設定
const VOICE_ID = '4lOQ7A2l7HPuG7UIHiKA';  // 女性音声
const TTS_MODEL = 'eleven_multilingual_v2';   // 日本語対応
const STT_MODEL = 'scribe_v1';                // 多言語認識
```

### フェーズ5: UIデザインのモダン化
- ダークテーマの実装
- グラデーション効果とアニメーション
- レスポンシブデザインの適用

#### デザイン仕様
```css
/* メインカラーパレット */
background: gradient(gray-900 → black → gray-800)
accent-colors: purple-500, cyan-500, blue-500
effects: backdrop-blur-xl, shadow-2xl, hover:scale-105
```

### フェーズ6: OpenAI統合 (2025年6月19日)
- OpenAI GPT-4o-mini APIの統合
- `/api/chat/route.ts`エンドポイント作成
- リアルタイム音声チャットボット実装

#### 技術的課題と解決策
**課題**: Hydrationエラー
```
Hydration failed because the server rendered HTML didn't match the client
```

**解決策**: Dateオブジェクトの文字列化とクライアントサイドレンダリング
```typescript
// 変更前: Dateオブジェクト使用
interface ChatMessage {
  timestamp: Date;
}

// 変更後: 文字列で保存
interface ChatMessage {
  timestamp: string;
}

// クライアントサイドでのみ表示
{isClient && (
  <span>{message.timestamp}</span>
)}
```

### フェーズ7: 音声チャットボット機能
- 音声入力→STT→GPT→TTS→音声出力の完全自動化
- チャット履歴管理とUI実装
- モード切替機能（Studio/Chat）

## 🔧 API設定要件

### ElevenLabs API権限
- **Text to Speech**: `Has access`
- **Speech to Text**: `Has access`  
- **Voices**: `Read only`

### OpenAI API権限
- **Chat Completions**: `Required`
- **Models**: `gpt-4o-mini`

### 環境変数
```env
ELEVENLABS_API_KEY=sk_xxxxxxxxxxxxx
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
```

## 📁 ファイル構成

```
src/app/
├── api/
│   ├── tts/route.ts      # 音声合成エンドポイント
│   ├── stt/route.ts      # 音声認識エンドポイント
│   ├── chat/route.ts     # OpenAI チャットエンドポイント
│   └── voices/route.ts   # 音声リストエンドポイント
├── page.tsx              # メインUI (VoiceStudio + VoiceChat)
└── layout.tsx            # アプリケーションレイアウト
```

## 🐛 解決済み技術課題

### 1. ElevenLabs SDK互換性問題
- **問題**: TypeScriptコンストラクタエラー
- **解決**: 直接REST API呼び出しに変更

### 2. STT APIパラメータエラー
- **問題**: 無効なパラメータ形式
- **解決**: 公式ドキュメント準拠のパラメータ使用

### 3. 音声ID無効エラー
- **問題**: 404 Not Found (無効なvoice_id)
- **解決**: 有効な女性音声IDに変更

### 4. 日本語音声品質
- **問題**: 英語モデルでの日本語発音
- **解決**: `eleven_multilingual_v2`モデル使用

### 5. Hydrationエラー (2025年6月19日)
- **問題**: サーバーとクライアントでDateオブジェクトが異なる
- **解決**: timestampの文字列化とクライアントサイドレンダリング

## 🎯 機能仕様

### Text-to-Speech
- **入力**: 日本語テキスト
- **出力**: MP3音声ファイル
- **モデル**: `eleven_multilingual_v2`
- **音声**: 固定女性音声

### Speech-to-Text  
- **入力**: WebM音声データ
- **出力**: 日本語テキスト
- **モデル**: `scribe_v1`
- **言語**: 日本語 (`ja`)

### Voice Chat (新機能)
- **入力**: 音声 → STT → GPT-4o-mini → TTS → 音声出力
- **会話履歴**: リアルタイムチャット表示
- **自動処理**: 音声認識後の自動チャット開始
- **自動再生**: AI応答の自動音声再生

### UI/UX
- **テーマ**: ダークモード
- **モード切替**: Studio Mode ⇄ Chat Mode
- **レスポンシブ**: モバイル対応
- **アニメーション**: ホバー効果、スケール変換
- **アクセシビリティ**: マイク権限管理
- **チャット履歴**: メッセージバブル表示、クリア機能

## 📝 開発のベストプラクティス

### エラーハンドリング
```typescript
// 詳細なエラー情報を提供
catch (error) {
  console.error('STT Error:', error);
  return NextResponse.json({ 
    error: 'Failed to convert speech to text', 
    details: error instanceof Error ? error.message : 'Unknown error'
  }, { status: 500 });
}
```

### セキュリティ
- APIキーはサーバーサイドのみで使用
- 環境変数による機密情報管理
- クライアントサイドでの機密情報露出なし

### パフォーマンス
- 音声データのストリーミング処理
- エラー時のフォールバック機能
- ローディング状態の適切な管理

## 🚀 デプロイ推奨事項

### Vercel設定
```bash
# 環境変数設定
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
OPENAI_API_KEY=your_openai_api_key_here

# ビルド設定
npm run build
npm run start
```

### 運用監視
- API使用量の監視 (ElevenLabs + OpenAI)
- エラーログの追跡
- パフォーマンスメトリクスの確認
- 音声チャット応答時間の監視

## 📈 今後の拡張可能性

### 機能拡張案
- [ ] 複数音声の選択機能
- [ ] 音声速度・ピッチ調整
- [ ] 音声ファイルのエクスポート機能
- [ ] チャットボットキャラクター設定
- [ ] 会話履歴の永続化
- [x] ✅ リアルタイム音声チャットボット
- [x] ✅ OpenAI GPT統合

### 技術改善案
- [ ] キャッシュ機能の実装
- [ ] PWA対応
- [ ] オフライン機能
- [ ] WebRTC活用
- [ ] ストリーミングレスポンス
- [ ] 感情分析機能

---

**開発者**: Claude Code AIアシスタント  
**協力者**: User  
**最終更新**: 2025年6月19日

## 🎉 VoiceChat統合完了

2025年6月19日にOpenAI統合が完了し、VoiceStudioがリアルタイム音声チャットボット機能を搭載したVoiceChatに進化しました。

### 🔄 新機能フロー
```
音声入力 → ElevenLabs STT → OpenAI GPT-4o-mini → ElevenLabs TTS → 音声出力
    ↑                                                                     ↓
会話履歴保存 ←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←
```

これで、自然な日本語での音声対話が可能なAIアシスタントが完成しました。