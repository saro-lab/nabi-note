---
title: Bild
---

# Bild

## Beschreibung

`imageWing` (id `img`) besitzt das Bild (`<img>`). Wie `hr` und `youtube` ist es ein Klotz ohne
Inneres. Ein Druck auf die Schaltfläche öffnet eine Adresseingabe.

Eine Adresse kommt anhand ihres **Schemas** durch, nicht ihrer Endung: `http:` und `https:`, dazu
einfache relative Pfade. Protokollrelative `//host/…` werden abgelehnt, ebenso alles andere —
`javascript:` und Verwandte kommen nie in die Nähe des Dokuments. Ein Bild ohne brauchbare Adresse
ist überhaupt kein Bild, wird also verworfen, statt als Geist gespeichert zu werden.

Da der Caret nie in ein Bild hineingelangt, wählt ein Klick darauf das ganze Bild aus und ruft die
Kontextzeile auf.

| Steuerelement | Was es tut |
|---|---|
| Breite | ein Schieberegler über `30` `40` `50` `60` `70` `80` `90` `100` (Prozent, `60` standardmäßig) |
| Ansehen | nur das Bild, groß — es ändert nichts im Dokument |

**Hier gibt es kein Ausrichtungs-Steuerelement.** Die Ausrichtung eines Klotzes gehört dem
Wrapper-Absatz, der ihn hält, sie kommt also vom Flügel [Ausrichtung](../etc/align), dessen
Schaltflächen genau aus diesem Grund auf einem Wrapper-Absatz aktiv bleiben. Ein Bild wird
standardmäßig in einen zentrierten Wrapper-Absatz eingefügt.

Auf dem Weg hinaus landet die Breite auf dem Bild und die Ausrichtung auf dem umhüllenden Absatz.

```html
<div data-nabi-p data-nabi-align="c"><img src="…" alt="" data-nabi-width="70"/></div>
```

Die Ausrichtungswerte sind `l`, `c` und `r`. Kein Inline-`style` geht hinaus. Die tatsächliche
Gestalt des Bildes zeichnet das Stylesheet, das dieses Attribut innerhalb eines `.nabi-content` mit
eingebundenem `nabi.css` liest. Eine Breite außerhalb der Liste wird abgelehnt, statt auf die
nächste Stufe gerundet zu werden.

```ts
makeImageWing({ allowLocalUrls?: boolean })
```

Schalten Sie `allowLocalUrls` ein, sind auch `blob:`- und `data:image/...`-Adressen erlaubt —
schalten Sie es nur für Demos und Upload-Szenarien ein, die eine Datei ohne Server vorab anzeigen.
Standardmäßig ist es aus, und `data:image/svg` bleibt in beiden Fällen abgelehnt.

Sie können es an zwei Stellen einschalten — für den ganzen Editor mit `createNabiWith(wings, {
allowLocalUrls: true })`, oder allein für den Bild-Flügel mit `makeImageWing({ allowLocalUrls: true
})`. `imageWing` ist die fertige Konstante damit ausgeschaltet.

Ist ein Bild kaputt (eine tote Adresse, eine abgelaufene, ein verschwundenes Blob), erscheint ein
Platzhalter von selbst — der Flügel trägt das in seinem eigenen `attach`, und `mountSurface`
verdrahtet das `attach` jedes registrierten Flügels. **Es gibt nichts zusätzlich zu mounten.** Das
Kennzeichen gilt nur für den Bildschirm und überlebt nie in den gespeicherten Wert.

## Anwendung

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, imageWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// Die Flügelliste baut Sortenwissen, Commands und Baukästen zusammen — das ist die `registry`
const { nabi, registry } = createNabiWith([imageWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

Um eine per Upload erhaltene Datei (eine `blob:`-Adresse) unverändert offen zu halten:

```ts
makeImageWing({ allowLocalUrls: true })
```

## Demo

<WingDemo path="/wing/block/image" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
