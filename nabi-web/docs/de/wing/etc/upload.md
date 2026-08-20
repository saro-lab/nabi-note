---
title: Datei hochladen
---

# Datei hochladen

## Beschreibung

Der Upload zerfällt in drei Stücke — mit der bloßen Registrierung des Flügels geschieht nichts.

1. **`uploadWing`** — heftet der Werkzeugleiste die Schaltfläche zur Dateiauswahl an. Dieser Flügel
   selbst erzeugt weder `img` noch `a` — eine hochgeladene Datei wird als das festgeschrieben, was der
   Bild- oder Link-Flügel zeichnet, deshalb müssen Sie **`imageWing` oder `linkWing` mit
   registrieren**, damit das Ergebnis im Dokument landet. Fehlt beides, **kommt die Ausnahme genau an
   der Stelle der Registrierung** (nie später).
2. **`mountUpload({ … })`** — die Seite, die die Dateien tatsächlich entgegennimmt und `uploader`
   laufen lässt. Drop, Einfügen und die Auswahl-Schaltfläche fließen alle hierher. **Lassen Sie dieses
   Mounten aus, steht zwar die Schaltfläche da, aber es geschieht nichts.**
3. **`mountUploadView({ … })`** — die Seite, die Fortschritts-Platzhalter auf dem Bildschirm
   aufstellt. Ohne sie funktioniert der Upload trotzdem, nur sagt der Bildschirm während des Laufs
   nichts.

`uploader` hat die Gestalt `(task) => Promise<{ uri } | null>` — **eine URI bedeutet Erfolg, `null`
bedeutet Fehlschlag**, und der Platzhalter wird entfernt. Mit `task.onProgress(0–100)` melden Sie den
Fortschritt, und bricht `task.signal` ab, halten Sie an.

Die Grenzen sind `extensions`, `maxFileSize` und `maxTotalSize`, alle optional (0 oder weggelassen
bedeutet keine Grenze). Herausgefilterte Dateien kommen bei `onReject` an.

## Was nach dem Hochladen zurückbleibt

Bilder werden als Block von `imageWing` festgeschrieben, alle übrigen Dateien als Anhang-Link von
`linkWing`.

- **Der Name eines Anhangs ist ein lokalisiertes Namensschild, nicht der Dateiname** — auf Deutsch
  „Anhang". Ein Dateiname ist meist zu lang, um ihn im Dokument zu belassen, und vor allem muss er
  änderbar sein. Setzen Sie den Caret in diesen Link und ändern Sie ihn im
  [Namensfeld der Kontextzeile](../inline/link).
- **Die Endung bleibt als Kennzeichen zurück** — `data-nabi-file="pdf"`. Dieser Wert wird aus dem
  echten Dateinamen gezogen, und das Stylesheet zeichnet ihn als Abzeichen. Ändern Sie den Namen,
  reist das Kennzeichen mit.
- Eine Adresse, die der Link-Flügel ablehnen würde (etwa ein `blob:`, das ohne eingeschaltetes
  `allowLocalUrls` hereinkommt), wird zum bloßen Dateinamen als reinem Text herabgestuft — die
  Whitelist wird nie umgangen.

## Was während des Hochladens zu sehen ist

Während eine Datei hochlädt, steht an dieser Stelle ein vorläufiger Kasten — er lebt nur im DOM des
Editors, nie im Nabi-Baum, sodass im gespeicherten Wert kein einziges Zeichen davon zurückbleibt.

- **Bilder** zeigen sofort eine aus der gewählten Datei gebaute Vorschau, über die sich ein Raster
  legt. Mit dem Fortschritt wird Feld für Feld abgetragen, bis das Bild scharf dasteht. Die Reihenfolge,
  in der die Felder verschwinden, ist pro Datei gemischt, sodass beim gleichzeitigen Hochladen mehrerer
  Bilder nie dasselbe Muster wiederkehrt.
- **Dateien, die keine Bilder sind**, erhalten einen Kasten ohne Raster — eine 📎-Büroklammer mit dem
  Namensschild „Anhang" — mit der Endung daneben als Großbuchstaben-Abzeichen (`PDF` und so weiter). Ein
  Bild, dessen Vorschau sich nicht zeichnen lässt, fällt ebenfalls hierher.
- Der Fortschritt reitet als `data-nabi-per` auf dem Kasten, und das Stylesheet zeichnet ihn. Jeder
  Kasten trägt während des Hochladens eine Abbrechen-Schaltfläche (×), und während der Stapel läuft, ist
  das Bearbeiten gesperrt.

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

// Der Upload braucht den Bild- und Link-Flügel, damit ein Ergebnis zurückbleibt — ohne sie kommt hier sofort die Ausnahme
const { nabi, registry } = createNabiWith([imageWing, linkWing, uploadWing])

mountSurface({ nabi, registry, root: surface })

// Die Seite, die die Fortschritts-Platzhalter aufstellt — zuerst bauen, dann unten verdrahten
const view = mountUploadView({ nabi, surface, locale: 'de' })

const upload = mountUpload({
  nabi,
  root: surface,
  locale: 'de',
  extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf'],
  maxFileSize: 10 * 1024 * 1024,
  uploader: async (task) => {
    // Hier kommt der Code hin, der wirklich auf Ihren Server hochlädt. Eine URI bedeutet Erfolg, null bedeutet Fehlschlag
    // const uri = await user_callback(task.file, task.onProgress, task.signal)
    // return { uri }
    return null
  },
  onStart: (tasks) => view.start(tasks),
  onProgress: (id, percent) => view.progress(id, percent),
  onSettle: () => view.settle(),
  onDone: () => view.done(),
})

mountToolbar({
  nabi, registry, surface,
  root: document.querySelector<HTMLElement>('#toolbar')!,
  // Wohin die von der Dateiauswahl-Schaltfläche der Werkzeugleiste gewählten Dateien fließen
  onFiles: (files) => upload.take(files),
})
```

## Demo

Diese Website hat keinen Server, auf den sich etwas laden ließe, und tut daher nur so — sie gibt die
von `URL.createObjectURL()` erzeugte `blob:`-Adresse unverändert zurück. Das Ergebnis bleibt allein
auf dieser Seite.

<WingDemo path="/wing/etc/upload" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
