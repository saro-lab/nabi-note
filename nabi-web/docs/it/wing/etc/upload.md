---
title: Caricamento file
description: Collega il trasferimento dei file al caricatore del tuo servizio.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Caricamento file

Collega la selezione di file, il trascinamento e il rilascio e le operazioni di incolla che contengono solo file a un flusso di caricamento. La demo di questa pagina non invia file a un server; in un servizio reale devi collegare un uploader che riceva un file e restituisca un URL.

Per inserire i risultati del caricamento come blocchi immagine, serve il wing immagine. Per inserire altri file come link di allegati, serve il wing link. Se il tuo servizio accetta entrambi i formati, seleziona esplicitamente entrambi i wing. Durante il caricamento l'editor è bloccato e i file riusciti vengono inseriti insieme come un'unica operazione annullabile.

<WingDemo path="/wing/etc/upload" />

```ts
const selected = wings()
  .use('img')
  .use('a')
  .use('upload', { allowLocalUrls: false })
  .build()
```

Se selezioni solo `upload`, esso fornisce automaticamente la dipendenza mancante fra immagine e link. Il trasferimento viene collegato con `mountUpload()` e l'interfaccia di avanzamento nella schermata di modifica di solito con `mountUploadView()`. Se il server restituisce URL HTTPS, l'opzione per gli URL locali non è necessaria.

## Contratto API del server

NABI NOTE non invia autonomamente file al tuo server. La funzione `uploader` invia un file al server e, in caso di successo, restituisce solo un URL `https:` pubblico o autenticato. Il contratto API più semplice è il seguente.

```text
POST /api/uploads
Content-Type: multipart/form-data
Nome del campo: file

Successo: { "url": "https://cdn.example.com/uploads/8f2c.webp" }
Errore: risposta 4xx o 5xx
```

Il server non deve fidarsi soltanto del nome originale, dell'estensione o del valore MIME inviato dal browser. Verifica prima autenticazione e autorizzazione, limita la dimensione del file durante lo streaming e controlla il tipo reale del file. Crea il nome memorizzato sul server. Per le immagini, ricodificale o crea miniature quando necessario. Se i file caricati non devono essere scaricabili da chiunque, restituisci un percorso di download che richieda autenticazione anziché un URL pubblico.

| Controllo sul server | Motivo |
| --- | --- |
| Utente autenticato e permesso di caricamento | Evita di scrivere nello spazio di archiviazione di un altro utente |
| Dimensione di ogni file e della richiesta totale | Evita l'esaurimento di memoria e archiviazione |
| Tipo MIME reale ed estensione consentiti | Blocca file eseguibili con estensioni rinominate |
| Nome memorizzato casuale e archiviazione isolata | Evita manipolazione dei percorsi e sovrascrittura di file esistenti |
| Criteri di accesso e scadenza dell'URL di risposta | Evita che file privati siano esposti dal solo URL |

`extensions` e `maxFileSize` lato client sono solo il primo passo per offrire rapidamente un riscontro all'utente. Applica gli stessi limiti anche sul server.

## Collegare l'uploader nel browser

L'esempio seguente è il collegamento effettivo previsto da NABI NOTE. Usa `XMLHttpRequest` perché il normale `fetch()` del browser non fornisce l'avanzamento del caricamento. Restituisci dalla risposta del server solo l'`url`: le immagini diventano blocchi immagine e gli altri file link di allegati.

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
  { locale: 'it' },
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
    request.addEventListener('error', () => reject(new Error('La richiesta di caricamento non è riuscita.')))
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
  locale: 'it',
  onStart: (tasks) => uploadView.start(tasks),
  onProgress: (id, percent) => uploadView.progress(id, percent),
  onSettle: () => uploadView.settle(),
  onDone: () => uploadView.done(),
})

uploadView = mountUploadView({ nabi, surface: content, upload, locale: 'it' })

const surface = mountSurface({
  nabi,
  registry,
  root: content,
  fileSink: upload.take,
  locale: 'it',
})
```

Collega `fileSink: upload.take` affinché trascinamento e rilascio e le operazioni di incolla che contengono solo file entrino nel flusso di caricamento. L'interfaccia del wing di caricamento passa a `upload.take()` i risultati del pulsante di selezione file. Durante il caricamento l'editor è bloccato e i file riusciti di ciascun lotto vengono inseriti come un'unica operazione annullabile. `upload.cancel()` o il pulsante Annulla in `uploadView` interrompe le richieste in corso tramite `AbortSignal`.

## Errori e pulizia

Se il server restituisce una risposta di errore o l'`uploader` restituisce `null`, quel file non viene inserito nel documento. Gli altri file dello stesso lotto continuano a essere elaborati. Se viene superato il limite di dimensione totale, l'intero lotto non viene avviato. Alla chiusura della schermata, esegui l'unmount nell'ordine inverso alla creazione.

```ts
function dispose() {
  surface.unmount()
  uploadView.unmount()
  upload.unmount()
}
```

Solo durante lo sviluppo puoi usare URL `blob:` per un'anteprima immediata. In quel caso attiva `allowLocalUrls: true` nella configurazione dell'editor, nel wing immagine e nel wing di caricamento. Se i caricamenti reali del server restituiscono URL HTTPS, è più sicuro non abilitare questa opzione.

## Stili CSS

I file ordinari completati vengono mostrati dal wing link come `a[data-nabi-file]`. Usa questo selettore quando vuoi cambiare soltanto l'aspetto dell'allegato nella vista pubblicata.

```css
.article-body a[data-nabi-file] {
  padding: .3em .6em;
  border: 1px solid var(--nabi-line);
  border-radius: 8px;
  background: var(--nabi-soft);
}
```

I risultati del caricamento delle immagini seguono il CSS del wing immagine. L'avanzamento del caricamento appare solo nella vista di modifica, quindi il CSS della vista pubblicata non deve creare uno stato di avanzamento.
