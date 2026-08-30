---
title: Vibe coding con l'AI
description: Aiuta gli agenti di coding a usare NABI NOTE con precisione, basandosi sull'API pubblica attuale e sui confini della documentazione.
---

# Vibe coding con l'AI

NABI NOTE fornisce [`llms.txt`](/llms.txt) per gli strumenti AI e di automazione. Invece di chiedere a un agente di indovinare l'intera libreria, parti da questo indice e fagli leggere solo i documenti necessari al compito.

## Prompt da cui partire

Inserisci il framework e le funzionalità che ti servono nell'esempio seguente.

```text
Implementa un editor con NABI NOTE (nabi-note).
Leggi prima https://nabi.saro.me/llms.txt, poi leggi soltanto i documenti necessari per questo compito.

Ambiente: Vue 3 + TypeScript
Funzionalità richieste: formattazione di base, tabelle, immagini e upload
Origine archiviata: JSON NABI TREE
Pubblicazione: renderizzare sul server il JSON archiviato in HTML

Usa soltanto export pubblici e API che esistono davvero nei tipi installati.
Dopo l'implementazione, esegui il controllo dei tipi e una build, quindi indica i file modificati e i risultati della verifica.
```

Se l'agente non può aprire URL, inserisci nella conversazione `llms.txt` e i documenti collegati pertinenti.

## Indicalo solo a ciò che serve

`llms.txt` è un indice compatto. Fornire a un agente solo le pagine pertinenti è generalmente più utile che inviargli tutti i documenti insieme.

- Per assemblare con npm: [`quickstart-npm.md`](https://nabi.saro.me/llms/quickstart-npm.md)
- Per configurare il CDN: [`quickstart-cdn.md`](https://nabi.saro.me/llms/quickstart-cdn.md)
- Per scegliere le wing: [`wings.md`](https://nabi.saro.me/llms/wings.md)
- Per JSON archiviato, HTML ed eventi di modifica: [`document-model.md`](https://nabi.saro.me/llms/document-model.md)
- Per importazione HTML, incollamento e limiti degli upload: [`io-security.md`](https://nabi.saro.me/llms/io-security.md)
- Per wing personalizzate e rendering sul server: [`custom-wing.md`](https://nabi.saro.me/llms/custom-wing.md), [`ssr.md`](https://nabi.saro.me/llms/ssr.md)
- Per viewer, diff, stili e capilettera: [`viewer-diff.md`](https://nabi.saro.me/llms/viewer-diff.md), [`styling.md`](https://nabi.saro.me/llms/styling.md)
- Per import e tipi esatti: [`api-reference.md`](https://nabi.saro.me/llms/api-reference.md)

## Includi i requisiti del prodotto

Un agente non può dedurre dalla sola schermata di modifica l'archiviazione, la politica di sicurezza o il comportamento degli upload. Indica il framework effettivo, le wing incluse ed escluse, se JSON e HTML vengono archiviati, il contratto di richiesta e risposta dell'endpoint di upload, i limiti dei file e se le pagine pubblicate necessitano di SSR, comportamento del viewer o confronto.

Per gli aspetti non ancora decisi, chiedi all'agente di spiegare le opzioni e il loro impatto prima di implementare una scelta.

## Verifica il risultato

Esamina il codice generato come qualunque altro codice. In particolare, verifica che:

- carichi `nabi-note/nabi.css` sia per la modifica sia per il contenuto pubblicato;
- usi lo stesso `registry` per le wing selezionate e per ogni mount;
- archivi `getJson()`, mai `getEditorHtml()`;
- non scriva direttamente nell'`innerHTML` di un elemento `.nabi-content` in modifica;
- smonti ogni mount quando la schermata si chiude;
- convalidi tipo MIME, dimensione, autorizzazione e posizione di archiviazione sul server di upload;
- usi lo stesso ordine delle wing e le opzioni che influenzano l'HTML su server e browser;
- confermi i nomi di export effettivi con controllo dei tipi, test e build.

Il comportamento di IME e cursore, così come i percorsi di salvataggio e caricamento, richiedono una verifica reale anche quando la pagina sembra funzionare una volta. Prova l'input in composizione su dispositivi mobili e il ripristino di documenti salvati.

## Dai priorità alla versione installata

Quando un progetto ha già `nabi-note` installato, gli export di `package.json` e le dichiarazioni dei tipi sono più pertinenti del sito web costruito per un'altra release. Chiedi all'agente di verificare tale differenza di versione prima di scrivere codice.
