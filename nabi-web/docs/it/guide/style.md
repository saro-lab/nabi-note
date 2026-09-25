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
  --nabi-font: Inter, system-ui, sans-serif;
  --nabi-sticky-top: 4rem;
}
```

Metti i token condivisi su un genitore comune, così l'editor e la relativa vista pubblicata conservano lo stesso linguaggio visivo.

```html
<section class="brand-note">
  <div class="nabi">...</div>
  <article class="nabi-content">...</article>
</section>
```

```css
.brand-note {
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

I token per evidenziazione e colore del testo usano `--nabi-hl-<name>` e `--nabi-tc-<name>`. Per esempio, modificare `--nabi-hl-yellow` cambia il colore di visualizzazione delle evidenziazioni `yellow` archiviate senza modificare i dati del documento.

```css
.article-editor {
  --nabi-hl-yellow: #fff0a6;
  --nabi-tc-blue: #2563eb;
}
```

## Soglia della modalità mobile

La modalità mobile si attiva quando la larghezza della barra degli strumenti, della barra contestuale o della finestra è inferiore a `36rem`. A esattamente `36rem` resta il layout normale. In modalità mobile, le due barre scorrono orizzontalmente, i pannelli sono centrati e il selettore di tabelle si riduce a 5×5 celle adatte al tocco.

Imposta `--nabi-mobile-breakpoint` su `:root`, un antenato o una singola `.nabi`. Usa una lunghezza CSS non negativa, come `rem`, `px` o `calc()`. Le modifiche al valore CSS, alla dimensione del carattere radice, alla larghezza del contenitore o della finestra aggiornano automaticamente anche i pannelli aperti. I pannelli di input spostati sotto `body` mantengono la soglia dell’editor originale.

```css
.article-editor {
  --nabi-mobile-breakpoint: 40rem;
}
```

I dispositivi touch mantengono controlli più grandi anche oltre questa soglia.

## Modalità scura

La modalità chiara è quella predefinita. Aggiungi `.dark` a `html` o `body`, oppure imposta `data-nabi-theme="dark"` su un editor specifico o sul corpo pubblicato.

```html
<div class="nabi" data-nabi-theme="dark">...</div>
<article class="nabi-content" data-nabi-theme="dark">...</article>
```

Usa `data-nabi-theme="light"` per escluderti da `.dark` di un antenato. L'applicazione controlla il cambio di tema; il pacchetto non segue automaticamente `prefers-color-scheme`.

```css
.dark .brand-note {
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
  --nabi-font: "Source Serif 4", Georgia, serif;
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
