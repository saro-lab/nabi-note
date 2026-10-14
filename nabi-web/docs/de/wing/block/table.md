---
title: Tabelle
description: Mehrere Absätze und Blöcke in Zellen einfügen sowie Hintergrundfarben, Verbindungen und Ausrichtung bearbeiten.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Tabelle

Wählen Sie in der Werkzeugleiste Zeilen und Spalten aus, um eine Tabelle zu erstellen. Zellen können mehrere Absätze, Bilder, Listen, Zitate, Code, aufklappbare Bereiche und Videos enthalten. Setzen Sie den Cursor in eine Zelle, um mit den Eigenschaftswerkzeugen darunter Zeilen, Spalten, Zellverbindungen, Kopfzellen und Hintergrundfarben zu bearbeiten.

Bearbeiten Sie im folgenden Beispiel die Absätze und Listen in den Zellen und ziehen Sie über mehrere Zellen, um deren Hintergrundfarbe gemeinsam zu ändern. Mit **Tabelle auswählen** in den Eigenschaftswerkzeugen können Sie die Tabelle selbst über die Hauptwerkzeugleiste ausrichten.

<WingDemo path="/wing/block/table" />

```ts
const selected = wings().use('table').build()
```

Registrieren Sie auch die Wings, die Sie innerhalb der Zellen verwenden möchten. Einen Editor mit allen grundlegenden Wings stellen Sie mit `wings().allBasic()` zusammen.

## In Zellen schreiben

| Eingabe | Verhalten |
| --- | --- |
| Enter in einem normalen Absatz | Erstellt einen neuen Absatz in derselben Zelle. |
| Shift+Enter | Fügt einen Zeilenumbruch im aktuellen Absatz oder Listeneintrag ein. |
| Tab / Shift+Tab in einem normalen Absatz | Wechselt zur nächsten / vorherigen Zelle. |
| Tab / Shift+Tab in Listen oder Code | Verwendet das Einrücken / Ausrücken des jeweiligen Blocks. |

Enter folgt in Listen und Code den Eingaberegeln des jeweiligen Blocks. Auch wenn sich Code nicht weiter ausrücken lässt, wechselt Shift+Tab nicht zur vorherigen Zelle. Backspace oder Delete am Anfang oder Ende einer Zelle verbindet sie nicht mit einer benachbarten Zelle oder einem Absatz außerhalb der Tabelle.

Das Einfügen aus der Zwischenablage sowie das Einfügen von Bildern und Blöcken bleibt in der Zelle, in der die Aktion begonnen wurde. Bei einer Auswahl über Zellgrenzen hinweg sind das Einfügen von Blöcken und das Einfügen aus der Zwischenablage nicht verfügbar. Tabellen und [Float-Bereiche](./float) können nicht in Zellen verschachtelt werden. Beim Importieren oder Einfügen solcher Strukturen werden ihre Inhalte der Reihe nach ausgepackt.

Normale Zellen können Überschriften enthalten, Kopfzellen erhalten jedoch keine Überschriftenformatierung. Beim Umwandeln in eine Kopfzelle werden enthaltene Überschriften zu normalen Absätzen; Text und andere Formatierungen bleiben erhalten.

## Hintergrundfarben der Zellen

Die Hintergrundfarbe gilt für eine einzelne Zelle oder einen durch Ziehen ausgewählten rechteckigen Bereich. Auch wenn nur ein Teil des Textes ausgewählt ist, ändert sich der Hintergrund der gesamten zugehörigen Zelle. Die blassen Farben passen sich dem hellen und dunklen Design an. Haben mehrere ausgewählte Zellen unterschiedliche Farben, wird keine einzelne Farbe als ausgewählt angezeigt.

Sie können die Farbe auch per Befehl ändern und dabei die aktuelle Zellauswahl beibehalten.

```ts
nabi.applyCommand('setCellColor', { bg: 'cyan' })
```

Zulässige Werte sind `yellow`, `green`, `cyan`, `pink`, `purple` und `orange`. Um den Standardhintergrund wiederherzustellen, wählen Sie **Standard** in den Eigenschaftswerkzeugen oder übergeben eine leere Zeichenfolge.

```ts
nabi.applyCommand('setCellColor', { bg: '' })
```

Das Löschen von Inhalten, Ausschneiden und Entfernen von Formatierungen löscht die Hintergrundfarben nicht. Beim Verbinden wird die Farbe der linken oberen Zelle verwendet; beim Teilen erhalten neu entstehende Zellen dieselbe Farbe. Neue Zeilen und Spalten beginnen mit dem Standardhintergrund. Änderungen der Hintergrundfarbe lassen sich rückgängig machen und wiederholen.

## Zellinhalt und Tabelle ausrichten

Befindet sich der Cursor in einer Zelle, gilt die Ausrichtung für deren Absätze oder Bilder. Bei mehreren ausgewählten Zellen wird sie gemeinsam auf alle ausrichtbaren Absätze und Objekte darin angewendet, ausgenommen Code. Auch der Werkzeugleistenstatus für Überschriften, Ausrichtung und Initialen richtet sich nach den tatsächlich ausgewählten inneren Absätzen. Unterschiedliche Werte in den ausgewählten Absätzen werden nicht als ein einzelner Wert angezeigt.

Um die Tabelle selbst auszurichten, klicken Sie in den Eigenschaftswerkzeugen auf **Tabelle auswählen** und verwenden anschließend die Ausrichtungsschaltflächen der Hauptwerkzeugleiste. Dieselbe Ausrichtung ist verfügbar, wenn der Cursor vor oder hinter dem umschließenden Absatz der Tabelle steht und ein gestrichelter Rahmen erscheint. Dieser Rahmen kennzeichnet nur das Ziel; er macht aus dem Cursor keine Auswahl der gesamten Tabelle.

```ts
nabi.applyCommand('selectTable')
nabi.applyCommand('setAlign', { value: 'c' })
```

Das Hinzufügen und Löschen von Zeilen und Spalten sowie Verbinden und Teilen richten sich nach den ausgewählten Zellen. Beim Verbinden bleiben die Blöcke der einzelnen Zellen in Zeilenreihenfolge erhalten. Beim Teilen verbleibt der Inhalt in der ursprünglichen Zelle; die anderen Zellen sind leer.

## Kopieren und Speichern

Beim Kopieren mehrerer ausgewählter Zellen wird der sichtbare rechteckige Bereich bis einschließlich der letzten Zelle kopiert. HTML und das interne Zwischenablageformat bewahren leere Zellen, Zellverbindungen, Blöcke, Textformatierungen und Hintergrundfarben. Im Klartext werden Zellen durch Tabulatoren und Zeilenumbrüche getrennt; Zeilenumbrüche zwischen Blöcken in einer Zelle sowie Bild- und Video-URLs bleiben erhalten. Ausschneiden leert nur den Inhalt der ausgewählten Zellen und lässt sich mit einem einzigen Rückgängig-Schritt aufheben.

Steht der Cursor vor oder hinter einer Tabelle und erscheint der gestrichelte Rahmen, gelten Kopieren und Ausschneiden für den gesamten umschließenden Absatz. Beim Ausschneiden werden Absatz und Tabelle erst entfernt, nachdem das Schreiben in die Zwischenablage erfolgreich war. Wird eine Tabelle innerhalb eines Float-Bereichs ausgeschnitten oder gelöscht, bleibt der äußere Float-Bereich erhalten.

Das Speichern als JSON oder HTML bewahrt die Blöcke und Hintergrundfarben der Zellen. Einfache Tabellen werden als Markdown-Tabellen exportiert; Tabellen mit mehreren Blöcken oder Hintergrundfarben bleiben als HTML erhalten, um ihre Inhalte zu bewahren. In HTML wird der Farbname einer Zelle im Attribut `data-nabi-cell-color` von `td` oder `th` gespeichert. Beliebige Hintergrundfarbstile aus externem HTML werden nicht als Zellhintergrundfarben importiert.

Um im veröffentlichten Inhalt nach Spalten zu sortieren, speichern Sie die Tabelle als sortierbar und binden `attachViewer()` aus `nabi-note/viewer` ein. Tabellen mit verbundenen Zellen sind von der Spaltensortierung ausgeschlossen.

## CSS-Stile

Gestalten Sie Tabellen mit `.nabi-content table` und Zellen mit `.nabi-content :is(th, td)`. Wenden Sie Streifen und Kopfzellenhintergründe nur auf Zellen ohne Farbe an, damit festgelegte Hintergrundfarben nicht überschrieben werden.

```css
.article-body table { inline-size: 100%; border-collapse: collapse; }
.article-body :is(th, td) { padding: .6rem .75rem; border: 1px solid var(--nabi-line); }
.article-body th { font-weight: 700; }
.article-body th:not([data-nabi-cell-color]) { background: var(--nabi-soft); }
.article-body tr:nth-child(even) td:not([data-nabi-cell-color]) {
  background: color-mix(in srgb, var(--nabi-soft) 45%, transparent);
}
```

Die Zellhintergrundfarben selbst ändern Sie über CSS-Variablen mit dem jeweiligen Farbnamen, etwa `--nabi-cell-yellow`. Laden Sie das folgende CSS nach dem CSS des Pakets und setzen Sie die Klasse `table-note` sowie den `data-nabi-theme`-Wert des aktuellen Designs direkt auf das `.nabi`-Element des Editors oder das `.nabi-content`-Element der veröffentlichten Ansicht.

```css
.table-note:is(.nabi, .nabi-content)[data-nabi-theme="light"] {
  --nabi-cell-cyan: #e2f4f7;
}
.table-note:is(.nabi, .nabi-content)[data-nabi-theme="dark"] {
  --nabi-cell-cyan: #183b43;
}
```

Wenn der Viewer eingebunden ist, behalten Sie die Schaltfläche `.nabi-sort` bei. Ein erzwungenes Überschreiben von `position` oder dem rechten Padding der Zellen kann zu Überschneidungen mit der Sortierschaltfläche führen.
