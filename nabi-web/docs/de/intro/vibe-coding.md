---
title: KI-Vibe-Coding
description: llms.txt
---

# KI-Vibe-Coding

**`llms.txt`** ist eine Spezifikation, mit der Websites ihren Inhalt an KI-Agenten (LLMs)
übergeben. Statt HTML legt sie die Struktur und Verwendung eines Projekts in Markdown dar, das
ein Agent direkt lesen kann. Die vollständige Spezifikation steht auf
[llmstxt.org](https://llmstxt.org/).

Auch diese Website hat diese Tür offen. Es gibt keine Adresse zum Merken - wie im Beispiel unten
**geben Sie einem Agenten die Adresse**, und er folgt dem Rest von selbst.

```
https://nabi.saro.me/llms.txt
```

Cursor, Claude Code, OpenAI Codex, Windsurf und andere unterstützen den llms.txt-Standard.

## Beim ersten Einbinden

Bringen Sie nabi-note in eine Website, die es noch nicht nutzt, sagen Sie dem Agenten in einem
Zug, was Sie einschalten wollen, ob es einen Hell-/Dunkel-Modus gibt, und wie Sie es
ausliefern - den Rest baut er von selbst zusammen. **Nur der letzte Satz ändert sich zwischen den
drei Fällen unten** - der Rest kann so stehen bleiben, wie er ist.

### npm + Server-Rendering (SSR) - bei jeder Anfrage auf einem Server (Node) gezeichnet

Das gilt sowohl für ein selbst betriebenes Node-Backend als auch für ein SSR-Framework wie
Next.js, Nuxt oder SvelteKit - in beiden Fällen wird bei jeder Anfrage ein Dokument auf Node
gezeichnet und heruntergeschickt.

```
Wir wollen nabi-note als neuen Editor einbinden. Nutze https://nabi.saro.me/llms.txt
als Anleitung. Unsere Website hat einen Hell-/Dunkel-Modus, pass den Editor
daran an. Schalte alle Flügel ein, die standardmäßig mitkommen.

Wir rendern serverseitig mit Nuxt und wollen, dass der Text schon sichtbar ist,
sobald jemand die Seite öffnet. Installiere es mit npm und binde es mit SSR
plus hydrate ein.
```

### npm + nur im Browser zusammenbauen (CSR) - ein Bundler vorhanden, aber kein Server-Rendering nötig

```
Wir wollen nabi-note als neuen Editor einbinden. Nutze https://nabi.saro.me/llms.txt
als Anleitung. Unsere Website hat einen Hell-/Dunkel-Modus, pass den Editor
daran an. Schalte alle Flügel ein, die standardmäßig mitkommen.

Es ist ein Frontend, das mit Vite gebaut wird, Server-Rendering brauchen wir
nicht. Installiere es mit npm und baue es nur im Browser zusammen.
```

### CDN - eine statische Seite ohne Build-Tool

```
Wir wollen nabi-note als neuen Editor einbinden. Nutze https://nabi.saro.me/llms.txt
als Anleitung. Unsere Website hat einen Hell-/Dunkel-Modus, pass den Editor
daran an. Schalte alle Flügel ein, die standardmäßig mitkommen.

Diese Seite ist statisches HTML ohne Build-Tool. Binde es mit einem
<script>-Tag ein.
```

::: tip Hell und Dunkel brauchen keine zusätzliche Anweisung
`nabi.css` bringt die hellen Standardwerte, die `.dark`-Überschreibung und eine explizite
`.light`-Überschreibung schon mit. Lassen Sie die `dark`/`light`-Klasse der Seite unangetastet,
und der Editor folgt automatisch. Für eine Markenfarbe lassen Sie den Agenten zusätzlich
`llms/styling.md` lesen.
:::

Die drei Aufforderungen unterscheiden sich nur im letzten Satz - der Agent findet und liest
`llms/ssr.md` (plus `llms/quickstart-npm.md`), `llms/quickstart-npm.md` beziehungsweise
`llms/quickstart-cdn.md` und bindet es entsprechend ein.

## Eine Funktion ändern, hinzufügen oder entfernen

Ist nabi-note schon eingebunden, ist es sicherer, eine Änderung oder Erweiterung erst als
**Recherche und Plan zu erbitten, statt direkt als Umsetzung** - besonders bei allem, was bis
zum Backend reicht, wo Sie wissen müssen, was vorzubereiten ist, bevor auch nur eine Zeile Code
geschrieben wird.

### Beispiel - erst recherchieren, dann planen

```
Ich möchte Uploads hinzufügen. Lies https://nabi.saro.me/llms/wings.md und
https://nabi.saro.me/llms/api-reference.md und finde heraus, was unser Backend
braucht, um den upload-Flügel zu unterstützen (eine Adresse, die Dateien
entgegennimmt, erlaubte Endungen und Größenlimits, wie eine Fehlerantwort
aussehen soll). Setze es noch nicht um - zeig mir nur einen Plan, was
vorzubereiten ist.
```

Der Agent findet in `llms/wings.md`, dass `upload` ein Werkzeug-Flügel (tool) ist, der einen
`Uploader` erwartet, prüft in `llms/api-reference.md` die tatsächlichen Signaturen von
`mountUpload`, `Uploader` und `allowLocalUrls`, und legt einen Plan vor, der aufteilt, was das
Backend bereitstellen muss und was das Frontend allein entscheidet. Sobald Sie den Plan geprüft
und freigegeben haben, lassen Sie ihn umsetzen.

### Ein einfacheres Beispiel - direkt zu erbitten

Eine schmale Änderung, die keinen Plan braucht, können Sie direkt anfragen.

```
Lies https://nabi.saro.me/llms/styling.md und ändere nur die Akzentfarbe und
den Hintergrund des dunklen Themas auf unsere Markenfarben.
```

::: tip Ein Flügel, der den Vertrag bricht, wirft genau an der Stelle der Registrierung
Wenn ein Agent einen neuen Flügel bauen soll, lassen Sie ihn zusätzlich
[`llms/custom-wing.md`](https://nabi.saro.me/llms/custom-wing.md) lesen. Häufige Fehler - ein
reserviertes Wort als Name, oder ein knotenerrichtender Flügel ohne `toHtml` - platzen nicht
spät; sie **werfen in dem Moment, in dem der Flügel registriert wird.** Der Abschnitt "Es stirbt
genau an der Stelle der Registrierung" in diesem Dokument listet auf, was dabei erfasst wird.
:::

::: tip Ist es einmal eingebunden, lassen Sie eine Zeile zurück
Nach der ersten Einbindung müssen Sie die Adresse nicht jedes Mal wiederholen. Fügen Sie eine
Zeile wie diese in die Regeldatei Ihres Projekts ein (`CLAUDE.md`, `.cursorrules` usw.), und eine
Bitte, so kurz wie "mach X mit nabi-note", reicht dem Agenten, um die Adresse selbst zu finden.

```md
Dieses Projekt nutzt `nabi-note` als Editor. Prüfen Sie
https://nabi.saro.me/llms.txt, bevor Sie daran etwas bearbeiten.
```
:::

## Weiterführende Seiten

- [{{ t('menu_intro_index') }}](../intro) - die Wörter, die diese Dokumentation verwendet
- [{{ t('menu_wing_custom') }}](../wing/custom) - ein noch nicht vorhandenes Format selbst bauen,
  als für Menschen lesbares Dokument

<script setup lang="ts">
import { useTranslate } from '../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
