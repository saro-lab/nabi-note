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
o locale uma vez** — como no exemplo acima, colocando-o no objeto compartilhado (`shared`) e
passando para os mounts: quando a barra de ferramentas se monta, ela também prende o próprio
`locale` no núcleo (`nabi.$bindLocale`), então o que o núcleo fala (toast etc.) sai no mesmo
idioma. Num lugar sem barra de ferramentas, passe `locale` pela opção de `createNabiWith`. Para
desenhar um seletor, use o `LOCALES` (lista de códigos) que o pacote exporta.

| Montagem | Obrigatório | O que faz |
|---|---|---|
| `createNabiWith(wings, options?)` | Sim | Devolve `{ nabi, registry }`. Não precisa de DOM. Aceita tanto um array de wings quanto o construtor de seleção (`wings()`, veja [{{ t('menu_intro_cdn') }}](./cdn#escolher-os-wings)) |
| `mountSurface({ nabi, registry, root })` | Sim | Reconcilia cursor, IME e entrada com a árvore nabi. Prende junto o `attach` dos wings registrados |
| `mountToolbar({ nabi, registry, root, surface?, locale? })` | Não | A barra de ferramentas principal. Sem ela, ainda dá para editar direto via `applyCommand()` |
| `mountContextToolbar({ nabi, registry, root, surface? })` | Não | Linha de contexto por lugar do cursor (linha/coluna de tabela, linguagem de código, endereço/nome de link, etc.) |
| `mountHints({ toolbar, context?, root, surface? })` | Não | O selo de atalhos que aparece ao apertar Shift duas vezes seguidas |
| `mountViewTools({ nabi, surface, root, container, onBody? })` | Não | Os dois botões de prévia e tela cheia. `root` é a caixa `.nabi` que a tela cheia fixa, `onBody` é o hook que prende o runtime do lado da leitura no corpo da prévia (abaixo) |
| `mountSticky({ root, surface })` | Não | Desfaz o quanto a barra fixa foi empurrada pelo teclado do celular |
| `mountPickedMark({ nabi, surface })` | Não | A marca de seleção de imagem/vídeo (o navegador não desenha isso sozinho) |
| `mountFile({ nabi, store, name? })` | Ao usar save/open | Salvar e abrir como arquivo `.nabi` |
| `mountLocalHistory({ nabi, storage })` | Ao usar localHistory | Grava no navegador em intervalos definidos |
| `mountUpload({ … })` + `mountUploadView({ … })` | Ao usar upload | O progresso de envio de arrastar-e-soltar, colar e escolher arquivo, e a sua exibição |

**Não há mount separado para imagem, checkbox, arrastar célula de tabela ou realce de código**
— tudo isso os wings carregam via `attach`, e `mountSurface` prende tudo junto. Só o realce de
código precisa de alguém para colorir (`makeCodeAttach`, veja
[{{ t('menu_wing_code') }}](../wing/block/code)).

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

A última linha é uma regra: **se nada muda, fica quieto.** Aplicar `setHeading` de novo num
parágrafo que já é título de nível 2 responde `false`, sem deixar ponto de desfazer nem sinal.

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
