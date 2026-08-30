---
title: SSR সেটআপ
description: Server-এ সংরক্ষিত NABI TREE নথিকে নিরাপদে HTML-এ render করুন এবং browser-এ editor hydrate করুন।
---

# SSR সেটআপ

Server-এ browser surface বা UI নয়, শুধু `nabi-note/ssr` import করুন। এটি সংরক্ষিত NABI TREE JSON যাচাই করে published HTML বা hydrate করা যায় এমন editor HTML বানায়।

## Published HTML render করুন

```ts
import { makeRegistry, renderStoredHtml, wings } from 'nabi-note/ssr'

const registry = makeRegistry(wings().allBasic().build())
const html = renderStoredHtml(storedJson, registry)

if (html === null) throw new Error('সংরক্ষিত নথি পড়া যায়নি।')
```

`renderStoredHtml()` JSON input যাচাই ও normalise করে published HTML ফেরত দেয়। `null` মানে বর্তমান registry ওই input পড়তে পারে না। published page-এ package CSS ও `.nabi-content` রাখুন।

```html
<link rel="stylesheet" href="/assets/nabi.css">
<article class="nabi-content">...</article>
```

interactive table sorting বা code highlighting-এর জন্য কেবল browser-এ `nabi-note/viewer` থেকে `attachViewer()` যোগ করুন। সাধারণ published content-এর শুধু CSS-ই দরকার।

## Pre-render করা editor markup hydrate করুন

প্রথম paint থেকেই editor দেখাতে server-এ `renderStoredEditorHtml()` দিয়ে render করুন এবং browser surface-এ `hydrate: true` দিন।

```ts
// server
const initialEditorHtml = renderStoredEditorHtml(storedJson, registry)

// browser
const { nabi, registry } = createNabiWith(wings().allBasic(), { doc: storedJson })
const surface = mountSurface({ nabi, registry, root: content, hydrate: true })
```

Server ও browser-এ একই document, একই ক্রমের wing declaration এবং HTML-প্রভাবিত একই option থাকতে হবে। server output content root-এর সরাসরি child হিসেবে অপরিবর্তিত বসান এবং root-এ আগে থেকে `contenteditable` দেবেন না। কাঠামো আলাদা হলে surface নতুন editor HTML render করে।

## Toolbar-ও pre-render করুন

`renderToolbarHtml()` ও `renderViewToolsHtml()` server-এ toolbar control pre-render করতে পারে। browser-এ mount করলে registry, locale ও group order মিললে control-গুলো wire হয়। toolbar root-এর ভেতরে ইচ্ছামতো host DOM সমর্থিত নয়।

SSR-এর সময় `injectSheets()`-এর মতো browser API ব্যবহার করবেন না। তৈরি করা `nabi-note/nabi.css` file link করুন বা CSS bundle-এ অন্তর্ভুক্ত করুন।
