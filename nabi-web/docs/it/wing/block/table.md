---
title: Tabella
description: Inserisci più paragrafi e blocchi nelle celle e modifica sfondi, unioni e allineamento.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Tabella

Scegli righe e colonne dalla barra degli strumenti per creare una tabella. Le celle possono contenere più paragrafi, immagini, elenchi, citazioni, codice, sezioni comprimibili e video. Posiziona il cursore in una cella per modificare righe, colonne, unioni, intestazioni e colori di sfondo con gli strumenti delle proprietà sottostanti.

Prova a modificare i paragrafi e gli elenchi nelle celle dell’esempio seguente, poi trascina su più celle per cambiarne insieme lo sfondo. Fai clic su **Seleziona tabella** negli strumenti delle proprietà per allineare la tabella stessa dalla barra degli strumenti principale.

<WingDemo path="/wing/block/table" />

```ts
const selected = wings().use('table').build()
```

Registra anche le ali da usare nelle celle. Per un editor con tutte le ali di base, componilo con `wings().allBasic()`.

## Scrivere nelle celle

| Input | Comportamento |
| --- | --- |
| Enter in un paragrafo normale | Crea un nuovo paragrafo nella stessa cella. |
| Shift+Enter | Inserisce un’interruzione di riga nel paragrafo o nella voce di elenco corrente. |
| Tab / Shift+Tab in un paragrafo normale | Passa alla cella successiva / precedente. |
| Tab / Shift+Tab in un elenco o nel codice | Usa l’aumento / la riduzione del rientro del blocco. |

Enter negli elenchi e nel codice segue le regole di input di ciascun blocco. Anche quando non è più possibile ridurre il rientro del codice, Shift+Tab non passa alla cella precedente. Backspace o Delete all’inizio o alla fine di una cella non la unisce a una cella adiacente o a un paragrafo esterno alla tabella.

L’incolla e l’inserimento di immagini o blocchi rimangono nella cella in cui è iniziata l’operazione. Non è possibile inserire blocchi o incollare in selezioni che attraversano i confini delle celle. Tabelle e [aree flottanti](./float) non possono essere annidate nelle celle; quando si importano o incollano strutture di questo tipo, il loro contenuto viene estratto nell’ordine originale.

Le celle normali possono contenere titoli, ma il formato titolo non si applica alle celle di intestazione. Convertendo una cella in intestazione, i titoli interni diventano paragrafi normali, mantenendo il testo e le altre formattazioni.

## Colori di sfondo delle celle

Il colore di sfondo si applica a una cella o a un intervallo rettangolare selezionato trascinando. Anche selezionando solo parte del testo, cambia lo sfondo dell’intera cella che lo contiene. I colori tenui si adattano ai temi chiaro e scuro. Se le celle selezionate hanno colori diversi, nessun singolo colore viene indicato come selezionato.

Puoi cambiare il colore anche tramite un comando, mantenendo la selezione corrente delle celle.

```ts
nabi.applyCommand('setCellColor', { bg: 'cyan' })
```

I valori consentiti sono `yellow`, `green`, `cyan`, `pink`, `purple` e `orange`. Per ripristinare lo sfondo predefinito, scegli **Predefinito** negli strumenti delle proprietà o passa una stringa vuota.

```ts
nabi.applyCommand('setCellColor', { bg: '' })
```

Eliminare il contenuto, tagliare e cancellare la formattazione non rimuove i colori di sfondo. L’unione usa il colore della cella in alto a sinistra; la divisione assegna lo stesso colore alle nuove celle. Righe e colonne aggiunte partono dallo sfondo predefinito. Le modifiche al colore di sfondo supportano annullamento e ripristino.

## Allineare il contenuto e la tabella

Con il cursore in una cella, l’allineamento si applica ai paragrafi o alle immagini al suo interno. Selezionando più celle, viene applicato a tutti i paragrafi e gli oggetti allineabili contenuti, escluso il codice. Anche lo stato degli strumenti di titolo, allineamento e capolettera segue i paragrafi interni effettivamente selezionati. Valori diversi nei paragrafi selezionati non vengono mostrati come un unico valore.

Per allineare la tabella stessa, fai clic su **Seleziona tabella** negli strumenti delle proprietà, poi usa i pulsanti di allineamento della barra principale. Lo stesso allineamento è disponibile quando il cursore si trova prima o dopo il paragrafo che avvolge la tabella e compare un bordo tratteggiato. Il bordo indica soltanto il destinatario dell’azione; non trasforma il cursore in una selezione dell’intera tabella.

```ts
nabi.applyCommand('selectTable')
nabi.applyCommand('setAlign', { value: 'c' })
```

L’aggiunta e l’eliminazione di righe e colonne, l’unione e la divisione agiscono sulle celle selezionate. L’unione conserva i blocchi di ogni cella nell’ordine delle righe. La divisione lascia il contenuto nella cella originale e le altre celle vuote.

## Copiare e salvare

Copiare più celle selezionate copia l’intervallo rettangolare visibile fino all’ultima cella inclusa. HTML e il formato interno degli appunti conservano celle vuote, unioni, blocchi, formattazione del testo e colori di sfondo. Il testo semplice separa le celle con tabulazioni e interruzioni di riga, conservando le interruzioni tra i blocchi di una cella e gli indirizzi di immagini e video. Tagliare svuota solo il contenuto delle celle selezionate ed è reversibile con un unico annullamento.

Quando il cursore è prima o dopo una tabella e compare il bordo tratteggiato, copia e taglia si applicano all’intero paragrafo che la avvolge. Taglia rimuove paragrafo e tabella dopo che la scrittura negli appunti è riuscita. Tagliare o eliminare una tabella all’interno di un’area flottante lascia intatta l’area flottante esterna.

Il salvataggio in JSON e HTML conserva i blocchi e i colori di sfondo delle celle. Le tabelle semplici vengono esportate come tabelle Markdown; quelle con più blocchi o colori di sfondo rimangono in HTML per conservarne il contenuto. In HTML, il nome del colore è memorizzato nell’attributo `data-nabi-cell-color` di `td` o `th`. Gli stili arbitrari di colore di sfondo provenienti da HTML esterno non vengono importati come colori di sfondo delle celle.

Per ordinare le colonne nella vista pubblicata, salva la tabella come ordinabile e collega `attachViewer()` da `nabi-note/viewer`. Le tabelle con celle unite sono escluse dall’ordinamento per colonna.

## Stili CSS

Applica gli stili alle tabelle con `.nabi-content table` e alle celle con `.nabi-content :is(th, td)`. Applica le righe alternate e gli sfondi delle intestazioni soltanto alle celle senza colore, per non sovrascrivere gli sfondi assegnati.

```css
.article-body table { inline-size: 100%; border-collapse: collapse; }
.article-body :is(th, td) { padding: .6rem .75rem; border: 1px solid var(--nabi-line); }
.article-body th { font-weight: 700; }
.article-body th:not([data-nabi-cell-color]) { background: var(--nabi-soft); }
.article-body tr:nth-child(even) td:not([data-nabi-cell-color]) {
  background: color-mix(in srgb, var(--nabi-soft) 45%, transparent);
}
```

Modifica i colori di sfondo stessi tramite variabili CSS con il nome del colore, come `--nabi-cell-yellow`. Carica il CSS seguente dopo quello del pacchetto e assegna la classe `table-note` e il valore `data-nabi-theme` del tema corrente direttamente all’elemento `.nabi` dell’editor o all’elemento `.nabi-content` della vista pubblicata.

```css
.table-note:is(.nabi, .nabi-content)[data-nabi-theme="light"] {
  --nabi-cell-cyan: #e2f4f7;
}
.table-note:is(.nabi, .nabi-content)[data-nabi-theme="dark"] {
  --nabi-cell-cyan: #183b43;
}
```

Se il viewer è collegato, conserva il pulsante `.nabi-sort`. Sovrascrivere forzatamente `position` o il padding destro delle celle può causare sovrapposizioni con il pulsante di ordinamento.
