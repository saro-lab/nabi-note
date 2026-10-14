---
title: Grundlegende Verwendung
description: Erstellen Sie einen browserbasierten NABI NOTE-Editor, und speichern Sie sowie stellen Sie seine Dokumente wieder her.
---

# Grundlegende Verwendung

Dieser Leitfaden behandelt einen clientseitig gerenderten (CSR) Editor im Browser: Wählen Sie wings, binden Sie den Editor und seine Benutzeroberfläche ein, und speichern Sie bzw. stellen Sie NABI TREE JSON wieder her.

## Installieren und das Basis-Markup hinzufügen

```bash
npm install nabi-note
```

Laden Sie dasselbe Stylesheet sowohl für den Editor als auch für den veröffentlichten Inhalt. Fügen Sie `contenteditable` nicht selbst hinzu; `mountSurface()` hat die Kontrolle darüber.

```ts
import 'nabi-note/nabi.css'
```

```html
<div class="nabi">
  <div id="toolbar" class="nabi-toolbar"></div>
  <div id="content" class="nabi-content"></div>
</div>
```

## Einen Editor einbinden

`allBasic()` wählt die offiziellen wings aus, die ohne anwendungsspezifische Verkabelung funktionieren. Fügen Sie dienstverbundene wings wie Upload, Dateispeicher oder Dokument-Differenzierung hinzu, wie in ihren jeweiligen Leitfäden beschrieben.

```ts
import { createNabiWith, mountSurface, mountToolbar, wings } from 'nabi-note'

const content = document.querySelector<HTMLElement>('#content')!
const toolbarRoot = document.querySelector<HTMLElement>('#toolbar')!

const { nabi, registry } = createNabiWith(wings().allBasic(), {
  locale: 'de',
  onError: (error) => console.error(error),
  undoLimit: 200,
  typingMergeMs: 1000,
})

const surface = mountSurface({
  nabi,
  registry,
  root: content,
  locale: 'de',
  placeholder: 'Write something.',
})
const toolbar = mountToolbar({
  nabi,
  registry,
  root: toolbarRoot,
  surface: content,
  locale: 'de',
})
```

`locale` steuert Symbolleiste und Hilfetext; übergeben Sie denselben Wert an jede UI-Einbindung. `placeholder` wird nur für einen leeren Editor angezeigt. `onError` empfängt isolierte Fehler von Befehlen und Callbacks. `undoLimit` ist die Anzahl der Rückgängig-Einträge (standardmäßig 200). `typingMergeMs` ist das Intervall, das aufeinanderfolgende Eingaben in einem einzigen Rückgängig-Schritt zusammenfasst; setzen Sie es auf `0`, um jede Einfügung separat zu halten.

Das Standardintervall für aufeinanderfolgendes Enter zum Verlassen eines Blockcontainers beträgt 180ms. Für doppeltes Esc und Shift bleiben es 350ms. Ein explizites `doubleEnterMs` in `mountSurface()` ändert neben Enter auch das Intervall für doppeltes Esc.

Jeder Editor benötigt seine eigenen nicht überlappenden Inhalts- und Symbolleisten-Wurzeln. Geben Sie auf einer Seite mit mehreren Editoren jeder Symbolleiste ihre eigene Editor-Oberfläche durch `surface` an, damit Fokus und Tastenkürzel nicht ineinander übergehen.

## Toolbar konfigurieren

Die Standard-Toolbar gruppiert Überschriften, Textformatierung, Ausrichtung, Listen, Einfügen und Dokumentwerkzeuge in dieser Reihenfolge, mit senkrechten Trennlinien zwischen den Gruppen. Auf dem Desktop werden alle Werkzeuge mehrzeilig angezeigt, mobil stehen Schnellwerkzeuge und die Schaltfläche für alle Werkzeuge in einer Zeile. Eigenschaftswerkzeuge für Tabellen, Bilder und Float-Bereiche erscheinen darunter und bleiben gemeinsam mit den Textwerkzeugen nutzbar.

`groups` ändert die Gruppenreihenfolge, `quick` die Reihenfolge der mobilen Schnellwerkzeuge. Ein Editor mit häufigen Bildeinfügungen kann beispielsweise die Gruppe `media` nach vorn verschieben.

```ts
import { TOOLBAR_GROUPS, mountToolbar } from 'nabi-note'

const toolbar = mountToolbar({
  nabi,
  registry,
  root: toolbarRoot,
  surface: content,
  locale: 'de',
  groups: ['media', ...TOOLBAR_GROUPS.filter((group) => group !== 'media')],
  quick: ['b', 'i', 'tc', 'img'],
})
```

Schnellwerkzeuge behalten die angegebene Reihenfolge ohne Trennlinien. Innerhalb einer Gruppe gilt die Registrierungsreihenfolge der Wings. Beim Vorrendern der Toolbar per SSR müssen Server und Browser dieselbe Gruppenreihenfolge erhalten. [CSS-Themes](./style#umschaltbreite-fur-den-mobilmodus) erläutert das Layout abhängig von der Bildschirmbreite.

Mit `mountHints()` lässt sich durch zweimaliges Drücken von Shift die Werkzeugauswahl per Tastatur öffnen. Tab wechselt die Gruppe, Pfeiltasten wechseln zwischen Symbolen derselben Gruppe. Desktop und Vollbild verwenden die sichtbare Toolbar, mobil wird die Palette aller Werkzeuge verwendet.

Bildpanels, URL-Eingaben und Dateiauswahl merken sich die Auswahl beim Öffnen. Wird nur der Cursor bewegt, erfolgt das Einfügen an der ursprünglichen Stelle. Wird das Dokument bearbeitet oder ersetzt, wird die Eingabe mit einem Hinweis abgebrochen. Auch wenn Rückgängig denselben Inhalt wiederherstellt, wird die alte Auswahl nicht erneut verwendet.

## Wings auswählen

Verwenden Sie `use()` und `drop()`, um nur die benötigten Funktionen zu behalten. Jede Wing-Seite dokumentiert die Optionen, die sie akzeptiert.

```ts
const selected = wings()
  .allBasic()
  .drop('youtube')
  .use('upload')

const { nabi, registry } = createNabiWith(selected, { locale: 'de' })
```

Übergeben Sie für ein kleineres Bundle nur die erforderlichen wings, wie `boldWing` und `imageWing`, als Array. Unbekannte Namen, ungültige Optionen und fehlende Abhängigkeiten schlagen sofort fehl, wenn der Editor erstellt wird.

## Speichern und Laden

Speichern Sie die Ausgabe von `getJson()` als NABI TREE JSON, wenn ein Dokument erneut bearbeitet werden soll. `getHtml()` ist für veröffentlichte Ausgaben gedacht. Speichern Sie niemals das nur für den Editor bestimmte Ergebnis von `getEditorHtml()`.

```ts
const json = nabi.getJson()
await saveToServer(json)

const saved = await loadFromServer()
if (!nabi.setJson(saved)) showError('The saved document could not be read.')

const publishedHtml = nabi.getHtml()
```

Verwenden Sie `setHtml()`, um externes HTML zu importieren. Der Browser-Editor stellt bereits seinen HTML-Parser bereit, daher ist keine Parser-Option erforderlich. `setJson()` und `setHtml()` geben `false` für ungültige, nicht-leere Eingaben zurück und lassen das aktuelle Dokument unverändert.

```ts
nabi.setHtml('<p>Imported document</p>')
```

Sowohl JSON als auch HTML sind nicht vertrauenswürdige Eingaben. NABI NOTE liest sie durch die registrierten wings und deren erlaubte Regeln, aber das ersetzt keine Upload-Autorisierung oder die Sicherheitsrichtlinie Ihres Dienstes.

## Häufige APIs

| Aufgabe | API |
| --- | --- |
| Einen Editor erstellen | `createNabiWith`, `wings` |
| Die Oberfläche und Symbolleiste einbinden | `mountSurface`, `mountToolbar` |
| Speichern und Wiederherstellen | `getJson`, `setJson`, `getHtml`, `setHtml` |
| Änderungen beobachten | `nabi.onChange(listener)` |
| Rückgängig und Wiederholen | `nabi.undo()`, `nabi.redo()` |
| HTML auf einem Server rendern | `renderStoredHtml` aus `nabi-note/ssr` |
| Verhalten für veröffentlichte Seiten hinzufügen | `attachViewer` aus `nabi-note/viewer` |
| Dokumente vergleichen | `diffDocs` aus `nabi-note/diff` |

Für genaue Typen und jedes Argument prüfen Sie zuerst die installierten Paketdeklarationen. Automatisierungstools können auch die [englische API-Referenz](https://nabi.saro.me/llms/api-reference.md) verwenden.

## Einbindungen entfernen

Trennen Sie in umgekehrter Erstellungsreihenfolge. Ändern Sie das `innerHTML` der Bearbeitungs-Wurzel nicht direkt; ändern Sie Dokumente über öffentliche APIs wie `setJson()`, `setHtml()` oder `applyCommand()`.

```ts
function dispose() {
  toolbar.unmount()
  surface.unmount()
}
```
