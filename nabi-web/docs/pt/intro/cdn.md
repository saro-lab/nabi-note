---
title: Usar via CDN
description: Exemplo de CDN
---

# Usar via CDN

<CdnDemo />

---

## O que você acabou de fazer

O arquivo acima funciona sem que você precise ler nada dele. Volte aqui só quando quiser mudar
algo.

### Duas tags são toda a instalação

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/nabi-note@latest/dist/nabi.css">
<script src="https://cdn.jsdelivr.net/npm/nabi-note@latest"></script>
```

**Tudo** que o pacote exporta fica pendurado no único global `NabiNote`. **A folha de estilo
você prende à mão** — os mounts não injetam CSS, então esquecer o `<link>` deixa o editor nu.

### O esqueleto

```html
<div id="app" class="nabi">                    <!-- a raiz onde vivem cores, cantos e fontes -->
  <div id="chrome" class="nabi-toolbar">        <!-- barra de ferramentas e linha de contexto colam como um bloco só -->
    <div class="nabi-toolbar-row">
      <span id="tools"></span>                 <!-- prévia e tela cheia (bem à direita) -->
      <div id="toolbar"></div>
    </div>
    <div id="context"></div>                   <!-- se preenche sozinha, conforme onde o cursor aponta -->
  </div>
  <div id="editor" class="nabi-content" contenteditable="true"></div>
</div>
```

Os `id`s podem ter qualquer nome — o que você passa a um mount é o **elemento**, não o nome. As
quatro classes (`nabi`, `nabi-toolbar`, `nabi-toolbar-row`, `nabi-content`) são as alças em que a
folha de estilo se prende — deixe-as como estão. Se não for usar prévia e tela cheia, apague
`<span id="tools">` e a linha do `mountViewTools` junto. O recipiente pode ser passado como
quiser — como `mountViewTools` monta sozinho sua própria caixa flutuando na ponta direita, mesmo
passando a barra de ferramentas inteira a linha de botões não se desarruma.

### Escolher os wings

Escolher os wings é uma única linha de construtor. O arquivo acima parte dos vinte e nove wings
padrão, tira o upload e restringe o tipo de letra a dois.

```js
var wings = N.wings().all().drop('upload').use('tf', { values: ['sans', 'serif'] })
```

- `all()` começa com todos os wings oficiais. **Sem chamar, a mão fica vazia** — só o que entrar
  por `use()` é carregado.
- `use('nome', opções?)` acrescenta um. Chamado num wing que já está dentro, só troca as opções —
  é o que `use('tf', { values: [...] })` faz acima. Se um wing depende de outro para funcionar
  (upload precisa de imagem ou link), esse outro é puxado junto, silenciosamente.
- `drop('nome')` tira o que está dentro. Tentar tirar um wing do qual outro depende lança na hora
  e diz o que precisa ser tirado junto.
- O nome é a chave curta que fica gravada no valor salvo — `b` (negrito), `tf` (tipo de letra),
  `upload`, por exemplo. A lista inteira aparece com `console.log(N.wingNames())`.
- **Uma chamada errada lança na própria linha.** Nome digitado errado, chave de opção
  desconhecida, valor fora da lista — tudo isso lança, e a mensagem já vem com a correção — chamar
  `use('bod')` responde "seria 'b' (negrito)?". Não existe um lugar que ignora silenciosamente.

`createNabiWith` recebe o construtor direto — não é preciso chamar `build()`. Só onde um array é
exigido é que `build()` entrega o array. Para escolher só alguns, o array continua sendo a
resposta.

```js
var wings = [N.boldWing, N.italicWing, N.headingWing, N.bulletListWing]
```

Um wing feito à mão entra como objeto — como em `N.wings().all().use(customWing)`. O `w` desse
wing precisa começar com `ex` (`exNote`) — se colidir com um nome oficial futuro no valor salvo,
um documento já salvo passaria a ser lido com outro sentido. Como construir um está em
[{{ t('menu_wing_custom') }}](../wing/custom).

Os wings, um a um, estão em [{{ t('menu_wing') }}](../wing/inline/bold).

### Perguntar e avisar

O arquivo acima encaixou `ask` usando o `alert`/`confirm` do navegador — perguntas como "há um
texto em andamento. Abrir mesmo assim?" vão para essa caixa. Sem encaixar, a resposta da pergunta
é "não", e um aviso que não precisa de resposta é mostrado pelo recipiente de toast que o núcleo
já mantém, logo abaixo da barra de ferramentas — não é preciso encaixar nada à parte para avisos
como erro de upload. Os detalhes estão em [{{ t('menu_intro_usage') }}](./usage).

### Tirar o valor

| | |
|---|---|
| `nabi.getHtml()` | o HTML que você salva e publica |
| `nabi.getJson()` | a árvore nabi (JSON) |
| `nabi.setHtml(html)` · `nabi.setJson(json)` | colocá-lo de volta |
| `nabi.onChange(fn)` | toda vez que o valor muda |
| `N.renderStoredHtml(json, registry)` | o valor salvo em HTML, sem montar editor (veja [Lado da leitura](#lado-da-leitura), abaixo) |

---

## Endereços

Para fixar a versão, acrescente o número da versão ao endereço. O unpkg dá o mesmo arquivo.

**Não use o endereço sem número de versão (`/npm/nabi-note`)** — o jsDelivr cacheia esse lugar
por muito tempo, e o pacote e a folha de estilo podem acabar misturados entre versões
diferentes.

| | Endereço |
|---|---|
| **Pacote (mais recente)** | `https://cdn.jsdelivr.net/npm/nabi-note@latest` |
| **Pacote (fixo)** | <code>{{ CDN_BUNDLE }}</code> |
| **Folha de estilo (mais recente)** | `https://cdn.jsdelivr.net/npm/nabi-note@latest/dist/nabi.css` |
| **Folha de estilo (fixa)** | <code>{{ CDN_SHEET }}</code> |
| **Pacote** (unpkg) | `https://unpkg.com/nabi-note` |

O pacote sai junto dentro da própria publicação no npm, então **não existe uma publicação
separada para o CDN.**

---

## Lado da leitura

Uma página que só **exibe** um HTML salvo não monta editor. Basta prender a mesma folha de
estilo e colocar o valor dentro de um `.nabi-content` — sai igual ao que se via no editor.

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/nabi-note@latest/dist/nabi.css">

<div class="nabi-content">
  <!-- o valor salvo com getHtml() -->
</div>
```

**Se o que foi salvo é a árvore nabi (JSON), não HTML**, dá para desenhar ali mesmo sem montar
editor. O que se recebe é o valor salvo e a lista de wings registrados.

```html
<script>
  var registry = N.makeRegistry(N.wings().all().build())

  var saved = [{ w: 'p', ch: ['uma linha de comentário'] }]   // árvore nabi recebida do servidor
  document.querySelector('.nabi-content').innerHTML = N.renderStoredHtml(saved, registry)
</script>
```

Se não for uma árvore nabi, a resposta é `null`, e o valor que passa não difere em nenhum
caractere do `getHtml()` que o editor produz — o lugar onde o XSS é filtrado também é o mesmo.
Essa porta não usa DOM, então roda do mesmo jeito no servidor (Node.js), e **o caminho de montar
o HTML pronto no servidor antes de enviar** se abre pela mesma porta (veja
[{{ t('menu_intro_ssr') }}](./ssr#so-desenhando-o-valor-salvo-sem-montar-um-editor)).

Um servidor que importa via npm usa, em vez do pacote global, **`nabi-note/ssr`** — o ponto de
entrada que só carrega o necessário para desenhar, sem a superfície de edição nem as ferramentas
de tela.

Um único arquivo de folha de estilo **traz o CSS de todos os wings** — o arquivo não tem como
saber quais wings você registrou, então carrega todos.

A aparência é toda responsabilidade da folha de estilo, mas **ordenar tabela e colorir código são
coisas que o lado da leitura precisa fazer via JavaScript** — clicar no título da coluna para
reordenar as linhas, ou recortar o texto do código para colorir, é algo que CSS não faz. Se
quiser, prenda o runtime do lado da leitura numa única porta.

```html
<script type="module">
  import { attachViewer } from 'https://cdn.jsdelivr.net/npm/nabi-note@latest/dist/viewer/index.js'

  attachViewer(document.querySelector('.nabi-content'), { locale: 'pt' })
</script>
```

- Sem prender isso, o documento continua aparecendo normalmente — só que uma tabela com
  ordenação ligada não funciona, e o código fica com uma única cor.
- A ordenação de tabela só se prende numa tabela que teve a ordenação ligada no editor (fica a
  marca `data-nabi-sortable`).
- Colorir código é respondido pelo tokenizador embutido, sem precisar de dependência. Para usar
  um realçador como o Shiki, encaixe-o via hook, como em `{ locale: 'pt', highlight }` — o peso
  disso fica por conta da página que o encaixou.
- O pacote global `NabiNote` não tem essa porta — para a página de leitura não carregar o editor
  inteiro, `nabi-note/viewer` existe à parte. Um host que importa via npm prende a mesma porta
  também na prévia, como em
  [{{ t('menu_intro_usage') }}](./usage#prendendo-o-runtime-do-lado-da-leitura-na-previa).

---

## Próximas páginas

- [{{ t('menu_intro_usage') }}](./usage) — o caminho via npm, montagem, entrada e saída por completo
- [{{ t('menu_wing_custom') }}](../wing/custom) — construir você mesmo uma formatação que falta

<script setup lang="ts">
import CdnDemo from '../../.vitepress/ui/CdnDemo.vue'
import { useTranslate } from '../../.vitepress/src/langs.ts'
// o número da versão nunca é escrito à mão — é lido direto do package.json do nabi-npm
import { CDN_BUNDLE, CDN_SHEET } from '../../.vitepress/src/version.ts'

const { t } = useTranslate()
</script>
