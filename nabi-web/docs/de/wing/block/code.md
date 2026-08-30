---
title: Code
description: Speichern Sie mehrzeiligen Code zusammen mit der für die Syntaxhervorhebung verwendeten Sprache.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Code

Fügen Sie mehrzeiligen Code getrennt vom normalen Fließtext ein. Geben Sie drei Backticks in einem leeren Absatz ein und drücken Sie die Leertaste oder Eingabetaste, oder wechseln Sie über die Symbolleiste zu einem Codeblock. Wenn Sie nach den Backticks einen Sprachnamen wie `ts` hinzufügen, wird dieser Name ebenfalls gespeichert.

Der Sprachname ist ein Bezeichner, der für die Syntaxhervorhebung verwendet wird, und Namen außerhalb der registrierten Liste können auch manuell eingegeben werden. Da Codeinhalt und Einrückung erhalten bleiben müssen, akzeptieren Codeblöcke keine Absatzausrichtung.

<WingDemo path="/wing/block/code" />

```ts
const selected = wings().use('code').build()
```

## Einen Code-Highlighter verbinden

Die Registrierung des Codeblocks verwendet die Standardfärbung innerhalb des Editors. Um Code auch in der veröffentlichten Ansicht zu färben, verbinden Sie `nabi-note/viewer`. Der Viewer findet `pre > code` und liest den Wert von `data-nabi-lang` des übergeordneten Elements als Sprachnamen. Wenn dieser Wert fehlt, prüft er die Klasse `language-...` auf dem `code`-Element.

```ts
import { attachViewer } from 'nabi-note/viewer'

const viewer = attachViewer(article, {
  locale: 'de',
})

// After replacing the published HTML
viewer.refresh()

// When closing the screen
viewer.unmount()
```

Wenn kein separater Highlighter vorhanden ist oder dieser die Sprache nicht verarbeiten kann, färbt der abhängigkeitfreie integrierte Tokenizer stattdessen. Von dem Highlighter eingefügte Token-Span existieren nur auf dem Bildschirm und werden nicht in das gespeicherte JSON oder den ursprünglichen veröffentlichten HTML-Code zurückgeschrieben. `refresh()` und `unmount()` entfernen diese Spans und stellen die Verbindung zum aktuellen ursprünglichen Code wieder her.

### Wie die NABI-Website Shiki verbindet

Die NABI-Website lädt den Highlighter dynamisch, damit Shiki nicht in den ersten Bildschirm oder das SSR-Bundle eingeht. `loadCodeHighlighting()` in `nabi-web/docs/.vitepress/src/highlight.ts` erstellt Shiki-Core und ruft dann eine Sprachgrammatik nur ab, wenn Code in dieser Sprache tatsächlich benötigt wird. Das folgende Beispiel verwendet dieselbe Verbindung in der veröffentlichten Ansicht.

```ts
import { attachViewer } from 'nabi-note/viewer'
import { loadCodeHighlighting } from '../src/highlight'

const highlighting = await loadCodeHighlighting()
const viewer = attachViewer(article, {
  locale: 'de',
  highlight: highlighting?.highlight,
})

const stop = highlighting?.onGrammarLoaded(() => viewer.refresh())

// When closing the screen
stop?.()
viewer.unmount()
```

Wenn eine Sprache zum ersten Mal erscheint, beginnt der Download der Grammatik. Bis dahin wird der Block mit dem integrierten Tokenizer oder als reiner Text angezeigt. Sobald die Grammatik ankommt, ruft `onGrammarLoaded()` `viewer.refresh()` auf und färbt den Block erneut. Auf diese Weise werden nur benötigte Sprachen heruntergeladen, und eine spät ankommende Grammatik wird ohne weitere Seitenavigation angewendet.

Die Editor-Seite verwendet dieselbe Funktion `highlight`. Das NABI-Website-Demo ersetzt nur das Standard-`codeWing` `attach` durch `makeCodeAttach({ highlight, version })`. `version` ändert sich jedes Mal, wenn eine Grammatik ankommt, und fungiert als Signal zum Neuzeichnen von Code, der bereits gezeichnet wurde. Ein eigenständiger Dienst kann zuerst die Verbindung zur veröffentlichten Ansicht implementieren und diesen Ansatz erst hinzufügen, wenn auch beim Bearbeiten Shiki-Färbung benötigt wird.

## CSS-Stile

Stilen Sie Codeblöcke mit `.nabi-content pre` und Code mit `.nabi-content pre > code`. Ändern Sie `white-space` nicht, da es sich auf Code-Zeilenumbrüche und Bearbeitung auswirkt. Token-Farben können mit `[data-nabi-token]`-Selektoren geändert werden.

```css
.nabi-content [data-nabi-token="keyword"] { color: #7b4fd0; }
.nabi-content [data-nabi-token="string"] { color: #a2543a; }
```
