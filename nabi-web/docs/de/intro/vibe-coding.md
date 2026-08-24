---
title: KI-Vibe-Coding
description: Zeigt, wie Sie NABI NOTE mit llms.txt und einem KI-Coding-Assistenten einbinden und weiterentwickeln.
---

# KI-Vibe-Coding

**`llms.txt`** ist eine Standard-Spezifikation, mit der Websites KI-Agenten (LLMs) Projektstruktur und Verwendung effizient vermitteln.
Statt HTML liefert sie die Spezifikation und API eines Projekts als klares, für eine KI leicht zu parsendes Markdown-Dokument. Die vollständige Spezifikation steht auf [llmstxt.org](https://llmstxt.org/).

Auch die offizielle NABI NOTE-Website unterstützt `llms.txt` vollständig. Sie müssen keine langen Dokumente von Hand kopieren — **geben Sie dem KI-Agenten einfach die folgende URL**, und er durchsucht die Dokumentation selbst und erledigt die Aufgabe.

```
https://nabi.saro.me/llms.txt
```

Aktuelle KI-Coding-Tools wie Cursor, Claude Code, OpenAI Codex und Windsurf unterstützen den `llms.txt`-Standard.

## Beim ersten Einbinden

Wenn Sie NABI NOTE zum ersten Mal in ein Projekt einbinden, genügt es, die gewünschten Funktionen, ob ein Hell-/Dunkelmodus unterstützt werden soll, und die Zielumgebung (SSR/CSR/CDN) anzugeben — der KI-Agent schreibt daraus den passenden Code.

### npm + Server-Side Rendering (SSR) — Next.js, Nuxt, SvelteKit usw.

```
Wir wollen nabi-note als neuen Editor in unsere Website einbinden. Die Anleitung
findest du unter https://nabi.saro.me/llms.txt. Unsere Website hat einen
Hell-/Dunkelmodus, pass das Editor-Theme entsprechend an. Aktiviere alle
standardmäßig mitgelieferten Wings.

Unser Dienst rendert serverseitig mit Nuxt. Damit beim ersten Aufruf kein
Flackern entsteht, binde es mit npm-Paketinstallation und SSR + Hydration ein,
sodass es serverseitig vorgerendert wird.
```

### npm + Client-Side Rendering (CSR) — Vite, CRA, SPA-Umgebungen

```
Wir wollen nabi-note als neuen Editor in unsere Website einbinden. Die Anleitung
findest du unter https://nabi.saro.me/llms.txt. Unsere Website hat einen
Hell-/Dunkelmodus, pass das Editor-Theme entsprechend an. Aktiviere alle
standardmäßig mitgelieferten Wings.

Es handelt sich um eine Vite-basierte Frontend-SPA-Umgebung, serverseitiges
Rendering brauchen wir nicht. Installiere es als npm-Paket und baue es nur im
Browser-Client zusammen.
```

### CDN — statisches HTML ohne Build-Tool

```
Wir wollen nabi-note als neuen Editor in unsere Website einbinden. Die Anleitung
findest du unter https://nabi.saro.me/llms.txt. Unsere Website hat einen
Hell-/Dunkelmodus, pass das Editor-Theme entsprechend an. Aktiviere alle
standardmäßig mitgelieferten Wings.

Diese Seite ist statisches HTML ohne Build-Tool. Binde es mit <script>- und
<link>-Tags ein.
```

::: tip Das Theme (Hell/Dunkel) passt sich automatisch an
`nabi.css` bringt die helle Voreinstellung sowie die Klassen `.dark` und `.light` bereits mit. Sobald sich die `class="dark"` am Wurzelelement der Seite ändert, wechselt das Editor-Theme automatisch mit. Für eine Anpassung an Ihre Markenfarben lassen Sie den Agenten zusätzlich `llms/styling.md` lesen.
:::

## Beim Hinzufügen oder Anpassen von Funktionen

Wenn Sie an einem bereits eingebundenen Editor eine neue Funktion hinzufügen oder etwas ändern, ist es sicherer, **zuerst eine Recherche und einen Umsetzungsplan anzufordern**. Besonders bei Funktionen mit Backend-API-Anbindung (z. B. Datei-Upload) sollten die Anforderungen vorher klar geklärt werden.

### Beispiel-Prompt: Recherche und Planung

```
Ich möchte die Datei-Upload-Funktion einbinden. Lies dir
https://nabi.saro.me/llms/wings.md und
https://nabi.saro.me/llms/api-reference.md durch und finde heraus, wie das
Backend-API-Format (Endpunkt, erlaubte Endungen/Größenlimits, Format der
JSON-Antwort usw.) und der Frontend-Anbindungscode aussehen müssen, um den
upload-Wing zu aktivieren.
Schreib noch keinen Code, sondern zeig mir zuerst die nötigen Anforderungen
und einen Umsetzungsplan.
```

### Beispiel-Prompt: einfache Stil-Änderung

```
Lies dir https://nabi.saro.me/llms/styling.md durch und definiere die
Akzentfarbe des Editors sowie die Hintergrundfarbe des Dunkelmodus als
CSS-Variablen neu, passend zu unseren Markenfarben.
```

::: tip Ein Wing, der die Spezifikation verletzt, wirft sofort bei der Registrierung eine Ausnahme
Wenn Sie einen neuen Custom-Wing schreiben lassen, lassen Sie zusätzlich [`llms/custom-wing.md`](https://nabi.saro.me/llms/custom-wing.md) lesen. Häufige Fehler wie Konflikte mit reservierten Namen oder fehlende Pflichtmethoden werden nicht erst spät zur Laufzeit entdeckt, sondern **sofort bei der Erst-Registrierung als Ausnahme erkannt**.
:::

::: tip In der Projekt-Regeldatei hinterlegen
Wenn Sie diesen Satz in Ihr Projekt-Leitdokument (`CLAUDE.md`, `.cursorrules`, `AGENT.md` usw.) aufnehmen, reicht später schon "Füge dem Editor die Funktion ~ hinzu", damit die KI selbst `llms.txt` zu Rate zieht.

```md
Dieses Projekt verwendet `nabi-note` als WYSIWYG-Editor. Prüfen Sie bei
verwandten Aufgaben zuerst https://nabi.saro.me/llms.txt.
```
:::

## Weitere Dokumente

- [{{ t('menu_intro_index') }}](../intro) — Einführung und Architektur von NABI NOTE
- [{{ t('menu_wing_custom') }}](../wing/custom) — Leitfaden zum Erstellen eigener Wings

<script setup lang="ts">
import { useTranslate } from '../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
