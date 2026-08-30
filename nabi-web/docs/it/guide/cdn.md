---
title: Usare CDN
description: Esempio di collegamento di NABI NOTE per il browser senza uno strumento di build.
---

<script setup>
import CdnDemo from '../../.vitepress/ui/CdnDemo.vue'
</script>

# Usare CDN

In una pagina statica dove è difficile installare il pacchetto, puoi caricare il bundle per browser e il CSS di NABI NOTE da CDN. L'esempio seguente legge automaticamente la versione del pacchetto durante la build per creare gli indirizzi e assembla l'editor tramite l'oggetto globale `NabiNote`.

<CdnDemo />

## Aspetti da verificare in NABI NOTE

- Nel codice di distribuzione usa la stessa versione fissata sia per il CSS sia per JavaScript del browser. Un indirizzo senza versione, come `latest`, può modificare il comportamento quando esce una nuova versione.
- Il bundle per browser espone l'API radice come `window.NabiNote`. Non esistono bundle globali separati per `nabi-note/ssr`, `nabi-note/viewer` e `nabi-note/diff`.
- Il salvataggio dei file e la cronologia locale dell'esempio funzionano nel browser dell'utente. Se ti servono il salvataggio sul server o la sincronizzazione dell'account, invia il risultato di `getJson()` all'API dell'applicazione.
- Quando aggiungi il caricamento, collega non solo la wing `upload`, ma anche la funzione di invio effettiva e le wings di immagine o collegamento necessarie. Il server di caricamento è responsabile della convalida dei file.
- Il bundle per browser include internamente un HTML parser. Perciò `setHtml()`, l'apertura di file HTML e l'incollamento di HTML non richiedono un'opzione parser separata né un'API privata.

CDN cambia soltanto il modo di caricare. Il formato di salvataggio e la convalida dell'input sono gli stessi dell'installazione con npm, quindi consulta anche [l'uso di base](/it/guide/getting-started).
