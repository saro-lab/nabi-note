---
title: SSR سیٹ اپ
description: محفوظ شدہ NABI TREE دستاویزات کو سرور پر HTML میں محفوظ طور پر رینڈر کریں اور براؤزر میں ایڈیٹر hydrate کریں۔
---

# SSR سیٹ اپ

سرور پر براؤزر surfaces یا UI کے بجائے صرف `nabi-note/ssr` امپورٹ کریں۔ یہ محفوظ شدہ NABI TREE JSON کی توثیق کرتا ہے اور اسے شائع شدہ HTML یا hydrate ہونے والے ایڈیٹر HTML میں بدلتا ہے۔

## شائع شدہ HTML رینڈر کریں

```ts
import { makeRegistry, renderStoredHtml, wings } from 'nabi-note/ssr'

const registry = makeRegistry(wings().allBasic().build())
const html = renderStoredHtml(storedJson, registry)

if (html === null) throw new Error('The stored document could not be read.')
```

`renderStoredHtml()` اپنے JSON ان پٹ کی توثیق اور معمول بناتا ہے، پھر شائع شدہ HTML واپس کرتا ہے۔ `null` کا مطلب ہے کہ موجودہ registry اس ان پٹ کو نہیں پڑھ سکتی۔ شائع شدہ صفحے پر پیکیج CSS اور `.nabi-content` شامل کریں۔

```html
<link rel="stylesheet" href="/assets/nabi.css">
<article class="nabi-content">...</article>
```

براؤزر میں `nabi-note/viewer` سے `attachViewer()` صرف انٹرایکٹو جدول ترتیب یا کوڈ ہائی لائٹنگ کے لیے شامل کریں۔ سادہ شائع شدہ مواد کو صرف CSS درکار ہے۔

## پہلے سے رینڈر شدہ ایڈیٹر مارک اپ hydrate کریں

ایڈیٹر کو پہلے paint سے دکھانے کے لیے اسے سرور پر `renderStoredEditorHtml()` سے رینڈر کریں اور براؤزر surface کو `hydrate: true` دیں۔

```ts
// server
const initialEditorHtml = renderStoredEditorHtml(storedJson, registry)

// browser
const { nabi, registry } = createNabiWith(wings().allBasic(), { doc: storedJson })
const surface = mountSurface({ nabi, registry, root: content, hydrate: true })
```

سرور اور براؤزر کو ایک ہی دستاویز، ایک ہی ترتیب میں ونگ اعلانات، اور HTML کو متاثر کرنے والے اختیارات استعمال کرنے چاہییں۔ سرور آؤٹ پٹ کو بغیر تبدیلی کے content root کے براہ راست بچوں کے طور پر شامل کریں، اور اس root پر پہلے سے `contenteditable` مقرر نہ کریں۔ ساخت مختلف ہو تو surface نیا ایڈیٹر HTML رینڈر کرتا ہے۔

## ٹول بار بھی پہلے سے رینڈر کریں

`renderToolbarHtml()` اور `renderViewToolsHtml()` سرور پر ٹول بار controls پہلے سے رینڈر کر سکتے ہیں۔ براؤزر میں mount کرنے سے یہ controls اس وقت منسلک ہوتے ہیں جب registry، locale اور گروپ کی ترتیب یکساں ہو۔ ٹول بار root کے اندر من مانی host DOM کی سپورٹ نہیں ہے۔

SSR کے دوران `injectSheets()` جیسے براؤزر APIs استعمال نہ کریں۔ بنائی گئی `nabi-note/nabi.css` فائل کو لنک کریں یا اسے اپنے CSS بنڈل میں شامل کریں۔
