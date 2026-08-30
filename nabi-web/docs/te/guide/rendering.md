---
title: SSR అమరిక
description: సర్వర్‌లో నిల్వ చేసిన NABI TREE పత్రాలను సురక్షితంగా HTMLగా రెండర్ చేసి, బ్రౌజర్‌లో ఎడిటర్‌ను హైడ్రేట్ చేయండి.
---

# SSR అమరిక

సర్వర్‌లో బ్రౌజర్ సర్ఫేస్‌లు లేదా UIని కాకుండా `nabi-note/ssr`ను మాత్రమే దిగుమతి చేయండి. ఇది నిల్వ చేసిన NABI TREE JSONని ధృవీకరించి ప్రచురిత HTMLగా లేదా హైడ్రేట్ చేయగల ఎడిటర్ HTMLగా మారుస్తుంది.

## ప్రచురిత HTMLను రెండర్ చేయండి

```ts
import { makeRegistry, renderStoredHtml, wings } from 'nabi-note/ssr'

const registry = makeRegistry(wings().allBasic().build())
const html = renderStoredHtml(storedJson, registry)

if (html === null) throw new Error('The stored document could not be read.')
```

`renderStoredHtml()` తన JSON ఇన్‌పుట్‌ను ధృవీకరించి సాధారణీకరించి, ప్రచురిత HTMLను ఇస్తుంది. `null` అంటే ప్రస్తుత రిజిస్ట్రీ ఆ ఇన్‌పుట్‌ను చదవలేదని అర్థం. ప్రచురిత పేజీలో ప్యాకేజీ CSS, `.nabi-content`ను చేర్చండి.

```html
<link rel="stylesheet" href="/assets/nabi.css">
<article class="nabi-content">...</article>
```

ఇంటరాక్టివ్ పట్టిక క్రమీకరణ లేదా కోడ్ హైలైటింగ్‌కు మాత్రమే బ్రౌజర్‌లో `nabi-note/viewer`లోని `attachViewer()`ను చేర్చండి. సాధారణ ప్రచురిత కంటెంట్‌కు CSS మాత్రమే చాలు.

## ముందే రెండర్ చేసిన ఎడిటర్ మార్కప్‌ను హైడ్రేట్ చేయండి

మొదటి పెయింట్ నుంచే ఎడిటర్ కనిపించాలంటే సర్వర్‌లో `renderStoredEditorHtml()`తో రెండర్ చేసి, బ్రౌజర్ సర్ఫేస్‌కు `hydrate: true` ఇవ్వండి.

```ts
// server
const initialEditorHtml = renderStoredEditorHtml(storedJson, registry)

// browser
const { nabi, registry } = createNabiWith(wings().allBasic(), { doc: storedJson })
const surface = mountSurface({ nabi, registry, root: content, hydrate: true })
```

సర్వర్, బ్రౌజర్ ఒకే పత్రం, ఒకే క్రమంలోని వింగ్ డిక్లరేషన్‌లు, HTMLను ప్రభావితం చేసే ఒకే ఎంపికలను వాడాలి. సర్వర్ అవుట్‌పుట్‌ను మార్పుల్లేకుండా కంటెంట్ రూట్‌కు నేరుగా పిల్లలుగా చేర్చి, ఆ రూట్‌లో `contenteditable`ను ముందే సెట్ చేయవద్దు. నిర్మాణం వేరైతే సర్ఫేస్ కొత్త ఎడిటర్ HTMLను రెండర్ చేస్తుంది.

## టూల్‌బార్‌ను కూడా ముందే రెండర్ చేయండి

`renderToolbarHtml()`, `renderViewToolsHtml()` సర్వర్‌లో టూల్‌బార్ నియంత్రణలను ముందే రెండర్ చేయగలవు. రిజిస్ట్రీ, లోకేల్, సమూహ క్రమం సరిపోతే బ్రౌజర్‌లో మౌంట్ చేయడం ఆ నియంత్రణలను కలుపుతుంది. టూల్‌బార్ రూట్‌లో ఏకపక్ష హోస్ట్ DOMకు మద్దతు లేదు.

SSR సమయంలో `injectSheets()` వంటి బ్రౌజర్ APIలను వాడవద్దు. నిర్మించిన `nabi-note/nabi.css` ఫైల్‌కు లింక్ ఇవ్వండి లేదా మీ CSS బండిల్‌లో చేర్చండి.
