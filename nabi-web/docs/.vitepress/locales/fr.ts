// Translated — the values speak French, and every wing name is the word its toolbar button
// shows. A missing key is a type error, so the file has to be whole; it is.
// 옮겼다 — 값은 프랑스어로 말하고, 날개 이름은 그 날개 버튼이 툴바에 내놓는 낱말 그대로다.
// 키가 하나라도 빠지면 타입 오류라 파일은 온전해야 하고, 지금 온전하다.
export const fr = {
  label: 'Français',
  lang: 'fr',
  link: '/fr/',
  description: 'NABI NOTE — un éditeur WYSIWYG open source.',

  menu_docs: 'Documentation',
  menu_start: 'Guide',
  menu_getting_started: 'Utilisation de base',
  menu_cdn: 'Utiliser le CDN',
  menu_features: 'Wings',
  menu_style_guide: 'Styles CSS',
  menu_rendering: 'Configuration SSR',
  menu_extend_guide: 'Wings personnalisés',
  menu_intro_vibe_coding: 'Vibe coding par IA',



  menu_projects: 'Projets',

  menu_inline: 'Inline',
  menu_inline_bold: 'Gras',
  menu_inline_italic: 'Italique',
  menu_inline_underline: 'Souligné',
  menu_inline_strikethrough: 'Barré',
  menu_inline_superscript: 'Exposant',
  menu_inline_subscript: 'Indice',
  menu_inline_link: 'Lien',
  menu_inline_highlight: 'Surligneur',
  menu_inline_text_color: 'Couleur du texte',

  menu_block: 'Bloc',
  menu_block_heading: 'Titre',
  menu_block_bullet_list: 'Liste à puces',
  menu_block_ordered_list: 'Liste numérotée',
  menu_block_task_list: 'Liste de tâches',
  menu_block_table: 'Tableau',
  menu_block_image: 'Image',
  menu_block_youtube: 'YouTube',
  menu_block_code: 'Code',
  menu_block_details: 'Bloc dépliant',
  menu_block_quote: 'Citation',
  menu_block_divider: 'Séparateur',

  menu_etc: 'Divers',
  menu_etc_align: 'Alignement',
  menu_etc_dropcap: 'Lettrine',
  menu_etc_typeface: 'Police',
  menu_etc_font_size: 'Taille du texte',
  menu_etc_clear_format: 'Effacer la mise en forme',
  menu_etc_upload: 'Téléverser un fichier',

  search: 'Rechercher',
  search_no_results: 'Aucun résultat',
  search_hint: 'Saisissez un terme de recherche',
  search_move: 'Naviguer',
  search_open: 'Ouvrir',
  search_close: 'Fermer',

  // Exercises every wing but YouTube — no stranger's video on the front page
  // 유튜브만 빼고 기본 날개 전부를 써 보인다 — 앞면에 남의 영상을 걸지 않는다
  demo_html: `<p data-nabi-align="c"></p><div data-nabi-p data-nabi-align="c"><img src="https://nabi.saro.me/logo/nabi-mark-demo.svg" data-nabi-width="40"/></div><h1 data-nabi-align="c">NABI NOTE</h1><p data-nabi-align="c"><span data-nabi-size="lg"><i><span data-nabi-typeface="cursive">Un éditeur WYSIWYG open source</span></i></span></p><p></p><p data-nabi-dropcap="1"><span data-nabi-typeface="serif"><b>NABI NOTE</b> est un éditeur WYSIWYG open source dont la mise en forme, l’alignement, les tableaux, l’upload et les autres fonctionnalités sont séparés du noyau sous forme de modules indépendants appelés wings. Vous pouvez choisir seulement les wings nécessaires pour assembler un éditeur, et connecter les wings que vous construisez vous-même. Il est écrit en JavaScript pur, donc utilisable depuis des frameworks comme React ou Vue. Sur les pages sans configuration de build, vous pouvez démarrer immédiatement avec la <b>bibliothèque CDN</b>. Son propre format de document, <b>NABI TREE</b>, peut être converti en HTML même dans des environnements Node.js sans DOM de navigateur. Les documents entrants sont réparés par les règles enregistrées ; lors de la création du HTML, le texte et les attributs sont échappés et les adresses de liens sont vérifiées. Les wings personnalisés et les données reçues du serveur doivent toutefois rester examinés séparément selon la politique de sécurité de l’application. Les variables CSS et une mise en page basée sur rem permettent d’ajuster le thème et la taille ; le mode sombre et les réglages de polices multilingues sont aussi fournis. Le tri des tableaux, l’historique local et le travail documentaire assisté par IA continuent tous sur le même modèle de document.</span></p><p></p><h2>Police</h2><p>Sans empattement (par défaut), serif, monospace et cursive — chaque famille empile des polices par système d’écriture, si bien que la langue utilisée garde la forme de cette famille ; une écriture sans police manuscrite dans cette famille retombe sur la police du navigateur. <b>L’hôte choisit la police par défaut.</b></p><p></p><p>Ci-dessous, chaque famille est affichée <b>dans de nombreuses langues</b>.</p><p></p><p><span data-nabi-typeface="sans"><span data-nabi-size="lg">Sans empattement · Sin serifa · Sem serifa · Без засечек · بلا زخارف · सैन्स सेरिफ़ · স্যান্স সেরিফ · سانس سیرف · Tanpa serif · بدون سریف · सॅन्स सेरिफ · Không chân · శాన్స్ సెరిఫ్ · Mara seref · Sans serif · Bila serif · சான்ஸ் செரிஃப் · ไร้เชิง · Senza grazie · 산세리프 · ゴシック体 · 无衬线 · Serifenlos</span></span></p><p></p><p><span data-nabi-typeface="serif"><span data-nabi-size="lg">Avec empattement · Con serifa · Com serifa · С засечками · بزخارف · सेरिफ़ · সেরিফ · سیرف · Berserif · سریف · सेरिफ · Có chân · సెరిఫ్ · Mai seref · Serif · Yenye serif · செரிஃப் · มีเชิง · Con grazie · 세리프 · 明朝体 · 衬线</span></span></p><p></p><p><span data-nabi-typeface="mono"><span data-nabi-size="lg">Chasse fixe · Monoespaciada · Monoespaçada · Моноширинный · ثابت العرض · मोनोस्पेस · মনোস্পেস · یکساں چوڑائی · Lebar tetap · تک‌فاصله · Đơn cách · మోనోస్పేస్ · Tazara ɗaya · Eş aralıklı · Nafasi moja · ஒற்றையகலம் · ความกว้างคงที่ · Monospaziato · Monospace · 고정폭 · 等幅 · 等宽 · Dicktengleich</span></span></p><p></p><p><span data-nabi-typeface="cursive"><span data-nabi-size="lg">Cursive · Cursiva · Рукописный · خط اليد · हस्तलिपि · হস্তলিপি · رواں خط · Tulisan tangan · دست‌نویس · हस्ताक्षर · Chữ viết tay · చేతిరాత · Rubutun hannu · El yazısı · Mwandiko · கையெழுத்து · ลายมือ · Corsivo · 필기체 · 筆記体 · 手写体 · Schreibschrift</span></span></p><p></p><p></p><h2>Taille du texte</h2><p><span data-nabi-size="xs">Très petit</span></p><p><span data-nabi-size="sm">Petit</span></p><p><span data-nabi-size="lg">Grand</span></p><p><span data-nabi-size="xl">Très grand</span></p><p></p><p></p><h2>Titre</h2><p>Sur une ligne vide, tapez # puis une espace pour la transformer aussitôt en titre.</p><h1>H1</h1><h2>H2</h2><h3>H3</h3><h4>H4</h4><h5>H5</h5><h6>H6</h6><p></p><p></p><h2>Gras · Italique · Souligné · Barré</h2><p><b>Gras</b> <i>italique</i> <u>souligné</u> <s>barré</s> — un exemple.</p><p><b><i><s><u>Ils peuvent aussi être empilés.</u></s></i></b></p><h3>Exposant et indice</h3><p>La surface est de 3,5 m<sup>2</sup>, et une note se place ainsi.<sup>1</sup></p><p>L’eau est H<sub>2</sub>O.</p><p></p><p></p><h2>Couleur du texte · Surlignage</h2><p>La palette est choisie pour rester lisible en mode clair comme en mode sombre.</p><p>Couleur du texte <span data-color="green">Vert</span> · <span data-color="coral">Corail</span> · <span data-color="violet">Violet</span> · <span data-color="amber">Ambre</span> · <span data-color="blue">Bleu</span></p><p>Surlignage <mark data-color="yellow">Jaune</mark> · <mark data-color="green">Vert</mark> · <mark data-color="cyan">Cyan</mark> · <mark data-color="pink">Rose</mark> · <mark data-color="purple">Violet</mark> · <mark data-color="orange">Orange</mark></p><p></p><p></p><h2>Lien</h2><p>Insérez une adresse et elle devient un <a href="https://nabi.saro.me/">lien</a>.</p><p>Vous pouvez utiliser les URL http:// et https://, ainsi que les chemins du même site commençant par . ou /. Les adresses comme javascript: ne sont pas autorisées.</p><p>Par exemple, tapez <a href="https://nabi.saro.me/">https://nabi.saro.me</a> puis appuyez sur espace ou Entrée — la conversion se fait d’elle-même, comme ici.</p><h3>Ouverture des liens</h3><p>Le document ne stocke que l’adresse du lien ; la page qui affiche le document décide comment les liens s’ouvrent.</p><h3>Lien de pièce jointe</h3><p>Uploader autre chose qu’une image laisse un lien de fichier comme celui ci-dessous.</p><p><a href="https://nabi.saro.me/file-link-test.txt" data-nabi-file="txt" download>Pièce jointe</a> reste ainsi.</p><p></p><p></p><h2>Alignement</h2><p>Aligné à gauche</p><p>Centré</p><p>Aligné à droite</p><h3>Les titres peuvent aussi être alignés.</h3><p></p><p></p><h2>Listes</h2><h3>Liste à puces</h3><p>Sur une ligne vide, tapez - et appuyez sur <b>espace</b> — cela devient aussitôt une liste à puces.</p><div data-nabi-p><ul><li><p>Ceci est un élément de liste</p><div data-nabi-p><ul><li><p>Tab / Maj+Tab indente et désindente.</p></li></ul></div></li></ul></div><h3>Liste numérotée</h3><p>Sur une ligne vide, tapez 1. et appuyez sur <b>espace</b> pour obtenir une liste numérotée.</p><div data-nabi-p><ol><li><p>Premier</p></li><li><p>Deuxième</p></li><li><p>Troisième</p></li></ol></div><h3>Liste de tâches</h3><p>Sur une ligne vide, tapez [ ] ou [x] et appuyez sur <b>espace</b> pour obtenir une liste de tâches.</p><div data-nabi-p><ul data-nabi-list="task"><li data-nabi-checked="true"><p>Cet élément est coché.</p></li><li data-nabi-checked="false"><p>Celui-ci n’est pas encore coché.</p></li></ul></div><p></p><p></p><h2>Tableau</h2><p>Cliquez sur le bouton tableau dans la barre d’outils pour en créer un, puis ajoutez, supprimez et fusionnez lignes et colonnes.</p><h3>Tri des colonnes</h3><p>Ouvrez d’abord l’<b>Aperçu</b>, puis cliquez tour à tour sur les cellules d’en-tête <b>Stock</b> et <b>Prix</b>.</p><div data-nabi-p><div class="nabi-scroll"><table data-nabi-sortable><tr><th><p>Modèle</p></th><th><p>Stock</p></th><th><p>Prix</p></th><th><p>Poids</p></th></tr><tr><td><p>NB-7</p></td><td><p>1,200</p></td><td><p>349</p></td><td><p>1.2 kg</p></td></tr><tr><td><p>NB-9</p></td><td><p>20,000</p></td><td><p>99</p></td><td><p>0.9 kg</p></td></tr><tr><td><p>NB-12</p></td><td><p>3,500</p></td><td><p>1,299</p></td><td><p>1.4 kg</p></td></tr><tr><td><p>NB-80</p></td><td><p>900</p></td><td><p>8,900</p></td><td><p>2.1 kg</p></td></tr><tr><td><p>NB-100</p></td><td><p>À définir</p></td><td><p>12,999</p></td><td><p>2.4 kg</p></td></tr></table></div></div><p><b>Prix</b> ne contient que des nombres, donc il est trié numériquement.</p><p><b>Stock</b> est trié comme du texte à cause des lettres dans la dernière cellule.</p><p></p><p></p><h2>Séparateur</h2><p>Tapez --- et appuyez sur Entrée pour le transformer en séparateur.</p><div data-nabi-p><hr/></div><p></p><p></p><h2>Image</h2><p>La largeur va de 30 % à 100 %, et l’image peut être à gauche, au centre ou à droite.</p><div data-nabi-p><img src="https://nabi.saro.me/logo/nabi-mark-demo.svg" data-nabi-width="40"/></div><p></p><p></p><h2>YouTube</h2><div data-nabi-p><iframe src="https://www.youtube-nocookie.com/embed/6j-gQmaZ9Zk" title="YouTube" allowfullscreen loading="lazy" data-nabi-width="70"></iframe></div><p></p><p></p><h2>Upload</h2><p>Essayez de glisser une image ou un fichier sur l’éditeur.</p><p>L’upload utilisé ici est une maquette ; un réglage le connecte à votre serveur.</p><p>Si un upload échoue, l’image ou le fichier est retiré de l’éditeur.</p><p></p><p></p><h2>Citation</h2><div data-nabi-p><blockquote><p>Sur une ligne vide, tapez &gt; et appuyez sur <b>espace</b> pour obtenir un bloc de citation.</p><p>Il peut s’étendre sur plusieurs lignes.</p></blockquote></div><p></p><p></p><h2>Code</h2><p>Sur une ligne vide, tapez \`\`\` et appuyez sur <b>espace ou Entrée</b> pour obtenir un bloc de code.</p><p>Écrivez aussi le langage, comme \`\`\`java, puis appuyez sur espace ou Entrée pour obtenir un bloc de code avec ce langage appliqué.</p><div data-nabi-p><pre data-nabi-lang="typescript"><code class="language-typescript">import { createNabiWith, defaultWings } from 'nabi-note'<br/><br/>const { nabi } = createNabiWith(defaultWings)<br/>const html = nabi.getHtml()</code></pre></div><p></p><p></p><h2>Details</h2><div data-nabi-p><details open><summary>Details est composé d’un résumé et d’un corps.</summary><p>Vous pouvez choisir s’il est enregistré replié ou ouvert.</p></details></div><p></p><h2></h2><h2>Raccourcis</h2><p><b>Appuyez rapidement deux fois sur Maj</b> pour afficher le raccourci de chaque fonction dans la barre d’outils.</p><p></p><p></p><h2>Format automatique</h2><div data-nabi-p><div class="nabi-scroll"><table data-nabi-sortable><tr><th><p>Exemple</p></th><th><p>Touche d’action</p></th><th><p>Résultat</p></th></tr><tr><td><p>#</p></td><td><p>Espace</p></td><td><p>Titre</p></td></tr><tr><td><p>-</p></td><td><p>Espace</p></td><td><p>Liste à puces</p></td></tr><tr><td><p>1.</p></td><td><p>Espace</p></td><td><p>Liste numérotée</p></td></tr><tr><td><p>[ ] · [x]</p></td><td><p>Espace</p></td><td><p>Liste de tâches</p></td></tr><tr><td><p>&gt;</p></td><td><p>Espace</p></td><td><p>Citation</p></td></tr><tr><td><p>\`\`\` · \`\`\`ts</p></td><td><p>Espace · Entrée</p></td><td><p>Bloc de code</p></td></tr><tr><td><p>---</p></td><td><p>Entrée</p></td><td><p>Séparateur</p></td></tr><tr><td><p>https://…</p></td><td><p>Espace · Entrée</p></td><td><p>Lien</p></td></tr></table></div></div><p></p><p></p><h3>Fonctions de sortie</h3><div data-nabi-p><div class="nabi-scroll"><table data-nabi-sortable><tr><th><p>Fonction</p></th><th><p>Résultat</p></th></tr><tr><td><p>getHtml()</p></td><td><p>HTML</p></td></tr><tr><td><p>getJson()</p></td><td><p>JSON</p></td></tr></table></div></div><p></p><p></p><h2>Fonctionne sans DOM</h2><p>Convertir du JSON en HTML <b>ne nécessite aucun DOM</b>.</p><p>Un serveur (Node.js) peut lire le NABI TREE stocké et créer du HTML avec les mêmes règles.</p><p></p><h2>Adapté au mobile</h2><div data-nabi-p><ul><li><p><b>Interface mobile</b> — une mise en page responsive porte l’interface mobile.</p></li><li><p><b>Inset du clavier mobile</b> — lorsque le clavier s’ouvre, sa hauteur est prise en compte.</p></li><li><p><b>Tailles fluides</b> — chaque taille est écrite en rem.</p></li><li><p><b>Nombreuses langues</b> — plusieurs langues sont prises en charge.</p></li></ul></div><p></p><h2>Personnalisation</h2><div data-nabi-p><ul><li><p><b>Votre propre wing</b> — si vous avez besoin d’une fonction, construisez-la vous-même et enregistrez-la.</p></li><li><p><b>Votre propre CSS</b> — couleurs, coins et espacements sont tous définis en --nabi-* ; le sombre, le clair et le reste vous appartiennent.</p></li><li><p><b>Open source</b> — le projet est open source sur GitHub.</p></li></ul></div><div data-nabi-p><hr/></div><p>Lire la documentation → <a href="https://nabi.saro.me/">nabi.saro.me</a></p>`,
  demo_wings: 'Ailes',
  demo_wings_all: 'Tout activer',
  demo_wings_none: 'Tout désactiver',
  demo_zoom: 'Zoom',
  demo_zoom_out: 'Dézoomer',
  demo_zoom_in: 'Zoomer',
  demo_zoom_reset: 'Réinitialiser',
  demo_sticky: "Barre d'outils fixe",
  demo_sticky_keyboard: 'Compensation du clavier mobile',
  demo_sticky_height: 'Décalage',
  demo_sticky_unit: 'Unité du décalage',
  demo_typeface_base: 'Police par défaut',
  demo_typeface_sans: 'Sans empattement',
  demo_typeface_serif: 'Avec empattement',
  demo_typeface_mono: 'Chasse fixe',
  demo_typeface_cursive: 'Cursive',
  demo_html_small: '<p>Écrivez ici, et activez ou désactivez les wings ci-dessus.</p>',

  // Paired to pages by `src/sample.ts`; may use only markup that page enables (`src/wings.ts`)
  // 짝은 `src/sample.ts` 가 맺는다 — 그 페이지에서 켜지는 마크업만 써야 평문으로 안 떨어진다
  demo_html_bold:
    '<p>Repérez <b>les mots qui comptent</b>. Sélectionnez du texte et appuyez sur <b>G</b> dans la barre d\'outils.</p>',
  demo_html_italic:
    '<p>Les citations et les mots inhabituels se mettent en <i>italique</i>. Sélectionnez cette phrase et essayez.</p>',
  demo_html_underline:
    '<p>Il y a un <u>soulignement</u> ici. Sélectionnez ces lettres et appuyez à nouveau pour le retirer.</p>',
  demo_html_strikethrough: '<p><s>19,00 €</s> 9,90 € — pour garder l\'ancienne valeur visible.</p>',
  demo_html_superscript:
    '<p>La surface fait 3,5 m<sup>2</sup>, et les notes de bas de page s\'accrochent ainsi.<sup>1</sup></p>',
  demo_html_subscript: '<p>L\'eau, c\'est H<sub>2</sub>O, et le gaz qui pétille, c\'est du CO<sub>2</sub>.</p>',
  demo_html_link:
    '<p>Donnez-lui une adresse et vous obtenez <a href="https://example.com">un lien comme celui-ci</a>. Un lien déjà posé n\'ouvre aucune ligne contextuelle — pour changer l\'adresse, supprimez-le et refaites-en un.</p>',
  demo_html_highlight: '<p>Sélectionnez du texte et appuyez sur le bouton : six couleurs — <mark data-color="yellow">jaune</mark>, <mark data-color="green">vert</mark>, <mark data-color="cyan">cyan</mark>, <mark data-color="pink">rose</mark>, <mark data-color="purple">violet</mark>, <mark data-color="orange">orange</mark> — s’ouvrent près du caret.</p><p>Placez le caret dans un surlignage, et les mêmes échantillons apparaissent dans la ligne contextuelle pour changer seulement la couleur.</p>',
  demo_html_text_color: '<p>Colorez le texte en <span data-color="green">vert</span>, <span data-color="coral">corail</span>, <span data-color="violet">violet</span>, <span data-color="amber">ambre</span> ou <span data-color="blue">bleu</span> — cinq couleurs au total.</p><p><mark data-color="yellow">Le chevauchement avec un surlignage</mark> ne pose pas de problème : ce sont des marques différentes, donc <span data-color="blue">les deux s’appliquent.</span></p>',
  demo_html_heading:
    '<h1>Titre 1</h1><h2>Titre 2</h2><h3>Titre 3</h3><p>Texte courant. Taper # suivi d\'une espace sur une ligne vide fait aussi un titre.</p>',
  demo_html_bullet_list:
    '<ul><li>Une liste à puces</li><li>Tab indente, Maj+Tab désindente<ul><li>Un élément imbriqué</li></ul></li></ul><p>Taper - suivi d\'une espace sur une ligne vide en fait une aussi.</p>',
  demo_html_ordered_list:
    '<ol><li>Une liste numérotée</li><li>Insérer ou supprimer un élément renumérote tout seul</li></ol><p>Taper 1. suivi d\'une espace sur une ligne vide en fait une aussi.</p>',
  demo_html_task_list:
    '<ul data-nabi-list="task"><li data-nabi-checked="true">Cliquez sur la case devant le texte</li><li data-nabi-checked="false">L\'état coché est enregistré avec le document</li></ul><p>Taper [ ] ou [x] sur une ligne vide en fait une aussi.</p>',
  demo_html_table:
    '<table data-nabi-sortable=""><tbody><tr><th>Touche</th><th>Ce qu\'elle fait</th></tr><tr><td>Tab</td><td>Cellule suivante</td></tr><tr><td>Flèches</td><td>Déplacement dans la grille</td></tr></tbody></table><p>Placez le caret dans une cellule et la ligne contextuelle se remplit des commandes de ligne et de colonne.</p>',
  demo_html_image:
    '<div data-nabi-p data-nabi-align="c"><img src="/nabi-note.svg" alt="Logo NABI NOTE" data-nabi-width="50"></div><p>Cliquez sur l\'image pour ouvrir la boîte de largeur et d\'alignement.</p>',
  demo_html_youtube:
    '<p>Utilisez le bouton YouTube de la barre d\'outils, ou collez simplement une adresse de vidéo — l\'intégration atterrit ici même.</p>',
  demo_html_code:
    '<pre data-nabi-lang="ts">function sum(numbers: number[]) {<br>  return numbers.reduce((a, b) =&gt; a + b, 0)<br>}</pre><p>Placez le caret dans le code et la ligne contextuelle affiche un champ de langage.</p>',
  demo_html_details:
    '<details open=""><summary>Cliquez ici pour replier</summary><p>L\'état replié est enregistré avec le document — les lecteurs le voient tel que l\'auteur l\'a laissé.</p></details>',
  demo_html_quote: '<blockquote><p>Vous pouvez regrouper comme citation une phrase venant d’un autre texte, ou un contenu que vous voulez séparer.</p><p>Une citation peut contenir plusieurs paragraphes et blocs.</p></blockquote><p>Tapez &gt; puis une espace au début d’une ligne vide pour transformer cette ligne en citation.</p>',
  demo_html_divider:
    '<p>Un paragraphe au-dessus du séparateur.</p><hr><p>Et un autre en dessous. Taper --- seul sur une ligne puis Entrée fait aussi un trait.</p>',
  demo_html_align:
    '<p data-nabi-align="l">Aligné à gauche</p><p data-nabi-align="c">Centré</p><p data-nabi-align="r">Aligné à droite</p>',
  demo_html_font_size: '<p data-nabi-size="xs">Très petit — utile pour les notes de bas de page ou les notes d’appoint.</p><p data-nabi-size="sm">Petit — une taille en dessous du texte courant.</p><p>Un paragraphe à la taille par défaut. Le menu de taille montre aussi chaque taille de texte telle qu’elle apparaîtra.</p><p data-nabi-size="lg">Grand — utile pour une phrase qui doit ressortir.</p><p data-nabi-size="xl">Très grand — utile pour une phrase d’introduction sous un titre.</p><p>La taille du texte s’applique à la plage sélectionnée. S’il n’y a qu’un caret, elle s’applique au texte du paragraphe courant.</p>',
  demo_html_typeface: "<p>Ce paragraphe n’a pas de police explicite. Il est affiché avec la police par défaut de la page.</p><p data-nabi-typeface=\"serif\">Ce paragraphe utilise une police serif. Quand vous choisissez une famille comme serif, la police réelle suit le CSS du site.</p><p data-nabi-typeface=\"mono\">Ce paragraphe utilise une police monospace. Une largeur fixe par caractère aide à aligner des nombres ou du code — 0O 1lI</p><p data-nabi-typeface=\"cursive\">Cursive · Cursiva · Рукописный · خط اليد · हस्तलिपि · হস্তলিপি · رواں خط · Tulisan tangan · دست‌نویس · हस्ताक्षर · Chữ viết tay · చేతిరాత · Rubutun hannu · El yazısı · Mwandiko · கையெழுத்து · ลายมือ · Corsivo · 필기체 · 筆記体 · 手写体 · Schreibschrift</p>",
  demo_html_dropcap:
    '<p data-nabi-dropcap="on">La première lettre s\'étend sur trois lignes et le texte s\'écoule tout autour. Même un paragraphe court réserve la place de ces lignes, si bien que le bloc suivant n\'est jamais empiété.</p><p>Ce paragraphe ne l\'a pas.</p>',
  demo_html_clear_format:
    '<p>Sélectionnez du texte <b>gras</b>, <i>italique</i>, <u>souligné</u> ou <s>barré</s> et appuyez sur la gomme.</p><p>Seule la mise en forme des caractères part — les blocs restent exactement tels quels.</p>',
  demo_html_upload: '<p>Déposez un fichier dans la zone d’édition, ou collez-en un. Cette démo n’est pas connectée à un vrai serveur d’upload, donc les fichiers ne sont pas stockés sur un serveur.</p><p>Une fois l’upload terminé, un fichier peut rester dans le document comme <a href="https://nabi.saro.me/file-link-test.txt" data-nabi-file="txt">pièce jointe</a>.</p>',
  cdn_demo_lead: 'Enregistrez le code ci-dessous sous {file} et ouvrez-le dans un navigateur — vous le voyez tourner tout de suite.',
  cdn_demo_download: 'Télécharger demo.html',
  cdn_code_minheight: 'Hauteur minimale de l\'éditeur — évite qu\'il ressemble à une boîte d\'une seule ligne au chargement. Valeur libre.',
  cdn_code_wings: 'Toutes les wings sauf upload.',
  cdn_code_faces:
    'Parmi les polices, seules sans et serif sont gardées.\nLes systèmes ne prennent pas en charge les mêmes polices : mono et cursive ont besoin d\'une\npolice web importée à part pour être reconnues sur toutes les plateformes.\nVoir la page « Police » pour le détail.',
  cdn_code_change: 'Exemple de rappel quand la valeur change',
  code_copy: 'Copier le code',
  demo_install: 'Installation',
  demo_code: 'Code',
  demo_tree: 'nabi-tree',
  demo_loading: "Chargement de l'éditeur…",

  page_not_found: 'Page introuvable',
}
