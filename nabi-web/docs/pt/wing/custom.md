---
title: Crie o seu próprio wing
description: Uma formatação que falta é feita como um wing — preencha um único contrato, o resto o núcleo faz.
---

# Crie o seu próprio wing

Um wing (asa) é **um único objeto.** Não se herda de classe alguma nem se cumpre um
procedimento de registro à parte — colocá-lo no array que se passa a `createNabiWith` já **é**
o registro.

Negrito, tabela e envio de arquivo também são feitos preenchendo só os campos aqui listados. Um
wing construído por você funciona sob **as mesmas condições** que um wing padrão — não existe
atalho reservado.

---

## O menor wing possível

Um mark inline que conhece `<kbd>`.

```ts
import { createNabiWith, mountSurface, simpleMark, type Wing } from 'nabi-note'
import 'nabi-note/nabi.css'

const kbdWing: Wing = {
  ...simpleMark({
    w: 'kbd',                                                   // o nome deste wing — é o `w` do valor salvo
    toHtml: (_node, children, ctx) => ctx.element('kbd', children()),   // o caminho de saída
  }),
  // se declara dono de `<kbd>` no HTML que entra
  claim: (el, inner) => (el.tag === 'kbd' ? [{ w: 'kbd', ch: inner(false) }] : null),
}

const surface = document.querySelector<HTMLElement>('#editor')!
const { nabi, registry } = createNabiWith([kbdWing])
mountSurface({ nabi, registry, root: surface })
```

Agora `<kbd>` permanece no documento. Sobrevive a colar, `setHtml()`, salvar e reabrir.

```
registrado       <p>Aperte: <kbd>Ctrl</kbd>+<kbd>S</kbd></p>   →   permanece igual
não registrado   <p>Aperte: <kbd>Ctrl</kbd></p>                →   <p>Aperte: Ctrl</p>
```

**Os dois campos olham em direções opostas.** `toHtml` é o caminho de saída, `claim` é o
caminho de entrada. Sem escrever `claim`, ainda dá para desenhar, mas **não dá para ler de
volta** — a casca é retirada no instante em que se salva e se reabre.

`simpleMark` é um atalho para um mark sem atributos. Para um mark que carrega um valor há
`valueMark`; para um objeto, `boxObject`; para uma família de lista, `listFamily`; fora isso,
escreve-se o objeto `Wing` à mão.

---

## Wings são constantes

**A maioria dos wings já são constantes prontas** — `boldWing`, `headingWing`, basta colocar no
array. Só dois, que precisam de opções, têm função de fábrica.

```ts
makeImageWing({ allowLocalUrls: true })
makeUploadWing({ allowLocalUrls: true })
```

Para trocar só "o que se anexa", espalhe a constante — é mais simples trocar um campo do que
construir um wing novo.

```ts
const wing = { ...codeWing, attach: makeCodeAttach({ highlight: myHighlighter }) }
```

---

## Registro e ordem

```ts
const { nabi, registry } = createNabiWith([boldWing, italicWing, kbdWing])
```

**A ordem do array é a ordem de varredura.** Ao decidir a quem pertence uma marcação (`claim`),
o núcleo pergunta nessa ordem, e o primeiro wing que responder leva. Se ninguém levar, a casca é
retirada.

Na barra de ferramentas, **o grupo (`button.group`) vem primeiro.** A ordem dos grupos é fixa; é
só dentro de um mesmo grupo que esta ordem do array decide o posicionamento.

### Morre já no próprio registro

`createNabiWith` **lança na hora** para um wing que quebra o contrato. Nunca estoura depois.

| O que pega | Exemplo |
|---|---|
| Usar uma palavra reservada como nome | `w: 'p'` · `w: 'br'` |
| Registrar o mesmo nome duas vezes | `boldWing` duas vezes |
| Um wing que constrói nó sem `toHtml` | `place: 'mark'` sem forma de desenhar |
| Nome de comando que quebra a regra | precisa ser verbo+objeto em camelCase (`insertTable`) |
| Falta um parceiro necessário | envio precisa de `img` ou `a` junto (`requiresAnyOf`) |

---

## Comandos — funções puras

Todo caminho que altera o documento passa por um único comando. Um comando **não conhece nem o
DOM nem a tela.**

```ts
import { boxObject, insertLump, type Command, type Wing } from 'nabi-note'

const insertStamp: Command = (doc, sel, args, env) => {
  // vem de fora, então verifica — se não bater, não faz nada
  if (typeof args['text'] !== 'string') return null
  const stamp = { w: 'stamp', a: { t: args['text'] }, ch: [] }
  const r = insertLump(doc, sel.focus, stamp, env)
  return { doc: r.doc, selection: { anchor: r.caret, focus: r.caret } }
}

export const stampWing: Wing = {
  ...boxObject({
    w: 'stamp',
    attrs: { t: (v) => (typeof v === 'string' ? v : null) },
    toHtml: (node, _children, ctx) =>
      ctx.element('span', ctx.escape(String(node.a?.['t'] ?? '')), { 'data-nabi-stamp': '' }),
  }),
  commands: { insertStamp },
  button: {
    group: 'insert',
    label: { pt: 'Carimbo' },
    action: { kind: 'command', command: 'insertStamp', args: { text: 'OK' } },
  },
}
```

| Argumento | O que é |
|---|---|
| `doc` | O documento como está agora (um array de blocos). **Não mude — responda com um novo** |
| `sel` | A seleção como está agora |
| `args` | O que o botão ou a linha de contexto passou. **Vem de fora, então precisa ser verificado** |
| `env` | Conhecimento de tipos — o que contém o quê, o que é um bloco |

A resposta é `{ doc, selection }` ou **`null`**. **Responda `null` se nada muda** — assim
`applyCommand` responde `false` e nenhum ponto de desfazer se acumula. O documento com o qual
se responde ainda é aparado mais uma vez pelo `cocoon`, então nenhum comando pode deixar um
documento que quebre as regras.

Quem chama sempre passa pelo nome.

```ts
nabi.applyCommand('insertStamp', { text: 'OK' })   // boolean
```

---

## Todos os campos que se pode preencher

`Wing` tem vinte e cinco campos, e **só dois são obrigatórios** (`w` e `place`).

### O que é

| Campo | Significado |
|---|---|
| `w` | O nome deste wing. Vira o `w` no valor salvo. Palavras reservadas (`p`, `br`) não são permitidas |
| `place` | `'mark'` sobre caracteres · `'void'` um bloco sem interior · `'container'` um bloco com texto dentro · `'attr'` um atributo de parágrafo · `'tool'` uma ferramenta sem rastro no documento |
| `holds` | Como guarda o seu interior — `'blocks'` ou `'inline'` |
| `singleParagraph` | O interior é fixado a **um único** parágrafo (a célula de uma tabela) |
| `boolAttrs` | Nomes de atributos booleanos cujo único valor é `1` |
| `allows` | Os nomes de wings permitidos ali dentro. Sem isso, todos |
| `requiresAnyOf` | Um destes precisa estar registrado junto |
| `parts` | Estrutura sem botão trazida junto — linhas e células de uma tabela, a linha de resumo de um bloco recolhível |

### Valor

| Campo | Significado |
|---|---|
| `attrKey` · `attrValues` | O nome do campo em que um atributo de parágrafo escreve, e os valores que aceita |
| `currentValue` | Se está ativo agora — a barra de ferramentas e a linha de contexto pintam seus campos com base nessa resposta |

### Os caminhos de entrada e saída

| Campo | Significado |
|---|---|
| `toHtml` · `partHtml` | O caminho de saída |
| `claim` | Decide a quem pertence esta tag no HTML que entra |
| `repair` · `partRepair` | Apara este nó na porta do JSON. Responder `null` remove tudo, casca incluída |

### Mãos e teclas

| Campo | Significado |
|---|---|
| `commands` | Os comandos que este wing acrescenta |
| `onKey` | Intercepta a tecla primeiro enquanto o cursor está dentro de um nó deste wing |
| `escapeKeys` | Teclas que fazem o próximo caractere digitado sair deste mark |
| `inputRules` | Conversão automática disparada só pela digitação |
| `attach` | Para quando é preciso tocar a tela — arrastar célula de tabela, colorir código |

### Aparência

| Campo | Significado |
|---|---|
| `button` · `buttons` | Um botão da barra de ferramentas, ou vários |
| `context` | A declaração da linha de contexto |
| `styles` | O CSS que este wing carrega |

---

## `w` — escolhendo o nome

`w` é **uma string que se repete a cada nó do valor salvo.** Quanto mais curto, melhor — por
isso os wings padrão são tão curtos quanto `b`, `hl`, `tf`. Mas colidir com o nome de outro
derruba o registro, então dê ao seu um nome longo o bastante para não colidir, mesmo que fique
um pouco maior.

Não precisa coincidir com o nome da tag HTML — a tag de saída é decidida por `toHtml`.

::: warning Renomear depois
O `w` do valor salvo **é** esse nome, então renomeá-lo depois significa que **documentos já
salvos deixam de poder ser lidos.** Se precisar mudar, aceite o nome antigo também via `claim`
durante um período de transição.
:::

---

## Próximas páginas

- [Marks inline](./custom/inline) — `claim` · `toHtml` · `escapeKeys`
- [Blocos e atributos de parágrafo](./custom/block) — `place` · `holds` · `allows` · `parts` · `attrKey`
- [Teclas, conversão automática, colagem](./custom/input) — `onKey` · `inputRules` · `attach`
- [UI e comportamento](./custom/ui) — `button` · `context` · `styles`, e perguntar à pessoa

<script setup lang="ts">
import { useTranslate } from '../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
