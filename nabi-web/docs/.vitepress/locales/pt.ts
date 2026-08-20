// The words are Portuguese now — menu names match the editor's own buttons, so a reader who
// clicks "Negrito" in the menu meets "Negrito" in the toolbar.
// 이제 낱말은 포르투갈어다 — 메뉴 이름은 에디터 버튼이 보이는 말과 같게 맞췄으니, 메뉴에서
// "Negrito" 를 누른 사람은 툴바에서도 "Negrito" 를 만난다.
export const pt = {
  label: 'Português',
  lang: 'pt',
  link: '/pt/',
  description: 'NABI NOTE — um editor WYSIWYG de código aberto.',

  menu_docs: 'Documentação',
  menu_intro: 'Introdução',
  menu_intro_index: 'O que é o NABI NOTE?',
  menu_intro_usage: 'Uso básico',
  menu_intro_ssr: 'Suporte a SSR',
  menu_intro_cdn: 'Usando um CDN',
  menu_intro_vibe_coding: 'Vibe coding com IA',

  menu_wing: 'Asas (Wings)',
  menu_wing_custom: 'Crie a sua própria asa',
  menu_custom_start: 'Primeiros passos',
  menu_custom_inline: 'Marcas em linha',
  menu_custom_block: 'Blocos e atributos',
  menu_custom_ui: 'UI e ações',
  menu_custom_input: 'Teclas, regras e colagem',

  menu_style: 'Estilos',
  menu_style_custom: 'Estilos próprios',

  menu_projects: 'Projetos',

  menu_inline: 'Em linha',
  menu_inline_bold: 'Negrito',
  menu_inline_italic: 'Itálico',
  menu_inline_underline: 'Sublinhado',
  menu_inline_strikethrough: 'Tachado',
  menu_inline_superscript: 'Sobrescrito',
  menu_inline_subscript: 'Subscrito',
  menu_inline_link: 'Link',
  menu_inline_highlight: 'Realce',
  menu_inline_text_color: 'Cor do texto',

  menu_block: 'Bloco',
  menu_block_heading: 'Título',
  menu_block_bullet_list: 'Lista com marcadores',
  menu_block_ordered_list: 'Lista numerada',
  menu_block_task_list: 'Lista de tarefas',
  menu_block_table: 'Tabela',
  menu_block_image: 'Imagem',
  menu_block_youtube: 'YouTube',
  menu_block_code: 'Código',
  menu_block_details: 'Bloco recolhível',
  menu_block_quote: 'Citação',
  menu_block_divider: 'Separador',

  menu_etc: 'Outros',
  menu_etc_align: 'Alinhamento',
  menu_etc_dropcap: 'Capitular',
  menu_etc_typeface: 'Tipo de letra',
  menu_etc_font_size: 'Tamanho da letra',
  menu_etc_clear_format: 'Limpar formatação',
  menu_etc_upload: 'Enviar arquivo',

  search: 'Buscar',
  search_no_results: 'Nenhum resultado',
  search_hint: 'Digite um termo de busca',
  search_move: 'Mover',
  search_open: 'Abrir',
  search_close: 'Fechar',

  demo_placeholder: 'Escreva algo aqui',
  // Exercises every wing but YouTube — no stranger's video on the front page
  // 유튜브만 빼고 기본 날개 전부를 써 보인다 — 앞면에 남의 영상을 걸지 않는다
  demo_html: `<p data-nabi-align="c">No momento, a documentação está sendo gerada e traduzida com IA.</p><p data-nabi-align="c">Quando assentar, passa para a versão 1.0.0.</p><div data-nabi-p data-nabi-align="c"><img src="https://nabi.saro.me/logo/nabi-mark-demo.svg" data-nabi-width="40"/></div><h1 data-nabi-align="c">NABI NOTE</h1><p data-nabi-align="c"><span data-nabi-size="lg"><i><span data-nabi-typeface="cursive">Um editor WYSIWYG de código aberto</span></i></span></p><p><br/></p><p data-nabi-dropcap="1"><span data-nabi-typeface="serif"><b>NABI NOTE</b> é um editor WYSIWYG de código aberto em que cada função principal — formatação, alinhamento, tabelas, envios e o resto — vive fora do núcleo como um módulo independente chamado «asa», de modo que quem programa pode estendê-lo sem limite. É escrito em Vanilla JS puro com a meta de <b>ZERO dependência de frameworks</b>, então entra igual em React, em Vue ou no que for, e traz uma <b>biblioteca CDN</b> para projetos sem sistema de build. Carrega o seu próprio formato JSON, <b>NABI TREE</b>, de modo que a conversão entre HTML e texto pode ser preparada onde não há DOM (Node.js, SSR); e como remonta os documentos com um vocabulário permitido em vez de remendá-los, garante <b>scripts XSS bloqueados na raiz</b> sem nenhuma biblioteca de saneamento à parte. No design adota o sistema de <b>variáveis CSS</b>, o que torna fácil trocar a cor da marca, e um <b>layout em rem</b>, de modo que ampliar ou reduzir mantém a interface móvel macia; as cores ajustadas ao claro e ao escuro, os marcadores e as fontes multilíngues já estão lá. A isso somam-se a <b>ordenação de colunas que reconhece o tipo</b>, um <b>histórico local</b> sobre IndexedDB e suporte a <b>vibe coding</b>.</span></p><p><br/></p><h2>Fonte</h2><p>Sem serifa (padrão), com serifa, monoespaçada e cursiva: cada família empilha fontes por sistema de escrita, então qualquer idioma guarda o rosto daquela família; uma escrita sem mão cursiva naquela família cai para a fonte do navegador. <b>A fonte padrão é decidida pelo hospedeiro.</b></p><p><br/></p><p>Abaixo, cada família mostrada <b>em vários idiomas</b>.</p><p><br/></p><p><span data-nabi-typeface="serif"><span data-nabi-size="lg">세리프 · Serif · 明朝体 · 衬线 · Serif · Avec empattement · Serif · Com serifa · С засечками · بزخارف · सेरिफ़ · সেরিফ · سیرف · Berserif</span></span></p><p><br/></p><p><span data-nabi-typeface="mono"><span data-nabi-size="lg">고정폭 · Monospace · 等幅 · 等宽 · Dicktengleich · Chasse fixe · Monoespaciada · Monoespaçada · Моноширинный · ثابت العرض · मोनोस्पेस · মনোস্পেস · یکساں چوڑائی · Lebar tetap</span></span></p><p><br/></p><p><span data-nabi-typeface="cursive"><span data-nabi-size="lg">필기체 · Cursive · 筆記体 · 手写体 · Schreibschrift · Cursive · Cursiva · Cursiva · Рукописный · خط اليد · घसीट · হস্তলিপি · رواں خط · Tulisan tangan</span></span></p><p><br/></p><p><br/></p><h2>Tamanho da letra</h2><p><span data-nabi-size="xs">Muito pequeno</span></p><p><span data-nabi-size="sm">Pequeno</span></p><p><span data-nabi-size="lg">Grande</span></p><p><span data-nabi-size="xl">Muito grande</span></p><p><br/></p><p><br/></p><h2>Título</h2><p>Numa linha vazia escreva # e aperte espaço: na hora vira um título.</p><h1>H1</h1><h2>H2</h2><h3>H3</h3><h4>H4</h4><h5>H5</h5><h6>H6</h6><p><br/></p><p><br/></p><h2>Negrito · Itálico · Sublinhado · Riscado</h2><p><b>Negrito</b> <i>itálico</i> <u>sublinhado</u> <s>riscado</s> — um exemplo.</p><p><b><i><s><u>Também dá para sobrepor.</u></s></i></b></p><h3>Sobrescrito e subscrito</h3><p>A área é de 3,5 m<sup>2</sup>, e uma nota fica assim<sup>1</sup>.</p><p>A água é H<sub>2</sub>O.</p><p><br/></p><p><br/></p><h2>Cor do texto · Marcador</h2><p>A paleta foi escolhida para ler bem tanto no claro quanto no escuro.</p><p>Cor do texto <span data-color="green">Verde</span> · <span data-color="coral">Coral</span> · <span data-color="violet">Violeta</span> · <span data-color="amber">Âmbar</span> · <span data-color="blue">Azul</span></p><p>Marcador <mark data-color="yellow">Amarelo</mark> · <mark data-color="green">Verde</mark> · <mark data-color="cyan">Ciano</mark> · <mark data-color="pink">Rosa</mark> · <mark data-color="purple">Roxo</mark> · <mark data-color="orange">Laranja</mark></p><p><br/></p><p><br/></p><h2>Link</h2><p>Ponha um endereço e vira um <a href="https://nabi.saro.me/">link</a>.</p><p>Só http:// e https:// são aceitos; algo como javascript: não passa.</p><p>Por exemplo, escreva <a href="https://nabi.saro.me/">https://nabi.saro.me</a> e aperte espaço ou Enter: converte sozinho, como se vê aqui.</p><h3>target</h3><p>Por padrão, um link da mesma origem abre nesta janela e qualquer outro site numa nova; a regra se define ao declarar o editor.</p><h3>Link de anexo</h3><p>Se enviar algo que não seja imagem, fica um link em forma de arquivo como o de baixo.</p><p><a href="https://nabi.saro.me/file-link-test.txt" data-nabi-file="txt" download>Anexo</a> é assim que fica.</p><p><br/></p><p><br/></p><h2>Alinhamento</h2><p>À esquerda</p><p>Centralizado</p><p>À direita</p><h3>Títulos também se alinham.</h3><p><br/></p><p><br/></p><h2>Listas</h2><h3>Lista com marcadores</h3><p>Numa linha vazia escreva - e aperte <b>espaço</b>: na hora vira uma lista com marcadores.</p><div data-nabi-p><ul><li><p>Isto é um item</p><div data-nabi-p><ul><li><p>Tab / Shift+Tab recuam e voltam.</p></li></ul></div></li></ul></div><h3>Lista numerada</h3><p>Numa linha vazia escreva 1. e aperte <b>espaço</b>: sai uma lista numerada.</p><div data-nabi-p><ol><li><p>Primeiro</p></li><li><p>Segundo</p></li><li><p>Terceiro</p></li></ol></div><h3>Lista de tarefas</h3><p>Numa linha vazia escreva [ ] ou [x] e aperte <b>espaço</b>: sai uma lista de tarefas.</p><div data-nabi-p><ul data-nabi-list="task"><li data-nabi-checked="true"><p>Esta tarefa está feita.</p></li><li data-nabi-checked="false"><p>Esta ainda não.</p></li></ul></div><p><br/></p><p><br/></p><h2>Tabela</h2><p>Crie pela tabela da barra de ferramentas; linhas e colunas podem ser somadas, tiradas e juntadas.</p><h3>Ordenar colunas</h3><p>Aperte <b>Pré-visualizar</b> e depois clique, um depois do outro, nos cabeçalhos <b>Estoque</b> e <b>Preço</b>.</p><div data-nabi-p><div class="nabi-scroll"><table data-nabi-sortable><tr><th><p>Modelo</p></th><th><p>Estoque</p></th><th><p>Preço</p></th><th><p>Peso</p></th></tr><tr><td><p>NB-7</p></td><td><p>1,200</p></td><td><p>349</p></td><td><p>1.2 kg</p></td></tr><tr><td><p>NB-9</p></td><td><p>20,000</p></td><td><p>99</p></td><td><p>0.9 kg</p></td></tr><tr><td><p>NB-12</p></td><td><p>3,500</p></td><td><p>1,299</p></td><td><p>1.4 kg</p></td></tr><tr><td><p>NB-80</p></td><td><p>900</p></td><td><p>8,900</p></td><td><p>2.1 kg</p></td></tr><tr><td><p>NB-100</p></td><td><p>A definir</p></td><td><p>12,999</p></td><td><p>2.4 kg</p></td></tr></table></div></div><p><b>Preço</b> é só número, então ordena como número.</p><p><b>Estoque</b> ordena como texto porque a última célula tem letras. (Para evitar, esvazie essa célula.)</p><p><br/></p><p><br/></p><h2>Separador</h2><p>Escreva --- e aperte Enter: vira um separador.</p><div data-nabi-p><hr/></div><p><br/></p><p><br/></p><h2>Imagem</h2><p>Cole o endereço de uma imagem ou envie uma; a largura vai de 30% a 100% e ela fica à esquerda, no centro ou à direita.</p><div data-nabi-p><img src="https://nabi.saro.me/logo/nabi-mark-demo.svg" data-nabi-width="40"/></div><p><br/></p><p><br/></p><h2>YouTube</h2><div data-nabi-p><iframe src="https://www.youtube-nocookie.com/embed/6j-gQmaZ9Zk" title="YouTube" allowfullscreen loading="lazy" data-nabi-width="70"></iframe></div><p><br/></p><p><br/></p><h2>Envio</h2><p>Arraste uma imagem ou um arquivo para cima do editor.</p><p>O envio desta demonstração é de mentirinha; com um ajuste ele liga no seu servidor.</p><p>Se um envio falhar, essa imagem ou arquivo é tirado do editor.</p><p><br/></p><p><br/></p><h2>Citação</h2><div data-nabi-p><blockquote><p>Numa linha vazia escreva &gt; e aperte <b>espaço</b>: sai um bloco de citação.</p><p>Pode ocupar várias linhas.</p></blockquote></div><p><br/></p><p><br/></p><h2>Código</h2><p>Numa linha vazia escreva \`\`\` e aperte <b>espaço ou Enter</b>: sai um bloco de código.</p><p>Escreva também a linguagem, como \`\`\`java, e aperte espaço ou Enter: o bloco toma aquela linguagem.</p><div data-nabi-p><pre data-nabi-lang="typescript"><code class="language-typescript">import { createNabiWith, defaultWings } from 'nabi-note'<br/><br/>const { nabi } = createNabiWith(defaultWings)<br/>const html = nabi.getHtml()</code></pre></div><p><br/></p><p><br/></p><h2>Bloco recolhível</h2><div data-nabi-p><details open><summary>Um bloco recolhível é feito de título e conteúdo.</summary><p>Você decide se ele é salvo fechado ou aberto.</p></details></div><p><br/></p><h2>Histórico local</h2><p>Pela IndexedDB <b>do navegador</b>, o histórico é guardado no intervalo que você marcar.</p><p>Fica só no local e guarda tantas entradas quantas você declarar. — padrão: a cada 30 segundos, as últimas 20 sessões.</p><p><br/></p><p><br/></p><h2>Atalhos</h2><p>Aperte <b>Shift duas vezes rápido</b> e a barra de ferramentas mostra o atalho de cada função.</p><p><br/></p><p><br/></p><h2>Formato automático</h2><div data-nabi-p><div class="nabi-scroll"><table data-nabi-sortable><tr><th><p>Exemplo</p></th><th><p>Tecla</p></th><th><p>Resultado</p></th></tr><tr><td><p>#</p></td><td><p>Espaço</p></td><td><p>Título</p></td></tr><tr><td><p>-</p></td><td><p>Espaço</p></td><td><p>Lista com marcadores</p></td></tr><tr><td><p>1.</p></td><td><p>Espaço</p></td><td><p>Lista numerada</p></td></tr><tr><td><p>[ ] · [x]</p></td><td><p>Espaço</p></td><td><p>Lista de tarefas</p></td></tr><tr><td><p>&gt;</p></td><td><p>Espaço</p></td><td><p>Citação</p></td></tr><tr><td><p>\`\`\` · \`\`\`ts</p></td><td><p>Espaço · Enter</p></td><td><p>Bloco de código</p></td></tr><tr><td><p>---</p></td><td><p>Enter</p></td><td><p>Separador</p></td></tr><tr><td><p>https://…</p></td><td><p>Espaço · Enter</p></td><td><p>Link</p></td></tr></table></div></div><p><br/></p><p><br/></p><h3>Funções de saída</h3><div data-nabi-p><div class="nabi-scroll"><table data-nabi-sortable><tr><th><p>Função</p></th><th><p>Resultado</p></th></tr><tr><td><p>getHtml()</p></td><td><p>HTML</p></td></tr><tr><td><p>getJson()</p></td><td><p>JSON</p></td></tr></table></div></div><p><br/></p><p><br/></p><h2>Funciona sem DOM</h2><p>Converter JSON em HTML <b>não precisa de DOM</b>.</p><p>Um servidor (Node.js) lê a árvore nabi salva do jeito que está e monta o HTML enquanto barra o XSS.</p><p><br/></p><h2>Amigo do celular</h2><div data-nabi-p><ul><li><p><b>Interface móvel</b> — um layout responsivo sustenta a interface móvel.</p></li><li><p><b>Correção do teclado</b> — quando o teclado abre, a altura dele é corrigida.</p></li><li><p><b>Tamanhos fluidos</b> — todos os tamanhos são escritos em rem.</p></li><li><p><b>Multilíngue</b> — fala catorze idiomas.</p></li></ul></div><p><br/></p><h2>Personalização</h2><div data-nabi-p><ul><li><p><b>Suas próprias asas</b> — se faltar uma função, construa e registre a sua.</p></li><li><p><b>Seu próprio CSS</b> — cores, cantos e espaços são definidos com --nabi-*, o claro e o escuro são por sua conta.</p></li><li><p><b>Código aberto</b> — aberto no GitHub.</p></li></ul></div><div data-nabi-p><hr/></div><p>Ver a documentação → <a href="https://nabi.saro.me/">nabi.saro.me</a></p>`,
  demo_wings: 'Asas',
  demo_wings_all: 'Ligar tudo',
  demo_wings_none: 'Desligar tudo',
  demo_zoom: 'Zoom',
  demo_zoom_out: 'Diminuir',
  demo_zoom_in: 'Aumentar',
  demo_zoom_reset: 'Redefinir',
  demo_sticky: 'Barra de ferramentas fixa',
  demo_sticky_keyboard: 'Compensação do teclado mobile',
  demo_sticky_height: 'Altura',
  demo_sticky_unit: 'Unidade de altura',
  demo_typeface_base: 'Tipo de letra padrão',
  demo_typeface_sans: 'Sem serifa',
  demo_typeface_serif: 'Com serifa',
  demo_typeface_mono: 'Monoespaçada',
  demo_typeface_cursive: 'Cursiva',
  demo_html_small: '<p>Escreva aqui, e ligue e desligue os wings acima.</p>',

  // Paired to pages by `src/sample.ts`; may use only markup that page enables (`src/wings.ts`)
  // 짝은 `src/sample.ts` 가 맺는다 — 그 페이지에서 켜지는 마크업만 써야 평문으로 안 떨어진다
  demo_html_bold:
    '<p>Aponte para <b>as palavras que importam</b>. Selecione um texto e aperte <b>B</b> na barra de ferramentas.</p>',
  demo_html_italic:
    '<p>Uma palavra estranha ou uma citação vai em <i>itálico</i>. Selecione esta frase e experimente.</p>',
  demo_html_underline:
    '<p>Aqui há um <u>sublinhado</u>. Selecione essas letras e aperte de novo para tirar.</p>',
  demo_html_strikethrough: '<p><s>R$ 19,00</s> R$ 9,90 — mantém o valor antigo visível.</p>',
  demo_html_superscript:
    '<p>A área é 3,5m<sup>2</sup>, e notas de rodapé se marcam assim.<sup>1</sup></p>',
  demo_html_subscript: '<p>A água é H<sub>2</sub>O e o gás borbulhante é CO<sub>2</sub>.</p>',
  demo_html_link:
    '<p>Dando um endereço, você tem <a href="https://example.com">um link como este</a>. Um link existente não abre linha de contexto — para mudar o endereço, apague e crie um novo.</p>',
  demo_html_highlight:
    '<p>Selecione um texto e aperte o botão: aparecem seis cores ao lado do cursor — <mark data-color="yellow">amarelo</mark>·<mark data-color="green">verde</mark>·<mark data-color="cyan">ciano</mark>·<mark data-color="pink">rosa</mark>·<mark data-color="purple">roxo</mark>·<mark data-color="orange">laranja</mark>.</p><p>Coloque o cursor dentro de uma marca e o mesmo mostruário aparece na linha de contexto, só para trocar a cor.</p>',
  demo_html_text_color:
    '<p>Pinte o texto com cinco cores — <span data-color="green">verde</span>·<span data-color="coral">coral</span>·<span data-color="violet">violeta</span>·<span data-color="amber">âmbar</span>·<span data-color="blue">azul</span>.</p><p><mark data-color="yellow">Sobrepor com um marca-texto</mark> funciona bem: são marcas diferentes, então <span data-color="blue">as duas se aplicam.</span></p>',
  demo_html_heading:
    '<h1>Título 1</h1><h2>Título 2</h2><h3>Título 3</h3><p>Texto normal. Digitar # e um espaço numa linha vazia também vira título.</p>',
  demo_html_bullet_list:
    '<ul><li>Uma lista com marcadores</li><li>Tab recua, Shift+Tab avança<ul><li>Um item aninhado</li></ul></li></ul><p>Digitar - e um espaço numa linha vazia também vira lista.</p>',
  demo_html_ordered_list:
    '<ol><li>Uma lista numerada</li><li>Inserir ou apagar um item renumera tudo sozinho</li></ol><p>Digitar 1. e um espaço numa linha vazia também vira lista numerada.</p>',
  demo_html_task_list:
    '<ul data-nabi-list="task"><li data-nabi-checked="true">Clique no quadrado antes do texto</li><li data-nabi-checked="false">O estado marcado é salvo com o documento</li></ul><p>Digitar [ ] ou [x] numa linha vazia também vira lista de tarefas.</p>',
  demo_html_table:
    '<table data-nabi-sortable=""><tbody><tr><th>Tecla</th><th>O que faz</th></tr><tr><td>Tab</td><td>Vai para a próxima célula</td></tr><tr><td>Setas</td><td>Move pela grade</td></tr></tbody></table><p>Coloque o cursor numa célula e a linha de contexto se preenche com os comandos de linha e coluna.</p>',
  demo_html_image:
    '<div data-nabi-p data-nabi-align="c"><img src="/nabi-note.svg" alt="Logo do NABI NOTE" data-nabi-width="50"></div><p>Clique na imagem para abrir a caixa de largura e alinhamento.</p>',
  demo_html_youtube:
    '<p>Use o botão do YouTube na barra de ferramentas, ou simplesmente cole o endereço de um vídeo — o vídeo incorporado aparece bem aqui.</p>',
  demo_html_code:
    '<pre data-nabi-lang="ts">function sum(numbers: number[]) {<br>  return numbers.reduce((a, b) =&gt; a + b, 0)<br>}</pre><p>Coloque o cursor dentro do código e a linha de contexto mostra um campo de linguagem. Selecione várias linhas e aperte Tab para recuar todas juntas, e Shift+Tab para desfazer.</p>',
  demo_html_details:
    '<details open=""><summary>Clique aqui para recolher</summary><p>O estado recolhido é salvo com o documento — quem lê vê do jeito que quem escreveu deixou.</p></details>',
  demo_html_quote:
    '<blockquote><p>Uma caixa para palavras que não são suas. Dentro dela só valem marcas de caractere — os botões de imagem, código e tabela não aparecem.</p></blockquote><p>Digitar &gt; e um espaço numa linha vazia transforma a linha numa citação.</p>',
  demo_html_divider:
    '<p>Um parágrafo acima do divisor.</p><hr><p>E um abaixo. Digitar só --- numa linha e apertar Enter também cria uma linha.</p>',
  demo_html_align:
    '<p data-nabi-align="l">Alinhado à esquerda</p><p data-nabi-align="c">Alinhado ao centro</p><p data-nabi-align="r">Alinhado à direita</p>',
  demo_html_font_size:
    '<p data-nabi-size="xs">Extra pequeno — para notas de rodapé e comentários à parte.</p><p data-nabi-size="sm">Pequeno — um passo atrás do texto normal.</p><p>Um parágrafo de tamanho padrão. Aperte o botão e cinco níveis aparecem, na sua língua, cada um no seu próprio tamanho.</p><p data-nabi-size="lg">Grande — uma frase com peso.</p><p data-nabi-size="xl">Extra grande — a linha de abertura sob um título.</p>',
  demo_html_typeface:
    '<p>Este parágrafo não tem tipo de letra definido. Aparece com o padrão da página, sem serifa.</p><p data-nabi-typeface="serif">Este é com serifa. O que você escolhe é a família; a fonte de fato é a que este site colocou no token — aqui, Noto Serif.</p><p data-nabi-typeface="mono">Este é monoespaçado. Toda letra ocupa a mesma largura, o que alinha colunas — 0O 1lI</p><p data-nabi-typeface="cursive">Este é cursivo — Handwriting · 手書き · 手写.</p><p>O tipo de letra é fixo para título e tabela (sem serifa) e para código (monoespaçado). Um parágrafo que não define nada aparece com <b>o padrão definido ao declarar o wing</b> — sem definir, é sem serifa.</p>',
  demo_html_dropcap:
    '<p data-nabi-dropcap="on">A primeira letra ocupa três linhas e o texto flui ao redor dela. Mesmo um parágrafo curto reserva o espaço dessas linhas, então nunca sobra letra caindo no bloco de baixo.</p><p>Este parágrafo não tem isso.</p>',
  demo_html_clear_format:
    '<p>Selecione um texto <b>em negrito</b>, <i>itálico</i>, <u>sublinhado</u> ou <s>riscado</s> e aperte a borracha.</p><p>Só a formatação de caractere é apagada — os blocos continuam como estão.</p>',
  demo_html_upload:
    '<p>Arraste um arquivo para esta caixa, ou cole um. Este site não tem servidor para receber o envio, então só finge — o resultado só existe dentro desta página.</p><p>Um anexo concluído aparece como <a href="https://nabi.saro.me/file-link-test.txt" data-nabi-file="txt">anexo</a>.</p>',


  cdn_demo_lead: 'Salve o código abaixo como {file} e abra num navegador — você vê funcionando na hora.',
  cdn_demo_download: 'Baixar demo.html',
  cdn_code_minheight: 'altura mínima do editor — evita que ele pareça uma caixa de uma linha só ao abrir. Mude o valor à vontade.',
  cdn_code_wings: 'Todos os wings, exceto upload.',
  cdn_code_faces:
    'Das fontes, só sobram sans e serif.\nCada sistema suporta um conjunto diferente de fontes, então mono e cursiva precisam de uma\nfonte importada à parte para serem reconhecidas em toda plataforma. Detalhes na página\n"Tipo de letra".',
  cdn_code_change: 'exemplo de callback para quando o valor muda',
  code_copy: 'Copiar código',
  demo_install: 'Instalação',
  demo_code: 'Código',
  demo_chars: '{n} caracteres',
  demo_tree: 'nabi-tree',
  demo_loading: 'Carregando o editor…',

  page_not_found: 'Página não encontrada',
  nav_prev: 'Anterior',
  nav_next: 'Próxima',
}
