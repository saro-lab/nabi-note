---
title: Zusammenführen
description: Kombinieren Sie Ausgangsversion, eigene Version und zwischenzeitlich gespeicherte Version und bearbeiten Sie verbleibende Konflikte.
---

<script setup>
import MergeDemo from '../../.vitepress/ui/MergeDemo.vue'
</script>

# Zusammenführen

Wurden während Ihrer Bearbeitung andere Änderungen gespeichert, werden beide Seiten anhand der Version zu Bearbeitungsbeginn kombiniert. Automatisch kombinierbare Änderungen werden sofort vollständig übernommen; nur Überschneidungen bleiben als Konflikte. Dies ist eine eigenständige Ansicht aus `nabi-note/merge`, kein Wing.

| Links | Mitte | Rechts |
| --- | --- | --- |
| Version zu Bearbeitungsbeginn | Ihr aktuelles Dokument mit automatisch zusammengeführten Änderungen | Während Ihrer Bearbeitung gespeicherte Version |
| Schreibgeschützt | Direkt bearbeitbar | Schreibgeschützt |

In der Mitte bearbeiten Sie Text, Formatierung, Tabellen, Listen und Bilder wie im normalen Editor. Die übergebenen Wings bestimmen die Funktionen. Konfliktmarkierungen und Lösungsstatus gelangen nicht in den gespeicherten Inhalt.

## Vollständig automatisch zusammenführbares Beispiel

Sie haben die Besprechung auf **11 Uhr** verschoben, jemand anderes den Ort in den **Besprechungsraum im 3. Stock** geändert. Da unterschiedliche Absätze betroffen sind, enthält das mittlere Ergebnis beide Änderungen.

Ohne verbleibende Konflikte können Sie sofort **Bestätigen** wählen oder vorher den Text in der Mitte überarbeiten. Das unten angezeigte endgültige Dokument ist das tatsächliche Ergebnis des Bestätigungs-Callbacks.

<MergeDemo />

## Nur teilweise automatisch zusammenführbares Beispiel

Diesmal haben Sie die Zeit auf **11 Uhr**, jemand anderes auf **14 Uhr** geändert. Unterschiedliche Änderungen desselben Absatzes bleiben als Zeitkonflikt bestehen. Ihre Änderung der Moderation zu **Jimin und Seoyeon** und der neue Ort **Besprechungsraum im 3. Stock** werden automatisch übernommen.

Lösen Sie einen Konflikt auf eine der folgenden Arten:

- Links **&gt;&gt;**: den entsprechenden Inhalt der Ausgangsversion übernehmen.
- Rechts **&lt;&lt;**: den entsprechenden Inhalt der neu gespeicherten Version übernehmen.
- **Mit aktuellem Inhalt lösen**: den mittleren Inhalt beibehalten oder bearbeiten und als gelöst markieren.

Ändern Sie den Satz mit der Uhrzeit in der Mitte und wählen Sie **Mit aktuellem Inhalt lösen**. Bestätigen ist erst möglich, wenn alle Konflikte gelöst sind.

<MergeDemo partial />

Erneutes Bearbeiten eines gelösten Bereichs erhält seinen Status. Rückgängig nimmt auch den Lösungsstatus zurück, Wiederholen stellt ihn wieder her. Bloßes Löschen oder Bearbeiten von Text löst offene Konflikte nicht automatisch.

## Regeln für automatisches Zusammenführen und Konflikte

Verglichen werden Änderungen von der Ausgangsversion zu Ihrer Version sowie von derselben Ausgangsversion zur neuen Version. Einseitige und auf beiden Seiten identische Änderungen werden automatisch übernommen, ebenso Änderungen unterschiedlicher Absätze oder Zeilen.

Wie beim Text-Merge von Git werden Überschneidungen anhand von Absätzen und Zeilen beurteilt. Selbst unterschiedliche geänderte Wörter derselben Zeile bleiben ein Konflikt. Verschiedene Einfügungen an derselben Position oder Bearbeitungen von auf der anderen Seite gelöschtem Inhalt erfordern ebenfalls Ihre Entscheidung.

Ändern beide Seiten strukturierte Blöcke wie Tabellen, Listen oder Float-Bereiche unterschiedlich, entsteht ein Konflikt für die gesamte Struktur. Zellen und Listeneinträge werden nicht beliebig vermischt: Wählen Sie Inhalte aus oder bearbeiten Sie die Mitte. Auch überlappende Verschiebungen und Bearbeitungen mit unklarer Position werden nicht automatisch übernommen.

## Eine eigenständige Zusammenführungsansicht einbinden

Übergeben Sie gespeichertes NABI TREE JSON oder HTML-Strings als `base`, `local` und `incoming`. Verwenden Sie dieselben Wings und Optionen wie im ursprünglichen Editor. `mountMerge()` erstellt den mittleren Editor samt Werkzeugleiste, beide Quellen, Konfliktauswahl und Bestätigungsschaltfläche.

```ts
import { wings } from 'nabi-note'
import { mountMerge } from 'nabi-note/merge'
import 'nabi-note/nabi.css'

const merge = mountMerge({
  root: document.querySelector('#merge')!,
  base: editingStartedDocument,
  local: myEditedDocument,
  incoming: latestDocument,
  wings: wings().allBasic().build(),
  locale: 'de',
  incomingVersion: latestVersion,
  async onConfirm({ json, html, incomingVersion, signal }) {
    return saveDocument({ json, html, expectedVersion: incomingVersion, signal })
  },
  onError(error) {
    showError(error)
  },
})
```

`onConfirm` erhält JSON, Veröffentlichungs-HTML, Bearbeitungsrevision und `incomingVersion` des vollständig gelösten aktuellen Ergebnisses. `false` schließt die Bestätigung nicht ab. Während das Promise aussteht, sind Bearbeitung, Konfliktauswahl und erneute Bestätigung gesperrt. Beim Abbau wird das `signal` des Ergebnisses abgebrochen. Koreanische IME-Komposition muss vor der Bestätigung enden.

Binden Sie eigene Bildauswahl oder Uploads wie beim normalen Editor ein. `toolbarOptions` nimmt Werkzeugleisten-Panels und Host-Aktionen entgegen, `surfaceOptions` die Optionen der Bearbeitungsfläche.

`incomingVersion` gibt den vom Host gelieferten Wert unverändert zurück. Der Dienst muss ihn beim Speichern mit der aktuellen Serverversion vergleichen. Wurde währenddessen erneut gespeichert, laden Sie das neueste Dokument und beginnen Sie eine neue Zusammenführung, statt es mit einem alten Ergebnis zu überschreiben.

Statusabfrage und Bestätigung sind auch außerhalb der Ansicht möglich.

```ts
const stop = merge.session.onChange((state) => {
  updateRemainingCount(state.unresolvedCount)
})

const canConfirm = merge.session.getState().canConfirm
const confirmed = await merge.confirm()

stop()
merge.unmount()
```

Lesen Sie das Ergebnis mit `merge.nabi.getJson()` und `merge.nabi.getHtml()`. Speichern Sie weder das Editor-DOM noch `getEditorHtml()`. Für die gezielte Übernahme früherer Inhalte zwischen zwei Versionen verwenden Sie den Klick-Merge im [Vergleich](./compare).

## Nach Abschluss der Uploads bestätigen

Verbinden Sie den `upload`-Wing und `mountUpload()` für Dateischaltfläche, Einfügen und Drag-and-drop. `sendUpload` sendet Dateien zum Server und liefert `{ uri }`. Ein vollständiges Beispiel für Serveranbindung und Fortschrittsanzeige steht unter [Datei-Upload](../wing/etc/upload).

Mit `merge.session.hold()` setzen Sie Bestätigung und Konfliktauswahl aus, solange asynchrone Vorgänge wie Uploads noch nicht im Dokument angekommen sind. Rufen Sie die zurückgegebene Funktion bei Abschluss, Abbruch oder Abbau auf. Geben Sie erst **nach dem Einfügen ins Dokument** frei, nicht direkt nach dem Server-Upload, damit die Datei im Ergebnis enthalten ist.

```ts
import { mountUpload, wings, type UploadMount } from 'nabi-note'
import { mountMerge } from 'nabi-note/merge'

let upload: UploadMount | undefined
let releaseUpload: (() => void) | undefined

const merge = mountMerge({
  root,
  base,
  local,
  incoming,
  wings: wings().allBasic().use('upload').build(),
  locale: 'de',
  incomingVersion: latestVersion,
  toolbarOptions: { onFiles: (files) => upload?.take(files) },
  surfaceOptions: { fileSink: (files) => upload?.take(files) },
  onConfirm: ({ json, html, incomingVersion, signal }) =>
    saveDocument({ json, html, expectedVersion: incomingVersion, signal }),
})

upload = mountUpload({
  nabi: merge.nabi,
  root: merge.content,
  locale: 'de',
  uploader: sendUpload,
  onStart() {
    releaseUpload = merge.session.hold()
  },
  onDone() {
    releaseUpload?.()
    releaseUpload = undefined
  },
})

function dispose() {
  upload?.unmount()
  releaseUpload?.()
  merge.unmount()
}
```

`merge.content` ist das mittlere Editor-DOM; `merge.surface` und `merge.toolbar` sind bereits eingebunden. Erstellen Sie dort keine weitere Bearbeitungsfläche oder Werkzeugleiste. Bauen Sie zusätzliche Upload- und Fortschritts-Mounts zuerst ab und rufen Sie zuletzt `merge.unmount()` auf.
