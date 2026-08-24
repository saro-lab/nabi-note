---
title: Uso básico
description: Instale via npm, monte um único objeto nabi e troque documentos por três entradas e quatro saídas.
---

# Uso básico

O caminho instalando via npm. O caminho com um único `<script>` está em
[{{ t('menu_intro_cdn') }}](./cdn).

```sh
npm i nabi-note
```

---

## Encaixando as peças

O host constrói o lugar e prende os mounts um a um. Abaixo está a configuração mínima, e os
exemplos que aparecem em cada página de wing são todos esse mesmo esqueleto com um ou dois
wings a mais encaixados.

```html
<div id="app" class="nabi">
  <div id="chrome" class="nabi-toolbar">
    <div id="toolbar"></div>
    <div id="context"></div>
  </div>
  <div id="editor" class="nabi-content" contenteditable="true"></div>
</div>
```

```ts
import {
  createNabiWith,
  mountSurface,
  mountToolbar,
  mountContextToolbar,
  mountHints,
  mountViewTools,
  mountSticky,
  watchSettle,
  parseNodes,
  boldWing,
  italicWing,
} from 'nabi-note'
import 'nabi-note/nabi.css'

const app = document.querySelector<HTMLElement>('#app')!
const surface = document.querySelector<HTMLElement>('#editor')!

// a lista de wings monta junto o conhecimento de tipos, os comandos e os montadores — isso é o `registry`
const { nabi, registry } = createNabiWith([boldWing, italicWing], {
  parseHtml: parseNodes,
})

mountSurface({ nabi, registry, root: surface })

const settle = watchSettle(document, { surface })
const shared = { nabi, registry, surface, settle, locale: 'pt' }

const toolbar = mountToolbar({ ...shared, root: document.querySelector<HTMLElement>('#toolbar')! })
const context = mountContextToolbar({ ...shared, root: document.querySelector<HTMLElement>('#context')! })

mountHints({ toolbar, context, root: document.querySelector<HTMLElement>('#chrome')!, surface })
mountViewTools({ nabi, surface, root: app, container: document.querySelector<HTMLElement>('#toolbar')!, locale: 'pt' })
mountSticky({ root: app, surface })

// toda vez que o valor muda — prenda seu código aqui
// nabi.onChange(() => user_callback(nabi.getHtml()))
```

O host constrói o lugar, e **o núcleo sabe como aquele lugar é feito** — o mount prende sozinho
`.nabi-toolbar-row`, `.nabi-context`, `.nabi-editing` ao seu próprio recipiente, e também monta
sozinho a caixa de ferramentas. Isso significa que o host não precisa montar o layout, e por
isso a marcação acima só tem três classes.

- **`class="nabi"`** — os tokens de cor e a folha de estilo só vivem dentro dela. É também a
  caixa que a tela cheia fixa por inteiro, então a barra de ferramentas e a área de edição
  precisam estar **juntas** dentro dela.
- **`class="nabi-toolbar"`** — amarra a linha da barra de ferramentas e a linha de contexto num
  bloco só e as torna **fixas ao rolar (sticky)**. Se as duas ficarem fixas separadamente, o
  texto é empurrado quando a linha de contexto aparece, e a tela treme.
- **`class="nabi-content" contenteditable`** — a própria área de edição.

Se o site tem um cabeçalho fixo, desça-o pela mesma medida com `--nabi-sticky-top`, e se
prender `mountSticky()`, o núcleo mede o quanto o teclado do celular empurrou a tela e desfaz
isso.

**A folha de estilo é o host que prende.** Com um bundler basta `import 'nabi-note/nabi.css'`,
e se quiser carregar só o CSS dos wings registrados, chame
`injectSheets(document, collectSheets(registry))`. **Uma página cujo documento é renderizado
antes no servidor e enviado pronto deve usar o caminho do arquivo** — a injeção só prende depois
que o JavaScript do editor chega, e nesse meio-tempo o documento chega a ser desenhado nu, uma
vez.

**A língua também decide a direção do texto.** Passe árabe (`ar`) ou urdu (`ur`) e a raiz daquele
mount recebe `dir="rtl"`, ficando da direita para a esquerda — mesmo que a página não diga nada
via `<html dir>`. **Se `locale` não for dado, nada é tocado**: não se sobrepõe ao host que já
controla a direção por conta própria. Qual idioma corresponde a qual direção é o que
`localeDirection(code)` responde.

```ts
mountSurface({ nabi, registry, root: surface, locale: 'ar' })   // a área de edição vira RTL
mountToolbar({ nabi, registry, surface, root: toolbar, locale: 'ar' })   // a barra de ferramentas também espelha
```

A língua de exibição se define por `locale` em cada mount — o texto do documento continua igual
e só os nomes da barra de ferramentas e da linha de contexto mudam. **O host só precisa declarar
o locale uma vez** — como no exemplo acima, colocando-o no objeto compartilhado (shared) e
passando para os mounts: quando a barra de ferramentas se monta, ela também prende o próprio
`locale` no núcleo (`nabi.$bindLocale`), então o que o núcleo fala (toast etc.) sai no mesmo
idioma. Num lugar sem barra de ferramentas, passe `locale` pela opção de `createNabiWith`. Para
desenhar um seletor, use o `LOCALES` (lista de códigos) que o pacote exporta.

### O texto de exemplo do editor vazio

Um editor sem nada dentro mostra um texto de exemplo apagado na primeira linha. Ele desaparece no
instante em que um caractere chega, e volta quando o último é apagado. **Aparece sem que nada
precise ser feito** — a palavra vem do dicionário do núcleo, então segue o idioma daquele mount.
Onde ele fica é decidido pela **direção do texto** (esquerda em LTR, direita em RTL) — mesmo que a
linha esteja alinhada ao centro ou à direita, o texto de exemplo não a acompanha.

```ts
mountSurface({ nabi, registry, root: surface, placeholder: 'Deixe uma nota aqui' })
mountSurface({ nabi, registry, root: surface, placeholder: 'Primeira linha\nSegunda linha' })   // várias linhas
mountSurface({ nabi, registry, root: surface, placeholder: '' })   // sem texto de exemplo
```

A quebra de linha (`\n`) se torna uma linha de fato. O texto de exemplo fica **fora do fluxo** —
é uma camada à parte e não sofre o efeito da formatação do documento (título, alinhamento, capitular).
Por padrão a área já tem `12.5rem` de altura mínima; quando precisar de mais, levante-a com
`--nabi-content-min-height`. Esse valor se aplica **só à superfície de edição** — num documento
publicado ou em prévia a altura é do próprio texto.

**O texto de exemplo é uma camada à parte.** Fica na `::before` da raiz de edição, então não sofre
o efeito de formatação do documento — seja a primeira linha um título, alinhada ou com capitular —
a posição dela depende só da direção do texto.

A palavra entra na raiz da área de edição como `--nabi-placeholder`, e quem desenha é a folha de
estilos. Para mudar a cor ou o traço, sobrescreva esta regra.

```css
.nabi-content.nabi-editing:has(> :is(p, h1, h2, h3, h4, h5, h6):only-child > br:only-child)::before {
  color: #999;
}
```

| Montagem | Obrigatório | O que faz |
|---|---|---|
| `createNabiWith(wings, options?)` | Sim | Devolve `{ nabi, registry }`. Não precisa de DOM. Aceita tanto um array de wings quanto o construtor de seleção (`wings()`, veja [{{ t('menu_intro_cdn') }}](./cdn#escolher-os-wings)) |
| `mountSurface({ nabi, registry, root })` | Sim | Reconcilia cursor, IME e entrada com a árvore nabi. Prende junto o `attach` dos wings registrados |
| `mountToolbar({ nabi, registry, root, surface?, locale?, file? })` | Não | A barra de ferramentas principal. Sem ela, ainda dá para editar direto via `applyCommand()`. Encaixe a resposta de `mountFile()` em `file` e **o painel de salvar se coloca sem nenhuma fiação** — o botão salvar e <kbd>⌘</kbd><kbd>S</kbd> o abrem. Deixe vazio e o pressionamento chega ao host por `onHost('save')`, como antes. `surface` também é **o terreno onde vivem os atalhos** (veja [Onde os aceleradores são ouvidos](#onde-os-aceleradores-são-ouvidos)) |
| `mountContextToolbar({ nabi, registry, root, surface? })` | Não | Linha de contexto por lugar do cursor (linha/coluna de tabela, linguagem de código, endereço/nome de link, etc.) |
| `mountHints({ toolbar, context?, root, surface? })` | Não | O selo de atalhos que aparece ao apertar Shift duas vezes seguidas |
| `mountViewTools({ nabi, surface, root, container, onBody? })` | Não | Os dois botões de prévia e tela cheia. `root` é a caixa `.nabi` que a tela cheia fixa, `onBody` é o hook que prende o runtime do lado da leitura no corpo da prévia (abaixo) |
| `mountSticky({ root, surface, chrome?, nabi? })` | Não | Desfaz o quanto a barra fixa foi empurrada pelo teclado do celular. Passe `nabi` e **depois de uma edição o cursor se empurra para fora de baixo a barra por si mesmo** — deixe de fora e funciona como antes, só quando o host chama `aim()` (veja [O teclado móvel e a barra fixa](#o-teclado-móvel-e-a-barra-fixa)) |
| `mountPickedMark({ nabi, surface })` | Não | A marca de seleção de imagem/vídeo (o navegador não desenha isso sozinho) |
| `mountFile({ nabi, store, registry, parse?, name? })` | Ao usar save/open | salva em **três** formatos — `.nabi`, `.nhtml`, `.md` — e abre **quatro**, esses três mais um `.html` simples de fora. **`registry` é obrigatório** — a lista de formatos e a montagem de md e HTML vêm dele. `parse` é a porta que lê HTML; num navegador pode deixar de fora e `parseNodes` entra no lugar, mas num lugar sem DOM (servidor, testes) precisa passar para `.nhtml` e `.html` abrirem. O `FileMount` que ele devolve é **o jeito canônico de salvar e abrir sem wings** (`file.save()` · `file.saveAs(id, name)` · `file.formats()` · `await file.open()`) |
| `mountLocalHistory({ nabi, storage })` | Ao usar localHistory | Grava no navegador em intervalos definidos. Monta mesmo que `storage` seja `null` (lugares bloqueados como `file://`) — assim o botão explica por toast por que não funciona |
| `mountUpload({ … })` + `mountUploadView({ … })` | Ao usar upload | O progresso de envio de arrastar-e-soltar, colar e escolher arquivo, e a sua exibição |

**Não há mount separado para imagem, checkbox, arrastar célula de tabela ou realce de código**
— tudo isso os wings carregam via `attach`, e `mountSurface` prende tudo junto. Só o realce de
código precisa de alguém para colorir (`makeCodeAttach`, veja
[{{ t('menu_block_code') }}](../wing/block/code)).

### Onde os aceleradores são ouvidos

Um único lugar escuta aceleradores como <kbd>⌘</kbd><kbd>S</kbd>: a barra de ferramentas. Até onde
esse ouvido alcança é traçado por `mountToolbar({ surface })` — **só uma tecla levantada dentro
dessa superfície ou das linhas da barra** pertence a esse editor.

- **Com dois editores numa página, é preciso passar `surface`.** Sem isso a barra volta a escutar
  o documento inteiro, e então <kbd>⌘</kbd><kbd>S</kbd> digitado no editor de baixo salva o texto
  do editor de cima. Até uma tecla digitada num campo comum do próprio host pode ser capturada.
- **Sem registrar nenhum wing, a tecla não existe.** Salvar e abrir vivem no núcleo (`mountFile`),
  mas o botão e o acelerador pertencem ao wing — então um editor montado só com
  `wings().allBasic()` não tem <kbd>⌘</kbd><kbd>S</kbd> nem <kbd>⌘</kbd><kbd>O</kbd>. O único
  caminho de volta é `.use('save').use('open')`.
- **Sem lugar para chegar, a tecla não é engolida.** Numa montagem em que o botão de salvar não
  alcança nada (nem `file` nem `onHost` encaixados), a tecla segue para o navegador como se fosse
  dele. Não tiramos um atalho por um trabalho que não fazemos — engolir em silêncio faria o leitor
  pensar que o navegador quebrou.

Para salvar e abrir sem wings, use a alça que `mountFile` devolve — num editor sem botão nem
atalho, o próprio host chama `file.save()` e `file.open()`.

### O teclado móvel e a barra fixa

`mountSticky` faz mais no celular agora — observa o teclado subir e descer, e traz o cursor
**para debaixo da barra e acima do teclado**. Três coisas que o host deve saber.

- **Só se move enquanto o editor tem o foco.** Sem foco não dá nem um passo — a tela não deve
  saltar enquanto o host empurra um valor via `setHtml()`.
- **Enquanto uma mão está rolando a tela, não se move nem um pixel.** Fica travado por 250ms
  depois de uma rolagem — tirar a tela de uma mão em movimento é exatamente o que causa o tremor.
- **Só uma mudança do tamanho de um teclado abre a porta.** O recolhimento da barra de endereço
  (poucos pixels) não move nada; a porta só abre passado `max(120px, 15% da altura da janela)`.

Ao digitar, empurra **só o necessário** — arrastar a tela até a barra a cada caractere seria
inutilizável. No instante em que o teclado sobe, porém, alinha a vista para que **a barra fique
colada no topo da janela**, e depois que o viewport se acomoda, alinha mais uma vez.

`--nabi-bar-height` é o valor que esse passo usa — `mountSticky` grava a **altura medida** do
chrome ao qual se prende na raiz `.nabi`, e a folha de `.nabi-content > *` soma esse valor a
`scroll-margin-block-start`. **Não é um valor para o host ajustar, mas a explicação de por que o
cursor nunca fica escondido debaixo da barra** — sem esse mount, uma estimativa de `3.5rem` fica
no lugar, e ela fica bem curta quando a barra quebra em duas linhas ou a linha de contexto sobe.

::: warning Não bloqueie o zoom com a meta viewport
O Safari do iOS amplia a página inteira quando o foco cai num campo de formulário cujo texto tem
menos de 16px. O núcleo evita isso **aumentando o texto** — `--nabi-touch-font-size` (`16px` por
padrão). **Não** tomamos o outro caminho de bloquear o zoom em si com `user-scalable=no` ou
`maximum-scale=1`: isso tira do leitor o direito de ampliar. Se o host escrever essa meta na
própria página, o piso que o núcleo definiu perde o sentido — por isso, não a escreva.
:::

### Prendendo o runtime do lado da leitura na prévia

A prévia é o `getHtml()` colocado direto num HTML estático, então o que **o lado da leitura faz
via JavaScript** — ordenar tabela, colorir código — não se prende sozinho. O `attachViewer` de
`nabi-note/viewer` liga tudo isso numa única chamada, e na prévia é o hook `onBody` que o prende
— troque a linha `mountViewTools` da configuração mínima acima por esta.

```ts
import { attachViewer } from 'nabi-note/viewer'

mountViewTools({
  nabi,
  surface,
  root: app,
  container: document.querySelector<HTMLElement>('#toolbar')!,
  locale: 'pt',
  onBody: (body) => attachViewer(body, { locale: 'pt' }),
})
```

`onBody` é chamado quando o corpo da prévia é montado, e a função de desligar que ele devolve é
chamada quando a sobreposição é removida. Prenda **a mesma linha** (`attachViewer`) na página
publicada também — como a prévia deve ficar igual ao lado publicado, o ponto deste hook é prender
a mesma porta nos dois lugares. Os detalhes estão em
[{{ t('menu_intro_cdn') }} ▸ Lado da leitura](./cdn#lado-da-leitura).

Colorir código responde por padrão com o tokenizador embutido (zero dependências). Um host que
usa um realçador como o Shiki passa o mesmo hook via `attachViewer(body, { locale, highlight })`
— combinando com o que foi passado a `makeCodeAttach({ highlight })`, a cor da tela de edição e a
da tela de leitura não ficam diferentes.

Para trocar os wings, desmonte tudo isto (`unmount()`) e monte de novo — a marcação que o wing
removido segurava cai a texto puro naquele lugar. É assim que a demo deste site funciona de
fato — ligue e desligue um chip de wing e a montagem inteira é refeita.

Cor, formato e as demais variáveis CSS estão em
[{{ t('menu_style_custom') }}](../style/custom).

---

## As três formas de tirar o documento

```ts
nabi.getHtml()        // o HTML que você salva e publica
nabi.getJson()        // a árvore nabi (JSON)
nabi.getEditorHtml()  // o HTML da tela atual do editor (carrega data-key)
```

**Para salvar, use um dos dois primeiros.** `getEditorHtml()` carrega uma marca exclusiva da
tela (`data-key`), então não é o valor que se exporta — é o lugar para pré-renderizar o editor
por SSR.

O JSON de saída se parece com isto. **O documento é um array de blocos**, sem um nó-raiz que
o envolva.

```json
[
  {"w":"p","a":{"h":2},"ch":["Título"]},
  {"w":"p","ch":["texto ",{"w":"b","ch":["negrito"]}," e ",
    {"w":"a","a":{"href":"https://nabi.saro.me/"},"ch":["link"]}]},
  {"w":"p","a":{"a":"c"},"ch":["centralizado"]},
  {"w":"p","ch":[{"w":"ul","ch":[
    {"w":"li","ch":[{"w":"p","ch":["um"]}]},
    {"w":"li","ch":[{"w":"p","ch":["dois"]}]}]}]}
]
```

Só há quatro regras de leitura.

- **`w` é o id do wing que desenha aquele nó.** As únicas palavras reservadas são `p`
  (parágrafo) e `br` (linha); todo o resto é o id de um wing registrado — como `b`, `ul`, `li`.
  Título não é um wing separado, é **um atributo do parágrafo**
  (`{"w":"p","a":{"h":2}}`).
- **String é texto, objeto é wing.** Não existe um campo separado para marcar o tipo.
  - **`a` é o valor que aquele wing carrega** — endereço de link, cor do marca-texto, nível de
  título, coisas assim. Se não houver, também não há campo. O valor de alinhamento também é
  `a`, mas fica **dentro** desse campo, então não há confusão
  (`{"w":"p","a":{"a":"c"}}` — parágrafo alinhado ao centro).
- **Tabela, lista e imagem, que ocupam o lugar de um parágrafo, são envolvidas por uma camada de
  parágrafo** (veja o `ul` acima). Esse parágrafo carrega o alinhamento e dá ao cursor um lugar
  para ficar antes e depois daquele bloco. Em HTML sai como `<div data-nabi-p>` — `<p>` não pode
  conter tabela ou lista por regra de sintaxe.

A árvore que roda por dentro carrega mais um campo por nó, `_id` — o **endereço interno pelo
qual o cursor aponta um nó**, renumerado na maioria das edições e removido na saída (no exemplo
acima, de 470 para 323 bytes). O valor de saída pode ser colocado de volta direto em
`setJson()`.

---

## As quatro formas de colocar o documento

```ts
createNabiWith(wings, { doc })   // começa com uma árvore nabi já pronta
nabi.setJson(json)               // troca tudo por uma árvore nabi
nabi.setHtml(html)               // troca tudo por uma string de HTML
nabi.applyCommand('setHeading', { value: 2 })  // um comando de edição (o mesmo portão que os wings usam)
```

As quatro **respondem sucesso ou falha como `boolean`.** Não lançam exceção, e se falharem, não
tocam no documento.

| Onde a resposta é `false` | |
|---|---|
| `setJson` | não tem a forma de uma árvore nabi |
| `setHtml` | o adaptador `parseHtml` não foi encaixado (veja abaixo), ou a edição está bloqueada |
| `applyCommand` | esse comando não existe, ou **nada muda** |

**O documento vazio tem uma única forma — `[{"w":"p","ch":[]}]`.** Ao selecionar tudo e apagar,
o título ou o alinhamento do primeiro bloco não sobrevive. Esvaziar só uma linha entre várias é
diferente — como a intenção é continuar escrevendo naquela linha, os atributos do parágrafo
permanecem.

**Um valor vazio não é um erro de forma, é o documento vazio.** Dar `null`, `undefined`, uma
string vazia (mesmo só com espaços) ou um array vazio não é rejeitado — o editor **se acomoda
numa tela vazia e responde `true`**, tanto em `setJson` quanto em `setHtml`; por isso "esvaziar"
sempre funciona. Como não há nada para ler num valor vazio, `setHtml` nem precisa do adaptador
(abaixo) nesse caso. Um valor com a forma errada continua sendo rejeitado — vazio e errado não
são a mesma coisa.

A última linha é uma regra à parte: **se nada muda, fica quieto.** Aplicar `setHeading` de novo num
parágrafo que já é título de nível 2 responde `false`, sem deixar ponto de desfazer nem sinal.

O terceiro argumento de `applyCommand` é **a mão que chama** — em `applyCommand(name, args?,
by?)`, `by` é `'keyboard' | 'pointer'` (o tipo `CommandHand`), e vale teclado quando não é dito.
Há um único lugar em que isso muda o resultado: um comando de marca com o cursor recolhido fica
reservado quando vem do teclado (passa a valer a partir do próximo caractere), mas responde
`false` sem reserva quando vem de um ponteiro, avisando por toast que "não há nada para aplicar".
Ao construir uma UI própria que chama comandos por clique, indique `'pointer'`.

### `setHtml` precisa de um adaptador

Ler HTML é trabalho do `DOMParser` do navegador. O núcleo não conhece DOM, então esse
adaptador precisa ser encaixado na declaração.

```ts
import { createNabiWith, parseNodes } from 'nabi-note'

const { nabi } = createNabiWith(wings, { parseHtml: parseNodes })
```

`setJson` não precisa de adaptador — um JSON salvo pode ser colocado **direto no servidor
(Node.js)**. Como a montagem (`getHtml`) também não usa DOM, o caminho de ler JSON no servidor e
gerar HTML para enviar continua aberto.

---

## Colar, salvar e abrir

**Colar lê uma área de transferência através de vários olhos** — `HTML`, `MARKDOWN`, `TEXT` e o formato próprio do nabi (`NABI`). Quando há mais de uma leitura, um painel pequeno pergunta qual colar; quando há só uma, cola sem perguntar. Uma cola sem texto algum (só arquivos) pula o painel e vai para [{{ t('menu_etc_upload') }}](../wing/etc/upload).

**Três formatos salvam** — `.nabi` (o original), `.nhtml` (uma página HTML independente) e `.md` (markdown; o que não cabe ali vira HTML, então pode não voltar como era). **Quatro abrem** — esses três mais um `.html` simples de fora. Essa porta precisa do `mountFile()` da tabela acima, e encaixar um formato a mais está em [{{ t('menu_wing_custom') }}](../wing/custom#plugando-um-filtro-de-e-s).

---

## Os avisos saem como toast

Erro de upload, aviso do histórico local, um "nada para aplicar aqui" — tudo isso sai por **um
único caminho de toast.** O recipiente padrão é mantido pelo núcleo, então não é preciso encaixar
nada — se a barra de ferramentas existir, ele aparece num lugar fixo logo abaixo dela (mesmo que
a linha de contexto apareça e suma, esse lugar não se move).

- São três níveis — `'info' | 'warn' | 'error'`. Não é resultado de sucesso/falha, é a escala de
  **quanto quem lê precisa se atentar**.
- Some sozinho depois de 1 segundo por padrão (esmaece a partir de 0,5 s restantes), e clicar
  também fecha. No máximo três ficam de pé ao mesmo tempo por padrão — passando disso, o que tem
  menos tempo restante é removido primeiro.
- A mensagem pode conter `\n`, e é desenhada tanto no claro quanto no escuro.

Há duas opções que ajustam o comportamento e uma que troca a exibição inteira, em
`createNabiWith`.

```ts
const { nabi } = createNabiWith(wings, {
  toastMs: 2000,   // tempo de vida — padrão 1000ms. Quem chama também pode definir por chamada
  toastMax: 5,     // limite simultâneo — padrão 3
  // uma página com o próprio sistema de aviso só troca a exibição — o recipiente padrão do núcleo nunca é desenhado
  // toast: (level, message, ms) => user_callback(level, message),
})
```

É também a única porta pela qual um wing fala — `nabi.$toast(level, message, ms?)`. Como o tempo
vai junto com a mensagem, não é preciso aumentar o padrão inteiro só por causa de um aviso longo.

---

## Como o editor pergunta a uma pessoa

Ao abrir um arquivo, é preciso uma pergunta do tipo "há um texto em andamento. Abrir mesmo
assim?". Essa caixa se encaixa **uma vez, na declaração**.

```ts
const { nabi } = createNabiWith(wings, {
  ask: {
    message: (text) => window.alert(text),
    confirm: (text) => window.confirm(text),
  },
})
```

| | Forma |
|---|---|
| `message` | `(text: string) => void` — uma única fala, sem receber resposta |
| `confirm` | `(text: string) => boolean \| Promise<boolean>` — aceita síncrono ou assíncrono |
| `choose` | `(question: string, options: ChooseOption[]) => number \| Promise<number>` — uma dentre várias. A resposta é **um índice**, e `-1` (ou qualquer coisa fora do intervalo) é um cancelamento. `ChooseOption` é `{ label, icon? }`, onde `icon` é o **interior** de um svg 16×16 — deixe de fora e o nome fica sozinho |

**O núcleo não usa o do navegador automaticamente.** Uma caixa cinza não deve invadir uma
página que já tem seu próprio diálogo, e plugins (IntelliJ, VS Code) nem sequer têm
`window.confirm`. As três linhas acima são construídas pelo host.

::: warning Sem resposta, a resposta é "não"
Uma pergunta que ninguém responde não vira "sim" — o mesmo que cancelar, apertar Escape ou
fechar a janela. Como o lugar onde essa resposta pesa é "descartar o texto em andamento e
abrir?", não é certo ir para o lado de descartar só porque não há quem responda. No servidor
(Node) também passa quieto com esse valor.
:::

**É por editor** — não é global, então dois editores numa mesma página podem perguntar coisas
diferentes. Os wings recebem o mesmo (`nabi.$ask`) —
[{{ t('menu_wing_custom') }} ▸ UI e comportamento](../wing/custom/ui) fala sobre isso.

---

## O nome deste editor e "isso mudou?"

```ts
nabi.sessionId   // '1755245678901-1x9k3af' — <horário unix>-<nonce>, um por instância
nabi.isChanged() // se o documento se moveu desde a última linha de base
```

`sessionId` é criado uma vez e não muda. O horário diz quando este editor foi criado e já vem
ordenado por si só; o nonce distingue dois editores criados no mesmo milissegundo. É o rótulo
que se prende a rascunho, log e chave de autosave.

**Três coisas redesenham a linha de base** de `isChanged()`: colocar o documento inteiro
(`createNabiWith({ doc })`, `setJson()`, `setHtml()`) e avisar que já foi salvo.

```ts
nabi.$markSaved(savedDoc)   // depois que o salvamento se concretiza — passe o próprio documento salvo naquele momento
```

**Passe a árvore de no momento em que o salvamento aconteceu** (não a árvore atual). Isso
porque, enquanto o salvamento demora, o que foi digitado nesse meio-tempo ainda precisa
continuar marcado como "alterado". O wing de salvar (`save`) chama isso depois que o arquivo é
de fato gravado, então salvar como `.nabi` faz `isChanged()` virar `false`.

::: warning Só `.nabi` move a linha de base
O que sai como `.nhtml` ou `.md` é uma **cópia**, e uma cópia não move a linha de base — depois de
salvá-la, `isChanged()` continua `true`. Tratar uma cópia como "salva" faria a janela se fechar
sem perguntar, levando o original ainda incompleto com ela. Quando o salvamento é assíncrono, a
linha de base só se move **depois que ele tem sucesso** — um salvamento que falha não a toca.
:::

**Desfazer até voltar ao ponto inicial também deixa `false`** — como a árvore nabi é imutável e
cada edição a troca por inteiro, saber se é o mesmo documento não exige varrer nem gerar hash:
é sabido na hora.

```ts
window.addEventListener('beforeunload', (e) => {
  if (nabi.isChanged()) e.preventDefault()
})
```

---

## Próximas páginas

- [{{ t('menu_intro_ssr') }}](./ssr) — pré-renderize o valor salvo e retome com `hydrate`
- [{{ t('menu_intro_cdn') }}](./cdn) — sem ferramenta de build, com um único `<script>`
- [{{ t('menu_wing_custom') }}](../wing/custom) — construir você mesmo uma formatação que falta

<script setup lang="ts">
import { useTranslate } from '../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
