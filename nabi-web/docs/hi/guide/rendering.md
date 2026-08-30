---
title: SSR सेटअप
description: सहेजे NABI TREE दस्तावेज़ों को server पर सुरक्षित HTML में render करके browser में editor hydrate करें।
---

# SSR सेटअप

server पर केवल `nabi-note/ssr` import करें, browser surfaces या UI नहीं। यह सहेजे NABI TREE JSON को validate करके प्रकाशित HTML या hydratable editor HTML बनाता है।

## प्रकाशित HTML render करना

```ts
import { makeRegistry, renderStoredHtml, wings } from 'nabi-note/ssr'

const registry = makeRegistry(wings().allBasic().build())
const html = renderStoredHtml(storedJson, registry)

if (html === null) throw new Error('सहेजा हुआ दस्तावेज़ पढ़ा नहीं जा सका।')
```

`renderStoredHtml()` JSON input को validate और normalize करके प्रकाशित HTML लौटाता है। `null` का अर्थ है कि मौजूदा registry उस input को नहीं पढ़ सकती। प्रकाशित पृष्ठ पर package CSS और `.nabi-content` शामिल करें।

```html
<link rel="stylesheet" href="/assets/nabi.css">
<article class="nabi-content">...</article>
```

browser में `nabi-note/viewer` का `attachViewer()` केवल interactive table sorting या code highlighting के लिए जोड़ें। सामान्य प्रकाशित सामग्री को केवल CSS चाहिए।

## पहले से render हुई editor markup को hydrate करना

पहले paint से editor दिखाने के लिए server पर `renderStoredEditorHtml()` से render करें और browser surface को `hydrate: true` दें।

```ts
// server
const initialEditorHtml = renderStoredEditorHtml(storedJson, registry)

// browser
const { nabi, registry } = createNabiWith(wings().allBasic(), { doc: storedJson })
const surface = mountSurface({ nabi, registry, root: content, hydrate: true })
```

server और browser को समान दस्तावेज़, समान क्रम की wing declarations और HTML पर असर डालने वाले समान options उपयोग करने चाहिए। server output को बिना बदले content root के सीधे children की तरह रखें और उस root पर पहले से `contenteditable` न लगाएँ। संरचना अलग हो तो surface नया editor HTML render करती है।

## टूलबार भी पहले render करना

`renderToolbarHtml()` और `renderViewToolsHtml()` server पर toolbar controls पहले render कर सकते हैं। registry, locale और group order मिलने पर browser mount उन्हें जोड़ता है। toolbar root के भीतर मनमाना host DOM समर्थित नहीं है।

SSR में `injectSheets()` जैसे browser API उपयोग न करें। built `nabi-note/nabi.css` file link करें या अपने CSS bundle में शामिल करें।
