# DEGUCHIKAI
 
**概要:**

このドキュメントは、DEGUCHIKAIプロジェクト（`tauri-with-voice`リポジトリ）を理解し、活用し、貢献するための包括的なガイドです。Tauri、React、TypeScriptを用いて開発されたこのプロジェクトは、画像とテキストから音声を合成し、動画を生成するデスクトップアプリケーションです。

**想定読者:**

*   **新規開発者:** プロジェクトのアーキテクチャ、技術スタック、コーディング規約を理解し、開発プロセスに参加したい開発者。
*   **既存開発者:** プロジェクトの特定機能の詳細、貢献方法、最新の変更点などを確認したい開発者。
*   **非技術者:** プロジェクトの概要、目的、利用方法を知りたいユーザー。

## 1. プロジェクト紹介

### 1.1 プロジェクトの目的と背景

*   **目的:** スライド（画像とテキスト）から音声を合成し、動画を自動生成することで、プレゼンテーション資料作成の効率化を目指します。
*   **背景:** プレゼンテーション資料の作成には、スライドの作成だけでなく、音声の録音や動画編集といった作業も必要となり、時間と労力がかかります。このプロジェクトは、これらの作業を自動化し、より手軽に動画コンテンツを作成できるようにすることを目指しています。
*   **主要機能:**
    *   スライド（画像とテキスト）の読み込み
    *   テキストからの音声合成 (Voicevox API連携)
    *   スライドと音声を組み合わせた動画の自動生成
    *   生成された動画の連結
*   **技術スタック:**
    *   フロントエンド: React 18.3.1, TypeScript 5.6.2, Ant Design 5.24.2
    *   バックエンド: Rust 2024, Tauri 2, Voicevox Client 0.1.1
    *   動画処理: ffmpeg
*   **プロジェクトのゴール:**
    *   直感的なUI/UX
    *   高速な動画生成
    *   多様な音声スタイルに対応
    *   クロスプラットフォーム対応（Windows, macOS, Linux）

### 1.2 プロジェクトの利点

*   **効率的な動画生成:** スライドとテキストを用意するだけで、簡単に動画を作成できます。
*   **カスタマイズ性:** Ant Designを使用しているため、UIのカスタマイズが容易です。
*   **クロスプラットフォーム:** Tauriを使用しているため、Windows, macOS, Linuxで動作するアプリケーションを開発できます。

### 1.3 デモと利用事例

*   **デモ:** 現在オンラインデモは提供していませんが、README.md に簡単な実行例を記載しています。
*   **利用事例:**
    *   社内プレゼンテーション資料の作成
    *   教育コンテンツの作成
    *   YouTubeなどの動画コンテンツの作成

## 2. セットアップと利用方法 (Getting Started)

### 2.1 前提条件

*   OS: Windows, macOS, Linux
*   Node.js: v18以上
*   Rust: 最新版
*   Tauri CLI: v2以上
*   ffmpeg: 必須。環境変数にffmpegコマンドへのパスを通しておくこと。
*   Voicevox: 必須。 Voicevoxのエンジンを起動しておくこと。環境変数`DEFAULT_VOICEVOX_SERVER_URL`にVoicevoxのURLを設定すること。

### 2.2 インストール手順

1.  リポジトリをクローンします。
    ```bash
    git clone [リポジトリURL]
    cd [プロジェクトディレクトリ]
    ```
2.  フロントエンドの依存関係をインストールします。
    ```bash
    npm install
    ```
3.  Tauri CLIをインストールします。
    ```bash
    npm install -g @tauri-apps/cli
    ```
4.  Rustの環境をセットアップします。
    [Rust公式ウェブサイト](https://www.rust-lang.org/learn/get-started)の手順に従ってください。

### 2.3 初期設定

1.  環境変数を設定します。
    `.env`ファイルを作成し、以下の環境変数を設定します。
    ```
    DEFAULT_VOICEVOX_SERVER_URL=http://localhost:50021 # VoicevoxのURL
    DEFAULT_VOICEVOX_VOICE_ID=0 # デフォルトのVoicevox話者ID
    DEFAULT_RESOURCE_FILE_PATH=./resource/resource.txt # リソースファイルのパス
    DEFAULT_OUTPUT_VOICE_FILE_DIR=./results/output/voice # 音声出力先ディレクトリ
    DEFAULT_OUTPUT_VIDEO_FILE_DIR=./results/output/video # 動画出力先ディレクトリ
    ```

2.  リソースファイル (`resource/resource.txt`) を作成します。
    このファイルに、スライドで使用する画像ファイル名、タイトル、テキストコンテンツを記述します。詳細は後述の「リソースファイル形式」を参照してください。

### 2.4 基本的な使い方

1.  開発サーバーを起動します。
    ```bash
    npm run tauri dev
    ```
2.  アプリケーションが起動したら、UIからスライド（画像とテキスト）を読み込みます。
3.  「生成」ボタンをクリックすると、音声合成と動画生成が開始されます。
4.  生成された動画は、`results/output/video` ディレクトリに出力されます。

## 3. アーキテクチャとファイル構成

### 3.1 全体アーキテクチャ図

[全体のアーキテクチャ図は、必要に応じて追加してください。]

### 3.2 ファイル構成図

```
tauri-with-voice/
├── .gitignore
├── README.md
├── index.html
├── package-lock.json
├── package.json
├── src/
│   ├── App.css
│   ├── App.tsx
│   ├── components/
│   │   ├── update-rows.tsx
│   │   └── update-slide.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
├── src-tauri/
│   ├── Cargo.toml
│   ├── build.rs
│   ├── capabilities/
│   │   └── default.json
│   ├── resource/
│   │   ├── fonts/
│   │   │   ├── OFL.txt
│   │   │   ├── NotoSansJP-Regular.ttf
│   │   │   └── README.txt
│   │   └── resource.txt
│   ├── src/
│   │   ├── lib.rs
│   │   └── main.rs
│   └── tauri.conf.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

### 3.3 主要ディレクトリとファイルの役割

*   **`src/`**: Reactで記述されたフロントエンドのコードが含まれます。
    *   **`App.tsx`**: アプリケーションのエントリーポイントとなるコンポーネント。
    *   **`components/`**: UIコンポーネントを格納するディレクトリ。
        *   **`update-slide.tsx`**: スライドの追加・編集を行うコンポーネント。
        *   **`update-rows.tsx`**: スライド内のテキストコンテンツを編集するコンポーネント。
    *   **`main.tsx`**: ReactアプリケーションをDOMにマウントする処理を記述。
*   **`src-tauri/`**: Rustで記述されたバックエンドのコードとTauriの設定ファイルが含まれます。
    *   **`src/lib.rs`**: Tauriコマンド（Rust関数）を定義するファイル。
    *   **`src/main.rs`**: Tauriアプリケーションのエントリーポイント。
    *   **`tauri.conf.json`**: Tauriアプリケーションの設定ファイル。
    *   **`resource/resource.txt`**: スライドで使用する画像ファイル名、タイトル、テキストコンテンツを記述するリソースファイル。
*   **`vite.config.ts`**: Viteの設定ファイル。

### 3.4 リソースファイル形式 (resource/resource.txt)

リソースファイルは、スライドで使用する画像ファイル名、タイトル、テキストコンテンツを記述したテキストファイルです。以下の形式で記述します。

```
[画像ファイル名（絶対パスまたは相対パス）]
# スライドのタイトル（省略可能）
@0 テキストコンテンツ（Voicevox話者IDを指定する場合は @ID の形式で記述）
テキストコンテンツ
@1 テキストコンテンツ
```

例:

```
C:\Users\user\Pictures\slide1.png
# 自己紹介
@0 こんにちは、〇〇です。
このスライドでは、自己紹介をします。
@1 趣味は〇〇です。
```

## 4. コーディング規約と開発プロセス

### 4.1 コーディング規約

*   **TypeScript:**
    *   ESLint, Prettier を使用してコードの品質を維持。
    *   Reactの関数コンポーネントを使用。
    *   型定義を積極的に利用。
*   **Rust:**
    *   Rustfmtを使用してコードをフォーマット。
    *   Clippyを使用してコードのlintを実行。
    *   エラーハンドリングは `Result` 型を使用。

### 4.2 開発プロセス

1.  GitHub Issuesで機能提案やバグ報告を行う。
2.  `develop` ブランチから派生したフィーチャーブランチで開発を行う。
3.  Pull Requestを作成し、コードレビューを受ける。
4.  CI/CDパイプラインで自動テストを実行。
5.  `main` ブランチにマージ。

### 4.3 コントリビューションガイドライン

[プロジェクトへの貢献を促すために、コントリビューションガイドラインを明記します。]

## 5. 設計思想とアーキテクチャパターン

### 5.1 採用しているアーキテクチャパターン

*   **MVC (Model-View-Controller)**: ReactコンポーネントがViewとControllerの役割を担い、RustのバックエンドがModelの役割を担います。

### 5.2 各層の役割と責務

*   **Model (Rustバックエンド)**:
    *   音声合成
    *   動画生成
    *   ファイル操作
*   **View & Controller (Reactコンポーネント)**:
    *   UIの表示
    *   ユーザーからの入力の受付
    *   Tauriコマンドの呼び出し

### 5.3 なぜそのアーキテクチャパターンを採用したのか

*   **関心の分離:** フロントエンドとバックエンドの役割を明確に分離することで、コードの保守性と可読性を向上させます。
*   **テスト容易性:** 各コンポーネントが独立しているため、単体テストが容易になります。

## 11. ライセンス

[LICENSE](https://github.com/howlrs/gen-readme/blob/master/LICENSE)

## 12. 連絡先

[@xhowlrs](https://x.com/xhowlrs)
