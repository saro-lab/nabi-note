---
title: SSR அமைப்பு
description: சேமித்த NABI TREE ஆவணங்களைச் சேவையகத்தில் பாதுகாப்பாக HTML-ஆக உருவாக்கி, உலாவியில் திருத்தியை hydrate செய்யுங்கள்.
---

# SSR அமைப்பு

சேவையகத்தில் உலாவிக்கான surface அல்லது UI-யை அல்லாமல் `nabi-note/ssr`-ஐ மட்டும் import செய்யுங்கள். அது சேமித்த NABI TREE JSON-ஐச் சரிபார்த்து வெளியிடப்பட்ட HTML அல்லது hydrate செய்யக்கூடிய திருத்தி HTML-ஆக மாற்றுகிறது.

## வெளியிடப்பட்ட HTML-ஐ உருவாக்குதல்

```ts
import { makeRegistry, renderStoredHtml, wings } from 'nabi-note/ssr'

const registry = makeRegistry(wings().allBasic().build())
const html = renderStoredHtml(storedJson, registry)

if (html === null) throw new Error('சேமித்த ஆவணத்தைப் படிக்க முடியவில்லை.')
```

`renderStoredHtml()` அதன் JSON உள்ளீட்டைச் சரிபார்த்து இயல்பாக்கி, பின்னர் வெளியிடப்பட்ட HTML-ஐத் திருப்புகிறது. `null` என்பது நடப்பு registry-ஆல் அந்த உள்ளீட்டைப் படிக்க முடியாது என்பதாகும். வெளியிடப்பட்ட பக்கத்தில் package CSS-யையும் `.nabi-content`-ஐயும் சேர்க்கவும்.

```html
<link rel="stylesheet" href="/assets/nabi.css">
<article class="nabi-content">...</article>
```

ஊடாடும் அட்டவணை வரிசைப்படுத்தல் அல்லது code highlighting-க்கு மட்டுமே உலாவியில் `nabi-note/viewer`-இலிருந்து `attachViewer()`-ஐச் சேர்க்கவும். சாதாரண வெளியிடப்பட்ட உள்ளடக்கத்துக்கு CSS மட்டும் போதும்.

## முன்கூட்டியே உருவாக்கிய திருத்தி markup-ஐ hydrate செய்தல்

முதல் render-இலிருந்தே திருத்தியைக் காட்ட, சேவையகத்தில் `renderStoredEditorHtml()` மூலம் உருவாக்கி உலாவி surface-க்கு `hydrate: true`-ஐ வழங்குங்கள்.

```ts
// சேவையகம்
const initialEditorHtml = renderStoredEditorHtml(storedJson, registry)

// உலாவி
const { nabi, registry } = createNabiWith(wings().allBasic(), { doc: storedJson })
const surface = mountSurface({ nabi, registry, root: content, hydrate: true })
```

சேவையகமும் உலாவியும் ஒரே ஆவணத்தையும் ஒரே வரிசையில் உள்ள wing declaration-களையும் HTML-ஐப் பாதிக்கும் விருப்பங்களையும் பயன்படுத்த வேண்டும். சேவையக வெளியீட்டை உள்ளடக்க root-இன் நேரடி குழந்தைகளாக மாற்றமின்றி இடுங்கள்; அந்த root-இல் `contenteditable`-ஐ முன்கூட்டியே அமைக்காதீர்கள். அமைப்பு வேறுபட்டால் surface புதிய திருத்தி HTML-ஐ உருவாக்கும்.

## கருவிப்பட்டியையும் முன்கூட்டியே உருவாக்குதல்

`renderToolbarHtml()` மற்றும் `renderViewToolsHtml()` சேவையகத்தில் கருவிப்பட்டி controls-ஐ முன்கூட்டியே உருவாக்க முடியும். registry, மொழி மற்றும் குழு வரிசை பொருந்தினால் உலாவியில் mount செய்வது அந்த controls-க்கு செயல்பாட்டை இணைக்கும். கருவிப்பட்டி root-க்குள் விருப்பமான host DOM இடுவது ஆதரிக்கப்படாது.

SSR-இன் போது `injectSheets()` போன்ற உலாவி API-களைப் பயன்படுத்தாதீர்கள். உருவாக்கப்பட்ட `nabi-note/nabi.css` கோப்பை இணைக்கவும் அல்லது உங்கள் CSS bundle-இல் சேர்க்கவும்.
