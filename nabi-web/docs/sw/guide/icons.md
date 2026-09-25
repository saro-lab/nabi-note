---
title: "Mandhari ya aikoni"
description: "Tumia vigeu vya CSS kubadilisha aikoni za wing, onyesho la awali, skrini nzima, paneli, ulinganisho na upangaji wa jedwali. SVG, WebP na PNG zinaweza kuchanganywa; aikoni zisizobainishwa hutumia faili chaguomsingi."
---

# Mandhari ya aikoni

Tumia vigeu vya CSS kubadilisha aikoni za wing, onyesho la awali, skrini nzima, paneli, ulinganisho na upangaji wa jedwali. SVG, WebP na PNG zinaweza kuchanganywa; aikoni zisizobainishwa hutumia faili chaguomsingi.

## Kuchagua faili

Pakia CSS na uweke darasa la mandhari kwenye kihariri au mzazi wa pamoja. Picha huhifadhi rangi, uwazi na uwiano wake wa asili.

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

Tumia njia kutoka mzizi kama `/icons/...` au URL kamili za HTTPS. Hakuna hakikisho kwamba njia husika zitahesabiwa kutoka karibu na faili la mandhari. Ukihifadhi CSS mwenyewe, nakili toleo lilelile la `dist/icons/` kando ya `nabi.css`. Picha ikishindwa kupakia, aikoni huwa tupu lakini jina, kidokezo na kitendo cha kitufe hubaki.

## Kutafuta aikoni nyingine

Ongeza `--nabi-icon-` mbele ya thamani ya `data-nabi-icon` ya elementi ili kupata kigeu cha CSS. Kwa mfano, `diff-close` hutumia `--nabi-icon-diff-close`. Angalia <a href="/llms/icons.md" target="_blank" rel="noopener">mkataba wa aikoni</a> kwa kanuni za funguo za muktadha, menyu, kuhifadhi, historia na nyingine, pamoja na usimbaji wa herufi maalumu.

## Hali nyeusi na paneli

Kubadilisha darasa la mandhari au kigeu cha CSS husasisha aikoni bila mount nyingine. Aikoni chaguomsingi hufuata mandhari angavu/nyeusi. Faili maalumu hazirithi `currentColor`; weka matoleo meusi kama mfano hapo juu inapohitajika. Paneli zinazofunguliwa chini ya `body` pia hufuata mandhari ya aikoni na mabadiliko ya darasa/mtindo ya kihariri chanzo. Weka vigeu kwenye kihariri au mzazi wa pamoja, si ndani ya upau wa zana pekee.

## Kuonyesha vitufe chaguomsingi

`showPreview` na `showFullscreen` zote ni `true` kwa chaguomsingi. `false` huondoa kitufe husika, lengo lake la fokasi na matukio yake. Zote zikiwa `false`, eneo tupu la zana pia halitengenezwi.

```ts
import { mountViewTools, renderViewToolsHtml } from 'nabi-note'

const visibility = { showPreview: false, showFullscreen: true }
const toolsHtml = renderViewToolsHtml({ locale: 'en', ...visibility })
const tools = mountViewTools({
  nabi, surface, root, container, locale: 'en', ...visibility,
})
```

Pitisha chaguo zilezile za kuonyesha kwa SSR na mount. Kubadilisha usanidi, ita `tools.unmount()` kisha mount kwa chaguo mpya. Ikiwa vitufe vyote viwili havihitajiki, bado unaweza kuacha kabisa mount ya zana na markup ya SSR. Miito ya moja kwa moja ya `openPreview()` na `setFullscreen()` hubaki inapatikana.
