---
title: CDN の使い方
description: ビルドツールなしで NABI NOTE のブラウザー版を読み込みます。
---

<script setup>
import CdnDemo from '../../.vitepress/ui/CdnDemo.vue'
</script>

# CDN の使い方

パッケージをインストールしにくい静的ページでは、CDN からブラウザー版と CSS を読み込みます。下のデモはサイトのビルド時にパッケージバージョンを読み取り、グローバルな `NabiNote` オブジェクトからエディターを作ります。

<CdnDemo />

## NABI NOTE での注意点

- 配布するコードでは、CSS とブラウザー JavaScript を同じバージョンに固定してください。`latest` のようにバージョンのない URL は、新しいリリースが出たときに動作が変わることがあります。
- ブラウザーバンドルはルート API を `window.NabiNote` として公開します。`nabi-note/ssr`、`nabi-note/viewer`、`nabi-note/diff` は別々のグローバルバンドルとしては提供されません。
- このデモのファイル保存とローカル履歴は、ユーザーのブラウザー内で動作します。サーバー保存やアカウント同期には、`getJson()` の出力をアプリケーション API へ送ってください。
- アップロードには `upload` wing、実際のアップロード関数、そして必要な画像 wing またはリンク wing が必要です。ファイル検証はアップロードサーバー側の責任です。
- ブラウザー版は HTML パーサーを内部で接続しています。`setHtml()`、HTML ファイルを開く操作、HTML の貼り付けには、パーサーオプションや非公開 API は不要です。

CDN 読み込みで変わるのはライブラリーの読み込み方だけです。保存形式と入力検証は npm パッケージと同じなので、[基本的な使い方](/ja/guide/getting-started) も参照してください。
