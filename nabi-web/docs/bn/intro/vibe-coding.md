---
title: AI ভাইব কোডিং
description: বর্তমান public API ও নথির সীমা ধরে NABI NOTE নির্ভুলভাবে ব্যবহার করতে coding agent-কে সাহায্য করুন।
---

# AI ভাইব কোডিং

NABI NOTE AI ও automation tool-এর জন্য [`llms.txt`](/llms.txt) দেয়। agent-কে পুরো library অনুমান করতে না বলে, এই সূচক থেকে শুরু করে কাজটির প্রয়োজনীয় নথিগুলোই পড়ান।

## শুরু করার prompt

প্রয়োজনীয় framework ও feature পূরণ করুন।

```text
Build an editor with NABI NOTE (nabi-note).
First read https://nabi.saro.me/llms.txt, then read only the documents needed for this task.

Environment: Vue 3 + TypeScript
Features: basic formatting, tables, images, and uploads
Stored source: NABI TREE JSON
Publishing: render stored JSON to HTML on the server

Use only public exports and APIs that exist in the installed types.
After implementation, run type checking and a build, then report changed files and verification results.
```

agent URL খুলতে না পারলে কথোপকথনে `llms.txt` ও প্রাসঙ্গিক linked document দিন।

## কেবল প্রয়োজনীয় বিষয় দেখান

`llms.txt` একটি সংক্ষিপ্ত index। সব নথি একসঙ্গে পাঠানোর চেয়ে agent-কে শুধু প্রাসঙ্গিক পৃষ্ঠা দেওয়া সাধারণত বেশি কাজে লাগে।

- npm assembly: [`quickstart-npm.md`](https://nabi.saro.me/llms/quickstart-npm.md)
- CDN setup: [`quickstart-cdn.md`](https://nabi.saro.me/llms/quickstart-cdn.md)
- wing selection: [`wings.md`](https://nabi.saro.me/llms/wings.md)
- stored JSON, HTML, and change events: [`document-model.md`](https://nabi.saro.me/llms/document-model.md)
- HTML import, paste, and upload boundaries: [`io-security.md`](https://nabi.saro.me/llms/io-security.md)
- custom wings and server rendering: [`custom-wing.md`](https://nabi.saro.me/llms/custom-wing.md), [`ssr.md`](https://nabi.saro.me/llms/ssr.md)
- viewer, diff, styles, and drop caps: [`viewer-diff.md`](https://nabi.saro.me/llms/viewer-diff.md), [`styling.md`](https://nabi.saro.me/llms/styling.md)
- exact imports and types: [`api-reference.md`](https://nabi.saro.me/llms/api-reference.md)

## পণ্যের চাহিদা অন্তর্ভুক্ত করুন

agent কেবল editing screen দেখে storage, security policy বা upload behavior বুঝতে পারে না। বাস্তব framework, কোন wing আছে ও নেই, JSON এবং HTML দুটোই রাখা হয় কি না, upload endpoint-এর request ও response contract, file limit, এবং published page-এ SSR, viewer behavior বা diffing দরকার কি না বলুন।

এখনও ঠিক না হওয়া বিষয়ে সিদ্ধান্ত নেওয়ার আগে agent-কে বিকল্প ও তার প্রভাব ব্যাখ্যা করতে বলুন।

## ফলাফল পর্যালোচনা করুন

অন্য কোডের মতো generated code-ও review করুন। বিশেষ করে নিশ্চিত করুন যে এটি:

- editing ও published content দুটির জন্যই `nabi-note/nabi.css` লোড করে;
- নির্বাচিত wing ও প্রতিটি mount-এর জন্য একই `registry` ব্যবহার করে;
- `getJson()` রাখে, কখনও `getEditorHtml()` নয়;
- editing `.nabi-content` element-এর `innerHTML` সরাসরি লেখে না;
- screen বন্ধ হলে প্রতিটি mount unmount করে;
- upload server-এ MIME type, size, authorization ও storage location যাচাই করে;
- server ও browser-এ মিলিত wing order ও HTML-প্রভাবিত option ব্যবহার করে;
- type checking, test ও build দিয়ে প্রকৃত export name নিশ্চিত করে।

পাতাটি একবার কাজ করছে মনে হলেও IME ও caret behavior এবং save-and-load path বাস্তবে যাচাই করতে হয়। saved document restore করার সঙ্গে mobile-এ composition input-ও পরীক্ষা করুন।

## ইনস্টল করা সংস্করণকে অগ্রাধিকার দিন

কোনো project-এ `nabi-note` আগে থেকেই install করা থাকলে, অন্য release-এর website-এর চেয়ে তার `package.json` export ও type declaration-ই বেশি প্রাসঙ্গিক। কোড লেখার আগে agent-কে সেই version difference দেখতে বলুন।
