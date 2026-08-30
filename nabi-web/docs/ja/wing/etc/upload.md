---
title: ファイルアップロード
description: ファイル転送をサービスのアップローダーに接続します。
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# ファイルアップロード

ファイル選択、ドラッグ & ドロップ、ファイルだけを含む貼り付けをアップロードフローにつなぎます。このページのデモはサーバーへ送信しません。実際のサービスでは、ファイルを受け取り URL を返すアップローダーを接続する必要があります。

アップロード結果を画像ブロックとして入れるには画像 wing が必要です。その他のファイルを添付リンクとして入れるにはリンク wing が必要です。両方の形式を受け付けるサービスでは、2 つの wing を明示的に一緒に選びます。アップロード中はエディターがロックされ、成功したファイルは 1 つの undo 手順としてまとめて挿入されます。

<WingDemo path="/wing/etc/upload" />

```ts
const selected = wings()
  .use('img')
  .use('a')
  .use('upload', { allowLocalUrls: false })
  .build()
```

`upload` だけを選ぶと、画像またはリンクのうち不足している依存関係を自動で補います。転送は `mountUpload()` で接続し、編集画面の進行状態表示は通常 `mountUploadView()` で接続します。サーバーが HTTPS URL を返すなら、ローカル URL の許可オプションは必要ありません。

## サーバー API の約束

NABI NOTE はファイルをサーバーへ自動送信しません。`uploader` 関数がファイル 1 つをサーバーへ送り、成功したら公開 URL または認証が必要な `https:` URL だけを返す構造です。もっとも単純な API の約束は次のようになります。

```text
POST /api/uploads
Content-Type: multipart/form-data
Field name: file

Success: { "url": "https://cdn.example.com/uploads/8f2c.webp" }
Failure: 4xx or 5xx response
```

サーバーは元のファイル名、拡張子、ブラウザーが送った MIME だけを信用してはいけません。まず認証と権限を確認し、ストリーミング段階でファイルサイズを制限し、実際のファイル形式を検査します。保存名はサーバー側で新しく作ります。画像であれば必要に応じて再エンコードしたりサムネイルを作ったりします。アップロードしたファイルを誰でもダウンロードできないサービスなら、公開 URL ではなく認証が必要なダウンロードパスを返してください。

| サーバーで確認すること | 理由 |
| --- | --- |
| ログイン中のユーザーとアップロード権限 | 他のユーザーの保存領域を使わせないため |
| ファイル 1 つあたりのサイズとリクエスト全体のサイズ | メモリや保存領域の枯渇を防ぐため |
| 許可した実際の MIME と拡張子 | 名前だけを変えた実行ファイルを防ぐため |
| ランダムな保存名と分離された保存先 | パス操作と既存ファイルの上書きを防ぐため |
| 応答 URL のアクセス権限と期限ポリシー | 非公開ファイルが URL だけで露出するのを防ぐため |

クライアント側の `extensions` と `maxFileSize` は、ユーザーへ素早く知らせるための最初の段階にすぎません。同じ制限をサーバーにも必ず置いてください。

## ブラウザーでアップローダーを接続する

次の例は、NABI NOTE が想定している実際の接続です。`XMLHttpRequest` を使う理由は、ブラウザー標準の `fetch()` がアップロード進行率を提供しないためです。サーバーが返した `url` だけを返せば、画像は画像ブロックに、その他のファイルは添付リンクになります。

```ts
import {
  createNabiWith,
  mountSurface,
  mountUpload,
  mountUploadView,
  wings,
  type UploadTask,
} from 'nabi-note'

const content = document.querySelector<HTMLElement>('#content')!
const { nabi, registry } = createNabiWith(
  wings().use('img').use('a').use('upload').build(),
  { locale: 'ja' },
)

function sendUpload(task: UploadTask): Promise<{ uri: string } | null> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest()
    request.open('POST', '/api/uploads')
    request.responseType = 'json'

    request.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) task.onProgress((event.loaded / event.total) * 100)
    })

    request.addEventListener('load', () => {
      const url = request.response?.url
      if (request.status >= 200 && request.status < 300 && typeof url === 'string') {
        resolve({ uri: url })
      } else {
        resolve(null)
      }
    })
    request.addEventListener('error', () => reject(new Error('アップロードリクエストに失敗しました。')))
    task.signal.addEventListener('abort', () => request.abort(), { once: true })

    const body = new FormData()
    body.append('file', task.file as File, task.name)
    request.send(body)
  })
}

let uploadView: ReturnType<typeof mountUploadView>
const upload = mountUpload({
  nabi,
  root: content,
  uploader: sendUpload,
  extensions: ['png', 'jpg', 'jpeg', 'webp', 'pdf'],
  maxFileSize: 10 * 1024 * 1024,
  maxTotalSize: 20 * 1024 * 1024,
  locale: 'ja',
  onStart: (tasks) => uploadView.start(tasks),
  onProgress: (id, percent) => uploadView.progress(id, percent),
  onSettle: () => uploadView.settle(),
  onDone: () => uploadView.done(),
})

uploadView = mountUploadView({ nabi, surface: content, upload, locale: 'ja' })

const surface = mountSurface({
  nabi,
  registry,
  root: content,
  fileSink: upload.take,
  locale: 'ja',
})
```

`fileSink: upload.take` を接続すると、ドラッグ & ドロップと、ファイルだけを含む貼り付けがアップロードに入ります。ファイル選択ボタンは `upload` wing の UI が `upload.take()` へ渡します。アップロード中はエディターがロックされ、成功したファイルは 1 バッチにつき 1 回の undo として挿入されます。`upload.cancel()` または `uploadView` のキャンセルボタンは、`AbortSignal` を通じて進行中のリクエストを中断します。

## 失敗と画面の解放

サーバーがエラー応答を返したり `uploader` が `null` を返したりした場合、そのファイルは文書に入りません。同じバッチの他のファイルは処理を続けます。合計サイズ制限を超えると、バッチ全体が開始されません。画面を閉じるときは、作成した順序の逆に解放します。

```ts
function dispose() {
  surface.unmount()
  uploadView.unmount()
  upload.unmount()
}
```

開発中だけ、`blob:` URL を使って即時プレビューを作れます。この場合は、エディターの組み立て、画像 wing、アップロード wing それぞれで `allowLocalUrls: true` を有効にする必要があります。実際のサーバーアップロードが HTTPS URL を返すなら、このオプションは有効にしない方が安全です。

## CSS スタイル

完了した通常ファイルは、リンク wing によって `a[data-nabi-file]` として表示されます。公開画面で添付の見た目だけを変えるには、このセレクターを使います。

```css
.article-body a[data-nabi-file] {
  padding: .3em .6em;
  border: 1px solid var(--nabi-line);
  border-radius: 8px;
  background: var(--nabi-soft);
}
```

画像アップロードの結果は画像 wing の CSS に従います。アップロード進行表示は編集画面にだけ出るため、公開画面 CSS で進行状態を作る必要はありません。
