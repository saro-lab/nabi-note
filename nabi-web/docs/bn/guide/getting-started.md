---
title: প্রাথমিক ব্যবহার
description: ব্রাউজার-ভিত্তিক NABI NOTE editor তৈরি করুন, তারপর নথি সংরক্ষণ ও ফিরিয়ে আনুন।
---

# প্রাথমিক ব্যবহার

এই নির্দেশিকায় browser-এ client-side rendered (CSR) editor তৈরি করা, wing বাছা, editor ও UI mount করা এবং NABI TREE JSON সংরক্ষণ ও ফিরিয়ে আনা দেখানো হয়েছে।

## Install ও base markup যোগ করুন

```bash
npm install nabi-note
```

editor ও published content দুটির জন্যই একই stylesheet লোড করুন। নিজে `contenteditable` যোগ করবেন না; এটি `mountSurface()`-এর দায়িত্ব।

```ts
import 'nabi-note/nabi.css'
```

```html
<div class="nabi">
  <div id="toolbar" class="nabi-toolbar"></div>
  <div id="content" class="nabi-content"></div>
</div>
```

## Editor mount করুন

`allBasic()` application-specific wiring ছাড়া কাজ করা official wing বেছে নেয়। upload, file storage বা document diffing-এর মতো service-connected wing তাদের আলাদা নির্দেশিকা অনুযায়ী যোগ করুন।

```ts
import { createNabiWith, mountSurface, mountToolbar, wings } from 'nabi-note'

const content = document.querySelector<HTMLElement>('#content')!
const toolbarRoot = document.querySelector<HTMLElement>('#toolbar')!

const { nabi, registry } = createNabiWith(wings().allBasic(), {
  locale: 'bn',
  onError: (error) => console.error(error),
  undoLimit: 200,
  typingMergeMs: 1000,
})

const surface = mountSurface({
  nabi, registry, root: content, locale: 'bn', placeholder: 'কিছু লিখুন।',
})
const toolbar = mountToolbar({
  nabi, registry, root: toolbarRoot, surface: content, locale: 'bn',
})
```

`locale` toolbar ও helper text নিয়ন্ত্রণ করে; সব UI mount-এ একই মান দিন। `placeholder` শুধু খালি editor-এ দেখা যায়। `onError` command ও callback-এর বিচ্ছিন্ন failure পায়। `undoLimit` হলো undo entry-র সংখ্যা এবং `typingMergeMs` পরপর typing-কে একটি undo step-এ মিলিয়ে দেয়; প্রতিটি insertion আলাদা রাখতে `0` দিন।

প্রতিটি editor-এর আলাদা, একে অপরের সঙ্গে না-মেলা content ও toolbar root দরকার। একই পৃষ্ঠায় একাধিক editor হলে `surface` দিয়ে প্রতিটি toolbar-কে নিজস্ব editor surface দিন, যাতে focus ও shortcut একটির সঙ্গে অন্যটি না মেশে।

## Wing বাছুন

প্রয়োজনীয় feature-ই রাখতে `use()` ও `drop()` ব্যবহার করুন। প্রতিটি wing page-এ গ্রহণযোগ্য option লেখা আছে।

```ts
const selected = wings()
  .allBasic()
  .drop('youtube')
  .use('upload')

const { nabi, registry } = createNabiWith(selected, { locale: 'bn' })
```

ছোট bundle-এর জন্য `boldWing` ও `imageWing`-এর মতো প্রয়োজনীয় wing শুধু array-তে দিন। অজানা নাম, ভুল option বা না থাকা dependency editor তৈরির সময়ই ব্যর্থ হয়।

## সংরক্ষণ ও লোড

নথি আবার সম্পাদনা হবে হলে `getJson()` output-কে NABI TREE JSON হিসেবে রাখুন। `getHtml()` প্রকাশিত output-এর জন্য। editor-only `getEditorHtml()`-এর ফল কখনও রাখবেন না।

```ts
const json = nabi.getJson()
await saveToServer(json)

const saved = await loadFromServer()
if (!nabi.setJson(saved)) showError('সংরক্ষিত নথি পড়া যায়নি।')

const publishedHtml = nabi.getHtml()
```

বাইরের HTML import করতে `setHtml()` ব্যবহার করুন। browser editor-এ HTML parser আগে থেকেই আছে, তাই parser option প্রয়োজন নেই। `setJson()` ও `setHtml()` অবৈধ non-empty input-এর জন্য `false` দেয় এবং বর্তমান নথি বদলায় না।

```ts
nabi.setHtml('<p>আমদানি করা নথি</p>')
```

JSON ও HTML দুটোই untrusted input। NABI NOTE নিবন্ধিত wing ও তাদের allowed rule দিয়ে পড়ে, কিন্তু এতে upload authorization বা service-এর security policy-র বিকল্প হয় না।

## সাধারণ API

| কাজ | API |
| --- | --- |
| Editor তৈরি | `createNabiWith`, `wings` |
| Surface ও toolbar mount | `mountSurface`, `mountToolbar` |
| সংরক্ষণ ও ফিরিয়ে আনা | `getJson`, `setJson`, `getHtml`, `setHtml` |
| পরিবর্তন দেখুন | `nabi.onChange(listener)` |
| Undo ও redo | `nabi.undo()`, `nabi.redo()` |
| Server-এ HTML render | `nabi-note/ssr` থেকে `renderStoredHtml` |
| Published-page behavior যোগ | `nabi-note/viewer` থেকে `attachViewer` |
| নথি তুলনা | `nabi-note/diff` থেকে `diffDocs` |

নির্ভুল type ও সব argument-এর জন্য আগে installed package declaration দেখুন। automation tool [English API reference](https://nabi.saro.me/llms/api-reference.md)-ও ব্যবহার করতে পারে।

## Mount সরান

তৈরির উল্টো ক্রমে unmount করুন। editing root-এর `innerHTML` সরাসরি বদলাবেন না; `setJson()`, `setHtml()` বা `applyCommand()`-এর মতো public API দিয়ে নথি বদলান।

```ts
function dispose() {
  toolbar.unmount()
  surface.unmount()
}
```
