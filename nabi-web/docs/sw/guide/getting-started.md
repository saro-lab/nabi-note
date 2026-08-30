---
title: Matumizi ya msingi
description: Unda kihariri cha NABI NOTE kinachofanya kazi kwenye kivinjari, kisha hifadhi na urejeshe hati zake.
---

# Matumizi ya msingi

Mwongozo huu unaeleza kihariri cha client-side rendered (CSR) kwenye kivinjari: chagua wings, mount kihariri na UI yake, halafu hifadhi na urejeshe NABI TREE JSON.

## Sakinisha na uongeze markup ya msingi

```bash
npm install nabi-note
```

Pakia stylesheet ileile kwa kihariri na maudhui yaliyochapishwa. Usiweke `contenteditable` mwenyewe; `mountSurface()` ndiyo huimiliki.

```ts
import 'nabi-note/nabi.css'
```

```html
<div class="nabi">
  <div id="toolbar" class="nabi-toolbar"></div>
  <div id="content" class="nabi-content"></div>
</div>
```

## Mount kihariri

`allBasic()` huchagua wings rasmi zinazofanya kazi bila muunganisho maalumu wa programu. Ongeza wings zinazounganishwa na huduma, kama upload, uhifadhi wa faili, au document diffing, kama inavyoelezwa katika miongozo yake binafsi.

```ts
import { createNabiWith, mountSurface, mountToolbar, wings } from 'nabi-note'

const content = document.querySelector<HTMLElement>('#content')!
const toolbarRoot = document.querySelector<HTMLElement>('#toolbar')!

const { nabi, registry } = createNabiWith(wings().allBasic(), {
  locale: 'sw',
  onError: (error) => console.error(error),
  undoLimit: 200,
  typingMergeMs: 1000,
})

const surface = mountSurface({
  nabi,
  registry,
  root: content,
  locale: 'sw',
  placeholder: 'Andika kitu.',
})
const toolbar = mountToolbar({
  nabi,
  registry,
  root: toolbarRoot,
  surface: content,
  locale: 'sw',
})
```

`locale` hudhibiti maandishi ya toolbar na usaidizi; pitisha thamani ileile kwa kila UI mount. `placeholder` huonyeshwa kwa kihariri tupu pekee. `onError` hupokea makosa yaliyotengwa kutoka commands na callbacks. `undoLimit` ni idadi ya hatua za kutendua (chaguomsingi 200). `typingMergeMs` ni muda unaounganisha uandishi unaofuatana kuwa hatua moja ya kutendua; weka `0` ili kila uingizaji ubaki tofauti.

Kila kihariri kinahitaji content na toolbar roots zake zisizopishana. Kwenye ukurasa wenye vihariri kadhaa, pitisha eneo lake la kuhariri kwa kila toolbar kupitia `surface` ili focus na shortcuts zisichanganyike.

## Chagua wings

Tumia `use()` na `drop()` kubakiza vipengele unavyohitaji tu. Kila ukurasa wa wing hueleza options inazokubali.

```ts
const selected = wings()
  .allBasic()
  .drop('youtube')
  .use('upload')

const { nabi, registry } = createNabiWith(selected, { locale: 'sw' })
```

Kwa bundle ndogo, pitisha wings zinazohitajika tu, kama `boldWing` na `imageWing`, katika array. Majina yasiyojulikana, options batili, na dependencies zinazokosekana hushindwa mara moja kihariri kinapoundwa.

## Hifadhi na pakia

Hifadhi output ya `getJson()` kama NABI TREE JSON wakati hati itahaririwa tena. `getHtml()` ni ya output ya kuchapishwa. Usihifadhi kamwe matokeo ya kihariri pekee ya `getEditorHtml()`.

```ts
const json = nabi.getJson()
await saveToServer(json)

const saved = await loadFromServer()
if (!nabi.setJson(saved)) showError('Hati iliyohifadhiwa haikuweza kusomwa.')

const publishedHtml = nabi.getHtml()
```

Tumia `setHtml()` kuingiza HTML ya nje. Kihariri cha kivinjari tayari hutoa HTML parser yake, hivyo hakuna parser option inayohitajika. `setJson()` na `setHtml()` hurejesha `false` kwa ingizo batili lisilo tupu na huacha hati ya sasa bila kuguswa.

```ts
nabi.setHtml('<p>Hati iliyoingizwa</p>')
```

JSON na HTML zote ni ingizo lisiloaminika. NABI NOTE huzisoma kupitia wings zilizosajiliwa na sheria zake zinazoruhusiwa, lakini hilo halichukui nafasi ya ruhusa ya upload au sera ya usalama ya huduma yako.

## API zinazotumika mara nyingi

| Kazi | API |
| --- | --- |
| Unda kihariri | `createNabiWith`, `wings` |
| Mount surface na toolbar | `mountSurface`, `mountToolbar` |
| Hifadhi na urejeshe | `getJson`, `setJson`, `getHtml`, `setHtml` |
| Fuatilia mabadiliko | `nabi.onChange(listener)` |
| Tendua na rudia | `nabi.undo()`, `nabi.redo()` |
| Render HTML kwenye seva | `renderStoredHtml` kutoka `nabi-note/ssr` |
| Ongeza tabia ya ukurasa uliochapishwa | `attachViewer` kutoka `nabi-note/viewer` |
| Linganisha hati | `diffDocs` kutoka `nabi-note/diff` |

Kwa types sahihi na kila argument, angalia kwanza declarations za kifurushi kilichosakinishwa. Zana za automation zinaweza pia kutumia [English API reference](https://nabi.saro.me/llms/api-reference.md).

## Ondoa mounts

Fanya unmount kwa mpangilio wa kinyume wa uundaji. Usibadilishe moja kwa moja `innerHTML` ya editing root; badilisha hati kupitia API za umma kama `setJson()`, `setHtml()`, au `applyCommand()`.

```ts
function dispose() {
  toolbar.unmount()
  surface.unmount()
}
```
