---
title: YouTube
---

# YouTube

## Beschreibung

`youtubeWing` (Name `youtube`, ohne Kürzel) besitzt die YouTube-Einbettung (`<iframe>`). Es ist ein
**Klotz ohne Inneres** (`place: 'void'`) wie `hr` und `img`. Ein Druck auf die Schaltfläche öffnet
eine Adresseingabe, und nur YouTube-Adressen der Formen `watch?v=`, `youtu.be/`, `/embed/`,
`/shorts/`, `/v/` und `/live/` kommen durch (samt der Präfixe `www.`, `m.`, `music.` und
`youtube-nocookie.com`) — entschieden wird nicht durch eine Prüfung auf enthaltene Zeichenketten,
sondern durch Parsen mit `URL()`, weshalb eine Adresse wie `youtube.com.evil.test` nicht hängen
bleibt.

Der übergebenen Adresse wird nicht einfach geglaubt — es wird nur die **elfstellige Video-id**
herausgezogen und gespeichert. Die Adresse selbst bleibt nicht im gespeicherten Wert — was bleibt,
ist allein `{"w":"youtube","a":{"v":"<id>","w":"70"}}`, und auf dem Weg hinaus wird sie neu in genau
einer Gestalt zusammengesetzt: `https://www.youtube-nocookie.com/embed/<id>`.

Aus demselben Grund wie bei `hr` gelangt der Caret nicht hinein, und drücken Sie unmittelbar davor
oder dahinter Rücktaste oder Entf, verschwindet sie als Ganzes. Eine Einbettung, die kein YouTube
ist, wird beim Hereinholen **als Ganzes verworfen** — ein unbekanntes Dokument wird nicht innerhalb
unseres eigenen Dokuments aufgestellt.

## Kontextzeile

Klicken Sie das Video an, erscheinen zwei Felder.

| Gruppe | Felder |
|---|---|
| Breite | sechs Stufen `50` `60` `70` `80` `90` `100` (Standard `70`) — eine Skala, der aktuelle Wert erscheint mit |
| Adresse | eine Eingabe, gefüllt mit der id des aktuellen Videos |

**Felder für links, mittig, rechts gibt es hier nicht.** Der Platz des Videos wird nicht vom Video
getragen, sondern vom **Wrapper-Absatz, der es hält**, das erledigen also die
Ausrichtungs-Schaltflächen der Werkzeugleiste. Ein neu eingefügtes Video steht mit einem Wrapper-Absatz,
der zentrierte Ausrichtung (`c`) trägt.

Auf dem Weg hinaus landet die Breite also auf dem Video, die Ausrichtung auf dem umhüllenden Absatz.

```html
<div data-nabi-p data-nabi-align="c">
  <iframe src="https://www.youtube-nocookie.com/embed/<id>" title="YouTube"
          allowfullscreen loading="lazy" data-nabi-width="70"></iframe>
</div>
```

Inline-`style` geht nicht hinaus. Will der Host es über seine eigene UI einfügen, ruft er das
Command direkt auf — `applyCommand('insertYoutube', { v: Adresse, w: '80' })`, und um nur die Breite
zu ändern, `applyCommand('setYoutubeWidth', { w: '80' })`. Eine Breite außerhalb der Liste wird
abgelehnt.

## Anwendungsbeispiel

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, youtubeWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// Die Flügelliste baut Sortenwissen, Commands und Baukästen zusammen — das ist die `registry`
const { nabi, registry } = createNabiWith([youtubeWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/block/youtube" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
