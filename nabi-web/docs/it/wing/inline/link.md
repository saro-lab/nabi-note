---
title: Link
description: Collega indirizzi web sicuri e mostra gli allegati caricati.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Link

Seleziona del testo e associa un indirizzo. Se inserisci un indirizzo senza selezionare testo, l’indirizzo stesso viene inserito come testo del link. Anche digitare un indirizzo `http://` o `https://` e poi premere Space o Enter lo trasforma in link.

I link salvano solo `http:`, `https:` e percorsi dello stesso sito che iniziano con `.` o `/`. Gli indirizzi la cui origine non può essere identificata chiaramente, come `javascript:` o `//example.com`, vengono rifiutati. I link allegato creati dagli upload salvano anche informazioni sul file e non possono essere creati manualmente come link ordinari.

<WingDemo path="/wing/inline/link" />

```ts
const selected = wings().use('a').build()
```

## Incollare URL

Se l’intero contenuto incollato, esclusi gli spazi iniziali e finali, è un URL `http://` o `https://` valido, viene inserito subito come collegamento. Gli URL all’interno di frasi, il testo con più URL e i percorsi relativi seguono il comportamento di incollaggio esistente. Nei blocchi di codice e negli editor senza il wing dei collegamenti, il contenuto rimane testo. I dati interni validi degli appunti copiati dall’editor hanno la precedenza, per conservarne la formattazione originale.

Usa il callback `onPasteUrl` di `mountSurface()` per scegliere il testo visualizzato del collegamento.

| Argomento | Valore |
| --- | --- |
| `url` | L’URL completo senza gli spazi iniziali e finali |
| `isSameOrigin` | Indica se protocollo, host e porta dell’URL corrispondono all’origine del documento che contiene l’editor |
| `path` | Il percorso che inizia con `/`, inclusi query e frammento. Esempio: `/posts/1?a=2#top` |

```ts
const surface = mountSurface({
  nabi,
  registry,
  root: document.querySelector<HTMLElement>('#editor')!,
  onPasteUrl(url, isSameOrigin, path) {
    if (isSameOrigin && path === '/guide') return 'NABI NOTE'
    return url
  },
})
```

Una stringa restituita che non contiene soltanto spazi viene usata come testo visualizzato. Se il callback è assente, restituisce un valore vuoto o non di tipo stringa, oppure fallisce, l’URL incollato rimane il testo visualizzato. Le stringhe restituite non vengono mai interpretate come HTML e non modificano l’indirizzo del collegamento.

Il callback supporta anche funzioni `async` e promise. Il collegamento URL viene inserito subito mentre si attende la risposta; un risultato valido ricevuto in seguito cambia soltanto il testo visualizzato di quel collegamento. Un risultato tardivo viene ignorato se il collegamento è stato modificato o eliminato, se è stato caricato un nuovo documento o se la superficie è stata smontata.

## Stili CSS

Stilizza i link ordinari con `.nabi-content a` e i link allegato separatamente con `.nabi-content a[data-nabi-file]`.

```css
.article-body a:not([data-nabi-file]) {
  color: var(--nabi-accent);
  text-decoration-thickness: .08em;
  text-underline-offset: .16em;
}

.article-body a[data-nabi-file] {
  display: inline-flex;
  gap: .35em;
  padding: .25em .55em;
  background: var(--nabi-soft);
}
```

Le parti `::before` e `::after` dei link allegato sono usate per mostrare icona ed estensione del file, quindi di solito è meglio non sostituire o rimuovere il loro `content`.
