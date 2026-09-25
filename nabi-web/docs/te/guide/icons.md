---
title: "ఐకాన్ థీమ్‌లు"
description: "CSS వేరియబుల్స్‌తో వింగ్, మునుజూపు, పూర్తి తెర, ప్యానెల్, పోలిక, పట్టిక క్రమీకరణ ఐకాన్‌లను మార్చండి. SVG, WebP, PNGలను కలిపి వాడవచ్చు; పేర్కొనని ఐకాన్‌లు డిఫాల్ట్ ఫైల్‌లను వాడతాయి."
---

# ఐకాన్ థీమ్‌లు

CSS వేరియబుల్స్‌తో వింగ్, మునుజూపు, పూర్తి తెర, ప్యానెల్, పోలిక, పట్టిక క్రమీకరణ ఐకాన్‌లను మార్చండి. SVG, WebP, PNGలను కలిపి వాడవచ్చు; పేర్కొనని ఐకాన్‌లు డిఫాల్ట్ ఫైల్‌లను వాడతాయి.

## ఫైల్‌లను ఎంచుకోవడం

CSSను లోడ్ చేసి ఎడిటర్‌కు లేదా ఉమ్మడి పేరెంట్‌కు థీమ్ క్లాస్ జోడించండి. చిత్రాల అసలు రంగులు, పారదర్శకత, నిష్పత్తి అలాగే ఉంటాయి.

```ts
import 'nabi-note/nabi.css'
```

```html
<div class="nabi paper-note">...</div>
```

```css
.paper-note {
  --nabi-icon-toolbar-b: url("/icons/bold.svg");
  --nabi-icon-view-preview: url("/icons/preview.webp");
  --nabi-icon-view-fullscreen-enter: url("/icons/expand.svg");
  --nabi-icon-view-fullscreen-exit: url("/icons/shrink.webp");
  --nabi-icon-panel-preview-close: url("/icons/close.svg");
}
.paper-note[data-nabi-theme="dark"] {
  --nabi-icon-view-preview: url("/icons/preview-dark.webp");
}
```

`/icons/...` వంటి రూట్ నుంచి మొదలయ్యే పాత్‌లు లేదా పూర్తి HTTPS URLలను వాడండి. సాపేక్ష పాత్‌లు థీమ్ ఫైల్ పక్కనుంచి పరిష్కారమవుతాయని హామీ లేదు. CSSను మీరే హోస్ట్ చేస్తే అదే వెర్షన్ `dist/icons/`ను `nabi.css` పక్కన కాపీ చేయండి. చిత్రం లోడ్ కాకపోతే ఐకాన్ ఖాళీగా ఉంటుంది, కానీ బటన్ పేరు, టూల్‌టిప్, చర్య అందుబాటులో ఉంటాయి.

## ఇతర ఐకాన్‌లను కనుగొనడం

ఐకాన్ ఎలిమెంట్ `data-nabi-icon` విలువకు ముందు `--nabi-icon-` పెడితే CSS వేరియబుల్ వస్తుంది. ఉదాహరణకు `diff-close` కోసం `--nabi-icon-diff-close` వాడాలి. సందర్భం, మెనూ, సేవ్, చరిత్ర తదితర కీ నియమాలు, ప్రత్యేక అక్షరాల ఎన్‌కోడింగ్ కోసం <a href="/llms/icons.md" target="_blank" rel="noopener">ఐకాన్ ఒప్పందం</a> చూడండి.

## డార్క్ మోడ్ మరియు ప్యానెల్‌లు

థీమ్ క్లాస్ లేదా CSS వేరియబుల్ మార్చితే మళ్లీ mount చేయకుండానే ఐకాన్‌లు మారతాయి. డిఫాల్ట్ ఐకాన్‌లు లైట్/డార్క్ థీమ్‌ను అనుసరిస్తాయి. సొంత ఫైల్‌లు `currentColor`ను వారసత్వంగా పొందవు; అవసరమైతే పై ఉదాహరణలా డార్క్ ఫైల్‌లను ఇవ్వండి. `body` కింద తెరిచే ప్యానెల్‌లు కూడా మూల ఎడిటర్ ఐకాన్ థీమ్, క్లాస్/స్టైల్ మార్పులను అనుసరిస్తాయి. వేరియబుల్స్‌ను టూల్‌బార్ లోపల మాత్రమే కాకుండా ఎడిటర్ లేదా ఉమ్మడి పేరెంట్‌పై ఉంచండి.

## డిఫాల్ట్ బటన్‌ల ప్రదర్శన

`showPreview`, `showFullscreen` రెండింటి డిఫాల్ట్ `true`. `false` చేస్తే ఆ బటన్, దాని ఫోకస్ లక్ష్యం, ఈవెంట్‌లు తొలగిపోతాయి. రెండూ `false` అయితే ఖాళీ టూల్స్ ప్రాంతం కూడా ఏర్పడదు.

```ts
import { mountViewTools, renderViewToolsHtml } from 'nabi-note'

const visibility = { showPreview: false, showFullscreen: true }
const toolsHtml = renderViewToolsHtml({ locale: 'en', ...visibility })
const tools = mountViewTools({
  nabi, surface, root, container, locale: 'en', ...visibility,
})
```

SSR, mountలకు ఒకే ప్రదర్శన ఎంపికలను ఇవ్వండి. అమరిక మార్చడానికి `tools.unmount()` పిలిచి కొత్త ఎంపికలతో mount చేయండి. రెండు బటన్‌లు అవసరం లేకపోతే టూల్స్ mount, SSR మార్కప్‌ను పూర్తిగా వదిలేయవచ్చు. `openPreview()`, `setFullscreen()`లను నేరుగా పిలిచే సదుపాయం అలాగే ఉంటుంది.
