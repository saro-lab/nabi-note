---
title: কাস্টম উইং
description: সংরক্ষণযোগ্য নতুন নথি-সুবিধা তৈরির সময় মানতে হওয়া চুক্তি ও বাস্তবায়নক্রম।
---

# কাস্টম উইং

কাস্টম উইং শুধু টুলবারে একটি বোতাম যোগ করার সুবিধা নয়। এটি নথিতে সংরক্ষিত কাঠামো, কমান্ড, HTML ও Markdown রূপান্তর, আমদানির নিয়ম এবং পর্দার আচরণকে এক ঘোষণায় বাঁধা একটি সম্প্রসারণ একক। সম্পাদক তৈরির আগে registry ঘোষণাটি যাচাই করে, তাই ভুল কাঠামো নথিতে মিশে যেতে পারে না।

## আগে সবচেয়ে ছোট factory খুঁজুন

সাধারণ বিন্যাসের জন্য শুরু থেকে পুরো ঘোষণা বানাতে হয় না। মানহীন inline বিন্যাসে `simpleMark()`, সীমিত মানের বিন্যাসে `valueMark()`, সন্তানহীন block-এ `boxObject()`, আর তালিকায় `listFamily()` ব্যবহার করুন।

```ts
import { createNabiWith, simpleMark, wings } from 'nabi-note'

const exStrong = simpleMark({
  w: 'exStrong',
  toHtml: (_node, children, ctx) => ctx.element('strong', children()),
})

const { nabi, registry } = createNabiWith(
  wings().allBasic().use(exStrong),
)
```

## ধরনভেদে নিজে তৈরি করে দেখুন

নিচের উদাহরণগুলো ভিন্ন ভিন্ন সংরক্ষণ কাঠামো দেখায়। প্রথমে একটি factory বেছে নিবন্ধন করুন এবং `getJson()` ও `getHtml()`-এর ফল দেখুন। সুবিধা পর্দা থেকে সন্নিবেশ বা বদলাতে চাইলে তারপর কমান্ড ও বোতাম যোগ করুন।

### 1. মানহীন inline বিন্যাস: জোর দেওয়া

শুধু অক্ষর ঘিরে রাখে এমন সুবিধার জন্য `simpleMark()` উপযুক্ত। এই উদাহরণ নথিতে `exStrong` সংরক্ষণ করে এবং HTML-এ `<strong>` হিসেবে দেখায়।

```ts
import { simpleMark } from 'nabi-note'

export const exStrong = simpleMark({
  w: 'exStrong',
  clearable: true,
  toHtml: (_node, children, ctx) => ctx.element('strong', children()),
  styles: '.nabi-content strong { font-weight: 700; }',
})
```

`clearable: true` দিলে বিন্যাস মোছার সময় এই mark-ও সরানো যায়। বোতাম যোগ করার আগে `nabi.applyCommand()` বা অন্য কাস্টম কমান্ড দিয়ে এটি প্রয়োগ করুন। প্রকাশিত পর্দার CSS-এ `.nabi-content strong`-এর মতো সম্পাদকের একই selector ব্যবহার করুন।

### 2. মানসহ inline বিন্যাস: অবস্থা-লেবেল

রং, আকার বা অবস্থার মতো অনুমোদিত মানগুলোর একটি বাছতে হলে `valueMark()` ব্যবহার করুন। মানটি JSON-এর `a.v`-তে সংরক্ষিত হয় এবং তালিকার বাইরের মান `repair()` ধাপে সরানো হয়।

```ts
import { valueMark } from 'nabi-note'

export const exTone = valueMark({
  w: 'exTone',
  key: 'v',
  values: ['quiet', 'loud'],
  clearable: true,
  toHtml: (node, children, ctx) =>
    ctx.element('span', children(), { 'data-ex-tone': String(node.a?.v ?? '') }),
  styles: `
    .nabi-content [data-ex-tone="quiet"] { opacity: .65; }
    .nabi-content [data-ex-tone="loud"] { color: var(--nabi-accent); font-weight: 700; }
  `,
})
```

সংরক্ষণের উদাহরণ হলো `{ "w": "exTone", "a": { "v": "loud" }, "ch": ["গুরুত্বপূর্ণ"] }`। CSS সংরক্ষিত মানের selector দিয়ে প্রকাশিত পর্দাও বদলায়। মানের তালিকা ছোট করলে বিদ্যমান নথির বাইরের মান পড়ার সময়ও হারিয়ে যেতে পারে; তাই ইতিমধ্যে সংরক্ষিত নথি থাকলে মান অযত্নে বাদ দেবেন না।

### 3. সন্তানহীন block: বিজ্ঞপ্তি-বিভাজক

ছবি, ভিডিও বা বিভাজকের মতো সন্তানহীন স্বতন্ত্র block `boxObject()` দিয়ে বানান। কোনো attribute না থাকা বিভাজক সবচেয়ে ছোট উদাহরণ।

```ts
import { boxObject } from 'nabi-note'

export const exDivider = boxObject({
  w: 'exDivider',
  toHtml: (_node, _children, ctx) => ctx.element('hr', ''),
  styles: '.nabi-content hr { border-color: var(--nabi-line); }',
})
```

ঠিকানা বা প্রস্থের মতো attribute দরকার এমন block হলে `attrs`-এ মান-যাচাই function ঘোষণা করুন, আর অবশ্যই থাকতে হবে এমন মান `requires`-এ রাখুন। যাচাই করা যায় না এমন মানকে default-এ বদলানোর চেয়ে `null` দিয়ে প্রত্যাখ্যান করা সংরক্ষিত তথ্য ও পর্দার অমিল ঠেকায়।

### 4. একাধিক অনুচ্ছেদ রাখা block: নির্দেশনা বাক্স

মূল লেখা ধারণ করা block-এর জন্য সরাসরি `container` ঘোষণা ব্যবহার করুন। `holds: 'blocks'`-এর মানে এটি অনুচ্ছেদ, তালিকা, ছবি ইত্যাদি block-সন্তান নিতে পারে।

```ts
import type { Wing } from 'nabi-note'

export const exCallout: Wing = {
  w: 'exCallout',
  place: 'container',
  holds: 'blocks',
  toHtml: (_node, children, ctx) =>
    ctx.element('aside', children(), { class: 'ex-callout' }),
  styles: `
    .nabi-content .ex-callout {
      border-inline-start: 4px solid var(--nabi-accent);
      background: var(--nabi-soft);
      padding: 1rem;
    }
  `,
}
```

শুধু এই ঘোষণা দিয়ে অনুচ্ছেদকে নির্দেশনা বাক্সে রাখার কমান্ড তৈরি হয় না। নির্বাচিত অনুচ্ছেদ ঘিরে রাখার বিশুদ্ধ কমান্ড `commands`-এ যোগ করতে হবে এবং সেই কমান্ড চালানোর `button` ঘোষণা করতে হবে, তবেই সম্পাদক UI-তে এটি ব্যবহার করা যাবে।

### 5. তালিকা ও আইটেম একসঙ্গে বানানো সুবিধা

তালিকার parent ও item সবসময় জোড়া থাকে, তাই `listFamily()` ব্যবহার করুন। নিচের উদাহরণটি `<ul>` ও `<li>` তৈরি করা সবচেয়ে ছোট ব্যবহারকারী তালিকা।

```ts
import { listFamily } from 'nabi-note'

export const exList = listFamily({
  w: 'exList',
  item: 'exListItem',
  toHtml: (_node, children, ctx) => ctx.element('ul', children(), { class: 'ex-list' }),
  itemHtml: (_node, children, ctx) => ctx.element('li', children()),
  styles: '.nabi-content .ex-list { border-inline-start: 2px solid var(--nabi-line); }',
})
```

`listFamily()` তালিকার ভেতরে item নয় এমন block এলেও item দিয়ে ঘিরে কাঠামো মেরামত করে। চেক করা আছে কিনা এমন item-ভিত্তিক মান সংরক্ষণ করতে চাইলে `itemDecl` ও `repairItem` যোগ করুন।

### নিবন্ধনের ক্রম

একাধিক উইং একসঙ্গে ব্যবহার করলে একবারে নিবন্ধন করুন। server rendering-এও একই ক্রম ও ঘোষণা ব্যবহার করতে হবে, তবেই একই JSON থেকে একই HTML পাওয়া যাবে।

```ts
const selected = wings()
  .allBasic()
  .use(exStrong)
  .use(exTone)
  .use(exDivider)
  .use(exCallout)
  .use(exList)

const { nabi, registry } = createNabiWith(selected, { locale: 'bn' })
```

## নাম ও সংরক্ষণ কাঠামো ঠিক করুন

নথিতে লেখা নামের রূপ `ex[A-Z0-9]...` হতে হবে। `exCallout`-এর মতো `ex` দিয়ে শুরু করলে পরে আনুষ্ঠানিক উইং যোগ হলেও সংরক্ষিত নথির অর্থ বদলাবে না।

`place` সংরক্ষণ কাঠামো ঠিক করে। বাক্যের ভেতর ঘেরা বিন্যাস হলো `mark`, সন্তানহীন স্বতন্ত্র block হলো `void`, সন্তানধারী block হলো `container`। অনুচ্ছেদের attribute হলো `attr`, আর নথি তৈরি না করা পর্দার সরঞ্জাম হলো `tool`। `container`-এ `holds: 'blocks' | 'inline'` ও `toHtml()` দরকার।

```ts
const exNote = {
  w: 'exNote',
  place: 'container',
  holds: 'blocks',
  toHtml: (_node, children, ctx) => ctx.element('aside', children()),
} as const
```

`attrs`, `boolAttrs`, `allows`, `requiresAnyOf`, `parts` সংরক্ষণ কাঠামোর শর্ত ঘোষণা করার option। `parts` ব্যবহার করলে প্রতিটি part-এর জন্য মিল থাকা `partHtml`-ও অবশ্যই ঘোষণা করতে হবে। মান-নির্বাচনী উইংয়ে `attrKey` ও `attrValues` ব্যবহার করে অনুমোদিত পরিসর সীমিত করুন।

## ঘোষণা option-এর পুরো তালিকা

যেটুকু দরকার সেটুকুই ঘোষণা করুন। factory ব্যবহার করলে factory নির্ধারিত মান আবার লিখবেন না।

| বিভাগ | option | কাজ |
| --- | --- | --- |
| মূল | `w`, `place`, `basic`, `styles` | নাম, কাঠামোর ধরন, মৌলিক উইং অন্তর্ভুক্তি, মৌলিক CSS |
| কাঠামো | `holds`, `singleParagraph`, `attrs`, `boolAttrs` | সন্তানের ধরন, Enter-এর আচরণ, অনুমোদিত attribute, boolean attribute |
| কাঠামো | `parts`, `allows`, `noAlign`, `requiresAnyOf` | ভেতরের part, অনুমোদিত সন্তান, সারিবদ্ধকরণ নিষেধ, নির্ভরশীল উইং |
| মান নির্বাচন | `attrKey`, `attrValues`, `currentValue` | সংরক্ষিত মানের key ও তালিকা, এবং বর্তমান নির্বাচিত মান নির্ণয় |
| কমান্ড·ইনপুট | `commands`, `onKey`, `escapeKeys`, `doubleKeys`, `inputRules` | কমান্ড, key পরিচালনা, Escape·পরপর key·স্বয়ংক্রিয় রূপান্তর |
| পর্দা-সংযোগ | `attach` | surface-এর দরকারি DOM আচরণ ও অপসারণ ব্যবস্থা |
| রূপান্তর | `toHtml`, `partHtml`, `toMd`, `partMd` | HTML·Markdown আউটপুট |
| আমদানি·মেরামত | `claim`, `ioFilter`, `repair`, `partRepair` | HTML আমদানি, ফাইল পরিচালনা, JSON যাচাই·মেরামত |
| UI | `button`, `buttons`, `context` | টুলবার ও প্রাসঙ্গিক সরঞ্জাম ঘোষণা |
| বিন্যাস মোছা | `clearable` | বিন্যাস মোছার লক্ষ্য কি না |

`w` ও `place` সবসময় দরকার। `mark`, `void`, `container`-এর মতো নথি node তৈরি করা উইংয়ে `toHtml()`-ও দরকার। `container`-এ `holds` এবং `parts`-এ একই নামের `partHtml` দরকার। `attr` ও `tool` নথি node তৈরি করে না, তাই তাদের নিয়ম আলাদা।

## HTML, Markdown ও JSON একসঙ্গে রক্ষা করুন

`toHtml()` সংরক্ষিত node-কে পর্দার HTML-এ বদলায়, আর `toMd()` Markdown রপ্তানি করে। Markdown রূপান্তর ঘোষণা না করলে তৈরি HTML রয়ে যায়, ফলে তথ্য হারায় না। HTML আবার পড়তে হলে `claim()`-এ নিজের element ও attribute-ই শুধু পরীক্ষা করে node-এ বদলান।

`repair()` JSON পড়ার সময় ও কমান্ড চালানোর পরে আবার চলে। অনুমোদনহীন attribute-এর মান ঠিক করে ফেরান, আর বাঁচানো যায় না এমন node-এর জন্য `null` ফেরান। HTML `ctx.element()`, `ctx.escape()`, `ctx.url()`-এর মতো context function দিয়ে গড়ুন। string জুড়ে tag·attribute·URL যাচাই এড়িয়ে যাওয়া চলবে না।

## কমান্ড ও পর্দার আচরণ আলাদা রাখুন

কমান্ড নথি ও নির্বাচনের অবস্থান নিয়ে নতুন নথি এবং তার ভেতরের নির্বাচনের অবস্থান ফেরত দেওয়া বিশুদ্ধ function। এটি DOM পড়ে বা বদলায় না; বদলানো যায় না এমন অনুরোধে `null` ফেরায়। কমান্ডের নাম `insertNote`-এর মতো verb দিয়ে শুরু lower camel case-এ লিখুন।

সারণির drag নির্বাচন যেমন কমান্ডে প্রকাশ করা কঠিন পর্দার আচরণ `attach(host)`-এ রাখুন। event listener বা attribute বদলানোর সঙ্গে সঙ্গেই `host.onDispose()`-এ পুনরুদ্ধার function নিবন্ধন করতে হবে, যেন পরে সেটিং ব্যর্থ হলেও পরিষ্কার হয়। রচনাধীন পাঠের DOM বা surface-এর নির্বাচন mapping সরাসরি বদলাবেন না।

টুলবার ও প্রাসঙ্গিক সরঞ্জাম `button`, `buttons`, `context` ঘোষণা দিয়ে তৈরি করুন। একই কমান্ডের নিয়ম application UI-তে আলাদা করে বাস্তবায়ন করলে টুলবার ও নথির model অমিল হতে পারে।

## CSS শৈলী

উইংয়ের `styles`-এ প্রয়োজনীয় মৌলিক CSS ঘোষণা করা যায়। নিবন্ধিত উইংয়ের CSS `nabi-note/nabi.css`-এ থাকে। নির্বাচিত registry শুধু runtime-এ গড়লে browser-এ `collectSheets()` ও `injectSheets()` ব্যবহার করা যায়, কিন্তু SSR-এ CSS file link করুন।

প্রকাশিত পর্দাতেও সম্পাদকের একই class ও data attribute দিয়ে CSS প্রয়োগ করুন। সম্পাদকে ব্যবহারের selector ও প্রকাশিত পর্দায় ব্যবহারের selector আলাদা রাখুন এবং `[data-key]` সম্পাদনা node-এর কাঠামো বা `display`, `white-space` বদলাবেন না। CSS কেবল চেহারা বদলাবে; নথির কাঠামো ও caret mapping-এ হাত দেওয়া যাবে না।

```ts
const exCallout = {
  w: 'exCallout',
  place: 'container',
  holds: 'blocks',
  toHtml: (_node, children, ctx) =>
    ctx.element('aside', children(), { class: 'ex-callout' }),
  styles: `
    .nabi-content .ex-callout {
      padding: 1rem;
      border-inline-start: 4px solid var(--nabi-accent);
      background: var(--nabi-soft);
      border-radius: var(--nabi-radius);
    }
  `,
} as const
```

`toHtml()`-তৈরি class বা data attribute-ই লক্ষ্য করলে একই JSON-কে সম্পাদক ও প্রকাশিত পর্দায় নিরাপদে ভিন্নভাবে সাজানো যায়। service-নির্দিষ্ট পরিবর্তন `.article-body .ex-callout`-এর মতো আরও সীমিত selector-এ আলাদা রাখুন।

## যা যাচাই করবেন

সংরক্ষিত JSON আবার পড়লেও একই কাঠামো ও HTML আসে কি না যাচাই করুন। ভুল নাম, সদৃশ কমান্ড, অনুপস্থিত builder, পূরণ না হওয়া dependency registry প্রত্যাখ্যান করে কি না তাও পরীক্ষা করুন। HTML আমদানি ও `repair()`-এর ভুল input, কমান্ডের নির্বাচনের অবস্থান, SSR output, এবং CSS-লাগানো প্রকাশিত পর্দা পর্যন্ত পরীক্ষা করলে নিরাপদ হবে।

সম্পূর্ণ type ও factory argument ইনস্টল করা package-এর type declaration এবং [ইংরেজি API reference](https://nabi.saro.me/llms/api-reference.md)-এ দেখুন।
