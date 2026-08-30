---
title: AI バイブコーディング
description: AI エージェントが現在の公開 API と文書の境界に基づいて NABI NOTE を正しく使えるようにします。
---

# AI バイブコーディング

NABI NOTE は AI や自動化ツール向けに [`llms.txt`](/llms.txt) を提供しています。エージェントにライブラリー全体を推測させるのではなく、その索引から始め、作業に必要な文書だけを読ませます。

## 最初に使うプロンプト

必要なフレームワークと機能を埋めて使います。

```text
Build an editor with NABI NOTE (nabi-note).
First read https://nabi.saro.me/llms.txt, then read only the documents needed for this task.

Environment: Vue 3 + TypeScript
Features: basic formatting, tables, images, and uploads
Stored source: NABI TREE JSON
Publishing: render stored JSON to HTML on the server

Use only public exports and APIs that exist in the installed types.
After implementation, run type checking and a build, then report changed files and verification results.
```

エージェントが URL を開けない場合は、`llms.txt` と、そこからリンクされている関連文書を会話に含めてください。

## 必要な文書だけを示す

`llms.txt` は小さな索引です。すべての文書を一度に渡すより、関連ページだけを渡す方がたいてい役に立ちます。

- npm での組み立て: [`quickstart-npm.md`](https://nabi.saro.me/llms/quickstart-npm.md)
- CDN 設定: [`quickstart-cdn.md`](https://nabi.saro.me/llms/quickstart-cdn.md)
- wing の選択: [`wings.md`](https://nabi.saro.me/llms/wings.md)
- 保存 JSON、HTML、変更イベント: [`document-model.md`](https://nabi.saro.me/llms/document-model.md)
- HTML インポート、貼り付け、アップロードの境界: [`io-security.md`](https://nabi.saro.me/llms/io-security.md)
- カスタム wing とサーバー描画: [`custom-wing.md`](https://nabi.saro.me/llms/custom-wing.md), [`ssr.md`](https://nabi.saro.me/llms/ssr.md)
- viewer、diff、スタイル、ドロップキャップ: [`viewer-diff.md`](https://nabi.saro.me/llms/viewer-diff.md), [`styling.md`](https://nabi.saro.me/llms/styling.md)
- 正確な import と型: [`api-reference.md`](https://nabi.saro.me/llms/api-reference.md)

## プロダクト要件を含める

エージェントは、編集画面だけを見ても保存方法、セキュリティポリシー、アップロード動作を推測できません。実際のフレームワーク、含める wing と除外する wing、JSON と HTML のどちらを保存するか、アップロードエンドポイントのリクエストとレスポンスの約束、ファイル制限、公開ページに SSR、viewer 動作、diff が必要かどうかを明記してください。

まだ決まっていないことは、選択肢と影響を説明してから実装するようエージェントに求めます。

## 結果をレビューする

生成されたコードも通常のコードと同じようにレビューします。特に、次の点を確認してください。

- 編集画面と公開コンテンツの両方で `nabi-note/nabi.css` を読み込んでいる。
- 選択した wing とすべての mount で同じ `registry` を使っている。
- `getEditorHtml()` ではなく、必ず `getJson()` を保存している。
- 編集中の `.nabi-content` 要素の `innerHTML` を直接書き換えていない。
- 画面を閉じるとき、すべての mount を unmount している。
- アップロードサーバーで MIME、サイズ、認可、保存先を検証している。
- サーバーとブラウザーで wing の順序と HTML に影響するオプションが一致している。
- 型チェック、テスト、ビルドで実際の export 名を確認している。

IME とキャレットの動作、保存と読み込みの経路は、一度画面が動いたように見えても実際に確認する必要があります。保存文書の復元だけでなく、モバイルでの変換入力もテストしてください。

## インストール済みバージョンを優先する

プロジェクトにすでに `nabi-note` が入っている場合、その `package.json` の exports と型宣言は、別リリース向けに作られた Web サイトより直接関係します。コードを書く前に、そのバージョン差を確認するようエージェントに求めてください。
