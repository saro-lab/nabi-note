---
title: मूल उपयोग
description: browser में NABI NOTE editor बनाएँ, फिर उसके दस्तावेज़ save और restore करें।
---

# मूल उपयोग

यह guide browser के client-side rendered (CSR) editor को समझाती है: wings चुनें, editor और UI mount करें, फिर NABI TREE JSON save और restore करें।

## install और base markup

```bash
npm install nabi-note
```

editor और published content दोनों में एक stylesheet load करें। `contenteditable` स्वयं न जोड़ें; इसे `mountSurface()` संभालती है।

```ts
import 'nabi-note/nabi.css'
```

```html
<div class="nabi">
  <div id="toolbar" class="nabi-toolbar"></div>
  <div id="content" class="nabi-content"></div>
</div>
```

## editor mount करना

`allBasic()` ऐसी official wings चुनती है जिन्हें application-specific wiring नहीं चाहिए। upload, file storage या document diff जैसी service-connected wings उनके guides के अनुसार जोड़ें।

```ts
import { createNabiWith, mountSurface, mountToolbar, wings } from 'nabi-note'

const content = document.querySelector<HTMLElement>('#content')!
const toolbarRoot = document.querySelector<HTMLElement>('#toolbar')!

const { nabi, registry } = createNabiWith(wings().allBasic(), {
  locale: 'hi',
  onError: (error) => console.error(error),
  undoLimit: 200,
  typingMergeMs: 1000,
})

const surface = mountSurface({
  nabi,
  registry,
  root: content,
  locale: 'hi',
  placeholder: 'कुछ लिखें।',
})
const toolbar = mountToolbar({
  nabi,
  registry,
  root: toolbarRoot,
  surface: content,
  locale: 'hi',
})
```

`locale` toolbar और helper text नियंत्रित करती है; हर UI mount को समान value दें। `placeholder` केवल खाली editor में दिखता है। `onError` commands और callbacks की isolated failures लेता है। `undoLimit` undo entries की संख्या है, default 200। `typingMergeMs` लगातार typing को एक undo step में जोड़ने का interval है; हर insertion अलग रखने के लिए `0` दें।

हर editor को अपने अलग content और toolbar roots चाहिए। कई editors हों तो हर toolbar को `surface` से अपना editor surface दें, ताकि focus और shortcuts आपस में न मिलें।

## wings चुनना

केवल आवश्यक features रखने के लिए `use()` और `drop()` उपयोग करें। हर wing page उसके options बताती है।

```ts
const selected = wings()
  .allBasic()
  .drop('youtube')
  .use('upload')

const { nabi, registry } = createNabiWith(selected, { locale: 'hi' })
```

छोटे bundle के लिए केवल आवश्यक wings, जैसे `boldWing` और `imageWing`, array में दें। unknown names, invalid options और missing dependencies editor बनते ही fail होती हैं।

## save और load

दस्तावेज़ फिर edit होना हो तो `getJson()` output को NABI TREE JSON के रूप में save करें। `getHtml()` published output के लिए है। editor-only `getEditorHtml()` कभी save न करें।

```ts
const json = nabi.getJson()
await saveToServer(json)

const saved = await loadFromServer()
if (!nabi.setJson(saved)) showError('सहेजा हुआ दस्तावेज़ पढ़ा नहीं जा सका।')

const publishedHtml = nabi.getHtml()
```

external HTML import करने के लिए `setHtml()` उपयोग करें। browser editor अपना HTML parser देता है, इसलिए parser option नहीं चाहिए। invalid non-empty input पर `setJson()` और `setHtml()` `false` लौटाकर मौजूदा दस्तावेज़ नहीं बदलते।

```ts
nabi.setHtml('<p>आयात किया गया दस्तावेज़</p>')
```

JSON और HTML दोनों untrusted input हैं। NABI NOTE registered wings और allowed rules से उन्हें पढ़ता है, लेकिन यह upload authorization या service security policy की जगह नहीं लेता।

## सामान्य API

| काम | API |
| --- | --- |
| editor बनाना | `createNabiWith`, `wings` |
| surface और toolbar mount करना | `mountSurface`, `mountToolbar` |
| save और restore | `getJson`, `setJson`, `getHtml`, `setHtml` |
| changes देखना | `nabi.onChange(listener)` |
| undo और redo | `nabi.undo()`, `nabi.redo()` |
| server पर HTML render करना | `renderStoredHtml` from `nabi-note/ssr` |
| published-page behavior जोड़ना | `attachViewer` from `nabi-note/viewer` |
| documents compare करना | `diffDocs` from `nabi-note/diff` |

सटीक types और सभी arguments के लिए पहले installed package declarations देखें। automation tools [English API reference](https://nabi.saro.me/llms/api-reference.md) भी उपयोग कर सकते हैं।

## mounts हटाना

creation के उलटे क्रम में unmount करें। editing root का `innerHTML` सीधे न बदलें; `setJson()`, `setHtml()` या `applyCommand()` जैसे public API उपयोग करें।

```ts
function dispose() {
  toolbar.unmount()
  surface.unmount()
}
```
