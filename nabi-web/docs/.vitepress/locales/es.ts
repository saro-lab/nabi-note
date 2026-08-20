// The words are Spanish now — menu names match the editor's own buttons, so a reader who
// clicks "Negrita" in the menu meets "Negrita" in the toolbar.
// 이제 낱말은 스페인어다 — 메뉴 이름은 에디터 버튼이 보이는 말과 같게 맞췄으니, 메뉴에서
// "Negrita" 를 누른 사람은 툴바에서도 "Negrita" 를 만난다.
export const es = {
  label: 'Español',
  lang: 'es',
  link: '/es/',
  description: 'NABI NOTE — un editor WYSIWYG de código abierto.',

  menu_docs: 'Documentación',
  menu_intro: 'Introducción',
  menu_intro_index: '¿Qué es NABI NOTE?',
  menu_intro_usage: 'Uso básico',
  menu_intro_ssr: 'Soporte de SSR',
  menu_intro_cdn: 'Desde un CDN',
  menu_intro_vibe_coding: 'Vibe coding con IA',

  menu_wing: 'Alas (Wings)',
  menu_wing_custom: 'Crea tu propia ala',
  menu_custom_start: 'Primeros pasos',
  menu_custom_inline: 'Marcas en línea',
  menu_custom_block: 'Bloques y atributos',
  menu_custom_ui: 'UI y acciones',
  menu_custom_input: 'Teclas, reglas y pegado',

  menu_style: 'Estilos',
  menu_style_custom: 'Estilos propios',

  menu_projects: 'Proyectos',

  menu_inline: 'En línea',
  menu_inline_bold: 'Negrita',
  menu_inline_italic: 'Cursiva',
  menu_inline_underline: 'Subrayado',
  menu_inline_strikethrough: 'Tachado',
  menu_inline_superscript: 'Superíndice',
  menu_inline_subscript: 'Subíndice',
  menu_inline_link: 'Enlace',
  menu_inline_highlight: 'Resaltador',
  menu_inline_text_color: 'Color del texto',

  menu_block: 'Bloque',
  menu_block_heading: 'Encabezado',
  menu_block_bullet_list: 'Lista con viñetas',
  menu_block_ordered_list: 'Lista numerada',
  menu_block_task_list: 'Lista de tareas',
  menu_block_table: 'Tabla',
  menu_block_image: 'Imagen',
  menu_block_youtube: 'YouTube',
  menu_block_code: 'Código',
  menu_block_details: 'Bloque plegable',
  menu_block_quote: 'Cita',
  menu_block_divider: 'Separador',

  menu_etc: 'Otros',
  menu_etc_align: 'Alineación',
  menu_etc_dropcap: 'Letra capital',
  menu_etc_typeface: 'Tipografía',
  menu_etc_font_size: 'Tamaño del texto',
  menu_etc_clear_format: 'Borrar formato',
  menu_etc_upload: 'Subir archivo',

  search: 'Buscar',
  search_no_results: 'Sin resultados',
  search_hint: 'Escriba un término de búsqueda',
  search_move: 'Mover',
  search_open: 'Abrir',
  search_close: 'Cerrar',

  demo_placeholder: 'Escribe algo aquí',
  // Exercises every wing but YouTube — no stranger's video on the front page
  // 유튜브만 빼고 기본 날개 전부를 써 보인다 — 앞면에 남의 영상을 걸지 않는다
  demo_html: `<p data-nabi-align="c">Ahora mismo la documentación se está generando y traduciendo con IA.</p><p data-nabi-align="c">Cuando se asiente, pasará a la versión 1.0.0.</p><div data-nabi-p data-nabi-align="c"><img src="https://nabi.saro.me/logo/nabi-mark-demo.svg" data-nabi-width="40"/></div><h1 data-nabi-align="c">NABI NOTE</h1><p data-nabi-align="c"><span data-nabi-size="lg"><i><span data-nabi-typeface="cursive">Un editor WYSIWYG de código abierto</span></i></span></p><p><br/></p><p data-nabi-dropcap="1"><span data-nabi-typeface="serif"><b>NABI NOTE</b> es un editor WYSIWYG de código abierto en el que cada función principal —formato, alineación, tablas, subidas y lo demás— vive aparte del núcleo como un módulo independiente llamado «ala», de modo que quien programa puede ampliarlo sin límite. Está escrito en Vanilla JS puro con la meta de <b>CERO dependencia de frameworks</b>, así que entra igual en React, en Vue o en lo que sea, y trae una <b>biblioteca CDN</b> para proyectos sin sistema de compilación. Lleva su propio formato JSON, <b>NABI TREE</b>, de modo que la conversión entre HTML y texto puede prepararse donde no hay DOM (Node.js, SSR); y como rearma los documentos con un vocabulario permitido en vez de remendarlos, garantiza <b>scripts XSS bloqueados de raíz</b> sin ninguna biblioteca de saneamiento aparte. En el diseño adopta el sistema de <b>variables CSS</b>, con lo que el color de marca se cambia fácil, y una <b>maquetación en rem</b>, de modo que ampliar o reducir mantiene fluida la interfaz móvil; los colores ajustados a claro y oscuro, los marcadores y las tipografías multilingües ya están puestos. A eso se suman la <b>ordenación de columnas que reconoce el tipo</b>, un <b>historial local</b> sobre IndexedDB y soporte para <b>vibe coding</b>.</span></p><p><br/></p><h2>Tipografía</h2><p>Palo seco (por defecto), serif, monoespaciada y cursiva: cada familia apila tipografías por sistema de escritura, así que cualquier idioma conserva el rostro de esa familia; una escritura que no tenga mano cursiva en esa familia cae a la fuente del navegador. <b>La tipografía por defecto la decide el anfitrión.</b></p><p><br/></p><p>Abajo, cada familia mostrada <b>en varios idiomas</b>.</p><p><br/></p><p><span data-nabi-typeface="serif"><span data-nabi-size="lg">세리프 · Serif · 明朝体 · 衬线 · Serif · Avec empattement · Serif · Com serifa · С засечками · بزخارف · सेरिफ़ · সেরিফ · سیرف · Berserif</span></span></p><p><br/></p><p><span data-nabi-typeface="mono"><span data-nabi-size="lg">고정폭 · Monospace · 等幅 · 等宽 · Dicktengleich · Chasse fixe · Monoespaciada · Monoespaçada · Моноширинный · ثابت العرض · मोनोस्पेस · মনোস্পেস · یکساں چوڑائی · Lebar tetap</span></span></p><p><br/></p><p><span data-nabi-typeface="cursive"><span data-nabi-size="lg">필기체 · Cursive · 筆記体 · 手写体 · Schreibschrift · Cursive · Cursiva · Cursiva · Рукописный · خط اليد · घसीट · হস্তলিপি · رواں خط · Tulisan tangan</span></span></p><p><br/></p><p><br/></p><h2>Tamaño de letra</h2><p><span data-nabi-size="xs">Muy pequeño</span></p><p><span data-nabi-size="sm">Pequeño</span></p><p><span data-nabi-size="lg">Grande</span></p><p><span data-nabi-size="xl">Muy grande</span></p><p><br/></p><p><br/></p><h2>Título</h2><p>En una línea vacía escribe # y pulsa espacio: al momento se vuelve un título.</p><h1>H1</h1><h2>H2</h2><h3>H3</h3><h4>H4</h4><h5>H5</h5><h6>H6</h6><p><br/></p><p><br/></p><h2>Negrita · Cursiva · Subrayado · Tachado</h2><p><b>Negrita</b> <i>cursiva</i> <u>subrayado</u> <s>tachado</s>: un ejemplo.</p><p><b><i><s><u>También se pueden superponer.</u></s></i></b></p><h3>Superíndice y subíndice</h3><p>La superficie es de 3,5 m<sup>2</sup>, y una nota se pone así<sup>1</sup>.</p><p>El agua es H<sub>2</sub>O.</p><p><br/></p><p><br/></p><h2>Color de texto · Marcador</h2><p>La paleta está elegida para leerse bien tanto en claro como en oscuro.</p><p>Color de texto <span data-color="green">Verde</span> · <span data-color="coral">Coral</span> · <span data-color="violet">Violeta</span> · <span data-color="amber">Ámbar</span> · <span data-color="blue">Azul</span></p><p>Marcador <mark data-color="yellow">Amarillo</mark> · <mark data-color="green">Verde</mark> · <mark data-color="cyan">Cian</mark> · <mark data-color="pink">Rosa</mark> · <mark data-color="purple">Púrpura</mark> · <mark data-color="orange">Naranja</mark></p><p><br/></p><p><br/></p><h2>Enlace</h2><p>Pon una dirección y se convierte en un <a href="https://nabi.saro.me/">enlace</a>.</p><p>Solo se admiten http:// y https://; algo como javascript: no pasa.</p><p>Por ejemplo, escribe <a href="https://nabi.saro.me/">https://nabi.saro.me</a> y pulsa espacio o Intro: se convierte solo, como ves aquí.</p><h3>target</h3><p>Por defecto, un enlace del mismo origen se abre en esta ventana y cualquier otro sitio en una nueva; la regla se fija al declarar el editor.</p><h3>Enlace de adjunto</h3><p>Si subes algo que no sea una imagen, queda un enlace con forma de archivo como el de abajo.</p><p><a href="https://nabi.saro.me/file-link-test.txt" data-nabi-file="txt" download>Adjunto</a> así es como queda.</p><p><br/></p><p><br/></p><h2>Alineación</h2><p>A la izquierda</p><p>Centrado</p><p>A la derecha</p><h3>Los títulos también se alinean.</h3><p><br/></p><p><br/></p><h2>Listas</h2><h3>Lista con viñetas</h3><p>En una línea vacía escribe - y pulsa <b>espacio</b>: al momento se vuelve una lista con viñetas.</p><div data-nabi-p><ul><li><p>Esto es una viñeta</p><div data-nabi-p><ul><li><p>Tab / Mayús+Tab sangran y quitan sangría.</p></li></ul></div></li></ul></div><h3>Lista numerada</h3><p>En una línea vacía escribe 1. y pulsa <b>espacio</b>: sale una lista numerada.</p><div data-nabi-p><ol><li><p>Primero</p></li><li><p>Segundo</p></li><li><p>Tercero</p></li></ol></div><h3>Lista de tareas</h3><p>En una línea vacía escribe [ ] o [x] y pulsa <b>espacio</b>: sale una lista de tareas.</p><div data-nabi-p><ul data-nabi-list="task"><li data-nabi-checked="true"><p>Esta tarea está hecha.</p></li><li data-nabi-checked="false"><p>Esta todavía no.</p></li></ul></div><p><br/></p><p><br/></p><h2>Tabla</h2><p>Créala desde la tabla de la barra de herramientas; se añaden, se quitan y se combinan filas y columnas.</p><h3>Ordenar columnas</h3><p>Pulsa <b>Vista previa</b> y luego haz clic, uno tras otro, en los encabezados <b>Existencias</b> y <b>Precio</b>.</p><div data-nabi-p><div class="nabi-scroll"><table data-nabi-sortable><tr><th><p>Modelo</p></th><th><p>Existencias</p></th><th><p>Precio</p></th><th><p>Peso</p></th></tr><tr><td><p>NB-7</p></td><td><p>1,200</p></td><td><p>349</p></td><td><p>1.2 kg</p></td></tr><tr><td><p>NB-9</p></td><td><p>20,000</p></td><td><p>99</p></td><td><p>0.9 kg</p></td></tr><tr><td><p>NB-12</p></td><td><p>3,500</p></td><td><p>1,299</p></td><td><p>1.4 kg</p></td></tr><tr><td><p>NB-80</p></td><td><p>900</p></td><td><p>8,900</p></td><td><p>2.1 kg</p></td></tr><tr><td><p>NB-100</p></td><td><p>Por definir</p></td><td><p>12,999</p></td><td><p>2.4 kg</p></td></tr></table></div></div><p><b>Precio</b> son solo números, así que se ordena como número.</p><p><b>Existencias</b> se ordena como texto porque la última celda lleva letras. (Para evitarlo, vacía esa celda.)</p><p><br/></p><p><br/></p><h2>Separador</h2><p>Escribe --- y pulsa Intro: se vuelve un separador.</p><div data-nabi-p><hr/></div><p><br/></p><p><br/></p><h2>Imagen</h2><p>Pega la dirección de una imagen o súbela; el ancho va del 30 % al 100 % y se coloca a la izquierda, al centro o a la derecha.</p><div data-nabi-p><img src="https://nabi.saro.me/logo/nabi-mark-demo.svg" data-nabi-width="40"/></div><p><br/></p><p><br/></p><h2>YouTube</h2><div data-nabi-p><iframe src="https://www.youtube-nocookie.com/embed/6j-gQmaZ9Zk" title="YouTube" allowfullscreen loading="lazy" data-nabi-width="70"></iframe></div><p><br/></p><p><br/></p><h2>Subida</h2><p>Arrastra una imagen o un archivo sobre el editor.</p><p>La subida de esta demostración es de mentira; con un ajuste se conecta a tu servidor.</p><p>Si una subida falla, esa imagen o archivo se retira del editor.</p><p><br/></p><p><br/></p><h2>Cita</h2><div data-nabi-p><blockquote><p>En una línea vacía escribe &gt; y pulsa <b>espacio</b>: sale un bloque de cita.</p><p>Puede ocupar varias líneas.</p></blockquote></div><p><br/></p><p><br/></p><h2>Código</h2><p>En una línea vacía escribe \`\`\` y pulsa <b>espacio o Intro</b>: sale un bloque de código.</p><p>Escribe también el lenguaje, como \`\`\`java, y pulsa espacio o Intro: el bloque toma ese lenguaje.</p><div data-nabi-p><pre data-nabi-lang="typescript"><code class="language-typescript">import { createNabiWith, defaultWings } from 'nabi-note'<br/><br/>const { nabi } = createNabiWith(defaultWings)<br/>const html = nabi.getHtml()</code></pre></div><p><br/></p><p><br/></p><h2>Bloque plegable</h2><div data-nabi-p><details open><summary>Un bloque plegable se compone de título y contenido.</summary><p>Tú decides si se guarda plegado o desplegado.</p></details></div><p><br/></p><h2>Historial local</h2><p>A través de la IndexedDB <b>del navegador</b> se deja historial en el intervalo que fijes.</p><p>Se queda solo en local y guarda tantas entradas como declares. — por defecto: cada 30 segundos, las últimas 20 sesiones.</p><p><br/></p><p><br/></p><h2>Atajos</h2><p>Pulsa <b>dos veces seguidas Mayús</b> y la barra de herramientas muestra el atajo de cada función.</p><p><br/></p><p><br/></p><h2>Formato automático</h2><div data-nabi-p><div class="nabi-scroll"><table data-nabi-sortable><tr><th><p>Ejemplo</p></th><th><p>Tecla</p></th><th><p>Resultado</p></th></tr><tr><td><p>#</p></td><td><p>Espacio</p></td><td><p>Título</p></td></tr><tr><td><p>-</p></td><td><p>Espacio</p></td><td><p>Lista con viñetas</p></td></tr><tr><td><p>1.</p></td><td><p>Espacio</p></td><td><p>Lista numerada</p></td></tr><tr><td><p>[ ] · [x]</p></td><td><p>Espacio</p></td><td><p>Lista de tareas</p></td></tr><tr><td><p>&gt;</p></td><td><p>Espacio</p></td><td><p>Cita</p></td></tr><tr><td><p>\`\`\` · \`\`\`ts</p></td><td><p>Espacio · Intro</p></td><td><p>Bloque de código</p></td></tr><tr><td><p>---</p></td><td><p>Intro</p></td><td><p>Separador</p></td></tr><tr><td><p>https://…</p></td><td><p>Espacio · Intro</p></td><td><p>Enlace</p></td></tr></table></div></div><p><br/></p><p><br/></p><h3>Funciones de salida</h3><div data-nabi-p><div class="nabi-scroll"><table data-nabi-sortable><tr><th><p>Función</p></th><th><p>Resultado</p></th></tr><tr><td><p>getHtml()</p></td><td><p>HTML</p></td></tr><tr><td><p>getJson()</p></td><td><p>JSON</p></td></tr></table></div></div><p><br/></p><p><br/></p><h2>Funciona sin DOM</h2><p>Convertir JSON en HTML <b>no necesita DOM</b>.</p><p>Un servidor (Node.js) lee tal cual el árbol nabi guardado y arma el HTML mientras frena el XSS.</p><p><br/></p><h2>Amable con el móvil</h2><div data-nabi-p><ul><li><p><b>Interfaz móvil</b> — una maquetación adaptable sostiene la interfaz móvil.</p></li><li><p><b>Corrección del teclado</b> — cuando el teclado se abre, se corrige su altura.</p></li><li><p><b>Tamaños fluidos</b> — todos los tamaños están escritos en rem.</p></li><li><p><b>Multilingüe</b> — habla catorce idiomas.</p></li></ul></div><p><br/></p><h2>Personalización</h2><div data-nabi-p><ul><li><p><b>Tus propias alas</b> — si falta una función, constrúyela y regístrala.</p></li><li><p><b>Tu propio CSS</b> — colores, esquinas y márgenes están definidos con --nabi-*, lo claro y lo oscuro son cosa tuya.</p></li><li><p><b>Código abierto</b> — abierto en GitHub.</p></li></ul></div><div data-nabi-p><hr/></div><p>Ver la documentación → <a href="https://nabi.saro.me/">nabi.saro.me</a></p>`,
  demo_wings: 'Alas',
  demo_wings_all: 'Activar todo',
  demo_wings_none: 'Desactivar todo',
  demo_zoom: 'Zoom',
  demo_zoom_out: 'Alejar',
  demo_zoom_in: 'Acercar',
  demo_zoom_reset: 'Restablecer',
  demo_sticky: 'Barra de herramientas fija',
  demo_sticky_keyboard: 'Compensación del teclado móvil',
  demo_sticky_height: 'Altura',
  demo_sticky_unit: 'Unidad de altura',
  demo_typeface_base: 'Tipografía base',
  demo_typeface_sans: 'Sin serifa',
  demo_typeface_serif: 'Con serifa',
  demo_typeface_mono: 'Monoespaciada',
  demo_typeface_cursive: 'Manuscrita',
  demo_html_small: '<p>Escribe aquí y activa o desactiva los wings de arriba.</p>',

  // Paired to pages by `src/sample.ts`; may use only markup that page enables (`src/wings.ts`)
  // 짝은 `src/sample.ts` 가 맺는다 — 그 페이지에서 켜지는 마크업만 써야 평문으로 안 떨어진다
  demo_html_bold:
    '<p>Señala <b>las palabras importantes</b> de la frase. Selecciona texto y pulsa <b>B</b> en la barra de herramientas.</p>',
  demo_html_italic:
    '<p>Las palabras poco conocidas o las citas van en <i>cursiva</i>. Selecciona esta frase y pruébalo.</p>',
  demo_html_underline:
    '<p>Aquí hay un <u>subrayado</u>. Selecciona esas letras y vuelve a pulsar para quitarlo.</p>',
  demo_html_strikethrough: '<p><s>19,00 €</s> 9,90 € — para dejar ver el valor anterior.</p>',
  demo_html_superscript:
    '<p>El área es de 3,5 m<sup>2</sup>, y las notas al pie se ponen así.<sup>1</sup></p>',
  demo_html_subscript: '<p>El agua es H<sub>2</sub>O, y el gas del refresco es CO<sub>2</sub>.</p>',
  demo_html_link:
    '<p>Si le pones una dirección, obtienes <a href="https://example.com">un enlace como este</a>. Un enlace existente no muestra barra contextual — para cambiar la dirección, bórralo y crea uno nuevo.</p>',
  demo_html_highlight:
    '<p>Selecciona texto y pulsa el botón: aparecen seis colores junto al cursor — <mark data-color="yellow">amarillo</mark>, <mark data-color="green">verde</mark>, <mark data-color="cyan">celeste</mark>, <mark data-color="pink">rosa</mark>, <mark data-color="purple">morado</mark>, <mark data-color="orange">naranja</mark>.</p><p>Pon el cursor dentro de una marca y las mismas muestras aparecen en la barra contextual para cambiar el color.</p>',
  demo_html_text_color:
    '<p>Pinta el texto de <span data-color="green">verde</span>, <span data-color="coral">coral</span>, <span data-color="violet">violeta</span>, <span data-color="amber">ámbar</span> o <span data-color="blue">azul</span> — cinco colores en total.</p><p><mark data-color="yellow">Superponer un resaltado</mark> no es problema: son marcas distintas, así que <span data-color="blue">ambas se aplican.</span></p>',
  demo_html_heading:
    '<h1>Título 1</h1><h2>Título 2</h2><h3>Título 3</h3><p>Texto normal. Escribir # y un espacio en una línea vacía también crea un título.</p>',
  demo_html_bullet_list:
    '<ul><li>Una lista con viñetas</li><li>Tab sangra, Shift+Tab quita la sangría<ul><li>Un elemento anidado</li></ul></li></ul><p>Escribir - y un espacio en una línea vacía también crea una.</p>',
  demo_html_ordered_list:
    '<ol><li>Una lista numerada</li><li>Insertar o borrar un elemento vuelve a numerar todo</li></ol><p>Escribir 1. y un espacio en una línea vacía también crea una.</p>',
  demo_html_task_list:
    '<ul data-nabi-list="task"><li data-nabi-checked="true">Pulsa la casilla delante del texto</li><li data-nabi-checked="false">El estado marcado se guarda con el documento</li></ul><p>Escribir [ ] o [x] en una línea vacía también crea una.</p>',
  demo_html_table:
    '<table data-nabi-sortable=""><tbody><tr><th>Tecla</th><th>Qué hace</th></tr><tr><td>Tab</td><td>Siguiente celda</td></tr><tr><td>Flechas</td><td>Mueve por la cuadrícula</td></tr></tbody></table><p>Pon el cursor en una celda y la barra contextual se llena con comandos de fila y columna.</p>',
  demo_html_image:
    '<div data-nabi-p data-nabi-align="c"><img src="/nabi-note.svg" alt="logo de NABI NOTE" data-nabi-width="50"></div><p>Haz clic en la imagen para ver el cuadro de ancho y alineación.</p>',
  demo_html_youtube:
    '<p>Usa el botón de YouTube en la barra de herramientas, o simplemente pega la dirección de un video — el video incrustado aparece justo aquí.</p>',
  demo_html_code:
    '<pre data-nabi-lang="ts">function sum(numbers: number[]) {<br>  return numbers.reduce((a, b) =&gt; a + b, 0)<br>}</pre><p>Pon el cursor dentro del código y la barra contextual muestra un campo de lenguaje. Selecciona varias líneas y pulsa Tab para sangrarlas juntas; Shift+Tab lo deshace.</p>',
  demo_html_details:
    '<details open=""><summary>Haz clic aquí para plegar</summary><p>El estado plegado se guarda con el documento — quien lo lea lo ve tal como lo dejó quien escribió.</p></details>',
  demo_html_quote:
    '<blockquote><p>Una caja para palabras que no son tuyas. Dentro solo se aplican marcas de carácter — los botones de imagen, código y tabla no aparecen.</p></blockquote><p>Escribe &gt; y un espacio en una línea vacía y la línea se vuelve una cita.</p>',
  demo_html_divider:
    '<p>Un párrafo sobre el divisor.</p><hr><p>Y otro debajo. Escribir --- solo en una línea y pulsar Enter también crea una línea.</p>',
  demo_html_align:
    '<p data-nabi-align="l">Alineado a la izquierda</p><p data-nabi-align="c">Alineado al centro</p><p data-nabi-align="r">Alineado a la derecha</p>',
  demo_html_font_size:
    '<p data-nabi-size="xs">Muy pequeño — para notas al pie y acotaciones.</p><p data-nabi-size="sm">Pequeño — un paso detrás del cuerpo.</p><p>Un párrafo de tamaño por defecto. Pulsa el botón y aparecen cinco niveles, <b>cada uno en tu idioma, con su propio tamaño</b>.</p><p data-nabi-size="lg">Grande — una frase con peso.</p><p data-nabi-size="xl">Muy grande — el copete bajo un título.</p>',
  demo_html_typeface:
    '<p>Este párrafo no lleva ninguna tipografía — muestra la que trae la página por defecto, sin serifa.</p><p data-nabi-typeface="serif">Este es con serifa. Tú eliges la familia; la fuente real es la que este sitio puso en el token, aquí Noto Serif.</p><p data-nabi-typeface="mono">Este es monoespaciado. Cada carácter ocupa el mismo ancho, lo que alinea columnas — 0O 1lI</p><p data-nabi-typeface="cursive">Este es manuscrito — Handwriting · 手書き · 手写.</p><p>La tipografía se fija <b>por párrafo</b>, y convive sin problema con marcas como negrita.</p>',
  demo_html_dropcap:
    '<p data-nabi-dropcap="on">La primera letra ocupa tres líneas y el texto fluye a su alrededor. Aunque el párrafo sea corto, se reserva el espacio de esas líneas, así que el bloque de abajo nunca se ve invadido.</p><p>Este párrafo no lo tiene.</p>',
  demo_html_clear_format:
    '<p>Selecciona texto que esté en <b>negrita</b>, <i>cursiva</i>, <u>subrayado</u> o <s>tachado</s> y pulsa el borrador.</p><p>Solo se borra el formato de carácter — los bloques quedan exactamente igual.</p>',
  demo_html_upload:
    '<p>Suelta un archivo en esta caja, o pégalo. Este sitio no tiene servidor donde subirlo, así que solo lo simula — el resultado vive solo dentro de esta página.</p><p>Un archivo adjunto terminado se ve como <a href="/nabi-note.svg" data-nabi-file="svg">nabi-note.svg</a>.</p>',


  cdn_demo_lead: 'Guarde el código de abajo como {file} y ábralo en el navegador — se puede comprobar de inmediato.',
  cdn_demo_download: 'Descargar demo.html',
  cdn_code_minheight: 'alto mínimo del editor — para que no se vea como una caja de una sola línea al abrirlo. Cambie el valor libremente.',
  cdn_code_wings: 'Incluye todos los wings salvo el de subida.',
  cdn_code_faces:
    'Deja solo dos tipografías: sans-serif y serif.\nComo cada sistema admite tipografías distintas, la monoespaciada y la manuscrita\nnecesitan importarse aparte para que se reconozcan en todas las plataformas.\nVea el documento de "Tipografía" para más detalle.',
  cdn_code_change: 'Ejemplo de callback cuando cambia el valor',
  code_copy: 'Copiar código',
  demo_install: 'Instalación',
  demo_code: 'Código',
  demo_chars: '{n} caracteres',
  demo_tree: 'nabi-tree',
  demo_loading: 'Cargando el editor…',

  page_not_found: 'Página no encontrada',
  nav_prev: 'Anterior',
  nav_next: 'Siguiente',
}
