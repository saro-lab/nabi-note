---
title: "Temi delle icone"
description: "Usa variabili CSS per sostituire le icone di wing, anteprima, schermo intero, pannelli, confronto e ordinamento delle tabelle. Puoi combinare SVG, WebP e PNG; le icone non specificate usano i file predefiniti."
---

# Temi delle icone

Usa variabili CSS per sostituire le icone di wing, anteprima, schermo intero, pannelli, confronto e ordinamento delle tabelle. Puoi combinare SVG, WebP e PNG; le icone non specificate usano i file predefiniti.

## Scegliere i file

Carica il CSS e aggiungi una classe tema all’editor o a un genitore comune. Le immagini mantengono colori, trasparenza e proporzioni originali.

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

Usa percorsi dalla radice come `/icons/...` o URL HTTPS completi. I percorsi relativi non vengono necessariamente risolti accanto al file del tema. Se ospiti il CSS, copia la stessa versione di `dist/icons/` accanto a `nabi.css`. Se un’immagine non si carica, l’icona resta vuota, ma nome, suggerimento e azione del pulsante restano disponibili.

## Trovare altre icone

Anteponi `--nabi-icon-` al valore `data-nabi-icon` dell’elemento per ottenere la variabile CSS. Per esempio, `diff-close` usa `--nabi-icon-diff-close`. Il <a href="/llms/icons.md" target="_blank" rel="noopener">contratto delle icone</a> descrive le chiavi di contesto, menu, salvataggio, cronologia e altre, inclusa la codifica dei caratteri speciali.

## Modalità scura e pannelli

Cambiare la classe tema o una variabile CSS aggiorna le icone senza un nuovo mount. Le icone predefinite seguono il tema chiaro/scuro. I file personalizzati non ereditano `currentColor`; assegna varianti scure come sopra se necessario. I pannelli aperti sotto `body` seguono anche il tema delle icone e le modifiche a classi/stili dell’editor di origine. Imposta le variabili sull’editor o su un genitore comune, non solo dentro la barra.

## Mostrare i pulsanti predefiniti

`showPreview` e `showFullscreen` sono entrambi `true` per impostazione predefinita. `false` rimuove il relativo pulsante, il suo obiettivo di focus e gli eventi. Se entrambi sono `false`, non viene creata nemmeno un’area strumenti vuota.

```ts
import { mountViewTools, renderViewToolsHtml } from 'nabi-note'

const visibility = { showPreview: false, showFullscreen: true }
const toolsHtml = renderViewToolsHtml({ locale: 'en', ...visibility })
const tools = mountViewTools({
  nabi, surface, root, container, locale: 'en', ...visibility,
})
```

Passa le stesse opzioni di visibilità a SSR e mount. Per cambiare configurazione, chiama `tools.unmount()` e monta con nuove opzioni. Se nessuno dei due pulsanti serve, puoi ancora omettere del tutto il mount e il markup SSR degli strumenti. Le chiamate dirette a `openPreview()` e `setFullscreen()` restano disponibili.
