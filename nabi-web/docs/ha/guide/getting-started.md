---
title: Asalin amfani
description: Hanyar asali ta hada editan NABI NOTE a burauza, da adanawa da dawo da shi.
---

# Asalin amfani

Wannan takarda tana bayani ne bisa editan CSR da ke aiki a burauza. Zaɓi fuka-fukan da za a yi amfani da su, haɗa editan da allon, sannan ajiye NABI TREE JSON a sake loda shi.

## Shigarwa da asalin HTML

```bash
npm install nabi-note
```

Ana loda CSS iri ɗaya ga edita da allon wallafa. Kada ka ƙara `contenteditable` da hannu a yankin gyara. `mountSurface()` ne yake sarrafa shi.

```ts
import 'nabi-note/nabi.css'
```

```html
<div class="nabi">
  <div id="toolbar" class="nabi-toolbar"></div>
  <div id="content" class="nabi-content"></div>
</div>
```

## Haɗa edita

`allBasic()` yana zaɓar fuka-fukan hukuma da za a iya amfani da su ba tare da haɗin sabar dabam ba. Ƙara fuka-fukan da ke buƙatar haɗin sabis, kamar lodawa, ajiye da buɗe fayil, ko kwatanta canje-canje, kamar yadda takardar wannan fuka-fuki ta bayyana.

```ts
import {
  createNabiWith,
  mountSurface,
  mountToolbar,
  wings,
} from 'nabi-note'

const content = document.querySelector<HTMLElement>('#content')!
const toolbarRoot = document.querySelector<HTMLElement>('#toolbar')!

const { nabi, registry } = createNabiWith(wings().allBasic(), {
  locale: 'ha',
  onError: (error) => console.error(error),
  undoLimit: 200,
  typingMergeMs: 1000,
})

const surface = mountSurface({
  nabi,
  registry,
  root: content,
  locale: 'ha',
  placeholder: 'Shigar da abun ciki.',
})
const toolbar = mountToolbar({
  nabi,
  registry,
  root: toolbarRoot,
  surface: content,
  locale: 'ha',
})
```

`locale` shi ne harshen sandar kayan aiki da saƙonnin jagora. A ba dukkan sassan allo ƙima iri ɗaya. `placeholder` saƙon da zai bayyana ne a editan da babu komai; idan kirtani fanko ne, yana ɓoye. `onError` yana karɓar kurakuran da aka ware daga umarni ko callbacks. `undoLimit` yawan sauye-sauyen da za a iya soke ne, kuma tsohuwar ƙimarsa 200 ce. `typingMergeMs` lokaci ne na haɗa rubutu a jere zuwa soke guda; idan `0` ne, ana raba kowace harafi.

Yi amfani da tushen abun ciki da na sandar kayan aiki da ba sa haɗuwa ga kowane edita. Ko a allo mai editoci da yawa, a ba `surface` na toolbar yankin gyara nasa domin gajerun hanyoyi da focus kada su gauraya.

## Zaɓar fuka-fuki

Idan kana son haɗa ayyukan da ake bukata kawai, yi amfani da `use()` da `drop()`. Duba takardar gabatarwar kowace fuka-fuki don zaɓuɓɓukan da take karɓa.

```ts
const selected = wings()
  .allBasic()
  .drop('youtube')
  .use('upload')

const { nabi, registry } = createNabiWith(selected, { locale: 'ha' })
```

Idan kana bukatar ƙaramin bundle, za ka iya ba da fuka-fuki da ake bukata kawai, kamar `boldWing` da `imageWing`, a matsayin array. Sunan da babu shi, zaɓi mara inganci, ko dependency da ya yanke yana haifar da kuskure nan take yayin ƙirƙirar edita.

## Adanawa da lodawa

Adana NABI TREE JSON da aka karɓa daga `getJson()` idan za a sake gyara takarda. `getHtml()` sakamakon wallafawa ne. Kada a adana `getEditorHtml()` wanda na allon gyara kaɗai ne.

```ts
const json = nabi.getJson()
await saveToServer(json)

const saved = await loadFromServer()
if (!nabi.setJson(saved)) {
  showError('Ba a iya karanta takardar da aka adana ba.')
}

const publishedHtml = nabi.getHtml()
```

Yi amfani da `setHtml()` wajen shigo da HTML na waje. Editan burauza yana haɗa HTML parser kai tsaye, don haka babu buƙatar zaɓin parser dabam. `setJson()` da `setHtml()` suna dawo da `false` idan input marar fanko ba shi da inganci kuma suna barin takardar yanzu yadda take.

```ts
nabi.setHtml('<p>Takardar da aka shigo da ita</p>')
```

JSON da HTML duk input ne da ba a amince da su ba. Ana karanta su ta fuka-fuki da dokokin izini da aka yi rajista, amma hakan ba ya maye gurbin binciken izinin lodawa ko manufofin tsaro na sabis.

## API da ake yawan amfani da su

| Aiki | API |
| --- | --- |
| Haɗa edita | `createNabiWith`, `wings` |
| Haɗa allon gyara da toolbar | `mountSurface`, `mountToolbar` |
| Adanawa da dawo da takarda | `getJson`, `setJson`, `getHtml`, `setHtml` |
| Gano canje-canje | `nabi.onChange(listener)` |
| Soke da maimaitawa | `nabi.undo()`, `nabi.redo()` |
| Yin HTML a sabar | `renderStoredHtml` daga `nabi-note/ssr` |
| Ayyukan allon wallafa | `attachViewer` daga `nabi-note/viewer` |
| Kwatanta takardu | `diffDocs` daga `nabi-note/diff` |

Da farko a duba type declarations na package da aka shigar don ainihin types da cikakkun arguments. Kayan aikin sarrafa kansa kuma suna da [English API reference](https://nabi.saro.me/llms/api-reference.md).

## Lokacin rufe allo

A cire sassan da aka mount a sabanin tsarin da aka ƙirƙire su. Kada ka canza `innerHTML` na yankin gyara kai tsaye; yi amfani da API na jama'a kamar `setJson()`, `setHtml()`, ko `applyCommand()` wajen canza takarda.

```ts
function dispose() {
  toolbar.unmount()
  surface.unmount()
}
```
