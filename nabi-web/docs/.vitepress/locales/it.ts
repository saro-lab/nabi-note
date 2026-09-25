const itMainSections = [
  `<p data-nabi-align="c"></p><div data-nabi-p data-nabi-align="c"><img src="https://nabi.saro.me/logo/nabi-mark-demo.svg" data-nabi-width="40"/></div><h1 data-nabi-align="c">NABI NOTE</h1><p data-nabi-align="c"><span data-nabi-size="lg"><i><span data-nabi-typeface="cursive">Un editor WYSIWYG open source</span></i></span></p><p></p><p data-nabi-dropcap="1"><span data-nabi-typeface="serif"><b>NABI NOTE</b> è un editor WYSIWYG open source: formattazione, allineamento, tabelle, caricamento e altre funzioni sono moduli indipendenti chiamati wing. Scegli solo le wing necessarie per assemblare un editor e collega anche quelle create da te. È scritto in JavaScript semplice e può essere usato con framework come React o Vue. Nelle pagine senza build puoi iniziare subito con la <b>libreria CDN</b>. Il suo formato di documento, <b>NABI TREE</b>, può diventare HTML anche in Node.js senza DOM del browser. I documenti di input vengono corretti dalle regole registrate; durante la creazione dell'HTML testo e attributi sono sottoposti a escape e gli indirizzi dei collegamenti sono verificati. Le wing personalizzate e i dati ricevuti dal server vanno comunque valutati secondo la politica di sicurezza dell'applicazione. Le variabili CSS e il layout basato su rem permettono di regolare tema e dimensioni; sono disponibili anche modalità scura e caratteri per più lingue.</span></p><p></p>`,
  `<h2>Carattere</h2><p>Senza grazie (predefinito), con grazie, monospaziato e corsivo: ogni famiglia dispone i font per sistema di scrittura. <b>L'host decide il carattere predefinito.</b></p><p></p><p>Ogni famiglia è mostrata <b>in molte lingue</b>.</p><p></p><p><span data-nabi-typeface="sans"><span data-nabi-size="lg">Senza grazie · 산세리프 · ゴシック体 · 无衬线 · Serifenlos · Sans empattement · Sin serifa · Sem serifa · Без засечек · بلا زخارف · सैन्स सेरिफ़ · স্যান্স সেরিফ · سانس سیرف · Tanpa serif · بدون سریف · सॅन्स सेरिफ · Không chân · శాన్స్ సెరిఫ్ · Mara seref · Bila serif · சான்ஸ் செரிஃப் · ไร้เชิง · Senza grazie</span></span></p><p></p><p><span data-nabi-typeface="serif"><span data-nabi-size="lg">Con grazie · 세리프 · 明朝体 · 衬线 · Avec empattement · Con serifa · Com serifa · С засечками · بزخارف · सेरिफ़ · সেরিফ · سیرف · Berserif · سریف · सेरिफ · Có chân · సెరిఫ్ · Mai seref · Yenye serif · செரிஃப் · มีเชิง · Con grazie</span></span></p><p></p><p><span data-nabi-typeface="mono"><span data-nabi-size="lg">Monospaziato · 고정폭 · 等幅 · 等宽 · Dicktengleich · Chasse fixe · Monoespaciada · Monoespaçada · Моноширинный · ثابت العرض · मोनोस्पेस · মনোস্পেস · یکساں چوڑائی · Lebar tetap · تک‌فاصله · Đơn cách · మోనోస్పేస్ · Tazara ɗaya · Eş aralıklı · Nafasi moja · ஒற்றையகலம் · ความกว้างคงที่ · Monospaziato</span></span></p><p></p><p><span data-nabi-typeface="cursive"><span data-nabi-size="lg">Corsivo · 필기체 · 筆記体 · 手写体 · Schreibschrift · Cursiva · Рукописный · خط اليد · हस्तलिपि · হস্তলিপি · رواں خط · Tulisan tangan · دست‌نویس · हस्ताक्षर · Chữ viết tay · చేతిరాత · Rubutun hannu · El yazısı · Mwandiko · கையெழுத்து · ลายมือ · Corsivo</span></span></p><p></p><p></p>`,
  `<h2>Dimensione del testo</h2><p><span data-nabi-size="xs">Molto piccolo</span></p><p><span data-nabi-size="sm">Piccolo</span></p><p><span data-nabi-size="lg">Grande</span></p><p><span data-nabi-size="xl">Molto grande</span></p><p></p><p></p><h2>Intestazione</h2><p>Su una riga vuota, digita # e poi uno spazio per trasformarla in un titolo.</p><h1>H1</h1><h2>H2</h2><h3>H3</h3><h4>H4</h4><h5>H5</h5><h6>H6</h6><p></p><p></p>`,
  `<h2>Grassetto · Corsivo · Sottolineato · Barrato</h2><p><b>Grassetto</b> <i>corsivo</i> <u>sottolineato</u> <s>barrato</s> — un esempio.</p><p><b><i><s><u>Possono anche essere combinati.</u></s></i></b></p><h3>Apice e pedice</h3><p>L'area è 3,5 m<sup>2</sup> e una nota si aggiunge così.<sup>1</sup></p><p>L'acqua è H<sub>2</sub>O.</p><p></p><p></p>`,
  `<h2>Colore del testo · Evidenziatore</h2><p>La tavolozza rimane leggibile sia in modalità chiara sia in modalità scura.</p><p>Colore del testo <span data-color="green">Verde</span> · <span data-color="coral">Corallo</span> · <span data-color="violet">Viola</span> · <span data-color="amber">Ambra</span> · <span data-color="blue">Blu</span></p><p>Evidenziatore <mark data-color="yellow">Giallo</mark> · <mark data-color="green">Verde</mark> · <mark data-color="cyan">Ciano</mark> · <mark data-color="pink">Rosa</mark> · <mark data-color="purple">Viola</mark> · <mark data-color="orange">Arancione</mark></p><p></p><p></p>`,
  `<h2>Collegamento</h2><p>Inserisci un indirizzo e diventa un <a href="https://nabi.saro.me/">collegamento</a>.</p><p>Puoi usare URL http:// e https://, oltre ai percorsi dello stesso sito che iniziano con . o /. Indirizzi come javascript: non sono consentiti.</p><p>Per esempio, digita <a href="https://nabi.saro.me/">https://nabi.saro.me</a> e premi spazio o Invio: viene convertito automaticamente.</p><h3>Apertura dei collegamenti</h3><p>Il documento memorizza solo l'indirizzo; la pagina che lo visualizza decide come aprire i collegamenti.</p><h3>Collegamento a un allegato</h3><p>Il caricamento di un file diverso da un'immagine lascia un collegamento con l'aspetto di un file.</p><p><a href="https://nabi.saro.me/file-link-test.txt" data-nabi-file="txt" download>Allegato</a> rimane così.</p><p></p><p></p>`,
  `<h2>Allineamento</h2><p>Allineato a sinistra</p><p>Allineato al centro</p><p>Allineato a destra</p><h3>Anche i titoli possono essere allineati.</h3><p></p><p></p><h2>Elenchi</h2><h3>Elenco puntato</h3><p>Su una riga vuota, digita - e premi <b>spazio</b>: diventa un elenco puntato.</p><div data-nabi-p><ul><li><p>Un elemento puntato</p><div data-nabi-p><ul><li><p>Tab / Maiusc+Tab aumentano o riducono il rientro.</p></li></ul></div></li></ul></div><h3>Elenco numerato</h3><p>Su una riga vuota, digita 1. e premi <b>spazio</b> per creare un elenco numerato.</p><div data-nabi-p><ol><li><p>Primo</p></li><li><p>Secondo</p></li><li><p>Terzo</p></li></ol></div><h3>Elenco attività</h3><p>Su una riga vuota, digita [ ] o [x] e premi <b>spazio</b> per creare un elenco attività.</p><div data-nabi-p><ul data-nabi-list="task"><li data-nabi-checked="true"><p>Questo elemento è selezionato.</p></li><li data-nabi-checked="false"><p>Questo non è ancora selezionato.</p></li></ul></div><p></p><p></p>`,
  `<h2>Tabella</h2><p>Fai clic sul pulsante della tabella nella barra degli strumenti, poi aggiungi, elimina e unisci righe e colonne.</p><h3>Ordinamento delle colonne</h3><p><b>Anteprima</b>: fai clic, quindi seleziona nell’ordine le intestazioni <b>Disponibilità</b> e <b>Prezzo</b>.</p><div data-nabi-p><div class="nabi-scroll"><table data-nabi-sortable><tr><th><p>Modello</p></th><th><p>Disponibilità</p></th><th><p>Prezzo</p></th><th><p>Peso</p></th></tr><tr><td><p>NB-7</p></td><td><p>1,200</p></td><td><p>349</p></td><td><p>1.2 kg</p></td></tr><tr><td><p>NB-9</p></td><td><p>20,000</p></td><td><p>99</p></td><td><p>0.9 kg</p></td></tr><tr><td><p>NB-12</p></td><td><p>3,500</p></td><td><p>1,299</p></td><td><p>1.4 kg</p></td></tr><tr><td><p>NB-80</p></td><td><p>900</p></td><td><p>8,900</p></td><td><p>2.1 kg</p></td></tr><tr><td><p>NB-100</p></td><td><p>Da definire</p></td><td><p>12,999</p></td><td><p>2.4 kg</p></td></tr></table></div></div><p><b>Prezzo</b> contiene solo numeri, quindi viene ordinato numericamente.</p><p><b>Disponibilità</b> viene ordinata come testo perché l'ultima cella contiene lettere.</p><p></p><p></p>`,
  `<h2>Separatore</h2><p>Digita --- e premi Invio per trasformarlo in un separatore.</p><div data-nabi-p><hr/></div><p></p><p></p>`,
  `<h2>Immagine</h2><p>La larghezza va dal 30% al 100% e l'immagine può essere allineata a sinistra, al centro o a destra.</p><div data-nabi-p><img src="https://nabi.saro.me/logo/nabi-mark-demo.svg" data-nabi-width="40"/></div><p></p><p></p>`,
  `<h2>YouTube</h2><div data-nabi-p><iframe src="https://www.youtube-nocookie.com/embed/6j-gQmaZ9Zk" title="YouTube" allowfullscreen loading="lazy" data-nabi-width="70"></iframe></div><p></p><p></p>`,
  `<h2>Caricamento</h2><p>Prova a trascinare un'immagine o un file nell'editor.</p><p>Il caricamento usato qui è simulato; un'impostazione lo collega al tuo server.</p><p>Se il caricamento non riesce, l'immagine o il file viene rimosso dall'editor.</p><p></p><p></p>`,
  `<h2>Citazione</h2><div data-nabi-p><blockquote><p>Su una riga vuota, digita &gt; e premi <b>spazio</b> per creare un riquadro di citazione.</p><p>Può occupare più righe.</p></blockquote></div><p></p><p></p>`,
  `<h2>Codice</h2><p>Su una riga vuota, digita \`\`\` e premi <b>spazio o Invio</b> per creare un blocco di codice.</p><p>Scrivi anche il linguaggio, ad esempio \`\`\`java, poi premi spazio o Invio per creare un blocco di codice con quel linguaggio.</p><div data-nabi-p><pre data-nabi-lang="typescript"><code class="language-typescript">import { createNabiWith, defaultWings } from 'nabi-note'<br/><br/>const { nabi } = createNabiWith(defaultWings)<br/>const html = nabi.getHtml()</code></pre></div><p></p><p></p>`,
  `<h2>Dettagli</h2><div data-nabi-p><details open><summary>I dettagli sono composti da un riepilogo e da un corpo.</summary><p>Puoi scegliere se salvarli chiusi o aperti.</p></details></div><p></p><h2></h2>`,
  `<h2>Scorciatoie</h2><p><b>Premi rapidamente Maiusc due volte</b> per mostrare nella barra degli strumenti la scorciatoia di ogni funzione.</p><p></p><p></p>`,
  `<h2>Formattazione automatica</h2><div data-nabi-p><div class="nabi-scroll"><table data-nabi-sortable><tr><th><p>Esempio</p></th><th><p>Tasto di azione</p></th><th><p>Risultato</p></th></tr><tr><td><p>#</p></td><td><p>Spazio</p></td><td><p>Intestazione</p></td></tr><tr><td><p>-</p></td><td><p>Spazio</p></td><td><p>Elenco puntato</p></td></tr><tr><td><p>1.</p></td><td><p>Spazio</p></td><td><p>Elenco numerato</p></td></tr><tr><td><p>[ ] · [x]</p></td><td><p>Spazio</p></td><td><p>Elenco attività</p></td></tr><tr><td><p>&gt;</p></td><td><p>Spazio</p></td><td><p>Citazione</p></td></tr><tr><td><p>\`\`\` · \`\`\`ts</p></td><td><p>Spazio · Invio</p></td><td><p>Blocco di codice</p></td></tr><tr><td><p>---</p></td><td><p>Invio</p></td><td><p>Separatore</p></td></tr><tr><td><p>https://…</p></td><td><p>Spazio · Invio</p></td><td><p>Collegamento</p></td></tr></table></div></div><p></p><p></p><h3>Funzioni di output</h3><div data-nabi-p><div class="nabi-scroll"><table data-nabi-sortable><tr><th><p>Funzione</p></th><th><p>Risultato</p></th></tr><tr><td><p>getHtml()</p></td><td><p>HTML</p></td></tr><tr><td><p>getJson()</p></td><td><p>JSON</p></td></tr></table></div></div><p></p><p></p>`,
  `<h2>Funziona senza DOM</h2><p>La conversione da JSON a HTML <b>non richiede un DOM</b>.</p><p>Un server (Node.js) può leggere un NABI TREE salvato e creare HTML con le stesse regole.</p><p></p><h2>Adatto ai dispositivi mobili</h2><div data-nabi-p><ul><li><p><b>Interfaccia mobile</b> — un layout reattivo gestisce l'interfaccia mobile.</p></li><li><p><b>Spazio della tastiera mobile</b> — quando la tastiera si apre, la sua altezza viene considerata.</p></li><li><p><b>Dimensionamento fluido</b> — ogni dimensione è espressa in rem.</p></li><li><p><b>Molte lingue</b> — supporta più lingue.</p></li></ul></div><p></p><h2>Personalizzazione</h2><div data-nabi-p><ul><li><p><b>La tua wing</b> — se ti serve una funzione, creala e registrala.</p></li><li><p><b>Il tuo CSS</b> — colori, angoli e spaziatura sono tutti definiti come --nabi-*, quindi puoi impostare modalità scura, chiara e altro.</p></li><li><p><b>Open source</b> — è open source su GitHub.</p></li></ul></div><div data-nabi-p><hr/></div><p>Leggi la documentazione → <a href="https://nabi.saro.me/">nabi.saro.me</a></p>`,
]

export const it = {
  label: 'Italiano',
  lang: 'it',
  link: '/it/',
  description: 'NABI NOTE — un editor WYSIWYG open source.',

  menu_docs: 'Documentazione',
  menu_icon_theme: "Temi delle icone",
  menu_intro_vibe_coding: 'Vibe coding con IA',



  menu_projects: 'Progetti',

  menu_inline: 'In linea',
  menu_inline_bold: 'Grassetto',
  menu_inline_italic: 'Corsivo',
  menu_inline_underline: 'Sottolineato',
  menu_inline_strikethrough: 'Barrato',
  menu_inline_superscript: 'Apice',
  menu_inline_subscript: 'Pedice',
  menu_inline_link: 'Collegamento',
  menu_inline_highlight: 'Evidenziatore',
  menu_inline_text_color: 'Colore del testo',

  menu_block: 'Blocco',
  menu_block_heading: 'Intestazione',
  menu_block_bullet_list: 'Elenco puntato',
  menu_block_ordered_list: 'Elenco numerato',
  menu_block_task_list: 'Elenco attività',
  menu_block_table: 'Tabella',
  menu_block_image: 'Immagine',
  menu_block_youtube: 'YouTube',
  menu_block_code: 'Codice',
  menu_block_details: 'Blocco richiudibile',
  menu_block_quote: 'Citazione',
  menu_block_divider: 'Separatore',

  menu_etc: 'Altro',
  menu_etc_align: 'Allineamento',
  menu_etc_dropcap: 'Capolettera',
  menu_etc_typeface: 'Carattere',
  menu_etc_font_size: 'Dimensione del testo',
  menu_etc_clear_format: 'Cancella formattazione',
  menu_etc_upload: 'Carica file',

  search: 'Cerca',
  search_no_results: 'Nessun risultato',
  search_hint: 'Inserisci un termine di ricerca',
  search_move: 'Sposta',
  search_open: 'Apri',
  search_close: 'Chiudi',

  // Exercises every wing but YouTube — no stranger's video on the front page
  // 유튜브만 빼고 기본 날개 전부를 써 보인다 — 앞면에 남의 영상을 걸지 않는다
  demo_html: itMainSections.join(""),
  demo_wings: 'Ali',
  demo_wings_all: 'Attiva tutto',
  demo_wings_none: 'Disattiva tutto',
  demo_zoom: 'Zoom',
  demo_zoom_out: 'Riduci',
  demo_zoom_in: 'Ingrandisci',
  demo_zoom_reset: 'Ripristina',
  demo_sticky: 'Barra degli strumenti fissa',
  demo_sticky_keyboard: 'Spazio per tastiera mobile',
  demo_sticky_height: 'Altezza',
  demo_sticky_unit: 'Unità di altezza',
  demo_typeface_base: 'Carattere di base',
  demo_typeface_sans: 'Senza grazie',
  demo_typeface_serif: 'Con grazie',
  demo_typeface_mono: 'Monospaziato',
  demo_typeface_cursive: 'Corsivo',
  demo_html_small: '<p>Scrivi qui e attiva o disattiva le ali qui sopra.</p>',

  // Paired to pages by `src/sample.ts`; may use only markup that page enables (`src/wings.ts`)
  // 짝은 `src/sample.ts` 가 맺는다 — 그 페이지에서 켜지는 마크업만 써야 평문으로 안 떨어진다
  demo_html_bold:
    '<p>Metti in evidenza <b>le parole importanti</b>. Seleziona il testo e premi <b>B</b> nella barra degli strumenti.</p>',
  demo_html_italic:
    '<p>Le citazioni e le parole non comuni si scrivono in <i>corsivo</i>. Seleziona questa frase e prova.</p>',
  demo_html_underline:
    '<p>Qui c’è una <u>sottolineatura</u>. Seleziona le lettere e premi di nuovo per toglierla.</p>',
  demo_html_strikethrough: '<p><s>19,00 €</s> 9,90 € — per lasciare visibile il prezzo precedente.</p>',
  demo_html_superscript:
    '<p>L’area è di 3,5 m<sup>2</sup> e le note a piè di pagina si aggiungono così.<sup>1</sup></p>',
  demo_html_subscript: '<p>L’acqua è H<sub>2</sub>O e il gas delle bibite è CO<sub>2</sub>.</p>',
  demo_html_link:
    '<p>Inserisci un indirizzo per creare <a href="https://example.com">un collegamento come questo</a>. Il documento memorizza solo l’indirizzo del collegamento; la pagina che lo mostra decide se aprirlo nella stessa finestra o in una nuova.</p>',
  demo_html_highlight:
    '<p>Seleziona il testo e premi il pulsante: accanto al cursore compaiono sei colori — <mark data-color="yellow">giallo</mark>, <mark data-color="green">verde</mark>, <mark data-color="cyan">ciano</mark>, <mark data-color="pink">rosa</mark>, <mark data-color="purple">viola</mark>, <mark data-color="orange">arancione</mark>.</p><p>Metti il cursore nel testo evidenziato per cambiarne il colore dagli strumenti contestuali.</p>',
  demo_html_text_color:
    '<p>Applica al testo <span data-color="green">verde</span>, <span data-color="coral">corallo</span>, <span data-color="violet">viola</span>, <span data-color="amber">ambra</span> o <span data-color="blue">blu</span>.</p><p><mark data-color="yellow">L’evidenziazione</mark> e <span data-color="blue">il colore del testo si possono usare insieme.</span></p>',
  demo_html_heading:
    '<h1>Titolo 1</h1><h2>Titolo 2</h2><h3>Titolo 3</h3><p>Testo normale. Scrivi # e uno spazio su una riga vuota per creare un titolo.</p>',
  demo_html_bullet_list:
    '<ul><li>Un elenco puntato</li><li>Tab aumenta il rientro, Maiusc+Tab lo diminuisce<ul><li>Un elemento annidato</li></ul></li></ul><p>Scrivi - e uno spazio su una riga vuota per crearne uno.</p>',
  demo_html_ordered_list:
    '<ol><li>Un elenco numerato</li><li>Inserire o eliminare un elemento aggiorna la numerazione</li></ol><p>Scrivi 1. e uno spazio su una riga vuota per crearne uno.</p>',
  demo_html_task_list:
    '<ul data-nabi-list="task"><li data-nabi-checked="true">Fai clic sulla casella davanti al testo</li><li data-nabi-checked="false">Lo stato selezionato viene salvato nel documento</li></ul><p>Scrivi [ ] o [x] su una riga vuota per creare un elenco attività.</p>',
  demo_html_table:
    '<table data-nabi-sortable=""><tbody><tr><th>Tasto</th><th>Funzione</th></tr><tr><td>Tab</td><td>Cella successiva</td></tr><tr><td>Frecce</td><td>Sposta nella griglia</td></tr></tbody></table><p>Metti il cursore in una cella per mostrare i comandi di riga e colonna.</p>',
  demo_html_image:
    '<div data-nabi-p data-nabi-align="c"><img src="/nabi-note.svg" alt="logo NABI NOTE" data-nabi-width="50"></div><p>Fai clic sull’immagine per impostarne larghezza e allineamento.</p>',
  demo_html_youtube:
    '<p>Usa il pulsante YouTube nella barra degli strumenti oppure incolla l’indirizzo del video: l’embed apparirà qui.</p>',
  demo_html_code:
    '<pre data-nabi-lang="ts">function sum(numbers: number[]) {<br>  return numbers.reduce((a, b) =&gt; a + b, 0)<br>}</pre><p>Metti il cursore nel codice e la riga contestuale mostra un campo per la lingua.</p>',
  demo_html_details:
    '<details open=""><summary>Fai clic qui per richiudere</summary><p>Lo stato chiuso viene salvato nel documento: chi legge lo vede come lo ha lasciato l’autore.</p></details>',
  demo_html_quote:
    '<blockquote><p>Puoi raccogliere in una citazione una frase tratta da un altro testo o un contenuto che vuoi separare.</p><p>Una citazione può contenere più paragrafi e blocchi.</p></blockquote><p>Su una riga vuota, digita &gt; e premi Spazio per trasformarla in una citazione.</p>',
  demo_html_divider:
    '<p>Un paragrafo sopra il separatore.</p><hr><p>E uno sotto. Scrivere --- da solo su una riga e premere Invio crea anch’esso una linea.</p>',
  demo_html_align:
    '<p data-nabi-align="l">Allineato a sinistra</p><p data-nabi-align="c">Allineato al centro</p><p data-nabi-align="r">Allineato a destra</p>',
  demo_html_font_size:
    '<p data-nabi-size="xs">Molto piccolo — adatto a note a piè di pagina o annotazioni di supporto.</p><p data-nabi-size="sm">Piccolo — un livello sotto il testo normale.</p><p>Un paragrafo di dimensione predefinita. Il menu delle dimensioni mostra ogni testo come apparirà.</p><p data-nabi-size="lg">Grande — adatto a una frase che necessita di enfasi.</p><p data-nabi-size="xl">Molto grande — adatto a una frase introduttiva sotto un titolo.</p><p>La dimensione del testo si applica all’intervallo selezionato. Se è presente solo il cursore, si applica al testo del paragrafo corrente.</p>',
  demo_html_typeface:
    '<p>Questo paragrafo non ha un carattere esplicito. Viene mostrato con il font predefinito della pagina.</p><p data-nabi-typeface="serif">Questo paragrafo usa un carattere con grazie. Quando scegli una famiglia come quella con grazie, il font effettivo segue il CSS del sito.</p><p data-nabi-typeface="mono">Questo paragrafo usa un carattere monospaziato. La larghezza fissa dei caratteri è utile per allineare numeri o codice — 0O 1lI</p><p data-nabi-typeface="cursive">Corsivo · 필기체 · 筆記体 · 手写体 · Schreibschrift · Cursive · Cursiva · Рукописный · خط اليد · हस्तलिपि · হস্তলিপি · رواں خط · Tulisan tangan · دست‌نویس · हस्ताक्षर · Chữ viết tay · చేతిరాత · Rubutun hannu · El yazısı · Mwandiko · கையெழுத்து · ลายมือ · Corsivo</p>',
  demo_html_dropcap:
    '<p data-nabi-dropcap="on">La prima lettera occupa tre righe e il testo scorre intorno a essa. Anche i paragrafi brevi riservano spazio per quelle righe, quindi il blocco seguente non viene mai spinto dentro.</p><p>Questo paragrafo non ha il capolettera.</p>',
  demo_html_clear_format:
    '<p><b>Grassetto</b>·<i>corsivo</i>·<u>sottolineato</u>·<s>barrato</s> sono applicati a questo testo; selezionalo e premi Cancella formattazione.</p><p>La formattazione in linea della selezione viene rimossa, ma la struttura di paragrafi e blocchi resta invariata.</p>',
  demo_html_upload:
    '<p>Trascina un file nell’area di modifica oppure incollalo. Questa demo non è collegata a un vero server di caricamento, quindi i file non vengono salvati su un server.</p><p>Dopo il caricamento, un file può restare nel documento come <a href="https://nabi.saro.me/file-link-test.txt" data-nabi-file="txt" download>allegato</a>.</p>',


  cdn_demo_lead: 'Salva il codice seguente come {file} e aprilo nel browser per vederlo subito in funzione.',
  cdn_demo_download: 'Scarica demo.html',
  cdn_code_minheight: 'Altezza minima dell’editor: evita che al primo avvio sembri un campo a una sola riga. Modifica il valore liberamente.',
  cdn_code_wings: 'Tutte le ali tranne il caricamento.',
  cdn_code_faces:
    'Mantiene soltanto i caratteri senza grazie e con grazie.\nOgni sistema offre caratteri diversi, quindi monospaziato e corsivo\nrichiedono un web font importato separatamente.\nConsulta la pagina "Carattere" per i dettagli.',
  cdn_code_change: 'Esempio di callback quando il valore cambia',
  code_copy: 'Copia codice',
  demo_install: 'Installazione',
  demo_code: 'Codice',
  demo_tree: 'nabi-tree',
  demo_loading: 'Caricamento dell’editor…',

  page_not_found: 'Pagina non trovata',
}
