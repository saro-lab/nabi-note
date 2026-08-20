---
title: UI と動作
description: ツールバーのボタン(button) · 状況行(context) · シート(styles) — 翼が人の前に立つ三つの場所です。
---

# UI と動作

翼が人の前に立つ場所は三つです。

| 欄 | どこに |
|---|---|
| `button` · `buttons` | 上の **ツールバー** — いつでも見える場所 |
| `context` | **状況行** — いまキャレットが触れているものにだけ現れる場所 |
| `styles` | この翼が運ぶ **CSS** |

---

## ツールバーのボタン

```ts
button: {
  group: 'emphasis',                   // どのまとまりに立つか — 必須です
  svg: '<path d="…"/>',                // 16×16 座標の中身です。なければ文字で立ちます
  label: { ja: '太字' },
  shortcut: 'B',                       // ヒントモードでのこの文字
  accelerator: 'mod+b',                // Ctrl/⌘ の組み合わせ
  action: { kind: 'mark' },
}
```

ボタンが複数なら `buttons` に配列で書きます — 揃えの翼ひとつが左・中央・右の三つを立てる
ようなときです。そのときは `name` で互いを区別し `value` でそれぞれが表す値を書きます。

### `group` — 順序はまとまりが決めます

```
font · heading · emphasis · script · color · link ·
align · list · structure · media · container · clear · file
```

**この順序は決められています。** 翼を配列のどこに入れてもボタンは自分のまとまりの場所に
立ちます。同じまとまりの中でだけ登録順に並びます。一覧にない名前を使うと末尾に新しい
まとまりが立ちます。

まとまりがまるごと空になったとき(中のボタンが全部隠れたとき)、そのまとまりは画面から
消えます — 空の区切り線が残りません。

### `action` — 押すと何が起こるか

| `kind` | すること | 一緒に書くもの |
|---|---|---|
| `'mark'` | コアのマークトグルに行きます。**コマンドを書かなくても済みます** | — |
| `'command'` | コマンドをひとつ回します | `command` · `args?` |
| `'menu'` | 値の一覧をパネルに広げます | `command` · `argKey` · `values` |
| `'grid'` | 行×列の格子を広げます(表を入れる) | `command` · `rowsKey` · `colsKey` · `max?` |
| `'prompt'` | 入力欄を開き、受け取った値をコマンドに渡します | `command` · `fields` |
| `'file'` | ファイル選択のウィンドウを開きます | `accept?` · `multiple?` |
| `'host'` | ホストに渡します(`mountToolbar` の `onHost`) | — |

`action` を書かなければ、そのボタンは押しても何も起こりません。

### `shortcut` と `accelerator`

| | 形 | 規則 |
|---|---|---|
| `shortcut` | `'B'` | ラテン **大文字・数字一文字**です |
| `accelerator` | `'mod+b'` | `mod+` の後に **小文字一文字**です |

どちらも **翼どうしで重なると登録するその場で死にます。** あとから静かにどちらかが効か
なくなることはありません。

`accelerated` を別に書くと、加速キーで押したときだけ違う動作が行きます — ボタンを押すと
パネルが開くが <kbd>Ctrl</kbd>+キーでは既定値がすぐ掛かる、というようにです。

---

## 押されているように見える仕組み

ボタンが「いま押されている」と塗られる根拠はひとつだけです。

| `place` | 何を見るか |
|---|---|
| `'mark'` | キャレットの位置にそのマークがあるか |
| `'attr'` | キャレットが立つ段落の `currentValue` |
| `'container'`·`'void'` | キャレットがその物体の中か上にあるか |
| `'tool'` | **常にオフ**です |

値が複数ある翼(揃え・見出し)はボタンごとに `value` を書き、翼の `currentValue` が
答えた値と同じボタンだけが塗られます。

```ts
currentValue: (node) => {
  const h = node.a?.['h']
  return typeof h === 'number' && h >= 1 && h <= 6 ? String(h) : undefined
}
```

**`currentValue` は文字を答えます** — 数値の値でも `String()` で移して答えます。
`undefined` は「このノードには自分の値がない」という意味です。

---

## ボタンは立てない場所で自動的に隠れます

| `place` | 隠れるとき |
|---|---|
| `'mark'` | 文字だけが住む場所(コードの箱の中など)で、その場所の持ち主のとき |
| `'attr'` | キャレットが物体を抱えたラッパー段落の上にあるとき。**揃え(`a`)だけ例外**です |
| `'void'`·`'container'` | 文字だけが住む場所か、いまの器の `allows` が自分を受け付けないとき |
| `'tool'` | 隠れません |

揃えだけ例外である理由は前に見たとおりです — 物体の揃えは物体自身ではなく、それを
抱えるラッパー段落が持ちます。画像の上で「中央」を押せなければなりません。

`allows` を書いておけば **ツールバーが自動でついてきます。** コードの箱の中で表のボタン
が消えるのは、別に書かれた規則ではなく `allows` ひとつから来ています。

---

## 状況行

いまキャレットが触れているものにだけ現れる行です。画像を押すとサイズ調整が、リンクに
キャレットを置くとアドレス欄が現れる場所です。

```ts
context: {
  title: { ja: 'ノート' },
  controls: [
    {
      kind: 'select',
      name: 'tone',
      label: { ja: 'トーン' },
      command: 'setNoteTone',
      argKey: 'value',
      attr: 't',                                    // いまの値を読む属性の欄
      values: [
        { value: 'info', label: { ja: '通知' } },
        { value: 'warn', label: { ja: '注意' } },
      ],
    },
  ],
}
```

### いつ現れるか

キャレットの位置で **触れるものすべて**がそれぞれ自分の行を広げます。

- キャレットの経路の上にある器たち(内側が先、外側が後)
- 選ばれた物体(ラッパー段落の上で選択された画像など)
- キャレットの位置に掛かっている **マークたち** — ツールバーのボタンと違い、マークも
  状況行を持ちます
- キャレットが立つ段落が値を持つ **段落属性**の翼

表の中のリンクにキャレットを置くと、リンクの行と表の行が一緒に現れます。

### `ContextControl` の七種類

| `kind` | 何 | 一緒に書くもの |
|---|---|---|
| `'button'` | 一度押すとコマンド | `command` · `args?` |
| `'toggle'` | オン/オフの二状態 | `command` · `token` |
| `'select'` | 一覧からひとつ | `command` · `argKey` · `values` · `attr?` |
| `'range'` | 目盛りを動かすもの(サイズ調整) | `command` · `argKey` · `values` · `rest?` · `readout?` |
| `'text'` | 文字入力欄ひとつ(リンクのアドレス) | `command` · `argKey` · `initial?` · `placeholder?` · `validate?` |
| `'prompt'` | 複数の欄をパネルに | `command` · `fields` |
| `'lightbox'` | 大きく見る | `src` · `alt?` |

七つとも共通で `name`(必須) · `label?` · `svg?` · `tip?` · `visible?` を持ちます。

`visible: (node) => boolean` は **同じ翼の中で欄を隠す**扉です — すでに結合されたセル
にだけ「結合を解除」を見せる、というようにです。

`attr` を書くと、いまの値をその属性の欄から直接読んで塗ります。`'toggle'` は `token` で
`currentValue` が答えた文字と比べます。

---

## `styles` — 翼が運ぶ CSS

```ts
styles: `
.nabi-content aside[data-nabi-note] {
  border-inline-start: 3px solid var(--nabi-accent);
  padding: .6rem .9rem;
  background: color-mix(in srgb, var(--nabi-accent) 8%, transparent);
}
`
```

規則は四つです。

- **`.nabi-content` の下に限定します。** ホストページの他の文章に広がってはいけません。
- **フォントサイズは `rem` か `em`**で書きます。
- **暗いバリエーションは `.dark` クラスでだけ**分けます。メディアクエリで分けると、
  ホストが明るい画面を使っているときにエディタだけが暗くなってしまいます。
- **広い・狭いはコンテナクエリ**で測ります。画面の幅ではなく、エディタが置かれた場所の
  幅が基準です。

登録したものだけを載せたいときは自分でまとめて付けます。

```ts
import { collectSheets, injectSheets } from 'nabi-note'

const detach = injectSheets(document, collectSheets(registry))
```

同じ文書のシートは **一度だけ**載ります — 複数の翼が同じ CSS を分け持っていても文書には
ひとつだけ付きます。返り値は外す関数で、**この呼び出しが新しく付けたものだけ**を外します。

---

## 人に尋ねる

```ts
const { nabi, registry } = createNabiWith(wings, {
  ask: {
    message: (text) => window.alert(text),
    confirm: (text) => window.confirm(text),
  },
})
```

`confirm` は `boolean` も `Promise<boolean>` も受け取ります — ブラウザの `confirm` を
そのまま差し込んでもよく、自分で作ったパネルを開いて答えをあとで返しても構いません。

::: warning 渡さなければ答えはいつも「いいえ」です
`ask` を差し込まなければ静かな既定値が入ります。`message` はどこにも行かず、`confirm`
は `false` を答えます。**尋ねて消すことが静かにできない方**が、静かにできてしまうことより
よいという判断です。ローカル履歴の「本当に消しますか」がこの扉を通ります。
:::

::: tip コマンドは尋ねられません
コマンドは純粋関数なので画面も時間も知りません。尋ねる必要のあることはコマンドの外で
尋ね、**答えが出たあとに**コマンドを呼びます。翼の中でその場所になるのは `attach` で、
そこでは `host.nabi.$ask` で届きます。
:::

---

## 次のドキュメント

- [インラインマーク](../custom/inline) · [ブロックと段落属性](../custom/block) ·
  [キー・自動変換・貼り付け](../custom/input)
- [テーマと CSS 変数](../../style/custom) — シートが頼る変数の名前たち

<script setup lang="ts">
import { useTranslate } from '../../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
