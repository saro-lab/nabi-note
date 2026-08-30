---
title: Datei-Upload
description: Verbinden Sie die Dateiübertragung mit dem Uploader Ihres Dienstes.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Datei-Upload

Verbinden Sie Dateiauswahl, Drag & Drop und Einfügeoperationen, die nur Dateien enthalten, mit einem Upload-Vorgang. Die Demo auf dieser Seite sendet keine Dateien an einen Server; in einem echten Dienst müssen Sie einen Uploader verbinden, der eine Datei empfängt und eine URL zurückgibt.

Um Upload-Ergebnisse als Bildblöcke einzufügen, benötigen Sie die Image-Wing. Um andere Dateien als Anhangslinks einzufügen, benötigen Sie die Link-Wing. Wenn Ihr Dienst beide Formate akzeptiert, wählen Sie beide Wings explizit aus. Während des Uploads ist der Editor gesperrt, und erfolgreiche Dateien werden gemeinsam als ein Undo-Schritt eingefügt.

<WingDemo path="/wing/etc/upload" />

```ts
const selected = wings()
  .use('img')
  .use('a')
  .use('upload', { allowLocalUrls: false })
  .build()
```

Wenn Sie nur `upload` auswählen, wird automatisch die jeweils fehlende Abhängigkeit von Image oder Link bereitgestellt. Die Übertragung wird mit `mountUpload()` verbunden, und die Fortschritts-UI des Bearbeitungsbildschirms wird normalerweise mit `mountUploadView()` verbunden. Wenn der Server HTTPS-URLs zurückgibt, ist die lokale URL-Option nicht erforderlich.

## Server-API-Vertrag

NABI NOTE sendet keine Dateien selbst an Ihren Server. Die Funktion `uploader` sendet eine Datei an den Server und gibt im Erfolgsfall nur eine öffentliche oder authentifizierte `https:`-URL zurück. Der einfachste API-Vertrag sieht wie folgt aus.

```text
POST /api/uploads
Content-Type: multipart/form-data
Field name: file

Success: { "url": "https://cdn.example.com/uploads/8f2c.webp" }
Failure: 4xx or 5xx response
```

Der Server darf dem ursprünglichen Dateinamen, der Erweiterung oder dem MIME-Wert, die vom Browser gesendet werden, nicht blind vertrauen. Prüfen Sie zuerst Authentifizierung und Berechtigung, begrenzen Sie die Dateigröße während des Streamings und untersuchen Sie den tatsächlichen Dateityp. Erzeugen Sie den gespeicherten Namen auf dem Server. Kodieren Sie Bilder bei Bedarf neu oder erstellen Sie Thumbnails. Wenn hochgeladene Dateien nicht für alle herunterladbar sein sollen, geben Sie statt einer öffentlichen URL einen Download-Pfad zurück, der Authentifizierung erfordert.

| Prüfung auf dem Server | Warum |
| --- | --- |
| Angemeldeter Benutzer und Upload-Berechtigung | Verhindert das Schreiben in den Speicher eines anderen Benutzers |
| Größe pro Datei und Gesamtgröße der Anfrage | Verhindert das Erschöpfen von Arbeitsspeicher und Speicherplatz |
| Erlaubter tatsächlicher MIME-Typ und Erweiterung | Blockiert ausführbare Dateien mit umbenannten Erweiterungen |
| Zufälliger gespeicherter Name und isolierter Speicher | Verhindert Pfadmanipulation und Überschreiben bestehender Dateien |
| Zugriff auf die Antwort-URL und Ablaufrichtlinie | Verhindert, dass private Dateien allein durch die URL offengelegt werden |

Clientseitige `extensions` und `maxFileSize` sind nur der erste Schritt für schnelles Feedback an den Benutzer. Setzen Sie dieselben Grenzen auch auf dem Server.

## Uploader im Browser verbinden

Das folgende Beispiel ist die echte Verbindung, die NABI NOTE erwartet. Es verwendet `XMLHttpRequest`, da das Standard-`fetch()` des Browsers keinen Upload-Fortschritt bereitstellt. Geben Sie nur die `url` aus der Serverantwort zurück; Bilder werden zu Bildblöcken, andere Dateien werden zu Anhangslinks.

```ts
import {
  createNabiWith,
  mountSurface,
  mountUpload,
  mountUploadView,
  wings,
  type UploadTask,
} from 'nabi-note'

const content = document.querySelector<HTMLElement>('#content')!
const { nabi, registry } = createNabiWith(
  wings().use('img').use('a').use('upload').build(),
  { locale: 'de' },
)

function sendUpload(task: UploadTask): Promise<{ uri: string } | null> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest()
    request.open('POST', '/api/uploads')
    request.responseType = 'json'

    request.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) task.onProgress((event.loaded / event.total) * 100)
    })

    request.addEventListener('load', () => {
      const url = request.response?.url
      if (request.status >= 200 && request.status < 300 && typeof url === 'string') {
        resolve({ uri: url })
      } else {
        resolve(null)
      }
    })
    request.addEventListener('error', () => reject(new Error('Upload request failed.')))
    task.signal.addEventListener('abort', () => request.abort(), { once: true })

    const body = new FormData()
    body.append('file', task.file as File, task.name)
    request.send(body)
  })
}

let uploadView: ReturnType<typeof mountUploadView>
const upload = mountUpload({
  nabi,
  root: content,
  uploader: sendUpload,
  extensions: ['png', 'jpg', 'jpeg', 'webp', 'pdf'],
  maxFileSize: 10 * 1024 * 1024,
  maxTotalSize: 20 * 1024 * 1024,
  locale: 'de',
  onStart: (tasks) => uploadView.start(tasks),
  onProgress: (id, percent) => uploadView.progress(id, percent),
  onSettle: () => uploadView.settle(),
  onDone: () => uploadView.done(),
})

uploadView = mountUploadView({ nabi, surface: content, upload, locale: 'de' })

const surface = mountSurface({
  nabi,
  registry,
  root: content,
  fileSink: upload.take,
  locale: 'de',
})
```

Verbinden Sie `fileSink: upload.take`, damit Drag & Drop und Einfügeoperationen, die nur Dateien enthalten, in den Upload-Vorgang gehen. Die UI der Upload-Wing übergibt Ergebnisse der Dateiauswahl-Schaltfläche an `upload.take()`. Während des Uploads ist der Editor gesperrt, und erfolgreiche Dateien aus jedem Batch werden als ein Undo-Schritt eingefügt. `upload.cancel()` oder die Abbrechen-Schaltfläche in `uploadView` bricht laufende Anfragen über `AbortSignal` ab.

## Fehlerbereinigung

Wenn der Server eine Fehlerantwort zurückgibt oder `uploader` `null` zurückgibt, wird diese Datei nicht in das Dokument eingefügt. Andere Dateien im selben Batch werden weiterhin verarbeitet. Wenn das Gesamtgrößenlimit überschritten wird, startet der gesamte Batch nicht. Beim Schließen des Bildschirms unmounten Sie in umgekehrter Reihenfolge der Erstellung.

```ts
function dispose() {
  surface.unmount()
  uploadView.unmount()
  upload.unmount()
}
```

Nur während der Entwicklung können Sie `blob:`-URLs für eine sofortige Vorschau verwenden. Aktivieren Sie in diesem Fall `allowLocalUrls: true` in der Editor-Zusammenstellung, in der Image-Wing und in der Upload-Wing. Wenn echte Server-Uploads HTTPS-URLs zurückgeben, ist es sicherer, diese Option nicht zu aktivieren.

## CSS-Stile

Abgeschlossene normale Dateien werden über die Link-Wing als `a[data-nabi-file]` angezeigt. Verwenden Sie diesen Selektor, wenn Sie nur das Erscheinungsbild des Anhangs in der veröffentlichten Ansicht ändern möchten.

```css
.article-body a[data-nabi-file] {
  padding: .3em .6em;
  border: 1px solid var(--nabi-line);
  border-radius: 8px;
  background: var(--nabi-soft);
}
```

Bild-Upload-Ergebnisse folgen dem CSS des Image-Wings. Der Upload-Fortschritt erscheint nur in der Bearbeitungsansicht, sodass die CSS der veröffentlichten Ansicht keinen Fortschrittszustand erstellen muss.
