---
title: প্রাথমিক ব্যবহার
description: npm থেকে ইনস্টল করে একটি nabi অবজেক্ট দাঁড় করান, তারপর তিন ইনপুট আর তিন আউটপুট দিয়ে নথি আদান-প্রদান করুন।
---

# প্রাথমিক ব্যবহার

npm থেকে ইনস্টল করে ব্যবহারের পথ। একটিমাত্র `<script>` দিয়ে ব্যবহারের পথ
আছে [{{ t('menu_intro_cdn') }}](./cdn)-এ।

```sh
npm i nabi-note
```

---

## টুকরোগুলো জোড়া লাগানো

হোস্ট জায়গা তৈরি করে, mount একটা একটা করে জুড়ে দেয়। নিচেরটাই ন্যূনতম গঠন,
আর প্রতিটি wing নথিতে আসা উদাহরণ এই একই কাঠামোতে এক-দুটো wing জুড়ে দেওয়া রূপ।

```html
<div id="app" class="nabi">
  <div id="chrome" class="nabi-toolbar">
    <div id="toolbar"></div>
    <div id="context"></div>
  </div>
  <div id="editor" class="nabi-content" contenteditable="true"></div>
</div>
```

```ts
import {
  createNabiWith,
  mountSurface,
  mountToolbar,
  mountContextToolbar,
  mountHints,
  mountViewTools,
  mountSticky,
  watchSettle,
  parseNodes,
  boldWing,
  italicWing,
} from 'nabi-note'
import 'nabi-note/nabi.css'

const app = document.querySelector<HTMLElement>('#app')!
const surface = document.querySelector<HTMLElement>('#editor')!

// wing-এর তালিকাই ধরন-জ্ঞান·কমান্ড·জোড়াকারী একসঙ্গে গড়ে তোলে — সেটাই `registry`
const { nabi, registry } = createNabiWith([boldWing, italicWing], {
  parseHtml: parseNodes,
})

mountSurface({ nabi, registry, root: surface })

const settle = watchSettle(document, { surface })
const shared = { nabi, registry, surface, settle, locale: 'bn' }

const toolbar = mountToolbar({ ...shared, root: document.querySelector<HTMLElement>('#toolbar')! })
const context = mountContextToolbar({ ...shared, root: document.querySelector<HTMLElement>('#context')! })

mountHints({ toolbar, context, root: document.querySelector<HTMLElement>('#chrome')!, surface })
mountViewTools({ nabi, surface, root: app, container: document.querySelector<HTMLElement>('#toolbar')!, locale: 'bn' })
mountSticky({ root: app, surface })

// মান বদলালেই — এখানে আপনার কোড জুড়ে দিন
// nabi.onChange(() => user_callback(nabi.getHtml()))
```

জায়গা তৈরি করে হোস্ট, আর **সেই জায়গা কেমন দেখতে হবে তা জানে কোর** — mount
নিজের পাত্রে `.nabi-toolbar-row`·`.nabi-context`·`.nabi-editing` নিজে থেকেই
বসিয়ে দেয়, টুল-বাক্সও নিজে থেকেই দাঁড় করায়। মানে হোস্টের সাজানোর কোনো কাজ
নেই, তাই উপরের মার্কআপে ক্লাস মাত্র তিনটি।

- **`class="nabi"`** — রঙের টোকেন আর স্টাইলশিট এর ভিতরেই বাস করে। ফুলস্ক্রিন
  পুরোটাই আটকে রাখা বাক্সও এটিই, তাই টুলবার আর সম্পাদনার জায়গা **একসঙ্গেই**
  এর ভিতরে থাকতে হয়।
- **`class="nabi-toolbar"`** — টুলবার সারি আর কনটেক্সট সারি একসঙ্গে বেঁধে
  **উপরে আটকে (sticky)** রাখে। দুটো আলাদা করে আটকালে কনটেক্সট সারি উঠলে
  লেখা সরে গিয়ে পর্দা কাঁপে।
- **`class="nabi-content" contenteditable`** — সম্পাদনার জায়গা নিজেই।

সাইটে একটি স্থির শিরোনাম-বার থাকলে `--nabi-sticky-top` দিয়ে ততটা নামিয়ে
দিন, আর `mountSticky()` জুড়লে মোবাইল কিবোর্ড পর্দা যতটা ঠেলে দিয়েছে ততটা
কোর নিজেই মেপে ফিরিয়ে দেয়।

**স্টাইলশিট হোস্টই জোড়ে।** বান্ডলার ব্যবহার করলে `import 'nabi-note/nabi.css'`
একটাই যথেষ্ট, নিবন্ধিত wing-এরটুকুই রাখতে চাইলে
`injectSheets(document, collectSheets(registry))` ডাকুন।

প্রদর্শনের ভাষা প্রতিটি mount-এ `locale` দিয়ে ঠিক হয় — নথির লেখা যেমন আছে
তেমনই থাকে, কেবল টুলবার·কনটেক্সট সারির নামই বদলায়। বাছাইকারী আঁকতে চাইলে
প্যাকেজের এক্সপোর্ট করা `LOCALES` (কোডের তালিকা) ব্যবহার করুন।

| জোড়া লাগানো | আবশ্যক | কী করে |
|---|---|---|
| `createNabiWith(wings, options?)` | হ্যাঁ | `{ nabi, registry }` ফিরিয়ে দেয়। DOM লাগে না |
| `mountSurface({ nabi, registry, root })` | হ্যাঁ | ক্যারেট·IME·ইনপুট নাবিট্রির সঙ্গে মেলায়। নিবন্ধিত wing-এর `attach`-ও একসঙ্গে জুড়ে দেয় |
| `mountToolbar({ nabi, registry, root, surface?, locale? })` | না | মূল টুলবার। না থাকলেও `applyCommand()` দিয়ে সরাসরি সম্পাদনা চলে |
| `mountContextToolbar({ nabi, registry, root, surface? })` | না | ক্যারেটের জায়গা অনুযায়ী কনটেক্সট সারি (টেবিলের সারি·কলাম, কোডের ভাষা, লিঙ্কের ঠিকানা·নাম ইত্যাদি) |
| `mountHints({ toolbar, context?, root, surface? })` | না | Shift দুবার দ্রুত চাপলে ওঠা শর্টকাট ব্যাজ |
| `mountViewTools({ nabi, surface, root, container })` | না | প্রিভিউ·ফুলস্ক্রিন দুটো বোতাম। `root` হলো ফুলস্ক্রিন যে `.nabi` বাক্স আটকে রাখবে |
| `mountSticky({ root, surface })` | না | মোবাইল কিবোর্ড পর্দা যতটা ঠেলেছে ততটা আটকে থাকা টুলবার ফিরিয়ে দেয় |
| `mountPickedMark({ nabi, surface })` | না | ছবি·ভিডিও বাছাই করার চিহ্ন (ব্রাউজার নিজে আঁকে না) |
| `mountFile({ nabi, store, name? })` | save·open ব্যবহারে | `.nabi` ফাইলে সংরক্ষণ·খোলা |
| `mountLocalHistory({ nabi, storage })` | localHistory ব্যবহারে | নির্দিষ্ট বিরতিতে ব্রাউজারে রেকর্ড রাখে |
| `mountUpload({ … })` + `mountUploadView({ … })` | upload ব্যবহারে | ড্রপ·পেস্ট·ফাইল বাছাইয়ের আপলোড অগ্রগতি আর তার প্রদর্শন |

**ছবি·চেকবক্স·টেবিল-ঘর টানা·কোড রং বসাতে আলাদা mount করার কিছু নেই** —
সবই wing নিজেই `attach` দিয়ে ধরে রাখে, `mountSurface` একসঙ্গে জুড়ে দেয়।
কোড রং বসাতে কেবল যে রং বসাবে তাকে গুঁজে দিলেই হয়
(`makeCodeAttach`, [{{ t('menu_wing_code') }}](../wing/block/code) দেখুন)।

wing বদলাতে চাইলে এই পুরো টুকরোটা তুলে (`unmount()`) নতুন করে বানাতে হয় —
বাদ পড়া wing যে মার্কআপ ধরে রেখেছিল তা সেখানেই সাধারণ লেখায় নেমে আসে। এই
সাইটের ডেমো ঠিক এভাবেই কাজ করে — wing চিপ বন্ধ-চালু করলে পুরো জোড়া লাগানোটাই
নতুন করে তৈরি হয়।

রং·রূপসহ CSS ভেরিয়েবল আছে [{{ t('menu_style_custom') }}](../style/custom)-এ।

---

## নথি বের করার তিন পথ

```ts
nabi.getHtml()        // সংরক্ষণ·প্রকাশের HTML
nabi.getJson()        // নাবিট্রি (JSON)
nabi.getEditorHtml()  // এখনকার সম্পাদক-পর্দার HTML (data-key লাগানো)
```

**সংরক্ষণের মান আগের দুটোর একটি।** `getEditorHtml()`-এ পর্দা-নির্দিষ্ট চিহ্ন
(`data-key`) লাগানো থাকে বলে এটি বের করার মান নয় — সার্ভার রেন্ডারিং (SSR)
দিয়ে সম্পাদক আগে থেকে এঁকে রাখার জায়গা এটি।

বেরোনো JSON দেখতে এমন। **নথি মানেই ব্লকের একটি অ্যারে**, তাকে মোড়ানো কোনো
রুট নোড নেই।

```json
[
  {"w":"p","a":{"h":2},"ch":["শিরোনাম"]},
  {"w":"p","ch":["লেখা ",{"w":"b","ch":["গাঢ়"]}," আর ",
    {"w":"a","a":{"href":"https://nabi.saro.me/"},"ch":["লিঙ্ক"]}]},
  {"w":"p","a":{"a":"c"},"ch":["মাঝে"]},
  {"w":"p","ch":[{"w":"ul","ch":[
    {"w":"li","ch":[{"w":"p","ch":["এক"]}]},
    {"w":"li","ch":[{"w":"p","ch":["দুই"]}]}]}]}
]
```

পড়ার নিয়ম কেবল চারটি।

- **`w` হলো সেই নোড আঁকা wing-এর id।** সংরক্ষিত শব্দ কেবল দুটি — `p`
  (অনুচ্ছেদ) আর `br` (লাইন), বাকি সবই নিবন্ধিত wing-এর id — `b`·`ul`·`li`-এর
  মতো। শিরোনাম আলাদা wing নয়, বরং **অনুচ্ছেদের অ্যাট্রিবিউট**
  (`{"w":"p","a":{"h":2}}`)।
- **স্ট্রিং হলে লেখা, অবজেক্ট হলে wing।** ধরন লেখার আলাদা কোনো ঘর নেই।
- **`a` হলো সেই wing বহন করা মান** — লিঙ্কের ঠিকানা, হাইলাইটের রং, শিরোনামের
  স্তরের মতো। না থাকলে ঘরও নেই। সারিবদ্ধতার মানও `a`, তবে এই ঘরের **ভিতরে**
  থাকে বলে গুলিয়ে যায় না (`{"w":"p","a":{"a":"c"}}` — মাঝে-সারিবদ্ধ অনুচ্ছেদ)।
- **টেবিল·তালিকা·ছবির মতো অনুচ্ছেদের জায়গা নেওয়া জিনিস একটি অনুচ্ছেদ দিয়ে
  মোড়া থাকে** (উপরের `ul` দেখুন)। সেই অনুচ্ছেদই সারিবদ্ধতা বহন করে, আর
  ক্যারেট সেই বস্তুর আগে-পরে দাঁড়ানোর জায়গা পায়। HTML-এ তা
  `<div data-nabi-p>` হয়ে বেরোয় — `<p>` ব্যাকরণে টেবিল·তালিকা ধরে রাখতে পারে
  না বলে।

ভিতরে চলা ট্রিতে প্রতিটি নোডে আরেকটি `_id` থাকে — **ক্যারেট নোড ধরার
অভ্যন্তরীণ ঠিকানা**, বেশিরভাগ সম্পাদনায় নতুন করে বসে, আর বেরোনোর সময় ছেঁকে
বাদ যায় (উপরের উদাহরণে ৪৭০ → ৩২৩ বাইট)। বেরোনো মান যেমন আছে তেমনই
`setJson()`-এ আবার বসিয়ে দেওয়া যায়।

---

## নথি ঢোকানোর চার পথ

```ts
createNabiWith(wings, { doc })   // আগে থেকেই বানানো নাবিট্রি দিয়ে শুরু
nabi.setJson(json)               // নাবিট্রি দিয়ে গোটাটাই বদলে দেওয়া
nabi.setHtml(html)               // HTML স্ট্রিং দিয়ে গোটাটাই বদলে দেওয়া
nabi.applyCommand('setHeading', { value: 2 })  // সম্পাদনা কমান্ড (wing যে দরজা ব্যবহার করে সেটিই)
```

চারটিই **সাফল্য-ব্যর্থতা `boolean` হিসেবে জানায়।** ছোঁড়ে না, ব্যর্থ হলে
নথি ছোঁয় না।

| উত্তর `false` হয় যেখানে | |
|---|---|
| `setJson` | নাবিট্রির রূপ নয় |
| `setHtml` | `parseHtml` অ্যাডাপ্টার গোঁজা হয়নি (নিচে দেখুন) অথবা সম্পাদনা লক করা |
| `applyCommand` | এমন কোনো কমান্ড নেই, অথবা **কিছুই বদলায়নি** |

শেষ লাইনটিই একটি নিয়ম — **কিছু না বদলালে চুপ থাকে।** আগে থেকেই স্তর-২
শিরোনাম হওয়া অনুচ্ছেদে আবার `setHeading` চাপলে `false` ফেরত দেয়, undo-এর
জায়গা বা সংকেত কিছুই রেখে যায় না।

### `setHtml`-এর একটি অ্যাডাপ্টার লাগে

HTML পড়ার কাজ করে ব্রাউজারের `DOMParser`। কোর DOM চেনে না বলে ঘোষণার সময়
সেই অ্যাডাপ্টার গুঁজে দিতে হয়।

```ts
import { createNabiWith, parseNodes } from 'nabi-note'

const { nabi } = createNabiWith(wings, { parseHtml: parseNodes })
```

`setJson`-এর কোনো অ্যাডাপ্টার লাগে না — সংরক্ষিত JSON **সার্ভারে (Node.js)
সরাসরি বসিয়ে দিলেও** চলে। জোড়া লাগানো (`getHtml`)-ও DOM ব্যবহার করে না, তাই
সার্ভারে JSON পড়ে HTML বানিয়ে বের করার পথ খোলাই থাকে।

---

## সম্পাদক মানুষকে যেভাবে জিজ্ঞেস করে

ফাইল খোলার সময় "লেখা এখনও আছে, তবু কি খুলবেন?" জাতীয় প্রশ্ন দরকার হয়। সেই
বাক্স **ঘোষণার সময় একবারই** গুঁজে দেওয়া হয়।

```ts
const { nabi } = createNabiWith(wings, {
  ask: {
    message: (text) => window.alert(text),
    confirm: (text) => window.confirm(text),
  },
})
```

| | রূপ |
|---|---|
| `message` | `(text: string) => void` — একটিমাত্র কথা, উত্তর নেয় না |
| `confirm` | `(text: string) => boolean \| Promise<boolean>` — সিঙ্ক্রোনাস বা অ্যাসিনক্রোনাস দুটোই নেয় |

**কোর ব্রাউজারেরটা নিজে থেকে ব্যবহার করে না।** নিজস্ব ডায়ালগ থাকা পাতায়
ধূসর বাক্স এসে ঢুকে পড়া ঠিক নয়, আর প্লাগইনে (IntelliJ, VS Code)
`window.confirm` আদৌ নেই বলে। উপরের তিন লাইন হোস্টই বানায়।

::: warning না দিলে উত্তর "না"
কেউ উত্তর না দেওয়া প্রশ্নের অর্থ "হ্যাঁ" নয় — বাতিল, Escape, বা জানালা বন্ধ
করার মতোই। এই উত্তর যেখানে বসে সেটি "লেখা এখনও থাকা অবস্থায় খুলব কি না" —
জিজ্ঞেস করার কেউ নেই বলে ফেলে দেওয়ার দিকে যাওয়া ঠিক না। সার্ভারেও (Node)
এই মান দিয়ে চুপচাপ পার হয়ে যায়।
:::

**একটিমাত্র সম্পাদকের নিজস্ব** — গ্লোবাল নয় বলে একই পাতার দুটো সম্পাদক
আলাদা আলাদাভাবে জিজ্ঞেস করতে পারে। wing-ও একই জিনিস পায় (`nabi.$ask`) —
[{{ t('menu_wing_custom') }} ▸ UI ও আচরণ](../wing/custom/ui)-এ এই গল্প আছে।

---

## এই সম্পাদকের নাম আর "বদলেছে কি না"

```ts
nabi.sessionId   // '1755245678901-1x9k3af' — <ইউনিক্স-সময়>-<nonce>, প্রতিটি ইনস্ট্যান্সে একটি
nabi.isChanged() // শেষ ভিত্তিরেখার পর থেকে নথি নড়েছে কি না
```

`sessionId` একবারই তৈরি হয় আর বদলায় না। সময়টি এই সম্পাদক কখন দাঁড়িয়েছিল তা
বলে আর নিজেই সাজানো, আর nonce একই মিলিসেকেন্ডে দাঁড়ানো দুটো সম্পাদককে আলাদা
করে। খসড়া·লগ·অটো-সেভ চাবিতে জোড়ার নাম-লেবেল এটি।

`isChanged()`-এর **ভিত্তিরেখা নতুন করে টানে তিনটি জিনিস** — নথি গোটাটাই
বসানো (`createNabiWith({ doc })`·`setJson()`·`setHtml()`) আর সংরক্ষণ হয়েছে
বলে জানানো।

```ts
nabi.$markSaved(savedDoc)   // সংরক্ষণ সফল হওয়ার পরে — সেই মুহূর্তে সংরক্ষণ করা নথিটাই পাঠান
```

**সংরক্ষণের সেই মুহূর্তের ট্রিটাই পাঠাতে হয়** (এখনকার ট্রি নয়)। সংরক্ষণ
হতে সময় লাগার মধ্যে টাইপ করা অক্ষরও তখনও "বদলে গেছে" হিসেবেই থেকে যেতে হয়
বলে। সংরক্ষণ wing (`save`) ফাইল সত্যিই লেখা হওয়ার পরে এটি ডাকে, তাই `.nabi`
তে সংরক্ষণ করলে `isChanged()` `false` হয়ে যায়।

**undo করে আগের জায়গায় ফিরলে আবার `false`** — নাবিট্রি অপরিবর্তনীয় আর
প্রতিটি সম্পাদনায় গোটাটাই বদলে যায় বলে, একই নথি কি না তা ঘেঁটে বা হ্যাশ না
করেই সেখানেই বোঝা যায়।

```ts
window.addEventListener('beforeunload', (e) => {
  if (nabi.isChanged()) e.preventDefault()
})
```

---

## পরের নথি

- [{{ t('menu_intro_ssr') }}](./ssr) — সংরক্ষিত রূপ সার্ভারে আগেভাগে এঁকে `hydrate` দিয়ে ধরে নেওয়া
- [{{ t('menu_intro_cdn') }}](./cdn) — বিল্ড টুল ছাড়াই একটিমাত্র `<script>` দিয়ে
- [{{ t('menu_wing_custom') }}](../wing/custom) — না-থাকা ফরম্যাট নিজেই বানানো

<script setup lang="ts">
import { useTranslate } from '../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
