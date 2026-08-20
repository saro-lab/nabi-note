---
title: নিজের wing বানানো
description: না-থাকা ফরম্যাট wing দিয়ে বানানো হয় — একটি চুক্তি পূরণ করলেই কোর বাকিটা করে।
---

# নিজের wing বানানো

wing হলো **একটিমাত্র অবজেক্ট**। ক্লাস উত্তরাধিকার করতে হয় না, আলাদা কোনো
নিবন্ধন প্রক্রিয়াও নেই — `createNabiWith`-এ পাঠানো অ্যারেতে বসানোই
নিবন্ধন।

গাঢ়·টেবিল·আপলোডও এখানে লেখা ঘরগুলো ভরেই বানানো। নিজে বানানো wing ডিফল্ট
wing-এর **একই শর্তে** কাজ করে — আলাদা কোনো শর্টকাট নেই।

---

## সবচেয়ে ছোট wing

`<kbd>` চেনে এমন একটি ইনলাইন মার্ক।

```ts
import { createNabiWith, mountSurface, simpleMark, type Wing } from 'nabi-note'
import 'nabi-note/nabi.css'

const kbdWing: Wing = {
  ...simpleMark({
    w: 'kbd',                                                   // এই wing-এর নাম — সংরক্ষিত মানের `w` এটিই
    toHtml: (_node, children, ctx) => ctx.element('kbd', children()),   // বেরোনোর চিত্র
  }),
  // ভিতরে আসা HTML-এ `<kbd>`-এর মালিক নিজেকে দাবি করে
  claim: (el, inner) => (el.tag === 'kbd' ? [{ w: 'kbd', ch: inner(false) }] : null),
}

const surface = document.querySelector<HTMLElement>('#editor')!
const { nabi, registry } = createNabiWith([kbdWing])
mountSurface({ nabi, registry, root: surface })
```

এখন `<kbd>` নথিতে টিকে থাকে। পেস্ট·`setHtml()`·সংরক্ষণ·আবার লোড করার পরেও
সেভাবেই থাকে।

```
নিবন্ধিত হলে      <p>চাপুন: <kbd>Ctrl</kbd>+<kbd>S</kbd></p>   →   যেমন ছিল তেমনই
নিবন্ধিত না হলে   <p>চাপুন: <kbd>Ctrl</kbd></p>              →   <p>চাপুন: Ctrl</p>
```

**দুটো ঘর দুই দিকে তাকায়।** `toHtml` বেরোনোর পথ, `claim` ঢোকার পথ। `claim`
না লিখলে আঁকা যায় ঠিকই, কিন্তু **আবার পড়া যায় না** — সংরক্ষণ করে আবার লোড
করার মুহূর্তেই খোলস খসে যায়।

`simpleMark` হলো অ্যাট্রিবিউট-বিহীন মার্কের জন্য একটি শর্টকাট। মান বহনকারী
মার্কের জন্য `valueMark`, বস্তুর জন্য `boxObject`, তালিকা-ধরনের জন্য
`listFamily` আছে, বাকি সব ক্ষেত্রে `Wing` অবজেক্ট হাতে লেখা হয়।

---

## wing একটি কনস্ট্যান্ট

**বেশিরভাগ wing-ই আগে থেকে প্রস্তুত কনস্ট্যান্ট** — `boldWing`·
`headingWing`-এর মতো অ্যারেতে বসিয়ে দিলেই হয়। অপশন লাগে এমন মাত্র দুটোরই
ফ্যাক্টরি ফাংশন আলাদা আছে।

```ts
makeImageWing({ allowLocalUrls: true })
makeUploadWing({ allowLocalUrls: true })
```

কেবল "জোড়ার কাজ" বদলাতে চাইলে কনস্ট্যান্ট ছড়িয়ে লেখা হয় — নতুন wing না
বানিয়ে একটিমাত্র ঘর বদলানো বলে এই পথ সহজ।

```ts
const wing = { ...codeWing, attach: makeCodeAttach({ highlight: myHighlighter }) }
```

---

## নিবন্ধন আর ক্রম

```ts
const { nabi, registry } = createNabiWith([boldWing, italicWing, kbdWing])
```

**অ্যারের ক্রমই স্ক্যানের ক্রম।** কোনো মার্কআপের মালিক বাছার সময় (`claim`)
কোর এই ক্রমেই জিজ্ঞেস করে, প্রথম যে উত্তর দেয় সেই wing তা নিয়ে নেয়। কেউ না
নিলে খোলস খসে যায়।

টুলবারে **গুচ্ছ (`button.group`) আগে**। গুচ্ছের ক্রম বাঁধা, একই গুচ্ছের
ভিতরে কেবল এই অ্যারের ক্রমেই সাজে।

### নিবন্ধনের মুহূর্তেই ভেঙে পড়ে

`createNabiWith` চুক্তি ভাঙা wing **তখনই ছুঁড়ে দেয়।** দেরিতে ফাটে না।

| যা ধরা পড়ে | উদাহরণ |
|---|---|
| সংরক্ষিত নাম ব্যবহার | `w: 'p'` · `w: 'br'` |
| একই নাম দুবার নিবন্ধন | `boldWing` দুবার |
| নোড বানায় অথচ `toHtml` নেই | `place: 'mark'` অথচ আঁকার কোনো উপায় নেই |
| কমান্ডের নাম নিয়ম ভাঙে | ক্রিয়া+কর্ম উটকেস হতে হয় (`insertTable`) |
| প্রয়োজনীয় জোড় নেই | আপলোডে `img` বা `a` অবশ্যই সঙ্গে থাকতে হয় (`requiresAnyOf`) |

---

## কমান্ড — বিশুদ্ধ ফাংশন

নথি বদলানোর সব পথ একটিমাত্র কমান্ডের ভেতর দিয়ে যায়। কমান্ড **DOM বা পর্দা
কিছুই চেনে না।**

```ts
import { boxObject, insertLump, type Command, type Wing } from 'nabi-note'

const insertStamp: Command = (doc, sel, args, env) => {
  // বাইরে থেকে আসা মান বলে যাচাই করা হয় — না মিললে কিছুই ঘটে না
  if (typeof args['text'] !== 'string') return null
  const stamp = { w: 'stamp', a: { t: args['text'] }, ch: [] }
  const r = insertLump(doc, sel.focus, stamp, env)
  return { doc: r.doc, selection: { anchor: r.caret, focus: r.caret } }
}

export const stampWing: Wing = {
  ...boxObject({
    w: 'stamp',
    attrs: { t: (v) => (typeof v === 'string' ? v : null) },
    toHtml: (node, _children, ctx) =>
      ctx.element('span', ctx.escape(String(node.a?.['t'] ?? '')), { 'data-nabi-stamp': '' }),
  }),
  commands: { insertStamp },
  button: {
    group: 'insert',
    label: { bn: 'সিল', en: 'Stamp' },
    action: { kind: 'command', command: 'insertStamp', args: { text: 'নিশ্চিত' } },
  },
}
```

| আর্গুমেন্ট | কী |
|---|---|
| `doc` | এখনকার নথি (ব্লকের অ্যারে)। **বদলাবেন না, নতুন একটি ফিরিয়ে দিন** |
| `sel` | এখনকার নির্বাচন |
| `args` | বোতাম বা কনটেক্সট সারি পাঠানো মান। **বাইরে থেকে আসা বলে যাচাই করতে হয়** |
| `env` | ধরন-জ্ঞান — কী কী ধরে রাখে, কী বস্তু |

উত্তর হয় `{ doc, selection }` অথবা **`null`**। **কিছু না বদলালে `null`
ফিরিয়ে দিন** — তাহলে `applyCommand` `false` ফিরিয়ে দেয় আর undo-এর জায়গা
জমে না। ফিরিয়ে দেওয়া নথি `cocoon` আরেকবার গুছিয়ে দেয় বলে কোনো কমান্ডই নিয়ম
ভাঙা নথি রেখে যেতে পারে না।

ডাকার সময় সবসময় নাম ধরে।

```ts
nabi.applyCommand('insertStamp', { text: 'নিশ্চিত' })   // boolean
```

---

## ভরা যায় এমন সব ঘর

`Wing`-এ পঁচিশটি ঘর, **আবশ্যক মাত্র দুটি** (`w`·`place`)।

### কী

| ঘর | অর্থ |
|---|---|
| `w` | এই wing-এর নাম। সংরক্ষিত মানের `w` এটিই হয়। সংরক্ষিত শব্দ (`p`·`br`) ব্যবহার করা যায় না |
| `place` | `'mark'` লেখার উপরে · `'void'` ভিতরে কিছু নেই এমন বস্তু · `'container'` ভিতরে লেখা আছে এমন বস্তু · `'attr'` অনুচ্ছেদ-অ্যাট্রিবিউট · `'tool'` নথিতে চিহ্ন না রাখা টুল |
| `holds` | ভিতরটা কীভাবে ধরে রাখে — `'blocks'` বা `'inline'` |
| `singleParagraph` | ভিতরটা **একটিমাত্র** অনুচ্ছেদে বাঁধা (টেবিলের ঘর) |
| `boolAttrs` | মান কেবল `1`-ই হয় এমন বুলিয়ান অ্যাট্রিবিউটের নাম |
| `allows` | এর ভিতরে ঢুকতে পারে এমন wing-এর নাম। না লিখলে সবই |
| `requiresAnyOf` | এদের একটি সঙ্গে নিবন্ধিত থাকতেই হবে |
| `parts` | সঙ্গে নিয়ে আসা বোতাম-বিহীন কাঠামো — টেবিলের সারি·ঘর, ভাঁজের সারাংশ-লাইন |

### মান

| ঘর | অর্থ |
|---|---|
| `attrKey` · `attrValues` | অনুচ্ছেদ-অ্যাট্রিবিউট ব্যবহার করা ঘরের নাম আর গ্রহণযোগ্য মানের তালিকা |
| `currentValue` | এখন চাপা আছে কি না — টুলবার·কনটেক্সট সারি এই উত্তর দিয়ে ঘর রাঙায় |

### যাতায়াতের পথ

| ঘর | অর্থ |
|---|---|
| `toHtml` · `partHtml` | বেরোনোর চিত্র |
| `claim` | ভিতরে আসা HTML-এ এই ট্যাগের মালিক বাছাই |
| `repair` · `partRepair` | JSON-এর প্রবেশদ্বারে এই নোড গুছিয়ে দেয়। `null` ফিরিয়ে দিলে খোলসসহ সরে যায় |

### হাত আর কী

| ঘর | অর্থ |
|---|---|
| `commands` | এই wing বসানো কমান্ড |
| `onKey` | ক্যারেট এই wing-এর নোডের ভিতরে থাকলে কী প্রথমে হাতে নেয় |
| `escapeKeys` | পরের অক্ষর এই মার্কের বাইরে বসানোর জন্য যে কী |
| `inputRules` | কেবল লেখার মধ্য দিয়েই ঘটে যাওয়া স্বয়ংক্রিয় রূপান্তর |
| `attach` | পর্দায় হাত দিতে হলে — টেবিলের ঘর টানা, কোড রং বসানো এটিই |

### চেহারা

| ঘর | অর্থ |
|---|---|
| `button` · `buttons` | টুলবারের একটি বা একাধিক বোতাম |
| `context` | কনটেক্সট সারির ঘোষণা |
| `styles` | এই wing বহন করা CSS |

---

## `w` — নাম রাখা

`w` হলো **সংরক্ষিত মানে প্রতিটি নোডে বারবার আসা অক্ষরগুচ্ছ**। যত ছোট তত
ভালো — ডিফল্ট wing-এর `b`·`hl`·`tf`-এর মতো ছোট হওয়ার কারণ এটিই। তবে
অন্যের নামের সঙ্গে মিলে গেলে নিবন্ধন ভেঙে পড়ে, তাই নিজে বানানোরটা কিছুটা
লম্বা হলেও মিলবে না এমন নাম ব্যবহার করুন।

HTML ট্যাগের নামের সঙ্গে মিলতেই হবে এমন নয় — বেরোনো ট্যাগ ঠিক করে
`toHtml`।

::: warning নাম পরে বদলালে
সংরক্ষিত মানের `w` মানেই সেই নাম, তাই নাম বদলালে **আগে থেকে সংরক্ষিত নথি
পড়া যাবে না।** বদলাতেই হলে পুরনো নামও `claim`-এ গ্রহণ করে একটা স্থানান্তর
সময় রাখুন।
:::

---

## পরের নথি

- [ইনলাইন মার্ক](./custom/inline) — `claim` · `toHtml` · `escapeKeys`
- [ব্লক আর অনুচ্ছেদ-অ্যাট্রিবিউট](./custom/block) — `place` · `holds` · `allows` · `parts` · `attrKey`
- [কী·স্বয়ংক্রিয় রূপান্তর·পেস্ট](./custom/input) — `onKey` · `inputRules` · `attach`
- [UI ও আচরণ](./custom/ui) — `button` · `context` · `styles`, আর মানুষকে জিজ্ঞেস করা

<script setup lang="ts">
import { useTranslate } from '../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
