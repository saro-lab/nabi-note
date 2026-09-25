---
title: "Jigogin gumaka"
description: "Yi amfani da masu canjin CSS don sauya gumakan wing, samfoti, cikakken allo, bangarori, kwatantawa da jera tebur. Ana iya haɗa SVG, WebP da PNG; gumakan da ba a ayyana ba suna amfani da fayilolin asali."
---

# Jigogin gumaka

Yi amfani da masu canjin CSS don sauya gumakan wing, samfoti, cikakken allo, bangarori, kwatantawa da jera tebur. Ana iya haɗa SVG, WebP da PNG; gumakan da ba a ayyana ba suna amfani da fayilolin asali.

## Zaɓen fayiloli

Loda CSS sannan ka sa ajin jigo a editan ko mahaifin da suka haɗa. Hotuna suna riƙe launuka, bayyana ta cikinsu da rabon girman su na asali.

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

Yi amfani da hanyoyi daga tushe kamar `/icons/...` ko cikakkun URL na HTTPS. Ba a tabbatar cewa za a lissafa hanyar dangi daga kusa da fayil ɗin jigo ba. Idan kana ɗaukar nauyin CSS da kanka, kwafi sigar `dist/icons/` ɗaya a gefen `nabi.css`. Idan hoto bai loda ba, gunkin ya zama fanko, amma suna, bayanin shawara da aikin maɓallin suna nan.

## Nemo sauran gumaka

Ƙara `--nabi-icon-` a gaban ƙimar `data-nabi-icon` ta sinadarin gunkin don samun mai canjin CSS. Misali, `diff-close` yana amfani da `--nabi-icon-diff-close`. Duba <a href="/llms/icons.md" target="_blank" rel="noopener">ƙa’idar gumaka</a> don dokokin maɓallan mahalli, menu, adanawa, tarihi da sauransu, har da yadda ake sanya lambar haruffa na musamman.

## Yanayin duhu da bangarori

Sauya ajin jigo ko mai canjin CSS yana sabunta gumaka ba tare da sake mount ba. Gumakan asali suna bin jigon haske/duhu. Fayilolinka ba sa gado `currentColor`; sa nau’in duhu kamar misalin sama idan ana buƙata. Bangarorin da aka buɗe ƙarƙashin `body` su ma suna bin jigon gumaka da sauyin aji/salo na editan asali. Sanya masu canjin a editan ko mahaifin da suka haɗa, ba cikin sandar kayan aiki kaɗai ba.

## Nuna maɓallan asali

`showPreview` da `showFullscreen` dukansu `true` ne a asali. Sanya `false` yana cire maɓallin, inda yake karɓar mayar da hankali da abubuwan da yake saurara. Idan duka `false` ne, ba a ƙirƙirar yankin kayan aiki marar komai ba.

```ts
import { mountViewTools, renderViewToolsHtml } from 'nabi-note'

const visibility = { showPreview: false, showFullscreen: true }
const toolsHtml = renderViewToolsHtml({ locale: 'en', ...visibility })
const tools = mountViewTools({
  nabi, surface, root, container, locale: 'en', ...visibility,
})
```

Ba SSR da mount zaɓuɓɓukan nunawa iri ɗaya. Don sauya tsari, kira `tools.unmount()` sannan ka mount da sabbin zaɓuɓɓuka. Idan ba a buƙatar maɓallan biyu, ana iya barin mount na kayan aiki da rubutun SSR gaba ɗaya kamar da. Ana iya ci gaba da kiran `openPreview()` da `setFullscreen()` kai tsaye.
