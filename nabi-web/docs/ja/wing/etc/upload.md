---
title: ファイルをアップロード
---

# ファイルをアップロード

## 説明

アップロードは三つの部品に分かれます — 翼の登録だけでは何も起こりません。

1. **`uploadWing`** — ツールバーにファイル選択ボタンを付けます。この翼自身は `img` も
   `a` も作りません — アップロードされたファイルは画像・リンクの翼が描くものとして
   コミットされるので、**`imageWing` か `linkWing` を一緒に登録してはじめて**結果が
   文書に残ります。どちらもなければ **登録するその場で例外が出ます**(あとから
   出るのではありません)。
2. **`mountUpload({ … })`** — 実際にファイルを受け取り `uploader` を回す側です。
   ドロップ・貼り付け・ファイル選択がすべてここに流れ込みます。**この mount を外すと、
   ボタンはあっても何も起こりません。**
3. **`mountUploadView({ … })`** — 進捗のプレースホルダを画面に立てる側です。なくても
   アップロードはできますが、進んでいるあいだ画面が何も語りません。

`uploader` は `(task) => Promise<{ uri } | null>` の形です — **アドレスを返せば成功、
`null` なら失敗**で、プレースホルダが取り払われます。`task.onProgress(0〜100)` で進捗を
知らせ、`task.signal` が中断されると止まります。

制限は `extensions`・`maxFileSize`・`maxTotalSize` の三つで、すべて省略できます(0 や
省略なら制限なし)。弾かれたファイルは `onReject` に来ます。

## アップロードのあとに残るもの

画像は `imageWing` のブロックとして、それ以外のファイルは `linkWing` の添付リンクとして
コミットされます。

- **添付の名前はファイル名ではなく i18n のラベルです** — 日本語なら「添付ファイル」。
  ファイル名はたいてい文書に残すには長く、何より変えられなければならないからです。
  名前は、キャレットをそのリンクに置いて
  [状況行の名前欄](../inline/link) で変えます。
- **拡張子は印として残ります** — `data-nabi-file="pdf"`。この値は本当のファイル名から
  取り出したもので、シートがそれをバッジとして描きます。名前を変えても、印は付いていきます。
- リンクが受け付けないアドレス(`allowLocalUrls` を入れないまま来た `blob:` など)は、
  平文のファイル名に格下げされます — ホワイトリストを迂回することはありません。

## アップロード中に見えるもの

アップロードのあいだ、その場所には一時的な箱が立ちます — エディタの DOM にだけあって
ナビツリーにはないので、保存値には一文字も残りません。

- **画像** は選んだファイルで作ったプレビューがすぐに現れ、その上を格子が覆います。進捗の
  ぶんだけ枡がひとつずつ取り払われてはっきりしていきます。枡が取り払われる順序はファイル
  ごとに混ぜられ、複数枚を一度にアップロードしても同じ模様が繰り返されません。
- **画像ではないファイル** は格子なしで 📎 と「添付ファイル」のラベルが立つ箱を受け取り、
  拡張子が大文字のバッジ(`PDF` など)で一緒に出ます。プレビューを描けない画像もここに
  落ちます。
- 進捗は箱に `data-nabi-per` として載り、シートが描きます。アップロード中は箱ごとに
  キャンセル(×)ボタンが立ち、バッチが回っているあいだ編集はロックされます。

## 使用例

```ts
import {
  createNabiWith,
  mountSurface,
  mountToolbar,
  mountUpload,
  mountUploadView,
  imageWing,
  linkWing,
  uploadWing,
} from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// アップロードは画像・リンクの翼がなければ結果を残せない — なければここで即座に例外
const { nabi, registry } = createNabiWith([imageWing, linkWing, uploadWing])

mountSurface({ nabi, registry, root: surface })

// 進捗のプレースホルダを立てる側 — 先に作っておいて下でつなぐ
const view = mountUploadView({ nabi, surface, locale: 'ja' })

const upload = mountUpload({
  nabi,
  root: surface,
  locale: 'ja',
  extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf'],
  maxFileSize: 10 * 1024 * 1024,
  uploader: async (task) => {
    // ここに実際にサーバーへアップロードするコードを入れます。アドレスを返せば成功、null なら失敗です
    // const uri = await user_callback(task.file, task.onProgress, task.signal)
    // return { uri }
    return null
  },
  onStart: (tasks) => view.start(tasks),
  onProgress: (id, percent) => view.progress(id, percent),
  onSettle: () => view.settle(),
  onDone: () => view.done(),
})

mountToolbar({
  nabi, registry, surface,
  root: document.querySelector<HTMLElement>('#toolbar')!,
  // ツールバーのファイル選択ボタンが選んだファイルが流れ込む先
  onFiles: (files) => upload.take(files),
})
```

## デモ

このサイトにはアップロード先のサーバーがないので、`URL.createObjectURL()` で作った
`blob:` アドレスをそのまま返すふりをするだけです。結果はこのページの中にだけ残ります。

<WingDemo path="/wing/etc/upload" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
