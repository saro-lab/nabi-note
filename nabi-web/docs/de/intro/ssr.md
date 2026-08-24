---
title: SSR-Unterstützung
description: Gespeicherte Dokumente serverseitig vorab rendern und Editor sowie Werkzeugleiste per Hydration sofort übernehmen.
---

# SSR (Server-Side Rendering) Unterstützung

## Gespeicherte Dokumente rendern (nur lesende Ansichten)

Ein Bildschirm, der ein Dokument nur **anzeigt** — etwa eine Kommentarliste oder eine Beitragsansicht —, braucht keine Editor-Instanz. Um ein Dokument zu HTML zu rendern, reicht die Liste der registrierten Flügel (`registry`), dafür gibt es eine eigene, serverseitige Render-Funktion.

```ts
import { makeRegistry, defaultWings, renderStoredHtml, renderStoredEditorHtml } from 'nabi-note/ssr'

// Einmal beim Serverstart erzeugen und über mehrere Anfragen hinweg wiederverwenden.
const registry = makeRegistry(defaultWings)

const saved = [{ w: 'p', ch: ['Ein Kommentar'] }]   // Nabi-Baum, aus der Datenbank gelesen

renderStoredHtml(saved, registry)        // '<p>Ein Kommentar</p>'
renderStoredEditorHtml(saved, registry)  // '<p data-key="n0">Ein Kommentar</p>'
```

**`nabi-note/ssr` ist ein leichtgewichtiger Einstiegspunkt, der nur die zum Rendern nötige Kernlogik enthält.** Er referenziert weder die Editierfläche (`surface`) noch die Bildschirm-UI-Werkzeuge (`ui`), und Architektur-Unit-Tests stellen sicher, dass kein DOM-Code in das Server-Bündel gelangt. Lädt Ihre Umgebung bereits das vollständige Editor-Bündel, stehen dieselben Funktionen auch über das Paket `nabi-note` zur Verfügung.

| Funktion | Beschreibung |
|---|---|
| `renderStoredHtml(json, registry, options?)` | HTML zum Speichern und Veröffentlichen — derselbe Wert wie `getHtml()` des Editors |
| `renderStoredEditorHtml(json, registry, options?)` | HTML zum Initialisieren des Editors — derselbe Wert wie `getEditorHtml()` (trägt `data-key`) |

- **Verwendet überhaupt keine DOM-API.** Läuft direkt in Serverumgebungen wie Node.js.
- **Gibt `null` zurück, wenn es kein gültiger Nabi-Baum ist.** Die Validierungsregeln sind dieselben wie bei `setJson()`. Ungültige Eingaben werfen nie eine Ausnahme — die Funktion gibt `null` zurück und protokolliert die Ursache über `console.error`.
- **Entspricht exakt dem, was die Editor-Instanz erzeugt.** Beide durchlaufen dieselbe Normalisierungs- und Zusammenbau-Pipeline, daher wird XSS-Filterung identisch angewendet.
- Der Parameter `options` unterstützt `{ allowLocalUrls?: boolean }` — dieselbe Rolle wie die gleichnamige Option von `createNabiWith`.

**Dieselben Nabi-Baum-Daten erzeugen immer denselben `data-key`.** Deshalb können Sie mit `renderStoredEditorHtml` das initiale Editor-HTML serverseitig vorab rendern, an den Client senden und dort mit der Option `hydrate: true` mounten — der Editor aktiviert sich sofort, ohne erneutes Rendern oder Flackern.

```ts
mountSurface({ nabi, registry, root: surface, hydrate: true })
```

Weichen Server- und Client-Rendering zufällig voneinander ab, fällt der Client automatisch auf ein normales Rendering zurück — es reicht also, dass Server und Client dieselbe Flügelliste (`registry`) verwenden.

::: tip Die Startseite dieser Website läuft genau so, über SSR-Hydration
Das Dokument der Startseiten-Demo wird **zur Build-Zeit mit `renderStoredEditorHtml` vorab gerendert** und im HTML eingebettet; sobald das Client-Skript geladen ist, weckt `hydrate` den Editor darauf. Deshalb ist der Fließtext sofort sichtbar, noch bevor JS geladen ist — es entsteht kein Layout-Sprung (CLS).
:::

---

## Werkzeugleiste vorab rendern

Der Aufbau der Werkzeugleiste **hängt nicht vom Dokumentinhalt ab.** Er entsteht allein aus der Liste der registrierten Flügel, der Anzeigesprache (Locale) und der Gruppenreihenfolge — das Ergebnis ist also deterministisch. Einmal beim Serverstart rendern, cachen und über mehrere Anfragen hinweg wiederverwenden.

```ts
import { makeRegistry, defaultWings, renderToolbarHtml } from 'nabi-note/ssr'

const registry = makeRegistry(defaultWings)

const toolbarHtml = renderToolbarHtml({ registry, locale: 'de' })
// '<div class="nabi-group" data-group="font">…</div>'
```

Betten Sie diesen HTML-String in den Werkzeugleisten-Container ein und senden Sie ihn zum Client — `mountToolbar` erkennt im Browser das vorhandene Markup und **bindet nur die Event-Listener, ohne neu zu rendern.**

```ts
mountToolbar({ nabi, registry, surface, root: toolbar })
```

::: warning Setzen Sie `class="nabi-toolbar-row"` selbst auf den Container
Wenn Sie eine vorab gerenderte Werkzeugleiste ausliefern, muss die Zeile von Anfang an `class="nabi-toolbar-row"` tragen. Fehlt sie, wird die Klasse erst beim Mounten hinzugefügt — und das damit verbundene Padding kommt erst in diesem Moment hinzu, wodurch **die Button-Zeile sichtbar verrutscht.**
:::

- **Sicher auch bei abweichender Struktur.** Weicht das gelieferte HTML von der aktuellen Flügelliste ab, rendert der Client sofort neu — nichts bleibt kaputt.
- **Eine vorab gerenderte Werkzeugleiste startet im Standardzustand** (nichts gedrückt, nichts versteckt). Gedrückt-Zustand (`aria-pressed`) und kontextabhängige Sichtbarkeit hängen von der Caret-Position ab und synchronisieren sich automatisch, sobald der Client mountet.
- **Nur auf Bildschirmen mit Editor einsetzen.** Eine reine Leseseite braucht keine Werkzeugleiste.

**Vorschau- und Vollbild-Button lassen sich genauso vorab rendern.** Da es sich um View-Tool-Komponenten und nicht um Flügel handelt, werden sie separat mit `renderViewToolsHtml` gerendert.

```ts
import { renderViewToolsHtml } from 'nabi-note/ssr'

renderViewToolsHtml({ locale: 'de' })
// '<span class="nabi-tools">…</span>'
```

::: tip Auch die Werkzeugleiste der Startseiten-Demo ist vorab gerendert
Die Werkzeugleiste der Startseiten-Demo wird **zur Build-Zeit mit `renderToolbarHtml` und `renderViewToolsHtml` vorab gerendert**, und `mountToolbar`/`mountViewTools` erkennen diese Zeile und verdrahten nur. Deshalb poppen nie Dutzende Werkzeugleisten-Icons verspätet auf.
:::

---

## Weiter lesen

- [{{ t('menu_intro_usage') }}](./usage) — npm-Installation und die vollständige Nutzung des Editors
- [{{ t('menu_intro_cdn') }}](./cdn) — mit einem einzigen `<script>`-Tag, ohne Build-Tool

<script setup lang="ts">
import { useTranslate } from '../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
