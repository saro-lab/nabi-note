// Translated — the values speak German, and every wing name is the word its toolbar button
// shows. A missing key is a type error, so the file has to be whole; it is.
// 옮겼다 — 값은 독일어로 말하고, 날개 이름은 그 날개 버튼이 툴바에 내놓는 낱말 그대로다.
// 키가 하나라도 빠지면 타입 오류라 파일은 온전해야 하고, 지금 온전하다.
export const de = {
  label: 'Deutsch',
  lang: 'de',
  link: '/de/',
  description: 'NABI NOTE — ein Open-Source-WYSIWYG-Editor.',

  menu_docs: 'Dokumentation',
  menu_start: 'Leitfaden',
  menu_getting_started: 'Grundlagen',
  menu_cdn: 'CDN nutzen',
  menu_features: 'Wings',
  menu_style_guide: 'CSS-Stile',
  menu_rendering: 'SSR-Einrichtung',
  menu_extend_guide: 'Eigene Wings',
  menu_intro_vibe_coding: 'KI-Vibe-Coding',



  menu_projects: 'Projekte',

  menu_inline: 'Inline',
  menu_inline_bold: 'Fett',
  menu_inline_italic: 'Kursiv',
  menu_inline_underline: 'Unterstrichen',
  menu_inline_strikethrough: 'Durchgestrichen',
  menu_inline_superscript: 'Hochgestellt',
  menu_inline_subscript: 'Tiefgestellt',
  menu_inline_link: 'Link',
  menu_inline_highlight: 'Textmarker',
  menu_inline_text_color: 'Textfarbe',

  menu_block: 'Block',
  menu_block_heading: 'Überschrift',
  menu_block_bullet_list: 'Aufzählung',
  menu_block_ordered_list: 'Nummerierte Liste',
  menu_block_task_list: 'Checkliste',
  menu_block_table: 'Tabelle',
  menu_block_image: 'Bild',
  menu_block_youtube: 'YouTube',
  menu_block_code: 'Code',
  menu_block_details: 'Klappbox',
  menu_block_quote: 'Zitat',
  menu_block_divider: 'Trennlinie',

  menu_etc: 'Weiteres',
  menu_etc_align: 'Ausrichtung',
  menu_etc_dropcap: 'Initiale',
  menu_etc_typeface: 'Schriftart',
  menu_etc_font_size: 'Schriftgröße',
  menu_etc_clear_format: 'Formatierung löschen',
  menu_etc_upload: 'Datei hochladen',

  search: 'Suchen',
  search_no_results: 'Keine Treffer',
  search_hint: 'Bitte einen Suchbegriff eingeben',
  search_move: 'Bewegen',
  search_open: 'Öffnen',
  search_close: 'Schließen',

  // Exercises every wing but YouTube — no stranger's video on the front page
  // 유튜브만 빼고 기본 날개 전부를 써 보인다 — 앞면에 남의 영상을 걸지 않는다
  demo_html: `<p data-nabi-align="c"></p><div data-nabi-p data-nabi-align="c"><img src="https://nabi.saro.me/logo/nabi-mark-demo.svg" data-nabi-width="40"/></div><h1 data-nabi-align="c">NABI NOTE</h1><p data-nabi-align="c"><span data-nabi-size="lg"><i><span data-nabi-typeface="cursive">Ein Open-Source-WYSIWYG-Editor</span></i></span></p><p></p><p data-nabi-dropcap="1"><span data-nabi-typeface="serif"><b>NABI NOTE</b> ist ein Open-Source-WYSIWYG-Editor, dessen Formatierung, Ausrichtung, Tabellen, Uploads und weitere Funktionen vom Kern getrennt als eigenständige Module namens wings leben. Sie können nur die benötigten wings auswählen, um einen Editor zusammenzustellen, und selbst gebaute wings anbinden. Er ist in reinem JavaScript geschrieben und kann deshalb in Frameworks wie React oder Vue verwendet werden. Auf Seiten ohne Build-Einrichtung können Sie sofort mit der <b>CDN-Bibliothek</b> starten. Das eigene Dokumentformat, <b>NABI TREE</b>, lässt sich auch in Node.js-Umgebungen ohne Browser-DOM in HTML umwandeln. Eingabedokumente werden über registrierte Regeln repariert; beim Erzeugen von HTML werden Text und Attribute escapet und Link-Adressen geprüft. Eigene wings und Daten vom Server müssen dennoch zusätzlich nach der Sicherheitsrichtlinie der Anwendung geprüft werden. CSS-Variablen und ein rem-basiertes Layout helfen dabei, Theme und Größe anzupassen; außerdem gibt es Dark Mode und Schriftfamilien-Einstellungen für mehrere Sprachen. Tabellensortierung, lokale Historie und KI-gestützte Dokumentarbeit laufen alle auf demselben Dokumentmodell weiter.</span></p><p></p><h2>Schriftart</h2><p>Serifenlos (Standard), Serif, Monospace und Schreibschrift — jede Familie stapelt Schriften je Schriftsystem, sodass jede Sprache die Form dieser Familie behält; ein Schriftsystem ohne Handschrift in dieser Familie fällt auf die Browser-Schrift zurück. <b>Der Host bestimmt die Standardschrift.</b></p><p></p><p>Unten wird jede Familie <b>in vielen Sprachen</b> gezeigt.</p><p></p><p><span data-nabi-typeface="sans"><span data-nabi-size="lg">Serifenlos · Sans empattement · Sin serifa · Sem serifa · Без засечек · بلا زخارف · सैन्स सेरिफ़ · স্যান্স সেরিফ · سانس سیرف · Tanpa serif · بدون سریف · सॅन्स सेरिफ · Không chân · శాన్స్ సెరిఫ్ · Mara seref · Sans serif · Bila serif · சான்ஸ் செரிஃப் · ไร้เชิง · Senza grazie · 산세리프 · ゴシック体 · 无衬线</span></span></p><p></p><p><span data-nabi-typeface="serif"><span data-nabi-size="lg">Serif · Avec empattement · Con serifa · Com serifa · С засечками · بزخارف · सेरिफ़ · সেরিফ · سیرف · Berserif · سریف · सेरिफ · Có chân · సెరిఫ్ · Mai seref · Yenye serif · செரிஃப் · มีเชิง · Con grazie · 세리프 · 明朝体 · 衬线</span></span></p><p></p><p><span data-nabi-typeface="mono"><span data-nabi-size="lg">Dicktengleich · Chasse fixe · Monoespaciada · Monoespaçada · Моноширинный · ثابت العرض · मोनोस्पेस · মনোস্পেস · یکساں چوڑائی · Lebar tetap · تک‌فاصله · Đơn cách · మోనోస్పేస్ · Tazara ɗaya · Eş aralıklı · Nafasi moja · ஒற்றையகலம் · ความกว้างคงที่ · Monospaziato · Monospace · 고정폭 · 等幅 · 等宽</span></span></p><p></p><p><span data-nabi-typeface="cursive"><span data-nabi-size="lg">Schreibschrift · Cursive · Cursiva · Рукописный · خط اليد · हस्तलिपि · হস্তলিপি · رواں خط · Tulisan tangan · دست‌نویس · हस्ताक्षर · Chữ viết tay · చేతిరాత · Rubutun hannu · El yazısı · Mwandiko · கையெழுத்து · ลายมือ · Corsivo · 필기체 · 筆記体 · 手写体</span></span></p><p></p><p></p><h2>Textgröße</h2><p><span data-nabi-size="xs">Sehr klein</span></p><p><span data-nabi-size="sm">Klein</span></p><p><span data-nabi-size="lg">Groß</span></p><p><span data-nabi-size="xl">Sehr groß</span></p><p></p><p></p><h2>Überschrift</h2><p>Tippen Sie in einer leeren Zeile # und danach ein Leerzeichen, um sie direkt in eine Überschrift zu verwandeln.</p><h1>H1</h1><h2>H2</h2><h3>H3</h3><h4>H4</h4><h5>H5</h5><h6>H6</h6><p></p><p></p><h2>Fett · Kursiv · Unterstrichen · Durchgestrichen</h2><p><b>Fett</b> <i>kursiv</i> <u>unterstrichen</u> <s>durchgestrichen</s> — ein Beispiel.</p><p><b><i><s><u>Sie können auch übereinandergelegt werden.</u></s></i></b></p><h3>Hoch- und Tiefstellung</h3><p>Die Fläche beträgt 3,5 m<sup>2</sup>, und eine Fußnote wird so hinzugefügt.<sup>1</sup></p><p>Wasser ist H<sub>2</sub>O.</p><p></p><p></p><h2>Textfarbe · Hervorhebung</h2><p>Die Palette ist so gewählt, dass sie in hellem und dunklem Modus lesbar bleibt.</p><p>Textfarbe <span data-color="green">Grün</span> · <span data-color="coral">Koralle</span> · <span data-color="violet">Violett</span> · <span data-color="amber">Bernstein</span> · <span data-color="blue">Blau</span></p><p>Hervorhebung <mark data-color="yellow">Gelb</mark> · <mark data-color="green">Grün</mark> · <mark data-color="cyan">Cyan</mark> · <mark data-color="pink">Pink</mark> · <mark data-color="purple">Lila</mark> · <mark data-color="orange">Orange</mark></p><p></p><p></p><h2>Link</h2><p>Geben Sie eine Adresse ein, dann wird daraus ein <a href="https://nabi.saro.me/">Link</a>.</p><p>Sie können http://- und https://-URLs sowie gleichseitige Pfade verwenden, die mit . oder / beginnen. Adressen wie javascript: sind nicht erlaubt.</p><p>Tippen Sie zum Beispiel <a href="https://nabi.saro.me/">https://nabi.saro.me</a> und drücken Sie Leerzeichen oder Enter — wie hier zu sehen, wird es automatisch umgewandelt.</p><h3>Links öffnen</h3><p>Das Dokument speichert nur die Link-Adresse; die Seite, die das Dokument anzeigt, entscheidet, wie Links geöffnet werden.</p><h3>Anhang-Link</h3><p>Wenn etwas anderes als ein Bild hochgeladen wird, bleibt ein dateiförmiger Link wie unten.</p><p><a href="https://nabi.saro.me/file-link-test.txt" data-nabi-file="txt" download>Anhang</a> bleibt so erhalten.</p><p></p><p></p><h2>Ausrichtung</h2><p>Linksbündig</p><p>Zentriert</p><p>Rechtsbündig</p><h3>Auch Überschriften lassen sich ausrichten.</h3><p></p><p></p><h2>Listen</h2><h3>Aufzählung</h3><p>Tippen Sie in einer leeren Zeile - und drücken Sie <b>Leerzeichen</b> — daraus wird direkt eine Aufzählung.</p><div data-nabi-p><ul><li><p>Das ist ein Aufzählungspunkt</p><div data-nabi-p><ul><li><p>Tab / Umschalt+Tab rücken ein und aus.</p></li></ul></div></li></ul></div><h3>Nummerierte Liste</h3><p>Tippen Sie in einer leeren Zeile 1. und drücken Sie <b>Leerzeichen</b>, um eine nummerierte Liste zu erstellen.</p><div data-nabi-p><ol><li><p>Erstens</p></li><li><p>Zweitens</p></li><li><p>Drittens</p></li></ol></div><h3>Checkliste</h3><p>Tippen Sie in einer leeren Zeile [ ] oder [x] und drücken Sie <b>Leerzeichen</b>, um eine Checkliste zu erstellen.</p><div data-nabi-p><ul data-nabi-list="task"><li data-nabi-checked="true"><p>Dieser Punkt ist erledigt.</p></li><li data-nabi-checked="false"><p>Dieser Punkt ist noch offen.</p></li></ul></div><p></p><p></p><h2>Tabelle</h2><p>Klicken Sie in der Werkzeugleiste auf die Tabellen-Schaltfläche, um eine Tabelle zu erstellen; danach können Sie Zeilen und Spalten hinzufügen, löschen und verbinden.</p><h3>Spalten sortieren</h3><p>Öffnen Sie zuerst die <b>Vorschau</b> und klicken Sie dann nacheinander auf die Kopfzellen <b>Bestand</b> und <b>Preis</b>.</p><div data-nabi-p><div class="nabi-scroll"><table data-nabi-sortable><tr><th><p>Modell</p></th><th><p>Bestand</p></th><th><p>Preis</p></th><th><p>Gewicht</p></th></tr><tr><td><p>NB-7</p></td><td><p>1,200</p></td><td><p>349</p></td><td><p>1.2 kg</p></td></tr><tr><td><p>NB-9</p></td><td><p>20,000</p></td><td><p>99</p></td><td><p>0.9 kg</p></td></tr><tr><td><p>NB-12</p></td><td><p>3,500</p></td><td><p>1,299</p></td><td><p>1.4 kg</p></td></tr><tr><td><p>NB-80</p></td><td><p>900</p></td><td><p>8,900</p></td><td><p>2.1 kg</p></td></tr><tr><td><p>NB-100</p></td><td><p>Offen</p></td><td><p>12,999</p></td><td><p>2.4 kg</p></td></tr></table></div></div><p><b>Preis</b> besteht nur aus Zahlen und wird deshalb numerisch sortiert.</p><p><b>Bestand</b> wird wegen der Buchstaben in der letzten Zelle als Text sortiert.</p><p></p><p></p><h2>Trennlinie</h2><p>Tippen Sie --- und drücken Sie Enter, um daraus eine Trennlinie zu machen.</p><div data-nabi-p><hr/></div><p></p><p></p><h2>Bild</h2><p>Die Breite reicht von 30 % bis 100 %, und das Bild kann links, zentriert oder rechts stehen.</p><div data-nabi-p><img src="https://nabi.saro.me/logo/nabi-mark-demo.svg" data-nabi-width="40"/></div><p></p><p></p><h2>YouTube</h2><div data-nabi-p><iframe src="https://www.youtube-nocookie.com/embed/6j-gQmaZ9Zk" title="YouTube" allowfullscreen loading="lazy" data-nabi-width="70"></iframe></div><p></p><p></p><h2>Upload</h2><p>Ziehen Sie ein Bild oder eine Datei in den Editor.</p><p>Der hier verwendete Upload ist ein Mock-up; über eine Einstellung verbinden Sie ihn mit Ihrem Server.</p><p>Wenn ein Upload fehlschlägt, wird das Bild oder die Datei aus dem Editor entfernt.</p><p></p><p></p><h2>Zitat</h2><div data-nabi-p><blockquote><p>Tippen Sie in einer leeren Zeile &gt; und drücken Sie <b>Leerzeichen</b>, um einen Zitatblock zu erstellen.</p><p>Er kann über mehrere Zeilen laufen.</p></blockquote></div><p></p><p></p><h2>Code</h2><p>Tippen Sie in einer leeren Zeile \`\`\` und drücken Sie <b>Leerzeichen oder Enter</b>, um einen Codeblock zu erstellen.</p><p>Schreiben Sie auch die Sprache dazu, etwa \`\`\`java, und drücken Sie Leerzeichen oder Enter, um einen Codeblock mit dieser Sprache zu erhalten.</p><div data-nabi-p><pre data-nabi-lang="typescript"><code class="language-typescript">import { createNabiWith, defaultWings } from 'nabi-note'<br/><br/>const { nabi } = createNabiWith(defaultWings)<br/>const html = nabi.getHtml()</code></pre></div><p></p><p></p><h2>Details</h2><div data-nabi-p><details open><summary>Details besteht aus Zusammenfassung und Inhalt.</summary><p>Sie können festlegen, ob es eingeklappt oder geöffnet gespeichert wird.</p></details></div><p></p><h2></h2><h2>Tastenkürzel</h2><p><b>Drücken Sie zweimal schnell Shift</b>, um in der Werkzeugleiste die Tastenkürzel jeder Funktion zu sehen.</p><p></p><p></p><h2>Autoformat</h2><div data-nabi-p><div class="nabi-scroll"><table data-nabi-sortable><tr><th><p>Beispiel</p></th><th><p>Auslösetaste</p></th><th><p>Ergebnis</p></th></tr><tr><td><p>#</p></td><td><p>Leerzeichen</p></td><td><p>Überschrift</p></td></tr><tr><td><p>-</p></td><td><p>Leerzeichen</p></td><td><p>Aufzählung</p></td></tr><tr><td><p>1.</p></td><td><p>Leerzeichen</p></td><td><p>Nummerierte Liste</p></td></tr><tr><td><p>[ ] · [x]</p></td><td><p>Leerzeichen</p></td><td><p>Checkliste</p></td></tr><tr><td><p>&gt;</p></td><td><p>Leerzeichen</p></td><td><p>Zitat</p></td></tr><tr><td><p>\`\`\` · \`\`\`ts</p></td><td><p>Leerzeichen · Enter</p></td><td><p>Codeblock</p></td></tr><tr><td><p>---</p></td><td><p>Enter</p></td><td><p>Trennlinie</p></td></tr><tr><td><p>https://…</p></td><td><p>Leerzeichen · Enter</p></td><td><p>Link</p></td></tr></table></div></div><p></p><p></p><h3>Ausgabefunktionen</h3><div data-nabi-p><div class="nabi-scroll"><table data-nabi-sortable><tr><th><p>Funktion</p></th><th><p>Ergebnis</p></th></tr><tr><td><p>getHtml()</p></td><td><p>HTML</p></td></tr><tr><td><p>getJson()</p></td><td><p>JSON</p></td></tr></table></div></div><p></p><p></p><h2>Funktioniert ohne DOM</h2><p>Die Umwandlung von JSON nach HTML <b>braucht kein DOM</b>.</p><p>Ein Server (Node.js) kann den gespeicherten NABI TREE lesen und nach denselben Regeln HTML erzeugen.</p><p></p><h2>Mobilfreundlich</h2><div data-nabi-p><ul><li><p><b>Mobile UI</b> — ein responsives Layout trägt die mobile Oberfläche.</p></li><li><p><b>Inset der mobilen Tastatur</b> — wenn die Tastatur geöffnet wird, wird ihre Höhe berücksichtigt.</p></li><li><p><b>Flexible Größen</b> — jede Größe ist in rem geschrieben.</p></li><li><p><b>Viele Sprachen</b> — mehrere Sprachen werden unterstützt.</p></li></ul></div><p></p><h2>Anpassung</h2><div data-nabi-p><ul><li><p><b>Eigener wing</b> — wenn Sie eine Funktion brauchen, bauen und registrieren Sie sie selbst.</p></li><li><p><b>Eigenes CSS</b> — Farben, Ecken und Abstände sind alle als --nabi-* definiert; Dark, Light und alles Weitere bestimmen Sie.</p></li><li><p><b>Open Source</b> — das Projekt ist Open Source auf GitHub.</p></li></ul></div><div data-nabi-p><hr/></div><p>Dokumentation lesen → <a href="https://nabi.saro.me/">nabi.saro.me</a></p>`,
  demo_wings: 'Flügel',
  demo_wings_all: 'Alle an',
  demo_wings_none: 'Alle aus',
  demo_zoom: 'Zoom',
  demo_zoom_out: 'Verkleinern',
  demo_zoom_in: 'Vergrößern',
  demo_zoom_reset: 'Zurücksetzen',
  demo_sticky: 'Werkzeugleiste fixieren',
  demo_sticky_keyboard: 'Ausgleich der mobilen Tastatur',
  demo_sticky_height: 'Abstand',
  demo_sticky_unit: 'Einheit des Abstands',
  demo_typeface_base: 'Standardschriftart',
  demo_typeface_sans: 'Serifenlos',
  demo_typeface_serif: 'Serif',
  demo_typeface_mono: 'Dicktengleich',
  demo_typeface_cursive: 'Schreibschrift',
  demo_html_small: '<p>Schreiben Sie hier, und schalten Sie oben die Flügel ein und aus.</p>',

  // Paired to pages by `src/sample.ts`; may use only markup that page enables (`src/wings.ts`)
  // 짝은 `src/sample.ts` 가 맺는다 — 그 페이지에서 켜지는 마크업만 써야 평문으로 안 떨어진다
  demo_html_bold:
    '<p>Heben Sie <b>die wichtigen Wörter</b> hervor. Markieren Sie etwas Text und drücken Sie <b>B</b> in der Werkzeugleiste.</p>',
  demo_html_italic:
    '<p>Zitate und fremde Wörter stehen <i>kursiv</i>. Markieren Sie diesen Satz und probieren Sie es aus.</p>',
  demo_html_underline:
    '<p>Hier steht eine <u>Unterstreichung</u>. Markieren Sie diese Buchstaben und drücken Sie es erneut, um sie zu entfernen.</p>',
  demo_html_strikethrough: '<p><s>19,00 €</s> 9,90 € — der alte Preis bleibt sichtbar.</p>',
  demo_html_superscript:
    '<p>Die Fläche beträgt 3,5m<sup>2</sup>, und Fußnoten hängen so.<sup>1</sup></p>',
  demo_html_subscript: '<p>Wasser ist H<sub>2</sub>O, und die Brause ist CO<sub>2</sub>.</p>',
  demo_html_link:
    '<p>Geben Sie eine Adresse ein, und Sie erhalten <a href="https://example.com">einen Link wie diesen</a>. Ein bestehender Link öffnet keine Kontextzeile — um die Adresse zu ändern, löschen Sie ihn und legen Sie einen neuen an.</p>',
  demo_html_highlight:
    '<p>Markieren Sie Text und drücken Sie die Schaltfläche: sechs Farben — <mark data-color="yellow">Gelb</mark>, <mark data-color="green">Grün</mark>, <mark data-color="cyan">Cyan</mark>, <mark data-color="pink">Pink</mark>, <mark data-color="purple">Violett</mark>, <mark data-color="orange">Orange</mark> — öffnen sich neben dem Caret.</p><p>Setzen Sie den Caret in eine Markierung, erscheinen dieselben Muster in der Kontextzeile, um nur die Farbe zu ändern.</p>',
  demo_html_text_color:
    '<p>Färben Sie Text <span data-color="green">grün</span>, <span data-color="coral">koralle</span>, <span data-color="violet">violett</span>, <span data-color="amber">bernstein</span> oder <span data-color="blue">blau</span> — fünf Farben insgesamt.</p><p><mark data-color="yellow">Eine Überschneidung mit einer Markierung</mark> ist kein Problem: es sind verschiedene Marks, also <span data-color="blue">gelten beide.</span></p>',
  demo_html_heading:
    '<h1>Überschrift 1</h1><h2>Überschrift 2</h2><h3>Überschrift 3</h3><p>Fließtext. Auch # und ein Leerzeichen am Anfang einer leeren Zeile ergeben eine Überschrift.</p>',
  demo_html_bullet_list:
    '<ul><li>Eine Aufzählungsliste</li><li>Tab rückt ein, Umschalt+Tab rückt aus<ul><li>Ein verschachtelter Eintrag</li></ul></li></ul><p>Auch - und ein Leerzeichen am Anfang einer leeren Zeile ergeben eine.</p>',
  demo_html_ordered_list:
    '<ol><li>Eine nummerierte Liste</li><li>Fügen Sie einen Eintrag ein oder löschen Sie ihn, und die Nummern ordnen sich neu</li></ol><p>Auch 1. und ein Leerzeichen am Anfang einer leeren Zeile ergeben eine.</p>',
  demo_html_task_list:
    '<ul data-nabi-list="task"><li data-nabi-checked="true">Klicken Sie das Kästchen vor dem Text an</li><li data-nabi-checked="false">Der Häkchen-Zustand wird mit dem Dokument gespeichert</li></ul><p>Auch [ ] oder [x] am Anfang einer leeren Zeile ergeben eine.</p>',
  demo_html_table:
    '<table data-nabi-sortable=""><tbody><tr><th>Taste</th><th>Was sie tut</th></tr><tr><td>Tab</td><td>Nächste Zelle</td></tr><tr><td>Pfeile</td><td>Im Raster bewegen</td></tr></tbody></table><p>Setzen Sie den Caret in eine Zelle, füllt sich die Kontextzeile mit Zeilen- und Spaltenbefehlen.</p>',
  demo_html_image:
    '<div data-nabi-p data-nabi-align="c"><img src="/nabi-note.svg" alt="NABI NOTE Logo" data-nabi-width="50"></div><p>Klicken Sie auf das Bild für den Kasten mit Breite und Ausrichtung.</p>',
  demo_html_youtube:
    '<p>Nutzen Sie die YouTube-Schaltfläche in der Werkzeugleiste, oder fügen Sie einfach eine Videoadresse ein — die Einbettung landet genau hier.</p>',
  demo_html_code:
    '<pre data-nabi-lang="ts">function sum(numbers: number[]) {<br>  return numbers.reduce((a, b) =&gt; a + b, 0)<br>}</pre><p>Setzen Sie den Caret in den Code, zeigt die Kontextzeile ein Sprachfeld. Markieren Sie mehrere Zeilen und drücken Sie Tab, werden sie gemeinsam eingerückt, Umschalt+Tab macht es rückgängig.</p>',
  demo_html_details:
    '<details open=""><summary>Hier klicken zum Einklappen</summary><p>Der eingeklappte Zustand wird mit dem Dokument gespeichert — Leser sehen es so, wie der Autor es hinterlassen hat.</p></details>',
  demo_html_quote: '<blockquote><p>Sie können einen Satz aus einem anderen Text oder Inhalte, die Sie abtrennen möchten, als Zitat gruppieren.</p><p>Ein Zitat kann mehrere Absätze und Blöcke enthalten.</p></blockquote><p>Tippen Sie &gt; und ein Leerzeichen am Anfang einer leeren Zeile, um diese Zeile in ein Zitat zu verwandeln.</p>',
  demo_html_divider:
    '<p>Ein Absatz über der Trennlinie.</p><hr><p>Und einer darunter. Auch --- allein in einer Zeile, gefolgt von Enter, ergibt eine Linie.</p>',
  demo_html_align:
    '<p data-nabi-align="l">Linksbündig</p><p data-nabi-align="c">Zentriert</p><p data-nabi-align="r">Rechtsbündig</p>',
  demo_html_font_size: '<p data-nabi-size="xs">Sehr klein — gut für Fußnoten oder ergänzende Hinweise.</p><p data-nabi-size="sm">Klein — eine Stufe kleiner als Fließtext.</p><p>Ein Absatz in Standardgröße. Das Größenmenü zeigt jede Textgröße ebenfalls so, wie sie erscheint.</p><p data-nabi-size="lg">Groß — gut für einen Satz, der betont werden soll.</p><p data-nabi-size="xl">Sehr groß — gut für einen einleitenden Satz unter einem Titel.</p><p>Die Schriftgröße gilt für den ausgewählten Bereich. Wenn nur der Caret steht, gilt sie für den Text im aktuellen Absatz.</p>',
  demo_html_typeface: "<p>Dieser Absatz hat keine ausdrücklich gesetzte Schriftart. Er wird mit der Standardschrift der Seite angezeigt.</p><p data-nabi-typeface=\"serif\">Dieser Absatz verwendet eine Serifenschrift. Wenn Sie eine Familie wie serif wählen, folgt die tatsächliche Schrift dem CSS der Website.</p><p data-nabi-typeface=\"mono\">Dieser Absatz verwendet eine Monospace-Schrift. Feste Zeichenbreite hilft beim Ausrichten von Zahlen oder Code — 0O 1lI</p><p data-nabi-typeface=\"cursive\">Schreibschrift · Cursive · Cursiva · Рукописный · خط اليد · हस्तलिपि · হস্তলিপি · رواں خط · Tulisan tangan · دست‌نویس · हस्ताक्षर · Chữ viết tay · చేతిరాత · Rubutun hannu · El yazısı · Mwandiko · கையெழுத்து · ลายมือ · Corsivo · 필기체 · 筆記体 · 手写体</p>",
  demo_html_dropcap:
    '<p data-nabi-dropcap="on">Der erste Buchstabe erstreckt sich über drei Zeilen, und der Text fließt daneben. Auch kurze Absätze reservieren den Platz für diese Zeilen, sodass der Block darunter nie hineingedrängt wird.</p><p>Dieser Absatz trägt es nicht.</p>',
  demo_html_clear_format:
    '<p>Markieren Sie Text, der <b>fett</b>, <i>kursiv</i>, <u>unterstrichen</u> oder <s>durchgestrichen</s> ist, und drücken Sie den Radiergummi.</p><p>Nur die Zeichenformatierung verschwindet — Blöcke bleiben genau, wie sie sind.</p>',
  demo_html_upload: '<p>Legen Sie eine Datei im Bearbeitungsbereich ab oder fügen Sie eine ein. Diese Demo ist nicht mit einem echten Upload-Server verbunden, daher werden Dateien nicht auf einem Server gespeichert.</p><p>Nach abgeschlossenem Upload kann eine Datei als <a href="https://nabi.saro.me/file-link-test.txt" data-nabi-file="txt">Anhang</a> im Dokument bleiben.</p>',
  cdn_demo_lead: 'Speichern Sie den Code unten als {file} und öffnen Sie ihn in einem Browser — Sie sehen ihn sofort laufen.',
  cdn_demo_download: 'demo.html herunterladen',
  cdn_code_minheight: 'Mindesthöhe des Editors — verhindert, dass er beim ersten Laden wie eine einzeilige Box aussieht. Wert frei änderbar.',
  cdn_code_wings: 'Jeder Flügel außer Upload.',
  cdn_code_faces:
    'Von den Schriftarten bleiben nur sans und serif übrig.\nSysteme unterstützen unterschiedliche Schriftarten, deshalb brauchen Mono und Cursive eine\nseparat importierte Web-Schrift, bevor jede Plattform sie erkennt. Details stehen auf der\nSeite „Schriftart".',
  cdn_code_change: 'Beispiel-Callback für den Fall, dass sich der Wert ändert',
  code_copy: 'Code kopieren',
  demo_install: 'Installation',
  demo_code: 'Code',
  demo_tree: 'nabi-tree',
  demo_loading: 'Editor wird geladen…',

  page_not_found: 'Seite nicht gefunden',
}
