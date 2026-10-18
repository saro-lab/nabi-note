---
title: マージ
description: 編集開始時・自分・その間に反映されたバージョンを合わせ、残った競合を編集して解決します。
---

<script setup>
import MergeDemo from '../../.vitepress/ui/MergeDemo.vue'
</script>

# マージ

編集中に別の変更が反映された場合は、編集開始時のバージョンを基準に両側の変更を合わせます。自動で合わせられる内容は最初からすべて反映し、重なる変更だけを競合として残します。マージはウィングではなく `nabi-note/merge` の独立した画面です。

| 左 | 中央 | 右 |
| --- | --- | --- |
| 編集を始めたバージョン | 自分の現在の文書に自動マージを反映した結果 | 編集中に新たに反映されたバージョン |
| 読み取り専用 | 直接編集可能 | 読み取り専用 |

中央では通常のエディターと同様に文章・書式・表・リスト・画像などを編集できます。使える機能は渡したウィングで決まり、競合の表示や解決状態は保存する文章に混ざりません。

## すべて自動でマージできる例

自分は会議時刻を **午前11時** に、別の人は場所を **3階会議室** に変えました。異なる段落の変更なので、中央の結果に両方が反映されます。

競合が残っていないので、すぐに **確認** を押せます。中央の文章をさらに整えてから確認してもかまいません。下に表示される最終文書は、確認コールバックが受け取った実際の結果です。

<MergeDemo />

## 一部だけ自動でマージできる例

今度は自分が会議時刻を **午前11時** に、別の人が **午後2時** に変えました。同じ段落を異なる内容にしたため、時刻は競合として残ります。自分が変えた進行担当の **ジミンとソヨン**、別の人が変えた場所の **3階会議室** は自動で反映されます。

競合は次のいずれかで解決します。

- 左の **&gt;&gt;**：編集開始時の該当内容を採用します。
- 右の **&lt;&lt;**：新たに反映されたバージョンの該当内容を採用します。
- **現在の内容で解決**：中央の内容をそのまま使うか編集して、解決済みにします。

中央の時刻の文を好きな内容に変え、**現在の内容で解決**を押してください。残った競合がすべて解決してから確認できます。

<MergeDemo partial />

解決済みの箇所を再編集しても解決状態は維持します。解決操作を元に戻すと状態も戻り、やり直すと復元します。文章の削除や編集だけでは未解決の競合は自動で解決されません。

## 自動マージと競合の基準

編集開始文書から自分の文書への変更と、同じ開始文書から新バージョンへの変更を比較します。片側だけの変更や両側で同じ内容にした変更は自動で反映します。異なる段落・行の変更もまとめて反映します。

Git のテキストマージのように、段落・行を基準に変更の重なりを判断します。同じ行の異なる単語を変えた場合も自動で混ぜず、競合とします。同じ位置への異なる挿入や、片側が削除した内容をもう片側が編集した場合も判断が必要です。

表・リスト・フロートなど内部構造を持つブロックを両側で異なる内容に変えた場合は、構造全体を競合とします。セルやリスト項目を任意に混ぜず、内容を選ぶか中央で直接編集します。移動と編集が重なり位置を確定できない場合も自動適用しません。

## 独立したマージ画面を接続する

`base`、`local`、`incoming` に保存済みの NABI TREE JSON または HTML 文字列を渡します。文書を作成したエディターと同じウィングとオプションを使います。`mountMerge()` が中央のエディターとツールバー、両側の原文、競合選択ツール、確認ボタンをまとめて作ります。

```ts
import { wings } from 'nabi-note'
import { mountMerge } from 'nabi-note/merge'
import 'nabi-note/nabi.css'

const merge = mountMerge({
  root: document.querySelector('#merge')!,
  base: editingStartedDocument,
  local: myEditedDocument,
  incoming: latestDocument,
  wings: wings().allBasic().build(),
  locale: 'ja',
  incomingVersion: latestVersion,
  async onConfirm({ json, html, incomingVersion, signal }) {
    return saveDocument({ json, html, expectedVersion: incomingVersion, signal })
  },
  onError(error) {
    showError(error)
  },
})
```

`onConfirm` は競合がすべて解決した現在の結果の JSON・公開用 HTML・編集 revision と `incomingVersion` を受け取ります。`false` を返すと確認は完了しません。Promise の待機中は結果の編集、競合選択、重複確認を一時的に防ぎます。画面を破棄すると結果の `signal` を中止します。韓国語の IME 変換中は変換終了後に確認できます。

サービスの画像選択画面やアップロードなどは通常のエディターと同様に接続します。`toolbarOptions` でツールバーパネルとホスト動作、`surfaceOptions` で編集面のオプションを渡せます。

`incomingVersion` はサービスから渡した値をそのまま返します。保存時の最新サーバーバージョンとの比較はサービスが行います。マージ中にさらに新しいバージョンが保存されたら、古い結果で上書きせず最新文書を取得して新しいマージを始めます。

画面の外からも状態の取得や確認の呼び出しができます。

```ts
const stop = merge.session.onChange((state) => {
  updateRemainingCount(state.unresolvedCount)
})

const canConfirm = merge.session.getState().canConfirm
const confirmed = await merge.confirm()

stop()
merge.unmount()
```

現在の結果は `merge.nabi.getJson()` と `merge.nabi.getHtml()` で取得します。編集画面の DOM や `getEditorHtml()` は保存しません。2つのバージョンから以前の内容だけを選んで反映するには、[比較](./compare)のクリックマージを使います。

## アップロード完了後に確認する

ファイルボタン・貼り付け・ドラッグ＆ドロップには `upload` ウィングと `mountUpload()` を接続します。`sendUpload` はファイルをサーバーに送り `{ uri }` を返す関数です。接続と進捗表示の全体例は[ファイルアップロード](../wing/etc/upload)を参照してください。

文書にまだ反映されていないアップロードなどの非同期処理では、`merge.session.hold()` で確認と競合選択を保留します。完了・取消・画面破棄の際に返された関数を呼んで解除します。最終結果からファイルが抜けないよう、サーバーへの送信直後ではなく **文書に挿入された後** に解除します。

```ts
import { mountUpload, wings, type UploadMount } from 'nabi-note'
import { mountMerge } from 'nabi-note/merge'

let upload: UploadMount | undefined
let releaseUpload: (() => void) | undefined

const merge = mountMerge({
  root,
  base,
  local,
  incoming,
  wings: wings().allBasic().use('upload').build(),
  locale: 'ja',
  incomingVersion: latestVersion,
  toolbarOptions: { onFiles: (files) => upload?.take(files) },
  surfaceOptions: { fileSink: (files) => upload?.take(files) },
  onConfirm: ({ json, html, incomingVersion, signal }) =>
    saveDocument({ json, html, expectedVersion: incomingVersion, signal }),
})

upload = mountUpload({
  nabi: merge.nabi,
  root: merge.content,
  locale: 'ja',
  uploader: sendUpload,
  onStart() {
    releaseUpload = merge.session.hold()
  },
  onDone() {
    releaseUpload?.()
    releaseUpload = undefined
  },
})

function dispose() {
  upload?.unmount()
  releaseUpload?.()
  merge.unmount()
}
```

`merge.content` は中央の編集 DOM、`merge.surface` と `merge.toolbar` は接続済みの編集面とツールバーです。同じ場所に作り直さないでください。追加したアップロードや進捗表示などの mount を先に破棄し、最後に `merge.unmount()` を呼びます。
