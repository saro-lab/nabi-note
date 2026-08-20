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
  menu_intro: 'Introduction',
  menu_intro_index: "Qu'est-ce que NABI NOTE ?",
  menu_intro_usage: 'Utilisation de base',
  menu_intro_ssr: 'Prise en charge du SSR',
  menu_intro_cdn: 'Depuis un CDN',
  menu_intro_vibe_coding: 'Vibe coding par IA',

  menu_wing: 'Ailes',
  menu_wing_custom: 'Créer sa propre aile',
  menu_custom_start: 'Pour commencer',
  menu_custom_inline: 'Marques en ligne',
  menu_custom_block: 'Blocs et attributs',
  menu_custom_ui: 'Interface et actions',
  menu_custom_input: 'Touches, règles, collage',

  menu_style: 'Apparence',
  menu_style_custom: 'Styles personnalisés',

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

  demo_placeholder: 'Écrivez quelque chose',
  // Exercises every wing but YouTube — no stranger's video on the front page
  // 유튜브만 빼고 기본 날개 전부를 써 보인다 — 앞면에 남의 영상을 걸지 않는다
  demo_html: `<p data-nabi-align="c">La documentation est en cours de génération et de traduction par IA.</p><p data-nabi-align="c">Une fois stabilisé, il passera en version 1.0.0.</p><div data-nabi-p data-nabi-align="c"><img src="https://nabi.saro.me/logo/nabi-mark-demo.svg" data-nabi-width="40"/></div><h1 data-nabi-align="c">NABI NOTE</h1><p data-nabi-align="c"><span data-nabi-size="lg"><i><span data-nabi-typeface="cursive">Un éditeur WYSIWYG libre</span></i></span></p><p><br/></p><p data-nabi-dropcap="1"><span data-nabi-typeface="serif"><b>NABI NOTE</b> est un éditeur WYSIWYG libre conçu pour que chaque fonction majeure — mise en forme, alignement, tableaux, téléversements et le reste — vive à l'écart du cœur comme un module indépendant appelé « aile », ce qui permet d'étendre l'éditeur sans limite. Il est écrit en Vanilla JS pur et vise <b>ZÉRO dépendance à un framework</b> : il s'insère dans React, Vue ou n'importe quoi d'autre, et une <b>bibliothèque CDN</b> l'accompagne pour les projets sans système de build. Il porte son propre format JSON, <b>NABI TREE</b>, si bien que la conversion HTML–texte peut être préparée là où il n'y a pas de DOM (Node.js, SSR) ; et parce qu'il reconstruit les documents à partir d'un vocabulaire autorisé plutôt que de les rapiécer, il garantit des <b>scripts XSS bloqués à la racine</b> sans bibliothèque de nettoyage séparée. Côté design, il adopte un système de <b>variables CSS</b>, ce qui rend la couleur de marque facile à changer, et une <b>mise en page en rem</b>, si bien que le zoom garde l'interface mobile fluide ; couleurs ajustées au clair et au sombre, surligneurs et polices multilingues sont là. S'y ajoutent le <b>tri des colonnes conscient du type</b>, un <b>historique local</b> sur IndexedDB et la prise en charge du <b>vibe coding</b>.</span></p><p><br/></p><h2>Police</h2><p>Sans empattement (par défaut), avec empattement, chasse fixe et cursive — chaque famille empile des polices par écriture, de sorte que toute langue garde le visage de cette famille ; une écriture sans main courante dans cette famille retombe sur la police du navigateur. <b>La police par défaut est choisie par l'hôte.</b></p><p><br/></p><p>Voici chaque famille montrée <b>en plusieurs langues</b>.</p><p><br/></p><p><span data-nabi-typeface="serif"><span data-nabi-size="lg">세리프 · Serif · 明朝体 · 衬线 · Serif · Avec empattement · Serif · Com serifa · С засечками · بزخارف · सेरिफ़ · সেরিফ · سیرف · Berserif</span></span></p><p><br/></p><p><span data-nabi-typeface="mono"><span data-nabi-size="lg">고정폭 · Monospace · 等幅 · 等宽 · Dicktengleich · Chasse fixe · Monoespaciada · Monoespaçada · Моноширинный · ثابت العرض · मोनोस्पेस · মনোস্পেস · یکساں چوڑائی · Lebar tetap</span></span></p><p><br/></p><p><span data-nabi-typeface="cursive"><span data-nabi-size="lg">필기체 · Cursive · 筆記体 · 手写体 · Schreibschrift · Cursive · Cursiva · Cursiva · Рукописный · خط اليد · घसीट · হস্তলিপি · رواں خط · Tulisan tangan</span></span></p><p><br/></p><p><br/></p><h2>Taille du texte</h2><p><span data-nabi-size="xs">Très petit</span></p><p><span data-nabi-size="sm">Petit</span></p><p><span data-nabi-size="lg">Grand</span></p><p><span data-nabi-size="xl">Très grand</span></p><p><br/></p><p><br/></p><h2>Titre</h2><p>Sur une ligne vide, tapez # puis une espace — cela devient aussitôt un titre.</p><h1>H1</h1><h2>H2</h2><h3>H3</h3><h4>H4</h4><h5>H5</h5><h6>H6</h6><p><br/></p><p><br/></p><h2>Gras · Italique · Souligné · Barré</h2><p><b>Gras</b> <i>italique</i> <u>souligné</u> <s>barré</s> — un exemple.</p><p><b><i><s><u>On peut aussi les superposer.</u></s></i></b></p><h3>Exposant et indice</h3><p>La surface est de 3,5 m<sup>2</sup>, et une note se met comme ceci<sup>1</sup>.</p><p>L'eau, c'est H<sub>2</sub>O.</p><p><br/></p><p><br/></p><h2>Couleur du texte · Surligneur</h2><p>La palette est choisie pour rester lisible en mode clair comme en mode sombre.</p><p>Couleur du texte <span data-color="green">Vert</span> · <span data-color="coral">Corail</span> · <span data-color="violet">Violet</span> · <span data-color="amber">Ambre</span> · <span data-color="blue">Bleu</span></p><p>Surligneur <mark data-color="yellow">Jaune</mark> · <mark data-color="green">Vert</mark> · <mark data-color="cyan">Cyan</mark> · <mark data-color="pink">Rose</mark> · <mark data-color="purple">Pourpre</mark> · <mark data-color="orange">Orange</mark></p><p><br/></p><p><br/></p><h2>Lien</h2><p>Insérez une adresse et cela devient un <a href="https://nabi.saro.me/">lien</a>.</p><p>Seuls http:// et https:// sont admis ; quelque chose comme javascript: ne passe pas.</p><p>Par exemple, tapez <a href="https://nabi.saro.me/">https://nabi.saro.me</a> puis une espace ou Entrée — la conversion se fait toute seule, comme ici.</p><h3>target</h3><p>Par défaut, un lien de la même origine s'ouvre dans cette fenêtre et tout autre site dans une nouvelle ; la règle se fixe à la déclaration de l'éditeur.</p><h3>Lien de pièce jointe</h3><p>Si vous téléversez autre chose qu'une image, il reste un lien en forme de fichier comme ci-dessous.</p><p><a href="https://nabi.saro.me/file-link-test.txt" data-nabi-file="txt" download>Pièce jointe</a> voilà ce qui reste.</p><p><br/></p><p><br/></p><h2>Alignement</h2><p>Aligné à gauche</p><p>Centré</p><p>Aligné à droite</p><h3>Les titres s'alignent aussi.</h3><p><br/></p><p><br/></p><h2>Listes</h2><h3>Liste à puces</h3><p>Sur une ligne vide, tapez - puis <b>espace</b> — cela devient aussitôt une liste à puces.</p><div data-nabi-p><ul><li><p>Voici une puce</p><div data-nabi-p><ul><li><p>Tab / Maj+Tab pour indenter et désindenter.</p></li></ul></div></li></ul></div><h3>Liste numérotée</h3><p>Sur une ligne vide, tapez 1. puis <b>espace</b> — vous obtenez une liste numérotée.</p><div data-nabi-p><ol><li><p>Premier</p></li><li><p>Deuxième</p></li><li><p>Troisième</p></li></ol></div><h3>Liste de tâches</h3><p>Sur une ligne vide, tapez [ ] ou [x] puis <b>espace</b> — vous obtenez une liste de tâches.</p><div data-nabi-p><ul data-nabi-list="task"><li data-nabi-checked="true"><p>Cette tâche est faite.</p></li><li data-nabi-checked="false"><p>Celle-ci ne l'est pas encore.</p></li></ul></div><p><br/></p><p><br/></p><h2>Tableau</h2><p>Créez-le depuis le tableau de la barre d'outils ; lignes et colonnes s'ajoutent, se suppriment et se fusionnent.</p><h3>Tri des colonnes</h3><p>Appuyez sur <b>Aperçu</b>, puis cliquez tour à tour sur les en-têtes <b>Stock</b> et <b>Prix</b>.</p><div data-nabi-p><div class="nabi-scroll"><table data-nabi-sortable><tr><th><p>Modèle</p></th><th><p>Stock</p></th><th><p>Prix</p></th><th><p>Poids</p></th></tr><tr><td><p>NB-7</p></td><td><p>1,200</p></td><td><p>349</p></td><td><p>1.2 kg</p></td></tr><tr><td><p>NB-9</p></td><td><p>20,000</p></td><td><p>99</p></td><td><p>0.9 kg</p></td></tr><tr><td><p>NB-12</p></td><td><p>3,500</p></td><td><p>1,299</p></td><td><p>1.4 kg</p></td></tr><tr><td><p>NB-80</p></td><td><p>900</p></td><td><p>8,900</p></td><td><p>2.1 kg</p></td></tr><tr><td><p>NB-100</p></td><td><p>À définir</p></td><td><p>12,999</p></td><td><p>2.4 kg</p></td></tr></table></div></div><p><b>Prix</b> ne contient que des nombres : le tri est numérique.</p><p><b>Stock</b> se trie comme du texte à cause des lettres de la dernière cellule. (Pour l'éviter, videz cette cellule.)</p><p><br/></p><p><br/></p><h2>Séparateur</h2><p>Tapez --- puis Entrée — cela devient un séparateur.</p><div data-nabi-p><hr/></div><p><br/></p><p><br/></p><h2>Image</h2><p>Collez une adresse d'image ou téléversez-en une ; la largeur va de 30 % à 100 % et elle se place à gauche, au centre ou à droite.</p><div data-nabi-p><img src="https://nabi.saro.me/logo/nabi-mark-demo.svg" data-nabi-width="40"/></div><p><br/></p><p><br/></p><h2>YouTube</h2><div data-nabi-p><iframe src="https://www.youtube-nocookie.com/embed/6j-gQmaZ9Zk" title="YouTube" allowfullscreen loading="lazy" data-nabi-width="70"></iframe></div><p><br/></p><p><br/></p><h2>Téléversement</h2><p>Faites glisser une image ou un fichier sur l'éditeur.</p><p>Le téléversement de cette démonstration est une maquette ; un réglage le branche sur votre serveur.</p><p>Si un téléversement échoue, l'image ou le fichier est retiré de l'éditeur.</p><p><br/></p><p><br/></p><h2>Citation</h2><div data-nabi-p><blockquote><p>Sur une ligne vide, tapez &gt; puis <b>espace</b> — vous obtenez un bloc de citation.</p><p>Il peut tenir sur plusieurs lignes.</p></blockquote></div><p><br/></p><p><br/></p><h2>Code</h2><p>Sur une ligne vide, tapez \`\`\` puis <b>espace ou Entrée</b> — vous obtenez un bloc de code.</p><p>Écrivez aussi le langage, comme \`\`\`java, puis espace ou Entrée : le bloc prend ce langage.</p><div data-nabi-p><pre data-nabi-lang="typescript"><code class="language-typescript">import { createNabiWith, defaultWings } from 'nabi-note'<br/><br/>const { nabi } = createNabiWith(defaultWings)<br/>const html = nabi.getHtml()</code></pre></div><p><br/></p><p><br/></p><h2>Bloc dépliant</h2><div data-nabi-p><details open><summary>Un bloc dépliant se compose d'un titre et d'un contenu.</summary><p>Vous choisissez s'il est enregistré replié ou déplié.</p></details></div><p><br/></p><h2>Historique local</h2><p>Un historique est conservé à intervalle fixe via l'IndexedDB <b>du navigateur</b>.</p><p>Il reste uniquement en local et garde autant d'entrées que déclaré. — par défaut : toutes les 30 secondes, les 20 dernières sessions.</p><p><br/></p><p><br/></p><h2>Raccourcis</h2><p>Appuyez <b>deux fois vite sur Maj</b> et la barre d'outils montre le raccourci de chaque fonction.</p><p><br/></p><p><br/></p><h2>Format automatique</h2><div data-nabi-p><div class="nabi-scroll"><table data-nabi-sortable><tr><th><p>Exemple</p></th><th><p>Touche</p></th><th><p>Résultat</p></th></tr><tr><td><p>#</p></td><td><p>Espace</p></td><td><p>Titre</p></td></tr><tr><td><p>-</p></td><td><p>Espace</p></td><td><p>Liste à puces</p></td></tr><tr><td><p>1.</p></td><td><p>Espace</p></td><td><p>Liste numérotée</p></td></tr><tr><td><p>[ ] · [x]</p></td><td><p>Espace</p></td><td><p>Liste de tâches</p></td></tr><tr><td><p>&gt;</p></td><td><p>Espace</p></td><td><p>Citation</p></td></tr><tr><td><p>\`\`\` · \`\`\`ts</p></td><td><p>Espace · Entrée</p></td><td><p>Bloc de code</p></td></tr><tr><td><p>---</p></td><td><p>Entrée</p></td><td><p>Séparateur</p></td></tr><tr><td><p>https://…</p></td><td><p>Espace · Entrée</p></td><td><p>Lien</p></td></tr></table></div></div><p><br/></p><p><br/></p><h3>Fonctions de sortie</h3><div data-nabi-p><div class="nabi-scroll"><table data-nabi-sortable><tr><th><p>Fonction</p></th><th><p>Résultat</p></th></tr><tr><td><p>getHtml()</p></td><td><p>HTML</p></td></tr><tr><td><p>getJson()</p></td><td><p>JSON</p></td></tr></table></div></div><p><br/></p><p><br/></p><h2>Fonctionne sans DOM</h2><p>Convertir du JSON en HTML <b>ne demande aucun DOM</b>.</p><p>Un serveur (Node.js) lit l'arbre nabi enregistré tel quel et assemble le HTML tout en bloquant le XSS.</p><p><br/></p><h2>Adapté au mobile</h2><div data-nabi-p><ul><li><p><b>Interface mobile</b> — une mise en page adaptative porte l'interface mobile.</p></li><li><p><b>Correction du clavier</b> — quand le clavier s'ouvre, sa hauteur est prise en compte.</p></li><li><p><b>Tailles fluides</b> — toutes les tailles sont écrites en rem.</p></li><li><p><b>Multilingue</b> — il parle quatorze langues.</p></li></ul></div><p><br/></p><h2>Personnalisation</h2><div data-nabi-p><ul><li><p><b>Vos propres ailes</b> — s'il manque une fonction, construisez-la et enregistrez-la.</p></li><li><p><b>Votre propre CSS</b> — couleurs, angles et espacements sont définis en --nabi-*, le clair comme le sombre vous appartiennent.</p></li><li><p><b>Libre</b> — code source ouvert sur GitHub.</p></li></ul></div><div data-nabi-p><hr/></div><p>Voir la documentation → <a href="https://nabi.saro.me/">nabi.saro.me</a></p>`,
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
  demo_html_highlight:
    '<p>Sélectionnez du texte et appuyez sur le bouton : six couleurs — <mark data-color="yellow">jaune</mark>, <mark data-color="green">vert</mark>, <mark data-color="cyan">cyan</mark> — s\'ouvrent à côté du caret.</p><p>Posez le caret à l\'intérieur d\'une marque et les mêmes nuances apparaissent dans la ligne contextuelle pour changer la couleur.</p>',
  demo_html_text_color:
    '<p>Colorez le texte en <span data-color="green">vert</span>, <span data-color="coral">corail</span> ou <span data-color="violet">violet</span> — cinq couleurs en tout.</p><p><mark data-color="yellow">Superposer un surlignage</mark> ne pose aucun problème : ce sont des marques différentes, donc <span data-color="blue">les deux s\'appliquent.</span></p>',
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
  demo_html_quote:
    '<blockquote><p>Une boîte pour des mots qui ne sont pas les vôtres. À l\'intérieur, seules les marques de caractères s\'appliquent — les boutons image, code et tableau n\'apparaissent pas.</p></blockquote><p>Tapez &gt; suivi d\'une espace sur une ligne vide et la ligne devient une citation.</p>',
  demo_html_divider:
    '<p>Un paragraphe au-dessus du séparateur.</p><hr><p>Et un autre en dessous. Taper --- seul sur une ligne puis Entrée fait aussi un trait.</p>',
  demo_html_align:
    '<p data-nabi-align="l">Aligné à gauche</p><p data-nabi-align="c">Centré</p><p data-nabi-align="r">Aligné à droite</p>',
  demo_html_font_size:
    '<p data-nabi-size="xs">Très petit — notes de bas de page et remarques annexes.</p><p data-nabi-size="sm">Petit — un cran en retrait du texte courant.</p><p>Un paragraphe à la taille par défaut. Appuyez sur le bouton et cinq crans apparaissent, <b>chacun dans votre langue, à sa propre taille</b>.</p><p data-nabi-size="lg">Grand — une phrase qui a du poids.</p><p data-nabi-size="xl">Très grand — le chapeau sous un titre.</p>',
  demo_html_typeface:
    '<p>Ce paragraphe ne porte aucun style de police — il affiche le défaut de la page, sans-serif.</p><p data-nabi-typeface="serif">Celui-ci est serif. Vous choisissez la famille ; la police réelle est celle que ce site a posée sur le jeton, ici Noto Serif.</p><p data-nabi-typeface="mono">Celui-ci est à chasse fixe. Chaque caractère prend la même largeur, ce qui aligne les colonnes — 0O 1lI</p><p data-nabi-typeface="cursive">Celui-ci est cursif — Handwriting · 手書き · 手写.</p><p>Le style de police se règle <b>par paragraphe</b>, et cohabite sans souci avec des marques comme le gras.</p>',
  demo_html_dropcap:
    '<p data-nabi-dropcap="on">La première lettre s\'étend sur trois lignes et le texte s\'écoule tout autour. Même un paragraphe court réserve la place de ces lignes, si bien que le bloc suivant n\'est jamais empiété.</p><p>Ce paragraphe ne l\'a pas.</p>',
  demo_html_clear_format:
    '<p>Sélectionnez du texte <b>gras</b>, <i>italique</i>, <u>souligné</u> ou <s>barré</s> et appuyez sur la gomme.</p><p>Seule la mise en forme des caractères part — les blocs restent exactement tels quels.</p>',
  demo_html_upload:
    '<p>Déposez un fichier dans cette boîte, ou collez-en un. Ce site n\'a pas de serveur où téléverser, donc il ne fait que semblant — le résultat ne vit que dans cette page, nulle part ailleurs.</p><p>Une pièce jointe terminée ressemble à <a href="/nabi-note.svg" data-nabi-file="svg">nabi-note.svg</a>.</p>',


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
  demo_chars: '{n} caractères',
  demo_tree: 'nabi-tree',
  demo_loading: "Chargement de l'éditeur…",

  page_not_found: 'Page introuvable',
  nav_prev: 'Précédent',
  nav_next: 'Suivant',
}
