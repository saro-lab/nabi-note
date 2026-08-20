---
title: ইনলাইন মার্ক বানানো
description: place 'mark' — লেখার উপরে বসানো ফরম্যাট। বেরোনোর পথ (toHtml) আর ঢোকার পথ (claim) দুটোই লিখতে হয়।
---

# ইনলাইন মার্ক বানানো

`place: 'mark'` মানে **লেখার উপরে বসানো ফরম্যাট**। জায়গা নেয় না, লেখার
প্রবাহ ভাঙে না, একের উপর আরেকটা বসতে পারে — গাঢ়·তির্যক·হাইলাইট সবই এই
ধরনের।

---

## একটি সম্পূর্ণ মার্ক

```ts
import { createNabiWith, mountSurface, simpleMark, type Wing } from 'nabi-note'
import 'nabi-note/nabi.css'

const kbdWing: Wing = {
  ...simpleMark({
    w: 'kbd',
    toHtml: (_node, children, ctx) => ctx.element('kbd', children()),
    button: {
      group: 'emphasis',
      label: { bn: 'কী', en: 'Key' },
      shortcut: 'K',
      action: { kind: 'mark' },        // টগল কোর নিজেই করে — কমান্ড লিখতে হয় না
    },
    styles: `.nabi-content kbd {
      font-family: var(--nabi-font-mono, monospace);
      border: 1px solid var(--nabi-line); border-radius: .25em; padding: 0 .3em;
    }`,
  }),
  claim: (el, inner) => (el.tag === 'kbd' ? [{ w: 'kbd', ch: inner(false) }] : null),
}

const surface = document.querySelector<HTMLElement>('#editor')!
const { nabi, registry } = createNabiWith([kbdWing])
mountSurface({ nabi, registry, root: surface })
```

`simpleMark` যা ভরে দেয় তা দুটো — `place: 'mark'` আর `escapeKeys:
['Escape']`। বাকিটা যেমন লেখা হয়েছে তেমনই যায়।

---

## দুই দিক আলাদা করে লিখতে হয়

| | দিক | না থাকলে |
|---|---|---|
| `toHtml` | নথি → HTML | **নিবন্ধন ভেঙে পড়ে।** নোড বানায় এমন wing-এর আঁকার উপায় থাকতেই হয় |
| `claim` | HTML → নথি | আঁকা যায় ঠিকই, তবে **আবার পড়া যায় না।** সংরক্ষণ করে আবার লোড করলে খোলস খসে যায় |

মূল ছয়টি মার্ক (`b`·`i`·`u`·`s`·`sub`·`sup`) আর মান-বহনকারী চারটি মার্ক
(`hl`·`tc`·`fs`·`tf`) — এদের ট্যাগ **কোর আগে থেকেই চেনে।** তাই
`boldWing`-এ `toHtml`-ও নেই, `claim`-ও নেই। নিজে বানানো নাম কোর চেনে না
বলে দুটোই লিখতে হয়।

### `toHtml`

```ts
toHtml: (node, children, ctx) => ctx.element('kbd', children())
```

| আর্গুমেন্ট | কী |
|---|---|
| `node` | এখনকার নোড। অ্যাট্রিবিউট বের হয় `node.a?.['কী']` দিয়ে |
| `children()` | ভিতরের আঁকা লেখা। **ডাকলে তবেই আঁকা হয়**, না ডাকলে ভিতরটা বেরোয় না |
| `ctx` | নিরাপদে বানানোর টুল |

`ctx` যা দেয়:

| | |
|---|---|
| `ctx.element(tag, inner, attrs?)` | একটি অংশ বানায়। মান নিজে থেকেই ইসকেপ হয়ে যায় |
| `ctx.escape(text)` | কেবল লেখাটুকু ইসকেপ করে |
| `ctx.url(raw)` · `ctx.src(raw)` | ঠিকানা ছেঁকে নেয়। অবিশ্বাস্য ঠিকানা মানে **`null`** |
| `ctx.keys` | এখন **সম্পাদকের জন্য** জোড়া লাগানো হচ্ছে কি না (`getEditorHtml()`) |

::: warning লেখা সরাসরি জোড়া লাগাবেন না
`` `<kbd>${node.a?.['t']}</kbd>` ``-এর মতো লিখলে নথির ভিতরের লেখা সরাসরি
মার্কআপ হয়ে যায়। সবসময় `ctx.element` বা `ctx.escape`-এর ভিতর দিয়ে যান।
:::

### `claim`

```ts
claim: (el, inner) => (el.tag === 'kbd' ? [{ w: 'kbd', ch: inner(false) }] : null)
```

| | |
|---|---|
| `el` | `{ kind, tag, attrs, children }` — যেমন এসেছে ঠিক তেমন এলিমেন্ট |
| `inner(block)` | ভিতরটা পড়ে। মার্ক হলে `false` (লেখার জায়গা), ব্লক হলে `true` |
| উত্তর | নোডের অ্যারে, অথবা **`null`** (এটা আমার নয় → পরের wing-কে জিজ্ঞেস করো) |

wing-এর অ্যারের ক্রম ধরে জিজ্ঞেস করা হয় আর **প্রথম যে দাবি করে** সে-ই নিয়ে
নেয়।

`null` ফিরিয়ে দেওয়ার জায়গা দুটো — আমার ট্যাগ নয় যখন, আর **আমার ট্যাগ
কিন্তু মান তালিকার বাইরে** যখন। পরেরটাতে `inner(false)` ফিরিয়ে দিলে
কেবল খোলসটুকু খসে গিয়ে লেখা টিকে থাকে।

---

## মান বহনকারী মার্ক

রং·আকারের মতো **নির্দিষ্ট তালিকা থেকে একটি বেছে নেওয়া** মার্কের জন্য
`valueMark` ব্যবহার করা হয়।

```ts
import { valueMark, type Wing } from 'nabi-note'

const LEVELS = ['low', 'mid', 'high'] as const

const riskWing: Wing = {
  ...valueMark({
    w: 'risk',
    key: 'v',                        // মান যে অ্যাট্রিবিউটে বাস করে
    values: [...LEVELS],             // এর বাইরের মান গ্রহণ করা হয় না
    toHtml: (node, children, ctx) =>
      ctx.element('span', children(), { 'data-risk': String(node.a?.['v'] ?? '') }),
  }),
  claim: (el, inner) => {
    if (el.tag !== 'span') return null
    const v = el.attrs['data-risk']
    if (v === undefined) return null
    if (!LEVELS.includes(v as typeof LEVELS[number])) return inner(false)   // তালিকার বাইরে — কেবল লেখা রাখে
    return [{ w: 'risk', a: { v }, ch: inner(false) }]
  },
}
```

`valueMark` যা দুটো জুড়ে দেয়:

- **`currentValue`** — ক্যারেট এখন যেখানে বসে সেখানকার মান। টুলবার আর
  কনটেক্সট সারি এই উত্তর দিয়ে কোন ঘর চাপা তা রাঙায়।
- **`repair`** — JSON-এর প্রবেশদ্বারে মান আবার যাচাই করে। তালিকার বাইরে
  হলে বা না থাকলে `null` ফিরিয়ে **খোলসসহ সরিয়ে দেয়।** হাতে ঠিক করা
  সংরক্ষিত মান এলেও এখানেই ধরা পড়ে।

::: tip মান বদলানোর কমান্ড
মান-মার্কের "এই মানে বদলাও" কমান্ডের এখনও প্রকাশিত সহায়ক নেই। টুলবার
বোতাম দিয়ে কেবল চালু-বন্ধ করা `action: { kind: 'mark' }` তেমনই ব্যবহার
করা যায়, আর মান বাছাই লাগলে এখন মূল চারটি মান-মার্ক (হাইলাইট·লেখার রং·
লেখার আকার·টাইপফেস) ব্যবহার করুন অথবা সেই ঘোষণা ছড়িয়ে লিখুন।
:::

---

## `escapeKeys` — মার্কের বাইরে বেরোনো

মার্কের শেষে ক্যারেট দাঁড়িয়ে থাকলে, পরের অক্ষর মার্কের ভিতরে না বাইরে
তা কেবল মানুষই জানে। `escapeKeys` সেই দরজা।

```ts
escapeKeys: ['Escape']    // simpleMark·valueMark-এর ডিফল্ট মান
```

**ক্যারেট নড়ে না।** এই কী চাপলে "পরের অক্ষর এই মার্কের বাইরে বসবে" এমন
একটি সংরক্ষণ বসে। একটি অক্ষর টাইপ করলেই সংরক্ষণ ব্যবহৃত হয়ে মিলিয়ে যায়।

```
<kbd>Ctrl</kbd>(ক্যারেট)  →  Escape  →  টাইপ "+"  →  <kbd>Ctrl</kbd>+
```

একাধিক wing একই কী ব্যবহার করলেও চলে — ক্যারেট এখন সত্যিই সেই মার্কের
ভিতরে থাকলে তবেই সংরক্ষণ বসে, তাই ওভারল্যাপ করা মার্কের মধ্যে যেগুলো
প্রযোজ্য কেবল সেগুলোই একসঙ্গে খোলে। <kbd>Escape</kbd> বসানো সংরক্ষণ
**বাতিল** করতেও ব্যবহৃত হয়।

---

## মার্ক কী পায় না

`onKey` লিখলেও **মার্কে তা আসে না।** ক্যারেটের জায়গা `{ path, offset }`,
আর `path`-এর শেষ প্রান্ত হলো **লেখা ধরে রাখা হোল্ডার** — মার্ক সেই
হোল্ডারের ভিতরের একটি ইনলাইন নোড বলে পথে আদৌ আসে না। কী-এর মালিক বাছার
সময় কোর এই পথ ধরে উপরের দিকে হাঁটে বলে মার্কের সঙ্গে দেখাই হয় না।

কারণটা ওভারল্যাপ। গাঢ়ের ভিতরে তির্যকের ভিতরে লিঙ্কে <kbd>Enter</kbd>
চাপলে তিনজনের মধ্যে কে মালিক তা ঠিক করার কোনো উপায় নেই। মার্কের কী নিয়ে
থাকা একমাত্র দরজা `escapeKeys`।

---

## পরের নথি

- [ব্লক আর অনুচ্ছেদ-অ্যাট্রিবিউট](../custom/block) — জায়গা নেওয়া জিনিস
- [কী·স্বয়ংক্রিয় রূপান্তর·পেস্ট](../custom/input) — `onKey` আর `inputRules`
- [UI ও আচরণ](../custom/ui) — টুলবার বোতাম আর কনটেক্সট সারি

<script setup lang="ts">
import { useTranslate } from '../../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
