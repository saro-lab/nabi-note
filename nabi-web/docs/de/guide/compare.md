---
title: Vergleich
description: Vergleichen Sie zwei Dokumente nebeneinander und übernehmen Sie ausgewählte frühere Inhalte in das aktuelle Dokument.
---

<script setup>
import CompareDemo from '../../.vitepress/ui/CompareDemo.vue'
</script>

# Vergleich

Stellen Sie zwei gespeicherte Dokumente gegenüber, um Änderungen zu sehen. Die Vergleichsansicht funktioniert ohne Editor; mit einem Callback lassen sich ausgewählte frühere Inhalte in das aktuelle Dokument übernehmen.

## Frühere Inhalte gezielt übernehmen

Eigenständige Vergleiche sind standardmäßig schreibgeschützt und zeigen keine **&gt;&gt;**-Schaltflächen zum Übernehmen. Mit einem `onMerge`-Callback werden diese Schaltflächen angezeigt.

Links steht das frühere, rechts das aktuelle Dokument. **&gt;&gt;** neben einer Änderung übernimmt den früheren Inhalt der betreffenden Absatz- oder Zeilengruppe. Die Auswahl erfolgt nicht zeichenweise. Auch gelöschte Inhalte können wiederhergestellt und neu hinzugefügte Inhalte entfernt werden.

Das folgende Beispiel ist schreibgeschützt. Sehen Sie sich an, wie sich die Treffzeit und die mitzubringenden Dinge geändert haben. **Neu beginnen** stellt das ursprüngliche Beispiel wieder her.

<CompareDemo />

## Eigenständige Vergleichsansicht

Importieren Sie aus `nabi-note/diff`. Übergeben Sie gespeichertes NABI TREE JSON oder HTML-Strings als `before` und `after`. Verwenden Sie für die Registry dieselben Wings wie im ursprünglichen Editor, damit Tabellen, Listen, Bilder und andere Inhalte vollständig gelesen und angezeigt werden.

```ts
import { makeRegistry, wings } from 'nabi-note'
import { mountDiff } from 'nabi-note/diff'
import 'nabi-note/nabi.css'

const registry = makeRegistry(wings().allBasic().build())
const diff = mountDiff({
  root: document.querySelector('#comparison')!,
  before: previousDocument,
  after: currentDocument,
  registry,
  locale: 'de',
})

diff.update(nextPreviousDocument, nextCurrentDocument)

diff.unmount()
```

Standardmäßig erscheinen nur Änderungen mit ihrem Kontext. Die Schaltfläche zum Einklappen öffnet die vollständigen Dokumente; Vor/Zurück navigiert zwischen Änderungen. Ohne Änderungen wird der gesamte Inhalt angezeigt. Ohne `onMerge` bleibt der Vergleich schreibgeschützt.

## Zusammenführen per Klick über einen Callback

Ein Klick übergibt einen Ergebnisvorschlag an `onMerge`. Das Anschließen des Callbacks speichert das Dokument nicht automatisch. Erst wenn der Host den Vorschlag annimmt und `update()` aufruft, ändert sich der Vergleich.

```ts
const diff = mountDiff({
  root,
  before: previousDocument,
  after: currentDocument,
  registry,
  locale: 'de',
  onMerge(proposal) {
    if (proposal.signal.aborted) return
    const accepted = diff.update(proposal.before, proposal.result, proposal.revision)
    if (!accepted) return
    currentDocument = proposal.result
  },
  onError(error) {
    showError(error)
  },
})
```

`proposal.result` enthält NABI TREE JSON mit ausschließlich der ausgewählten Änderung. `before` und `after` sind die Dokumente zum Klickzeitpunkt; `changeId` bezeichnet die Änderung, `revision` den Vergleichszustand. Wird diese `revision` als drittes Argument an `update()` übergeben und hat sich der Vergleich bereits geändert, liefert die Methode `false` und übernimmt den Vorschlag nicht.

Während ein asynchroner Callback läuft, sind doppelte Klicks gesperrt. Andere Dokumente einzusetzen oder die Ansicht abzubauen bricht `signal` ab. Beim Speichern auf einem Server müssen sowohl dieses Signal als auch die serverseitige Dokumentversion geprüft werden, damit kein veraltetes Ergebnis neuere Inhalte überschreibt.

## Vergleich aus dem Editor öffnen

Verbinden Sie den `diff`-Wing mit `mountDiffWing()`, um den Vergleich aus der Werkzeugleiste zu öffnen. Die Grundlage ist das zuletzt geladene Dokument. Normales Bearbeiten und Rückgängig ändern diese Grundlage nicht.

```ts
import { createNabiWith, mountToolbar, wings } from 'nabi-note'
import { mountDiffWing } from 'nabi-note/diff'

const { nabi, registry } = createNabiWith(wings().allBasic().use('diff'))
const comparison = mountDiffWing({
  nabi,
  registry,
  surface: content,
  locale: 'de',
})
const toolbar = mountToolbar({
  nabi,
  registry,
  root: toolbarRoot,
  surface: content,
  onHost(wing) {
    if (wing === 'diff') comparison.open()
  },
})
```

`merge` ist standardmäßig `true`, sodass ausgewählte frühere Inhalte in den Editor übernommen werden können. Die Änderung lässt sich rückgängig machen; die Grundlage bleibt erhalten. Ändert sich der ursprüngliche Editor bei geöffneter Ansicht, wird der Vergleich neu berechnet. Mit `merge: false` ist der Vergleich schreibgeschützt.

Rufen Sie beim Entfernen der Ansicht `toolbar.unmount()` und `comparison.unmount()` auf. Um auch die Version zu Bearbeitungsbeginn einzubeziehen und Änderungen beider Seiten automatisch zu kombinieren, verwenden Sie [Zusammenführen](./merge).
