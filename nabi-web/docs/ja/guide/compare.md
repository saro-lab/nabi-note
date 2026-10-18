---
title: 比較
description: 2つの文書を並べて比較し、選んだ以前の内容を現在の文書に反映します。
---

<script setup>
import CompareDemo from '../../.vitepress/ui/CompareDemo.vue'
</script>

# 比較

保存した2つの文書を並べて変更箇所を確認します。エディターなしでも比較画面を開けます。コールバックを接続すると、選んだ以前の内容を現在の文書に反映できます。

## 以前の内容を選んで反映する

左は以前の文書、右は現在の文書です。変更箇所の **&gt;&gt;** を押すと、その段落・行グループの以前の内容を現在の文書に反映します。文字ごとに選ぶ方式ではありません。現在の文書から削除した内容の復元や、新たに追加した内容の削除もできます。

下の例で、集合時刻や持ち物だけを元に戻してみてください。**コールバックで更新した現在の文書**を開くと結果を確認できます。**最初からやり直す**で元の例に戻ります。

<CompareDemo />

## 独立した比較画面

`nabi-note/diff` から読み込みます。`before` と `after` には保存した NABI TREE JSON または HTML 文字列を渡します。表・リスト・画像などをそのまま読み込み表示できるよう、文書を作成したエディターと同じウィングで registry を構成します。

```ts
import { makeRegistry, wings } from 'nabi-note'
import { mountDiff } from 'nabi-note/diff'
import 'nabi-note/nabi.css'

const registry = makeRegistry(wings().allBasic().build())
const diff = mountDiff({
  root: document.querySelector('#comparison')!,
  before: previousDocument,
  after: currentDocument,
  registry,
  locale: 'ja',
})

diff.update(nextPreviousDocument, nextCurrentDocument)

diff.unmount()
```

初期状態では変更箇所とその前後だけを表示します。折りたたみボタンで文書全体を展開し、前・次のボタンで変更箇所を移動できます。変更がなければ全文を表示します。`onMerge` を省略すると読み取り専用になります。

## コールバックでクリックマージを接続する

ボタンを押すと `onMerge` に結果候補を渡します。コールバックを接続するだけでは自動保存されません。サービスが候補を受け入れて `update()` を呼ぶと比較結果も変わります。

```ts
const diff = mountDiff({
  root,
  before: previousDocument,
  after: currentDocument,
  registry,
  locale: 'ja',
  onMerge(proposal) {
    if (proposal.signal.aborted) return
    const accepted = diff.update(proposal.before, proposal.result, proposal.revision)
    if (!accepted) return
    currentDocument = proposal.result
  },
  onError(error) {
    showError(error)
  },
})
```

`proposal.result` は選んだ変更だけを反映した NABI TREE JSON です。`before` と `after` はクリック時の文書、`changeId` は選んだ変更、`revision` は比較状態を識別します。この `revision` を `update()` の第3引数に渡すと、比較画面が既に変わっている場合は `false` を返し、候補を適用しません。

非同期コールバックの待機中は重複クリックを防ぎます。別の文書への更新や比較画面の破棄で `signal` が中止されます。サーバーに保存するサービスはこの信号とサーバーの文書バージョンを確認し、古い結果で新しい文書を上書きしないようにします。

## エディターから比較を開く

`diff` ウィングと `mountDiffWing()` を接続すると、ツールバーから比較画面を開けます。基準は最後に読み込んだ文書です。通常の編集や元に戻す操作では基準文書は変わりません。

```ts
import { createNabiWith, mountToolbar, wings } from 'nabi-note'
import { mountDiffWing } from 'nabi-note/diff'

const { nabi, registry } = createNabiWith(wings().allBasic().use('diff'))
const comparison = mountDiffWing({
  nabi,
  registry,
  surface: content,
  locale: 'ja',
  merge: true,
})
const toolbar = mountToolbar({
  nabi,
  registry,
  root: toolbarRoot,
  surface: content,
  onHost(wing) {
    if (wing === 'diff') comparison.open()
  },
})
```

`merge: true` を指定すると、比較画面で選んだ以前の内容をエディターに反映します。この変更は元に戻せ、基準文書も維持します。画面を開いている間に元のエディターが変わると比較を再計算します。`merge` を省略すると従来の読み取り専用画面になります。

画面を取り除く際は `toolbar.unmount()` と `comparison.unmount()` を呼びます。編集開始時のバージョンも含めて両側の変更を自動で合わせるには、[マージ](./merge)を使います。
