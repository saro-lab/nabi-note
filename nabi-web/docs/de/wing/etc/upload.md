---
title: Datei hochladen
---

# Datei hochladen

## Beschreibung

Der Dateiupload läuft über das Zusammenspiel von drei Modulen:

1. **`uploadWing`**: stellt der Werkzeugleiste eine Schaltfläche für Dateianhänge bereit. Das Ergebnis wird als Bild- oder Datei-Link-Knoten ins Dokument eingefügt, deshalb **müssen `imageWing` oder `linkWing` mit registriert sein**. Fehlen beide, wirft die Initialisierung eine Ausnahme.
2. **`mountUpload({ … })`**: nimmt Dateien aus Drag-and-Drop, Zwischenablage-Einfügen oder der Dateiauswahl der Werkzeugleiste entgegen und übergibt sie an die `uploader`-Funktion des Hosts.
3. **`mountUploadView({ … })`**: zeichnet die Platzhalter-UI für den Uploadfortschritt auf dem Bildschirm.

::: warning Regel für den Umgang mit Datei-Uploads beim Einfügen aus der Zwischenablage
Enthalten die Zwischenablage-Daten **Text oder HTML** (`text/html` oder `text/plain`), läuft das Einfügen über die normale Text-/Markdown-Pipeline statt über den Upload. Die Upload-Pipeline wird nur aufgerufen, wenn die Zwischenablage ausschließlich Dateidaten enthält. (Ein per Drag-and-Drop angehängtes Bild läuft immer über die Upload-Pipeline.)
:::

Die `uploader`-Funktion hat die Signatur `(task) => Promise<{ uri: string } | null>`. Bei erfolgreichem Upload zum Server gibt sie ein `{ uri }`-Objekt zurück, bei einem Fehlschlag `null`. Über den Callback `task.onProgress(0–100)` lässt sich der Fortschritt melden, über `task.signal` das Abbruchsignal behandeln.

Optionen für Dateierweiterung und Größenbegrenzung: `extensions`, `maxFileSize`, `maxTotalSize` (ohne Angabe kein Limit). Ungültige Dateien werden an den `onReject`-Callback übergeben.

## Wie das Dokument nach dem Upload gerendert wird

- **Bilddateien** werden als `<img>`-Blockobjekt von `imageWing` eingefügt.
- **Sonstige Anhänge** werden als Datei-Download-Link von `linkWing` eingefügt (`<a data-nabi-file="pdf" href="...">`). Der Anzeigetext des Anhangs wird passend zur Locale als „Anhang" erzeugt und lässt sich frei ändern, indem Sie den Cursor in den Link setzen und die Kontextleiste nutzen.

## Anwendungsbeispiel

```ts
import {
  createNabiWith,
  mountSurface,
  mountToolbar,
  mountUpload,
  mountUploadView,
  imageWing,
  linkWing,
  uploadWing,
} from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// Der Upload-Flügel braucht den Bild- oder Link-Flügel mit registriert
const { nabi, registry } = createNabiWith([imageWing, linkWing, uploadWing])

mountSurface({ nabi, registry, root: surface })

// UI-View für den Uploadfortschritt mounten
const view = mountUploadView({ nabi, surface, locale: 'de' })

const upload = mountUpload({
  nabi,
  root: surface,
  locale: 'de',
  extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'zip'],
  maxFileSize: 10 * 1024 * 1024,   // 10 MB
  uploader: async (task) => {
    // Hier die tatsächliche Upload-Logik zum Backend-Server implementieren
    // const uri = await myUploadApi(task.file, task.onProgress, task.signal)
    // return { uri }
    return null
  },
  onStart: (tasks) => view.start(tasks),
  onProgress: (id, percent) => view.progress(id, percent),
  onSettle: () => view.settle(),
  onDone: () => view.done(),
})

mountToolbar({
  nabi,
  registry,
  surface,
  root: document.querySelector<HTMLElement>('#toolbar')!,
  onFiles: (files) => upload.take(files),
})
```

## Demo

<WingDemo path="/wing/etc/upload" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
