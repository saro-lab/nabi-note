---
title: Temi CSS
description: Configura colori, font, dimensioni e modalità scura per editor e contenuti pubblicati con variabili CSS.
---

# Temi CSS

NABI NOTE usa lo stesso CSS per la modifica e per il contenuto pubblicato. Carica una volta il foglio di stile del pacchetto, quindi sovrascrivi soltanto le variabili necessarie su un contenitore del servizio.

```ts
import 'nabi-note/nabi.css'
```

```css
.article-editor {
  --nabi-fg: #202124;
  --nabi-bg: #fff;
  --nabi-accent: #5b4ee8;
  --nabi-content-min-height: 20rem;
  --nabi-font: Pretendard, system-ui, sans-serif;
  --nabi-sticky-top: 4rem;
}
```

Assegna la stessa classe di tema al `.nabi` dell'editor e al `.nabi-content` della vista pubblicata per applicare le stesse variabili a entrambi. Carica il CSS del servizio dopo quello del pacchetto e indica il tema corrente con `data-nabi-theme`.

```html
<div class="nabi brand-note" data-nabi-theme="light">...</div>
<article class="nabi-content brand-note" data-nabi-theme="light">...</article>
```

```css
.brand-note:is(.nabi, .nabi-content)[data-nabi-theme="light"] {
  --nabi-fg: #1f2937;
  --nabi-muted: #6b7280;
  --nabi-bg: #fff;
  --nabi-soft: #f7f7fb;
  --nabi-line: #e5e7eb;
  --nabi-accent: #635bff;
  --nabi-radius: 10px;
}
```

## Variabili comuni

| Scopo | Variabili |
| --- | --- |
| Testo e sfondo | `--nabi-fg`, `--nabi-muted`, `--nabi-bg`, `--nabi-soft` |
| Bordi e accento | `--nabi-line`, `--nabi-accent`, `--nabi-on-accent` |
| Angoli e ombre | `--nabi-radius`, `--nabi-layer-radius`, `--nabi-shadow` |
| Famiglie di font | `--nabi-font`, `--nabi-font-serif`, `--nabi-font-mono`, `--nabi-font-cursive` |
| Superficie di modifica | `--nabi-content-min-height`, `--nabi-placeholder-color` |
| Barra fissa e anteprima | `--nabi-sticky-top`, `--nabi-preview-width` |
| Controlli tattili | `--nabi-touch-font-size`, `--nabi-touch-control-size` |
| Larghezza di attivazione della modalità mobile | `--nabi-mobile-breakpoint` |

Evidenziazione e colore del testo usano rispettivamente `--nabi-hl-<name>` e `--nabi-tc-<name>`. Gli sfondi delle celle usano `--nabi-cell-<name>` con `yellow`, `green`, `cyan`, `pink`, `purple` e `orange`. Le variabili cambiano solo il colore visualizzato, non il nome memorizzato.

```css
.brand-note:is(.nabi, .nabi-content)[data-nabi-theme="light"] {
  --nabi-hl-yellow: #fff0a6;
  --nabi-tc-blue: #2563eb;
  --nabi-cell-cyan: #e2f4f7;
}
```

Il tema predefinito usa sfondi delle celle tenui. La modalità scura mantiene i nomi ma impiega colori distinti, più chiari e meno saturi, per renderli riconoscibili sulle superfici scure. Questi colori traslucidi lasciano intravedere lo sfondo; se li personalizzi, controlla il contrasto del testo sullo sfondo reale della pagina. Per sovrascrivere le variabili di colore predefinite, applica la classe di tema all'elemento effettivo dell'editor o del contenuto pubblicato, come sopra, anziché a un genitore esterno qualsiasi.

```css
.brand-note:is(.nabi, .nabi-content)[data-nabi-theme="dark"] {
  --nabi-cell-cyan: #183b43;
}
```

## Soglia della modalità mobile

La barra predefinita `layout: 'compact'` passa a una riga mobile quando lo schermo è più stretto di `36rem`. A esattamente `36rem` mantiene il layout desktop. Sul desktop tutti gli strumenti vanno a capo anche se l'editor è stretto. Anche le proprietà degli oggetti vanno a capo sotto; entrambe le righe occupano spazio sopra il testo. Lo schermo intero espande tutti gli strumenti a qualsiasi larghezza.

Sui dispositivi mobili, gli strumenti rapidi, il pulsante di tutti gli strumenti e i pulsanti collegati di anteprima/schermo intero rimangono nella barra principale. Restano disponibili quando compaiono le proprietà. La tavolozza mantiene ordine dei gruppi e separatori del desktop. `layout: 'wrap'` mostra sempre tutti gli strumenti su più righe.

I pannelli mobili si aprono nello spazio disponibile intorno alla barra e alle proprietà. Il selettore delle dimensioni della tabella fa eccezione: si apre al centro su uno sfondo traslucido con una griglia 5×5 facile da toccare. Non attende la chiusura della tastiera; scegliere una dimensione inserisce una tabella e chiude il selettore.

Imposta `--nabi-mobile-breakpoint` su `:root`, un antenato o un singolo `.nabi` per cambiare la soglia. Usa lunghezze CSS non negative come `rem`, `px` o `calc()`. Le modifiche al valore CSS, alla dimensione del font radice o alla larghezza dello schermo aggiornano automaticamente anche i pannelli aperti. I pannelli di input spostati sotto `body` mantengono la soglia dell'editor originale.

```css
.article-editor {
  --nabi-mobile-breakpoint: 40rem;
}
```

Le aree flottanti hanno una soglia separata per passare a una colonna: conta la larghezza del contenitore del testo, non dello schermo, inferiore a `36rem`. La stampa usa lo stesso layout.

## Modalità scura

La modalità chiara è quella predefinita. Aggiungi `.dark` a `html` o `body`, oppure imposta `data-nabi-theme="dark"` su un editor specifico o sul corpo pubblicato.

```html
<div class="nabi" data-nabi-theme="dark">...</div>
<article class="nabi-content" data-nabi-theme="dark">...</article>
```

Usa `data-nabi-theme="light"` per escluderti da `.dark` di un antenato. L'applicazione controlla il cambio di tema; il pacchetto non segue automaticamente `prefers-color-scheme`.

```css
.brand-note:is(.nabi, .nabi-content)[data-nabi-theme="dark"] {
  --nabi-fg: #f3f4f6;
  --nabi-muted: #a1a1aa;
  --nabi-bg: #18181b;
  --nabi-soft: #27272a;
  --nabi-line: #3f3f46;
  --nabi-accent: #a5b4fc;
}
```

## Applica lo stile anche al contenuto pubblicato

Anche l'HTML pubblicato necessita di `.nabi-content` e dello stesso CSS. Tabelle, blocchi di codice, immagini, checklist e capilettera vengono renderizzati senza JavaScript. Aggiungi `nabi-note/viewer` soltanto per comportamenti come l'ordinamento delle tabelle o l'evidenziazione del codice.

```html
<article class="nabi-content article-body">...</article>
```

```css
.article-body {
  --nabi-font: "Noto Serif KR", serif;
  --nabi-bg: transparent;
}
```

Imposta sulla classe del servizio il layout non gestito dal pacchetto, come larghezza del corpo e altezza di riga.

```css
.article-body {
  max-inline-size: 46rem;
  margin-inline: auto;
  padding: 2rem 1.25rem;
  line-height: 1.75;
}
```

## Non modificare la struttura di modifica

Non cambiare `display` o `white-space` sui nodi `[data-key]` in modifica, non aggiungere pseudo-elementi nel testo modificabile e non disabilitare il comportamento del puntatore sui wrapper degli oggetti. Queste regole possono compromettere la geometria del cursore e la mappatura del documento.

I capilettera pubblicati usano `::first-letter`, mentre una superficie di modifica usa un vero elemento `[data-nabi-dropcap-letter]`. Non aggiungere un'altra regola `::first-letter` dentro `.nabi-editing` né sostituire quell'elemento.
