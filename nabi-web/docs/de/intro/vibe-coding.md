---
title: AI-Vibe-Coding
description: Helfen Sie Coding-Agenten dabei, NABI NOTE präzise zu nutzen, indem Sie sie auf die aktuelle öffentliche API und die Dokumentationsgrenzen stützen.
---

# AI-Vibe-Coding

NABI NOTE stellt [`llms.txt`](/llms.txt) für KI- und Automatisierungstools bereit. Statt einen Agenten die gesamte Bibliothek erraten zu lassen, beginnen Sie mit diesem Index und lassen Sie ihn nur die für die Aufgabe benötigten Dokumente lesen.

## Zu verwendender Prompt

Füllen Sie das benötigte Framework und die Features aus.

```text
Build an editor with NABI NOTE (nabi-note).
First read https://nabi.saro.me/llms.txt, then read only the documents needed for this task.

Environment: Vue 3 + TypeScript
Features: basic formatting, tables, images, and uploads
Stored source: NABI TREE JSON
Publishing: render stored JSON to HTML on the server

Use only public exports and APIs that exist in the installed types.
After implementation, run type checking and a build, then report changed files and verification results.
```

Wenn der Agent keine URLs öffnen kann, fügen Sie `llms.txt` und die relevanten verlinkten Dokumente in die Konversation ein.

## Lenken Sie es nur auf das, was es braucht

`llms.txt` ist ein kompakter Index. Es ist in der Regel nützlicher, einem Agenten nur die relevanten Seiten zu geben, als alle Dokumente auf einmal zu senden.

- npm-Assembly: [`quickstart-npm.md`](https://nabi.saro.me/llms/quickstart-npm.md)
- CDN-Einrichtung: [`quickstart-cdn.md`](https://nabi.saro.me/llms/quickstart-cdn.md)
- wing-Auswahl: [`wings.md`](https://nabi.saro.me/llms/wings.md)
- gespeichertes JSON, HTML und Änderungsereignisse: [`document-model.md`](https://nabi.saro.me/llms/document-model.md)
- Grenzen für HTML-Import, Einfügen und Hochladen: [`io-security.md`](https://nabi.saro.me/llms/io-security.md)
- benutzerdefinierte wings und Server-Side-Rendering: [`custom-wing.md`](https://nabi.saro.me/llms/custom-wing.md), [`ssr.md`](https://nabi.saro.me/llms/ssr.md)
- Viewer, Diff, Styles und Drop Caps: [`viewer-diff.md`](https://nabi.saro.me/llms/viewer-diff.md), [`styling.md`](https://nabi.saro.me/llms/styling.md)
- exakte Imports und Typen: [`api-reference.md`](https://nabi.saro.me/llms/api-reference.md)

## Produktanforderungen einbeziehen

Ein Agent kann Speicher, Sicherheitsrichtlinien oder Upload-Verhalten nicht allein aus dem Bearbeitungsbildschirm ableiten. Geben Sie das tatsächliche Framework an, welche wings enthalten und ausgeschlossen sind, ob JSON und HTML gespeichert werden, den Anforderungs- und Antwortvertrag des Upload-Endpunkts, Dateilimits und ob veröffentlichte Seiten SSR, Viewer-Verhalten oder Diffing benötigen.

Für alles, was noch nicht entschieden ist, bitten Sie den Agenten, die Optionen und ihre Auswirkungen zu erklären, bevor er eine Entscheidung implementiert.

## Überprüfen Sie das Ergebnis

Überprüfen Sie generierten Code wie jeden anderen Code auch. Überprüfen Sie insbesondere, ob er:

- `nabi-note/nabi.css` sowohl für die Bearbeitung als auch für veröffentlichte Inhalte lädt;
- denselben `registry` für ausgewählte wings und jeden Mount verwendet;
- `getJson()` speichert, niemals `getEditorHtml()`;
- nicht direkt in den `innerHTML` eines bearbeiteten `.nabi-content`-Elements schreibt;
- jeden Mount beim Schließen des Bildschirms unmountet;
- MIME-Typ, Größe, Autorisierung und Speicherort auf dem Upload-Server validiert;
- auf Server und Browser dieselbe wing-Reihenfolge und HTML-beeinflussende Optionen verwendet;
- tatsächliche Exportnamen durch Typüberprüfung, Tests und einen Build bestätigt.

IME- und Caret-Verhalten sowie Pfade zum Speichern und Laden benötigen selbst dann eine echte Überprüfung, wenn die Seite einmal zu funktionieren scheint. Testen Sie auch die Kompositionseingabe auf Mobilgeräten sowie die Wiederherstellung gespeicherter Dokumente.

## Die installierte Version bevorzugen

Wenn ein Projekt `nabi-note` bereits installiert hat, sind dessen `package.json`-Exports und Typdeklarationen relevanter als eine Website, die für eine andere Veröffentlichung erstellt wurde. Bitten Sie den Agenten, diesen Versionsunterschied zu prüfen, bevor er Code schreibt.
