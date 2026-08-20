---
title: YouTube
---

# YouTube

## 説明

`youtubeWing`(名前 `youtube`、ショートカットなし)は YouTube の埋め込み(`<iframe>`)
を所有します。`hr`・`img` と同じ **中身のない物体**(`place: 'void'`)です。ボタンを
押すとアドレス入力パネルが出て、`watch?v=`・`youtu.be/`・`/embed/`・`/shorts/`・
`/v/`・`/live/` の形の YouTube アドレスだけが通ります(`www.`・`m.`・`music.` の
接頭辞、`youtube-nocookie.com` を含みます)— 文字列を含むかの検査ではなく `URL()`
の解析で判定するので、`youtube.com.evil.test` のようなアドレスは引っかかりません。

渡ってきたアドレスをそのまま信じず **11 文字の動画 id だけ**を取り出して保存します。
アドレスは保存値に残りません — 残るのは `{"w":"youtube","a":{"v":"<id>","w":"70"}}`
だけで、出ていくときに `https://www.youtube-nocookie.com/embed/<id>` というひとつの
形に新しく組み立てられます。

`hr` と同じ理由でキャレットは中に入らず、すぐ前/後ろで Backspace・Delete を押すと
丸ごと消えます。YouTube でない埋め込みは取り込むとき **まるごと捨てます** — 見慣れ
ない文書を自分たちの文書の中に立てません。

## 状況行

動画をクリックすると欄が二つ出ます。

| 種類 | 欄 |
|---|---|
| 幅 | `50` `60` `70` `80` `90` `100` の六段階(既定 `70`) — 目盛りで、いまの値が一緒に出ます |
| アドレス | いまの動画の id が入った入力パネル |

**左・中央・右の欄はここにありません。** 動画の位置は動画自身ではなく **それを抱える
ラッパー段落**が持つので、ツールバーの揃えボタンがその役目を果たします。新しく入れた
動画はラッパー段落が中央揃え(`c`)をまとって立ちます。

だから出ていくとき、幅は動画に、揃えはそれを包む段落に付きます。

```html
<div data-nabi-p data-nabi-align="c">
  <iframe src="https://www.youtube-nocookie.com/embed/<id>" title="YouTube"
          allowfullscreen loading="lazy" data-nabi-width="70"></iframe>
</div>
```

インライン `style` は出ていきません。ホストが自分の UI で入れたいときはコマンドを
直接呼びます — `applyCommand('insertYoutube', { v: アドレス, w: '80' })`、幅だけ
変えるには `applyCommand('setYoutubeWidth', { w: '80' })`。一覧の外の幅は拒みます。

## 使用例

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, youtubeWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// 翼の一覧がグリフの知識・コマンド・組み立て器を一緒に作る — それが `registry` です
const { nabi, registry } = createNabiWith([youtubeWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## デモ

<WingDemo path="/wing/block/youtube" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
