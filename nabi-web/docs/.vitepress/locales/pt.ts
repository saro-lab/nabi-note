// 옮겼다 — 키 하나라도 빠지면 타입 오류라 파일이 통째로 채워져 있어야 한다.
// Translated — a missing key is a type error, so the file must stay filled in whole.
export const pt = {
  menu_inline_footnote: "Nota de rodapé",
  demo_html_footnote: "<p>WYSIWYG<sup data-nabi-fn=\"WYSIWYG significa “What You See Is What You Get”: o resultado tem a mesma aparência do que você vê durante a edição.\">[1]</sup></p>",
  label: 'Português',
  lang: 'pt',
  link: '/pt/',
  description: 'NABI NOTE — um editor WYSIWYG de código aberto.',

  menu_docs: 'Documentação',
  menu_style: 'Estilo',
  menu_addons: 'Recursos adicionais',
  menu_icon_theme: "Temas de ícones",
  menu_intro_vibe_coding: 'Vibe coding com IA',



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
  search_hint: 'Por favor, digite um termo de busca',
  search_move: 'Mover',
  search_open: 'Abrir',
  search_close: 'Fechar',

  // Exercises every wing but YouTube — no stranger's video on the front page
  // 유튜브만 빼고 기본 날개 전부를 써 보인다 — 앞면에 남의 영상을 걸지 않는다
  demo_html: "<p data-nabi-align=\"c\"></p><div data-nabi-p data-nabi-align=\"c\"><img src=\"https://nabi.saro.me/logo/nabi-mark-demo.svg\" alt data-nabi-width=\"40\"/></div><p data-nabi-align=\"c\"><span data-nabi-size=\"xl\"><b>NABI NOTE</b></span></p><p data-nabi-align=\"c\"><span data-nabi-size=\"lg\"><i><span data-nabi-typeface=\"cursive\">Um editor WYSIWYG</span></i></span><sup data-nabi-fn=\"WYSIWYG significa “What You See Is What You Get”: o resultado tem a mesma aparência do que você vê durante a edição.\">[1]</sup><span data-nabi-size=\"lg\"><i><span data-nabi-typeface=\"cursive\"> de código aberto</span></i></span></p><p></p><p data-nabi-dropcap=\"1\"><span data-nabi-typeface=\"serif\"><b>NABI NOTE</b> é um editor WYSIWYG de código aberto que separa do núcleo funções como formatação, alinhamento, tabelas e envio de arquivos em módulos independentes chamados wings. Você pode escolher apenas os wings necessários para montar o editor e conectar aqueles que criar. Ele é escrito em JavaScript puro, podendo ser usado em frameworks como React ou Vue. Em páginas sem ambiente de compilação, você pode começar diretamente com a <b>biblioteca CDN</b>. Seu formato de documento próprio, <b>NABI TREE</b>, pode ser convertido em HTML até mesmo em Node.js sem o DOM do navegador. Os documentos recebidos são normalizados conforme as regras registradas; ao gerar HTML, textos e atributos são escapados e os endereços dos links são verificados. Wings personalizados e dados recebidos do servidor ainda devem ser revisados separadamente conforme a política de segurança da aplicação. Variáveis CSS e um layout baseado em rem permitem ajustar tema e tamanho, com modo escuro e tipografias para vários idiomas. Ordenação de tabelas, histórico local e trabalho com documentos auxiliado por IA usam o mesmo modelo de documento.</span></p><p></p><h2>Fonte</h2><p>As famílias sem serifa (padrão), com serifa, monoespaçada e cursiva incluem fontes alternativas por idioma. Se não houver uma fonte adequada para a família escolhida, será usada a fonte padrão do navegador. <b>A página que incorpora o editor define sua fonte padrão.</b></p><p></p><p>Abaixo, cada família mostrada <b>em vários idiomas</b>.</p><p></p><p><span data-nabi-typeface=\"sans\"><span data-nabi-size=\"lg\">산세리프 · ゴシック体 · 无衬线 · Serifenlos · Sans empattement · Sin serifa · Sem serifa · Без засечек · بلا زخارف · सैन्स सेरिफ़ · স্যান্স সেরিফ · سانس سیرف · Tanpa serif · بدون سریف · सॅन्स सेरिफ · Không chân · శాన్స్ సెరిఫ్ · Mara seref · Sans serif · Bila serif · சான்ஸ் செரிஃப் · ไร้เชิง · Senza grazie</span></span></p><p></p><p><span data-nabi-typeface=\"serif\"><span data-nabi-size=\"lg\">세리프 · 明朝体 · 衬线 · Serif · Avec empattement · Con serifa · Com serifa · С засечками · بزخارف · सेरिफ़ · সেরিফ · سیرف · Berserif · سریف · सेरिफ · Có chân · సెరిఫ్ · Mai seref · Yenye serif · செரிஃப் · มีเชิง · Con grazie</span></span></p><p></p><p><span data-nabi-typeface=\"mono\"><span data-nabi-size=\"lg\">고정폭 · 等幅 · 等宽 · Dicktengleich · Chasse fixe · Monoespaciada · Monoespaçada · Моноширинный · ثابت العرض · मोनोस्पेस · মনোস্পেস · یکساں چوڑائی · Lebar tetap · تک‌فاصله · Đơn cách · మోనోస్పేస్ · Tazara ɗaya · Eş aralıklı · Nafasi moja · ஒற்றையகலம் · ความกว้างคงที่ · Monospaziato · Monospace</span></span></p><p></p><p><span data-nabi-typeface=\"cursive\"><span data-nabi-size=\"lg\">필기체 · 筆記体 · 手写体 · Schreibschrift · Cursive · Cursiva · Рукописный · خط اليد · हस्तलिपि · হস্তলিপি · رواں خط · Tulisan tangan · دست‌نویس · हस्ताक्षर · Chữ viết tay · చేతిరాత · Rubutun hannu · El yazısı · Mwandiko · கையெழுத்து · ลายมือ · Corsivo</span></span></p><p></p><p></p><h2>Tamanho da letra</h2><p><span data-nabi-size=\"xs\">Muito pequeno</span></p><p><span data-nabi-size=\"sm\">Pequeno</span></p><p><span data-nabi-size=\"lg\">Grande</span></p><p><span data-nabi-size=\"xl\">Muito grande</span></p><p></p><p></p><h2>Título</h2><p>Numa linha vazia escreva # e aperte espaço: na hora vira um título.</p><h1>H1</h1><h2>H2</h2><h3>H3</h3><h4>H4</h4><h5>H5</h5><h6>H6</h6><p></p><p></p><h2>Negrito · Itálico · Sublinhado · Riscado</h2><p><b>Negrito</b> <i>itálico</i> <u>sublinhado</u> <s>riscado</s> podem ser aplicados juntos ao mesmo caractere.</p><p><b><i><s><u>Também dá para sobrepor.</u></s></i></b></p><h3>Sobrescrito e subscrito</h3><p>A área é de 3,5 m<sup>2</sup>, e uma nota fica assim<sup>1</sup>.</p><p>A água é H<sub>2</sub>O.</p><p></p><p></p><h2>Cor do texto · Marcador</h2><p>A paleta foi escolhida para ler bem tanto no claro quanto no escuro.</p><p>Cor do texto <span data-color=\"green\">Verde</span> · <span data-color=\"coral\">Coral</span> · <span data-color=\"violet\">Violeta</span> · <span data-color=\"amber\">Âmbar</span> · <span data-color=\"blue\">Azul</span></p><p>Marcador <mark data-color=\"yellow\">Amarelo</mark> · <mark data-color=\"green\">Verde</mark> · <mark data-color=\"cyan\">Ciano</mark> · <mark data-color=\"pink\">Rosa</mark> · <mark data-color=\"purple\">Roxo</mark> · <mark data-color=\"orange\">Laranja</mark></p><p></p><p></p><h2>Link</h2><p>Ponha um endereço e vira um <a href=\"https://nabi.saro.me/\">link</a>.</p><p>Só http:// e https:// são aceitos; algo como javascript: não passa.</p><p>Por exemplo, escreva <a href=\"https://nabi.saro.me/\">https://nabi.saro.me</a> e aperte espaço ou Enter: converte sozinho, como se vê aqui.</p><h3>Abertura de links</h3><p>Por padrão, um link da mesma origem abre nesta janela e qualquer outro site numa nova; a regra se define ao declarar o editor.</p><h3>Link de anexo</h3><p>Arquivos que não são imagens permanecem como links de anexo, como o exemplo abaixo.</p><p><a href=\"https://nabi.saro.me/file-link-test.txt\" data-nabi-file=\"txt\" download>Anexo</a>: o link é salvo no documento.</p><p></p><p></p><h2>Alinhamento</h2><p>À esquerda</p><p data-nabi-align=\"c\">Centralizado</p><p data-nabi-align=\"r\">À direita</p><h3>Não é possível aplicar alinhamento aos títulos.</h3><p></p><p></p><h2>Listas</h2><h3>Lista com marcadores</h3><p>Numa linha vazia escreva - e aperte <b>espaço</b>: na hora vira uma lista com marcadores.</p><div data-nabi-p><ul><li><p>Isto é um item</p><div data-nabi-p><ul><li><p>Tab / Shift+Tab recuam e voltam.</p></li></ul></div></li></ul></div><h3>Lista numerada</h3><p>Numa linha vazia escreva 1. e aperte <b>espaço</b>: sai uma lista numerada.</p><div data-nabi-p><ol><li><p>Primeiro</p></li><li><p>Segundo</p></li><li><p>Terceiro</p></li></ol></div><h3>Lista de tarefas</h3><p>Numa linha vazia escreva [ ] ou [x] e aperte <b>espaço</b>: sai uma lista de tarefas.</p><div data-nabi-p><ul data-nabi-list=\"task\"><li data-nabi-checked=\"true\"><p>Esta tarefa está feita.</p></li><li data-nabi-checked=\"false\"><p>Esta ainda não.</p></li></ul></div><p></p><p></p><h2>Tabela</h2><p>As células podem conter vários parágrafos e blocos, com cores de fundo para distinguir o conteúdo. Experimente editar o texto e as imagens da tabela abaixo.</p><div data-nabi-p><div class=\"nabi-scroll\"><table><tr><th data-nabi-cell-color=\"cyan\"><p>Recursos</p></th><th data-nabi-cell-color=\"cyan\"><p>Notas de trabalho</p></th></tr><tr><td><div data-nabi-p data-nabi-align=\"c\"><img src=\"/nabi-note.svg\" alt data-nabi-width=\"30\"/></div><p data-nabi-align=\"c\">Uma imagem e sua descrição na mesma célula.</p></td><td data-nabi-cell-color=\"yellow\"><h3>Parágrafos flexíveis</h3><p>Pressione Enter para criar um parágrafo ou Shift+Enter para quebrar a linha no mesmo parágrafo.</p></td></tr><tr><td data-nabi-cell-color=\"green\"><div data-nabi-p><ul data-nabi-list=\"task\"><li data-nabi-checked=\"true\"><p>Alterar o fundo das células</p></li><li data-nabi-checked=\"false\"><p>Recuar uma lista com Tab</p></li><li data-nabi-checked=\"false\"><p>Selecionar várias células e aplicar a mesma cor</p></li></ul></div></td><td><div data-nabi-p><details open><summary>Clique para ver dicas de edição</summary><p>As células também aceitam blocos recolhíveis, citações, código e vídeos.</p><p>Ao mesclar células, o conteúdo de cada uma é mantido na ordem.</p></details></div></td></tr></table></div></div><p>Clique em uma célula para mostrar sua cor de fundo e as ferramentas de linhas e colunas. Selecione várias células para alterar a cor e o alinhamento em conjunto. Para posicionar a tabela inteira, escolha “Selecionar tabela” e use as ferramentas de alinhamento.</p><p>Tabelas com cores ou vários blocos são preservadas como HTML mesmo ao salvar em Markdown.</p><h3>Cores de fundo das células</h3><p>Aqui estão todas as cores de fundo disponíveis. Clique em uma célula para mudar sua cor ou escolha “Padrão” nas propriedades para remover o fundo.</p><div data-nabi-p><div class=\"nabi-scroll\"><table data-nabi-table-full><tr><td data-nabi-cell-color=\"yellow\"><p data-nabi-align=\"c\"><b>Amarelo</b></p><p data-nabi-align=\"c\"><span data-nabi-typeface=\"mono\">yellow</span></p></td><td data-nabi-cell-color=\"green\"><p data-nabi-align=\"c\"><b>Verde</b></p><p data-nabi-align=\"c\"><span data-nabi-typeface=\"mono\">green</span></p></td><td data-nabi-cell-color=\"cyan\"><p data-nabi-align=\"c\"><b>Ciano</b></p><p data-nabi-align=\"c\"><span data-nabi-typeface=\"mono\">cyan</span></p></td></tr><tr><td data-nabi-cell-color=\"pink\"><p data-nabi-align=\"c\"><b>Rosa</b></p><p data-nabi-align=\"c\"><span data-nabi-typeface=\"mono\">pink</span></p></td><td data-nabi-cell-color=\"purple\"><p data-nabi-align=\"c\"><b>Roxo</b></p><p data-nabi-align=\"c\"><span data-nabi-typeface=\"mono\">purple</span></p></td><td data-nabi-cell-color=\"orange\"><p data-nabi-align=\"c\"><b>Laranja</b></p><p data-nabi-align=\"c\"><span data-nabi-typeface=\"mono\">orange</span></p></td></tr></table></div></div><h3>Ordenar colunas</h3><p>Aperte <b>Pré-visualizar</b> e depois clique, um depois do outro, nos cabeçalhos <b>Estoque</b> e <b>Preço</b>.</p><div data-nabi-p><div class=\"nabi-scroll\"><table data-nabi-sortable><tr><th><p>Modelo</p></th><th><p>Estoque</p></th><th><p>Preço</p></th><th><p>Peso</p></th></tr><tr><td><p>NB-7</p></td><td><p>1,200</p></td><td><p>349</p></td><td><p>1.2 kg</p></td></tr><tr><td><p>NB-9</p></td><td><p>20,000</p></td><td><p>99</p></td><td><p>0.9 kg</p></td></tr><tr><td><p>NB-12</p></td><td><p>3,500</p></td><td><p>1,299</p></td><td><p>1.4 kg</p></td></tr><tr><td><p>NB-80</p></td><td><p>900</p></td><td><p>8,900</p></td><td><p>2.1 kg</p></td></tr><tr><td><p>NB-100</p></td><td><p>A definir</p></td><td><p>12,999</p></td><td><p>2.4 kg</p></td></tr></table></div></div><p><b>Preço</b> contém apenas valores numéricos, portanto a coluna é ordenada numericamente.</p><p><b>Estoque</b> contém números e texto, portanto a coluna é ordenada como sequências de caracteres.</p><p></p><p></p><h2>Separador</h2><p>Escreva --- e aperte Enter: vira um separador.</p><div data-nabi-p><hr/></div><p></p><p></p><h2>Imagem</h2><p>A largura vai de 30% a 100% e ela fica à esquerda, no centro ou à direita.</p><div data-nabi-p><img src=\"https://nabi.saro.me/logo/nabi-mark-demo.svg\" alt data-nabi-width=\"40\"/></div><p></p><p></p><h2>Área flutuante</h2><div data-nabi-p><div data-nabi-float=\"right\" data-nabi-float-width=\"40\"><p><b>Visão geral</b></p><p>Uma pequena região de apoio para texto, imagens e tabelas.</p><div data-nabi-p><div class=\"nabi-scroll\"><table><tr><td data-nabi-cell-color=\"cyan\"><p>Posição</p></td><td><p>Direita</p></td></tr><tr><td data-nabi-cell-color=\"green\"><p>Largura máxima</p></td><td><p>40%</p></td></tr></table></div></div></div></div><p>Use uma área flutuante para colocar explicações ou pequenos materiais ao lado do texto principal. Em um documento largo, este texto flui ao lado da região. Clique dentro dela para editar texto e inserir imagens ou tabelas no mesmo editor.</p><p>Coloque o cursor na região para abrir suas propriedades. Alterne entre esquerda e direita e escolha uma largura máxima de 20, 30, 40 ou 50% adequada ao texto. Tabelas e imagens coladas também ficam dentro da região.</p><p>Você também pode agrupar os parágrafos selecionados em uma região. O botão de desfazer a região ao lado da largura deixa o conteúdo no documento. A prévia oculta o contorno pontilhado de edição; em documentos estreitos ou na impressão, tudo segue em uma coluna.</p><p></p><h2>YouTube</h2><div data-nabi-p><iframe src=\"https://www.youtube-nocookie.com/embed/6j-gQmaZ9Zk\" title=\"YouTube\" allowfullscreen loading=\"lazy\" data-nabi-width=\"70\"></iframe></div><p></p><p></p><h2>Envio</h2><p>Arraste uma imagem ou um arquivo para cima do editor.</p><p>Esta demonstração não envia arquivos a um servidor real. Conecte um carregador à sua aplicação para armazená-los em um servidor.</p><p>Depois de abrir o seletor de imagens ou iniciar um envio, mover apenas o cursor mantém a inserção na posição original. Editar o documento durante a espera cancela a inserção e mostra um aviso. O progresso e o resultado de um envio iniciado em uma célula também ficam nela.</p><p></p><p></p><h2>Citação</h2><div data-nabi-p><blockquote><p>Numa linha vazia escreva &gt; e aperte <b>espaço</b>: sai um bloco de citação.</p><p>Pode ocupar várias linhas.</p></blockquote></div><p></p><p></p><h2>Código</h2><p>Numa linha vazia escreva ``` e aperte <b>espaço ou Enter</b>: sai um bloco de código.</p><p>Escreva também a linguagem, como ```java, e aperte espaço ou Enter: o bloco toma aquela linguagem.</p><div data-nabi-p><pre data-nabi-lang=\"typescript\"><code class=\"language-typescript\">import { createNabiWith, defaultWings } from 'nabi-note'<br/><br/>const { nabi } = createNabiWith(defaultWings)<br/>const html = nabi.getHtml()</code></pre></div><p></p><p></p><h2>Bloco recolhível</h2><div data-nabi-p><details open><summary>Um bloco recolhível é feito de título e conteúdo.</summary><p>Você decide se ele é salvo fechado ou aberto.</p></details></div><p></p><h2></h2><h2>Barra de ferramentas</h2><p>As ferramentas de títulos, formatação, alinhamento, listas, inserção e documento estão agrupadas. No computador, ficam expandidas; no celular, há ferramentas rápidas e a paleta completa. As propriedades da tabela ou área flutuante selecionada aparecem abaixo.</p><p></p><h2>Atalhos</h2><p><b>Pressione Shift duas vezes rapidamente</b> para escolher ferramentas pelo teclado. No computador, navegue pela barra expandida; no celular, pela paleta completa. Use Tab para trocar de grupo, as setas para escolher uma ferramenta e Enter para executá-la.</p><p>No fim de um bloco de citação, código ou recolhível, pressione Enter duas vezes rapidamente para sair. O intervalo padrão é de 180ms.</p><p></p><p></p><h2>Formato automático</h2><div data-nabi-p><div class=\"nabi-scroll\"><table data-nabi-sortable><tr><th><p>Exemplo</p></th><th><p>Tecla</p></th><th><p>Resultado</p></th></tr><tr><td><p>#</p></td><td><p>Espaço</p></td><td><p>Título</p></td></tr><tr><td><p>-</p></td><td><p>Espaço</p></td><td><p>Lista com marcadores</p></td></tr><tr><td><p>1.</p></td><td><p>Espaço</p></td><td><p>Lista numerada</p></td></tr><tr><td><p>[ ] · [x]</p></td><td><p>Espaço</p></td><td><p>Lista de tarefas</p></td></tr><tr><td><p>&gt;</p></td><td><p>Espaço</p></td><td><p>Citação</p></td></tr><tr><td><p>``` · ```ts</p></td><td><p>Espaço · Enter</p></td><td><p>Bloco de código</p></td></tr><tr><td><p>---</p></td><td><p>Enter</p></td><td><p>Separador</p></td></tr><tr><td><p>https://…</p></td><td><p>Espaço · Enter</p></td><td><p>Link</p></td></tr></table></div></div><p></p><p></p><h3>Funções de saída</h3><div data-nabi-p><div class=\"nabi-scroll\"><table data-nabi-sortable><tr><th><p>Função</p></th><th><p>Resultado</p></th></tr><tr><td><p>getHtml()</p></td><td><p>HTML</p></td></tr><tr><td><p>getJson()</p></td><td><p>JSON</p></td></tr></table></div></div><p></p><p></p><h2>Funciona sem DOM</h2><p>Converter NABI TREE em HTML <b>não precisa de DOM</b>.</p><p>Um servidor (Node.js) também pode ler o NABI TREE salvo e gerar HTML com as mesmas regras.</p><p></p><h2>Amigo do celular</h2><div data-nabi-p><ul><li><p><b>Interface móvel</b> — Organiza as ferramentas de edição conforme a largura da tela.</p></li><li><p><b>Ajuste do teclado móvel</b> — Ajusta a altura da área de edição quando o teclado é aberto.</p></li><li><p><b>Tamanhos flexíveis</b> — Usa unidades rem no layout principal para se adaptar à ampliação e à redução.</p></li><li><p><b>Vários idiomas</b> — Você pode definir a localidade e a tipografia conforme o idioma e a direção do texto.</p></li></ul></div><p></p><h2>Personalização</h2><div data-nabi-p><ul><li><p><b>Seus próprios módulos wing</b> — se precisar de uma função, você pode criá-la e conectá-la.</p></li><li><p><b>Seu próprio CSS</b> — ajuste as cores principais, os cantos e os espaçamentos com os tokens --nabi-* para os modos claro e escuro.</p></li><li><p><b>Código aberto</b> — publicamos o código-fonte no GitHub e o desenvolvemos em colaboração.</p></li></ul></div><div data-nabi-p><hr/></div><p>Ver a documentação → <a href=\"https://nabi.saro.me/\">nabi.saro.me</a></p><section data-nabi-footnotes><ol><li data-nabi-fn-n=\"1\"><span data-nabi-fn-num>[1]</span> WYSIWYG significa “What You See Is What You Get”: o resultado tem a mesma aparência do que você vê durante a edição.</li></ol></section>",
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
    "<p>As células podem conter vários parágrafos e blocos, com cores de fundo para distinguir o conteúdo. Experimente editar o texto e as imagens da tabela abaixo.</p><div data-nabi-p><div class=\"nabi-scroll\"><table><tr><th data-nabi-cell-color=\"cyan\"><p>Recursos</p></th><th data-nabi-cell-color=\"cyan\"><p>Notas de trabalho</p></th></tr><tr><td><div data-nabi-p data-nabi-align=\"c\"><img src=\"/nabi-note.svg\" alt data-nabi-width=\"30\"/></div><p data-nabi-align=\"c\">Uma imagem e sua descrição na mesma célula.</p></td><td data-nabi-cell-color=\"yellow\"><h3>Parágrafos flexíveis</h3><p>Pressione Enter para criar um parágrafo ou Shift+Enter para quebrar a linha no mesmo parágrafo.</p></td></tr><tr><td data-nabi-cell-color=\"green\"><div data-nabi-p><ul data-nabi-list=\"task\"><li data-nabi-checked=\"true\"><p>Alterar o fundo das células</p></li><li data-nabi-checked=\"false\"><p>Recuar uma lista com Tab</p></li><li data-nabi-checked=\"false\"><p>Selecionar várias células e aplicar a mesma cor</p></li></ul></div></td><td><div data-nabi-p><details open><summary>Clique para ver dicas de edição</summary><p>As células também aceitam blocos recolhíveis, citações, código e vídeos.</p><p>Ao mesclar células, o conteúdo de cada uma é mantido na ordem.</p></details></div></td></tr></table></div></div><p>Clique em uma célula para mostrar sua cor de fundo e as ferramentas de linhas e colunas. Selecione várias células para alterar a cor e o alinhamento em conjunto. Para posicionar a tabela inteira, escolha “Selecionar tabela” e use as ferramentas de alinhamento.</p><p>Em um parágrafo normal, Tab passa à próxima célula; em listas e código, aplica recuo. Limpar o conteúdo ou a formatação mantém o fundo da célula.</p>",
  demo_html_image:
    '<div data-nabi-p data-nabi-align="c"><img src="/nabi-note.svg" alt="Logo do NABI NOTE" data-nabi-width="50"></div><p>Clique na imagem para abrir a caixa de largura e alinhamento.</p>',
  demo_html_youtube:
    '<p>Use o botão do YouTube na barra de ferramentas, ou simplesmente cole o endereço de um vídeo — o vídeo incorporado aparece bem aqui.</p>',
  demo_html_code:
    '<pre data-nabi-lang="ts">function sum(numbers: number[]) {<br>  return numbers.reduce((a, b) =&gt; a + b, 0)<br>}</pre><p>Coloque o cursor dentro do código e a linha de contexto mostra um campo de linguagem. Selecione várias linhas e aperte Tab para recuar todas juntas, e Shift+Tab para desfazer.</p>',
  demo_html_details:
    '<details open=""><summary>Clique aqui para recolher</summary><p>O estado recolhido é salvo com o documento — quem lê vê do jeito que quem escreveu deixou.</p></details>',
  demo_html_quote:
    "<div data-nabi-p><blockquote><p>Você pode agrupar como citação uma frase de outro texto ou conteúdo que queira destacar.</p><p>Uma citação pode conter vários parágrafos e blocos.</p></blockquote></div><p>Digite &gt; e pressione Espaço em uma linha vazia para transformá-la em citação.</p>",
  demo_html_divider:
    '<p>Um parágrafo acima do divisor.</p><hr><p>E um abaixo. Digitar só --- numa linha e apertar Enter também cria uma linha.</p>',
  demo_html_align:
    '<p data-nabi-align="l">Alinhado à esquerda</p><p data-nabi-align="c">Alinhado ao centro</p><p data-nabi-align="r">Alinhado à direita</p>',
  demo_html_font_size:
    "<p><span data-nabi-size=\"xs\">Muito pequeno — adequado para notas de rodapé ou explicações complementares.</span></p><p><span data-nabi-size=\"sm\">Pequeno — um nível abaixo do texto normal.</span></p><p>Um parágrafo no tamanho padrão. O menu de tamanhos também mostra cada tamanho como ele será exibido.</p><p><span data-nabi-size=\"lg\">Grande — adequado para uma frase que precisa de destaque.</span></p><p><span data-nabi-size=\"xl\">Muito grande — adequado para uma introdução abaixo de um título.</span></p><p>O tamanho se aplica ao intervalo selecionado. Se houver apenas o cursor, aplica-se ao texto do parágrafo atual.</p>",
  demo_html_typeface:
    "<p>Este parágrafo não tem uma família tipográfica explícita e usa a fonte padrão da página.</p><p><span data-nabi-typeface=\"serif\">Este parágrafo usa uma família com serifa. Ao escolher uma família como serif, a fonte real segue o CSS do site.</span></p><p><span data-nabi-typeface=\"mono\">Este parágrafo usa uma família monoespaçada. A largura fixa dos caracteres ajuda a alinhar números ou código — 0O 1lI</span></p><p><span data-nabi-typeface=\"cursive\">O tipo de letra é fixo para título e tabela (sem serifa) e para código (monoespaçado). Um parágrafo que não define nada aparece com o padrão definido ao declarar o wing — sem definir, é sem serifa.</span></p>",
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
  demo_tree: 'nabi-tree',
  demo_loading: 'Carregando o editor…',

  page_not_found: 'Página não encontrada',

  demo_html_float: "<div data-nabi-p><div data-nabi-float=\"right\" data-nabi-float-width=\"40\"><p><b>Visão geral</b></p><p>Uma pequena região de apoio para texto, imagens e tabelas.</p><div data-nabi-p><div class=\"nabi-scroll\"><table><tr><td data-nabi-cell-color=\"cyan\"><p>Posição</p></td><td><p>Direita</p></td></tr><tr><td data-nabi-cell-color=\"green\"><p>Largura máxima</p></td><td><p>40%</p></td></tr></table></div></div></div></div><p>Use uma área flutuante para colocar explicações ou pequenos materiais ao lado do texto principal. Em um documento largo, este texto flui ao lado da região. Clique dentro dela para editar texto e inserir imagens ou tabelas no mesmo editor.</p><p>Coloque o cursor na região para abrir suas propriedades. Alterne entre esquerda e direita e escolha uma largura máxima de 20, 30, 40 ou 50% adequada ao texto. Tabelas e imagens coladas também ficam dentro da região.</p><p>Você também pode agrupar os parágrafos selecionados em uma região. O botão de desfazer a região ao lado da largura deixa o conteúdo no documento. A prévia oculta o contorno pontilhado de edição; em documentos estreitos ou na impressão, tudo segue em uma coluna.</p>",
  menu_block_float: "Área flutuante",
}
