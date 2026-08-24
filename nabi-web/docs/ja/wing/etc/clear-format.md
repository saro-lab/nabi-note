---
title: 書式をクリア
---

# 書式をクリア

## 説明

`clearFormatWing` は、適用された書式を取り除いてプレーンテキストに戻す、ツール(`place: 'tool'`)翼です。

- **取り除く対象**: インラインマーク11種(`b`・`i`・`u`・`s`・`sub`・`sup`・`hl`・`tc`・`fs`・`tf`・`a`)と段落属性3種(`h` 見出し・`a` 揃え・`dc` ドロップキャップ)。
- **範囲を選択して実行すると**、選択区間に含まれるすべてのインラインマークと段落属性が一括で取り除かれます。
- **キャレットだけの状態で実行すると**、キャレットのある最も内側のマークから順に解除され、解除するマークがなくなった時点で段落属性が初期化されます。
- **添付リンク(`data-nabi-file`)は保護されます** — 通常のWebリンクと異なり、ファイル添付リンクはクリア対象から除外され、ファイル情報が保持されます。
- **ブロックオブジェクト(画像・表など)を抱えるラッパー段落の揃えは保持されます。**

## <kbd>Esc</kbd> 二連打

ツールバーのボタンのほかに、**Escキーを350ms以内に2回連続で入力する**と書式クリアコマンドが即座に実行されます。

- テキスト選択がある場合はもちろん、キャレットだけの状態でもツールバーのボタンを押した場合と完全に同じように段階的に書式を解除します。
- Escキーの優先度は最も低く処理されるため、1回目のEsc入力でマーク脱出の予約が動作していても、2回目のEsc入力で書式クリアが正常に発動します。

## 使用例

```ts
import { createNabiWith, mountSurface, mountToolbar, clearFormatWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

const { nabi, registry } = createNabiWith([clearFormatWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## デモ

<WingDemo path="/wing/etc/clear-format" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
