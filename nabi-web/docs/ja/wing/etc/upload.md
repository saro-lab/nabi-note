---
title: ファイルをアップロード
---

# ファイルをアップロード

## 説明

ファイルアップロードは3つのモジュールの連携で構成されます。

1. **`uploadWing`** — ツールバーにファイル添付ボタンを付けます。アップロードされた結果は画像またはファイルリンクのノードとして文書に挿入されるため、**`imageWing` か `linkWing` を一緒に登録する必要があります**。どちらもなければ、初期化時に例外が発生します。
2. **`mountUpload({ … })`** — ドラッグ&ドロップ、クリップボード貼り付け、ツールバーのファイル選択で入ってきたファイルを受け取り、ホストの `uploader` 関数に渡します。
3. **`mountUploadView({ … })`** — アップロードの進捗プレースホルダ UI を画面に描きます。

::: warning クリップボード貼り付け時のファイルアップロード処理規則
クリップボードのデータに**テキストや HTML が含まれている場合**（`text/html` または `text/plain`）は、ファイルアップロードではなく通常のテキスト/Markdown貼り付けパイプラインとして処理されます。アップロードパイプラインが呼ばれるのは、クリップボードの貼り付けにファイルデータだけが単独で含まれている場合だけです。（ドラッグ&ドロップによるファイル添付は常にアップロードパイプラインで処理されます。）
:::

`uploader` 関数は `(task) => Promise<{ uri: string } | null>` というシグネチャを持ちます。サーバーへのアップロードが成功すると `{ uri }` オブジェクトを返し、失敗すると `null` を返します。`task.onProgress(0〜100)` コールバックでアップロードの進捗を更新でき、`task.signal` で取消信号を処理します。

ファイルの拡張子と容量制限のオプション：`extensions`、`maxFileSize`、`maxTotalSize`（省略時は無制限）。条件に合わないファイルは `onReject` コールバックに渡されます。

## アップロード完了後の文書レンダリング

- **画像ファイル**：`imageWing` の `<img>` ブロックオブジェクトとして挿入されます。
- **一般の添付ファイル**：`linkWing` のファイルダウンロードリンク（`<a data-nabi-file="pdf" href="...">`）として挿入されます。添付ファイルの表示テキストはロケールに応じて「添付ファイル」として生成され、カーソルをリンクに置いて状況ツールバーから表示名を自由に変更できます。

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

// アップロードの翼は画像またはリンクの翼が一緒に登録されている必要があります
const { nabi, registry } = createNabiWith([imageWing, linkWing, uploadWing])

mountSurface({ nabi, registry, root: surface })

// アップロード進捗 UI ビューをマウント
const view = mountUploadView({ nabi, surface, locale: 'ja' })

const upload = mountUpload({
  nabi,
  root: surface,
  locale: 'ja',
  extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'zip'],
  maxFileSize: 10 * 1024 * 1024,   // 10MB
  uploader: async (task) => {
    // 実際にバックエンドサーバーへファイルをアップロードするロジックを実装
    // const uri = await myUploadApi(task.file, task.onProgress, task.signal)
    // return { uri }
    return null
  },
  onStart: (tasks) => view.start(tasks),
  onProgress: (id, percent) => view.progress(id, percent),
  onSettle: () => view.settle(),
  onDone: () => view.done(),
})

mountToolbar({
  nabi,
  registry,
  surface,
  root: document.querySelector<HTMLElement>('#toolbar')!,
  onFiles: (files) => upload.take(files),
})
```

## デモ

<WingDemo path="/wing/etc/upload" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
