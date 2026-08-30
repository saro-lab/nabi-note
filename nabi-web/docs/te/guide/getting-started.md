---
title: ప్రాథమిక వినియోగం
description: బ్రౌజర్ ఆధారిత NABI NOTE ఎడిటర్‌ను నిర్మించి, దాని పత్రాలను భద్రపరచి పునరుద్ధరించండి.
---

# ప్రాథమిక వినియోగం

ఈ మార్గదర్శిని బ్రౌజర్‌లో క్లయింట్-సైడ్ రెండర్ అయ్యే (CSR) ఎడిటర్‌ను వివరిస్తుంది: వింగ్స్‌ను ఎంచుకోండి, ఎడిటర్, UIని మౌంట్ చేయండి, ఆపై NABI TREE JSONని భద్రపరచి పునరుద్ధరించండి.

## ఇన్‌స్టాల్ చేసి ప్రాథమిక మార్కప్‌ను చేర్చండి

```bash
npm install nabi-note
```

ఎడిటర్, ప్రచురిత కంటెంట్ రెండింటికీ ఒకే స్టైల్‌షీట్‌ను లోడ్ చేయండి. `contenteditable`ను మీరే చేర్చవద్దు; దాన్ని `mountSurface()` నిర్వహిస్తుంది.

```ts
import 'nabi-note/nabi.css'
```

```html
<div class="nabi">
  <div id="toolbar" class="nabi-toolbar"></div>
  <div id="content" class="nabi-content"></div>
</div>
```

## ఎడిటర్‌ను మౌంట్ చేయండి

`allBasic()` అప్లికేషన్-ప్రత్యేక కనెక్షన్ లేకుండా పనిచేసే అధికారిక వింగ్స్‌ను ఎంచుతుంది. అప్‌లోడ్, ఫైల్ నిల్వ, పత్ర తేడాల వంటి సేవ-అనుసంధాన వింగ్స్‌ను వాటి ప్రత్యేక మార్గదర్శినిలో చెప్పినట్లు చేర్చండి.

```ts
import { createNabiWith, mountSurface, mountToolbar, wings } from 'nabi-note'

const content = document.querySelector<HTMLElement>('#content')!
const toolbarRoot = document.querySelector<HTMLElement>('#toolbar')!

const { nabi, registry } = createNabiWith(wings().allBasic(), {
  locale: 'te',
  onError: (error) => console.error(error),
  undoLimit: 200,
  typingMergeMs: 1000,
})

const surface = mountSurface({
  nabi,
  registry,
  root: content,
  locale: 'te',
  placeholder: 'ఏదైనా రాయండి.',
})
const toolbar = mountToolbar({
  nabi,
  registry,
  root: toolbarRoot,
  surface: content,
  locale: 'te',
})
```

`locale` టూల్‌బార్, సహాయక వచనాన్ని నియంత్రిస్తుంది; ప్రతి UI మౌంట్‌కు ఒకే విలువ ఇవ్వండి. `placeholder` ఖాళీ ఎడిటర్‌లోనే కనిపిస్తుంది. `onError` ఆదేశాలు, కాల్‌బ్యాక్‌ల నుంచి వేరుచేసిన వైఫల్యాలను అందుకుంటుంది. `undoLimit` అనేది అన్‌డూ ఎంట్రీల సంఖ్య (డిఫాల్ట్ 200). `typingMergeMs` వరుస టైపింగ్‌ను ఒక అన్‌డూ దశగా కలిపే విరామం; ప్రతి చొప్పింపును వేరుగా ఉంచడానికి `0` ఇవ్వండి.

ప్రతి ఎడిటర్‌కు ఒకదానితో ఒకటి మిళితం కాని స్వంత కంటెంట్, టూల్‌బార్ రూట్‌లు అవసరం. పేజీలో అనేక ఎడిటర్‌లు ఉంటే, ఫోకస్, షార్ట్‌కట్‌లు కలవకుండా ప్రతి టూల్‌బార్‌కు `surface` ద్వారా దాని స్వంత ఎడిటర్ సర్ఫేస్ ఇవ్వండి.

## వింగ్స్‌ను ఎంచుకోండి

మీకు అవసరమైన ఫీచర్‌లను మాత్రమే ఉంచడానికి `use()`, `drop()` వాడండి. ప్రతి వింగ్ పేజీ అది స్వీకరించే ఎంపికలను వివరిస్తుంది.

```ts
const selected = wings()
  .allBasic()
  .drop('youtube')
  .use('upload')

const { nabi, registry } = createNabiWith(selected, { locale: 'te' })
```

చిన్న బండిల్ కోసం `boldWing`, `imageWing` వంటి అవసరమైన వింగ్స్‌ను మాత్రమే అర్రేగా ఇవ్వండి. తెలియని పేర్లు, చెల్లని ఎంపికలు, లేని ఆధారాలు ఎడిటర్ సృష్టించే సమయంలోనే విఫలమవుతాయి.

## భద్రపరచి లోడ్ చేయండి

పత్రాన్ని మళ్లీ సవరించాలంటే `getJson()` అవుట్‌పుట్‌ను NABI TREE JSONగా భద్రపరచండి. `getHtml()` ప్రచురిత అవుట్‌పుట్ కోసం. ఎడిటర్‌కే పరిమితమైన `getEditorHtml()` ఫలితాన్ని ఎప్పుడూ నిల్వ చేయవద్దు.

```ts
const json = nabi.getJson()
await saveToServer(json)

const saved = await loadFromServer()
if (!nabi.setJson(saved)) showError('భద్రపరిచిన పత్రాన్ని చదవలేకపోయాం.')

const publishedHtml = nabi.getHtml()
```

బయటి HTMLను దిగుమతి చేయడానికి `setHtml()` వాడండి. బ్రౌజర్ ఎడిటర్ ఇప్పటికే తన HTML పార్సర్‌ను అందిస్తుంది కాబట్టి పార్సర్ ఎంపిక అవసరం లేదు. చెల్లని ఖాళీ కాని ఇన్‌పుట్‌కు `setJson()`, `setHtml()` `false`ను ఇచ్చి ప్రస్తుత పత్రాన్ని మార్చవు.

```ts
nabi.setHtml('<p>దిగుమతి చేసిన పత్రం</p>')
```

JSON, HTML రెండూ నమ్మలేని ఇన్‌పుట్‌లు. NABI NOTE వాటిని నమోదైన వింగ్స్, వాటి అనుమతించిన నియమాల ద్వారా చదువుతుంది; కానీ ఇది అప్‌లోడ్ అనుమతి లేదా మీ సేవ భద్రతా విధానానికి ప్రత్యామ్నాయం కాదు.

## సాధారణ APIలు

| పని | API |
| --- | --- |
| ఎడిటర్ సృష్టించండి | `createNabiWith`, `wings` |
| సర్ఫేస్, టూల్‌బార్‌ను మౌంట్ చేయండి | `mountSurface`, `mountToolbar` |
| భద్రపరచి పునరుద్ధరించండి | `getJson`, `setJson`, `getHtml`, `setHtml` |
| మార్పులను గమనించండి | `nabi.onChange(listener)` |
| అన్‌డూ, రీడూ | `nabi.undo()`, `nabi.redo()` |
| సర్వర్‌లో HTML రెండర్ చేయండి | `nabi-note/ssr`లోని `renderStoredHtml` |
| ప్రచురిత పేజీ ప్రవర్తనను చేర్చండి | `nabi-note/viewer`లోని `attachViewer` |
| పత్రాలను పోల్చండి | `nabi-note/diff`లోని `diffDocs` |

ఖచ్చితమైన రకాలు, ప్రతి ఆర్గుమెంట్ కోసం ముందుగా ఇన్‌స్టాల్ చేసిన ప్యాకేజీ డిక్లరేషన్‌లను చూడండి. ఆటోమేషన్ సాధనాలు [ఇంగ్లీష్ API సూచన](https://nabi.saro.me/llms/api-reference.md)ను కూడా వాడవచ్చు.

## మౌంట్‌లను తొలగించండి

సృష్టించిన క్రమానికి విరుద్ధంగా అన్‌మౌంట్ చేయండి. సవరణ రూట్‌లోని `innerHTML`ను నేరుగా మార్చవద్దు; `setJson()`, `setHtml()`, `applyCommand()` వంటి పబ్లిక్ APIల ద్వారా పత్రాలను మార్చండి.

```ts
function dispose() {
  toolbar.unmount()
  surface.unmount()
}
```
