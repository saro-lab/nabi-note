---
title: Usar via CDN
description: Explica como usar o NABI NOTE apenas com tags HTML, sem ferramentas de build.
---

# Usar via CDN

<CdnDemo />

---

## Configuração básica e funcionamento

O exemplo de demonstração acima funciona com um único arquivo HTML, sem bundler nem ferramenta de build.

### Integração com duas tags HTML

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/nabi-note@latest/dist/nabi.css">
<script src="https://cdn.jsdelivr.net/npm/nabi-note@latest"></script>
```

Todos os módulos exportados pelo pacote ficam ligados ao objeto global `NabiNote` (ou seu apelido `N`). **A folha de estilo CSS precisa ser vinculada manualmente** — as funções de montagem não injetam CSS automaticamente; sem a tag `<link>`, o editor aparece sem estilo.

### Estrutura HTML

```html
<div id="app" class="nabi">                    <!-- raiz para tema de cor, raio dos cantos e fonte -->
  <div id="chrome" class="nabi-toolbar">        <!-- cabeçalho fixo que envolve a barra de ferramentas e a barra de contexto -->
    <div class="nabi-toolbar-row">
      <span id="tools"></span>                 <!-- botões de prévia e tela cheia (alinhados à direita) -->
      <div id="toolbar"></div>
    </div>
    <div id="context"></div>                   <!-- barra de contexto que aparece dinamicamente conforme a posição do cursor -->
  </div>
  <div id="editor" class="nabi-content" contenteditable="true"></div>
</div>
```

O `id` de cada elemento pode ser definido livremente. Nas funções de montagem, passe o elemento DOM real, não o id como string.
As quatro classes (`nabi`, `nabi-toolbar`, `nabi-toolbar-row`, `nabi-content`) são classes obrigatórias usadas pela folha de estilo — mantenha-as como estão. Se prévia e tela cheia não forem necessárias, o elemento `<span id="tools">` e a chamada a `mountViewTools` podem ser omitidos. `mountViewTools` monta automaticamente sua própria área de botões dentro do container recebido.

### Configuração dos wings

A configuração dos wings pode ser escrita de forma simples encadeando o builder. O exemplo acima começa com os 26 wings básicos que funcionam sem integração do host, acrescenta as funções de salvar e abrir, e restringe as opções de fonte a duas.

```js
var wings = N.wings().allBasic().use('save').use('open').use('tf', { values: ['sans', 'serif'] })
```

- `all()` ativa todos os wings oficiais. Sem essa chamada, nenhum wing básico é incluído — apenas os wings declarados com `use()` são registrados.
- `allBasic()` seleciona, entre os wings oficiais, **os 26 que funcionam sem integração adicional da aplicação host.** Upload, salvar e abrir ficam de fora porque exigem uma configuração que o host precisa fornecer (como um endpoint de servidor ou um armazenamento de arquivos) — por isso o exemplo acima os acrescenta com `use()`.
- `use('nome', opções?)` adiciona um wing específico. Chamado sobre um wing já registrado, apenas atualiza suas opções (por exemplo, `use('tf', { values: [...] })`). Se um wing depende de outro (o wing de upload precisa do wing de imagem ou de link), esse outro é registrado automaticamente junto.
- `drop('nome')` remove um wing da lista registrada. Tentar remover um wing do qual outro depende lança uma exceção, indicando os wings relacionados que precisam ser removidos junto.
- O nome do wing é a chave curta e única (`w`) gravada no nabi-tree (por exemplo, `b` para negrito, `tf` para fonte, `upload`, etc.). A lista completa pode ser vista com `console.log(N.wingNames())`.
- **Um nome ou opção inválidos disparam um erro imediatamente.** Erros de digitação, chaves de opção não suportadas ou valores fora do intervalo válido geram uma mensagem de erro que indica como corrigir.

`createNabiWith` aceita a instância do builder diretamente como argumento, sem precisar chamar `build()`. Os wings também podem ser passados diretamente como um array.

```js
var wings = [N.boldWing, N.italicWing, N.headingWing, N.bulletListWing]
```

Um wing personalizado criado por você é passado como um objeto (`N.wings().all().use(customWing)`). Recomenda-se que o identificador `w` de um wing personalizado comece com o prefixo `ex` (por exemplo, `exNote`), para evitar colisão com identificadores oficiais. Para saber como escrever um, veja [{{ t('menu_wing_custom') }}](../wing/custom).

A especificação detalhada de cada wing está disponível no menu [{{ t('menu_wing') }}](../wing/inline/bold).

### Integração de caixas de diálogo e avisos

O exemplo acima conecta, através da opção `ask`, os `alert` e `confirm` nativos do navegador. Assim é possível exibir uma confirmação como "Há um texto em andamento. Deseja continuar?" em um popup do navegador.

Sem `ask`, a resposta padrão de uma confirmação é o cancelamento (`false`), e avisos simples são exibidos automaticamente pelo toast já embutido no núcleo, abaixo da barra de ferramentas. Para mais detalhes, veja [{{ t('menu_intro_usage') }}](./usage).

`ask` também inclui a função `choose`, para escolher uma entre várias opções. Porém, **o popup de escolha de formato ao colar da área de transferência já funciona por padrão, sem configuração adicional.** Assim que `mountToolbar` é montado, o núcleo conecta automaticamente sua própria UI de popup — em páginas que usam a barra de ferramentas, esse popup de escolha aparece sem implementação extra. Passe `ask.choose` apenas se quiser substituí-lo por uma UI modal própria.

### Métodos de entrada e saída

| Método | Descrição |
|---|---|
| `nabi.getHtml()` | Retorna o HTML para salvar e publicar |
| `nabi.getJson()` | Retorna os dados do nabi-tree (JSON) |
| `nabi.setHtml(html)` · `nabi.setJson(json)` | Substitui o conteúdo por novos dados do documento |
| `nabi.onChange(fn)` | Registra um listener para eventos de alteração |
| `N.renderStoredHtml(json, registry)` | Converte um nabi-tree em HTML sem precisar de um editor (veja [Visualizador somente leitura](#visualizador-somente-leitura-viewer) abaixo) |

---

## Endereços de distribuição CDN

Para fixar uma versão específica, informe o número da versão na URL do CDN. Tanto o jsDelivr quanto o unpkg são suportados.

Uma URL sem versão explícita (`/npm/nabi-note`) pode, devido ao cache do CDN, resultar em versões diferentes entre o script e o CSS — por isso recomenda-se especificar uma versão ou usar a tag `@latest`.

| Tipo | Endereço |
|---|---|
| **Script do bundle (mais recente)** | `https://cdn.jsdelivr.net/npm/nabi-note@latest` |
| **Script do bundle (versão fixa)** | <code>{{ CDN_BUNDLE }}</code> |
| **Folha de estilo (mais recente)** | `https://cdn.jsdelivr.net/npm/nabi-note@latest/dist/nabi.css` |
| **Folha de estilo (versão fixa)** | <code>{{ CDN_SHEET }}</code> |
| **Script do bundle (unpkg)** | `https://unpkg.com/nabi-note` |

O bundle do CDN é idêntico ao resultado de build em `dist/` dentro do pacote publicado no npm.

---

## Visualizador somente leitura (Viewer)

Para uma página que apenas **exibe** um documento HTML salvo, não é necessário criar uma instância do editor. Basta vincular a mesma folha de estilo e renderizar o HTML dentro de um container `.nabi-content` — o resultado aparece exatamente como no editor.

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/nabi-note@latest/dist/nabi.css">

<div class="nabi-content">
  <!-- string HTML salva com nabi.getHtml() -->
</div>
```

Se o documento foi **salvo como nabi-tree (JSON)**, é possível chamar a função de renderização para gerar o HTML em JavaScript puro. Basta passar os dados JSON salvos e a lista de wings registrados (`registry`) como argumentos.

```html
<script>
  var registry = N.makeRegistry(N.wings().all().build())

  var saved = [{ w: 'p', ch: ['uma linha de comentário'] }]   // árvore nabi carregada do servidor
  document.querySelector('.nabi-content').innerHTML = N.renderStoredHtml(saved, registry)
</script>
```

Se o valor não for um nabi-tree válido, a função retorna `null`. O resultado da renderização é completamente idêntico ao `getHtml()` de uma instância do editor — as mesmas regras de filtragem de XSS se aplicam, e como não depende do DOM, funciona da mesma forma em um servidor (Node.js, etc.) (veja [{{ t('menu_intro_ssr') }}](./ssr)).

Em ambientes de servidor que usam o pacote via npm, use o módulo leve **`nabi-note/ssr`** em vez do bundle global. Ele contém apenas a lógica necessária para renderização, então o código da área de edição e da UI não entra no bundle do servidor.

A folha de estilo CSS **contém os estilos de todos os wings.**

A formatação básica é totalmente representada em CSS, mas **a ordenação de tabelas e o realce de sintaxe de código exigem JavaScript no lado do cliente.** Se for necessário ordenar linhas ao clicar no cabeçalho da coluna, ou tokenizar e colorir código, é possível conectar um runtime leve de visualização.

```html
<script type="module">
  import { attachViewer } from 'https://cdn.jsdelivr.net/npm/nabi-note@latest/dist/viewer/index.js'

  attachViewer(document.querySelector('.nabi-content'), { locale: 'pt' })
</script>
```

- Mesmo sem conectar o viewer, o documento é exibido normalmente (apenas a ordenação de tabelas e a coloração de código ficam desativadas — a leitura do conteúdo não é afetada).
- A ordenação de tabelas só funciona em tabelas que tiveram a ordenação ativada no editor (que possuem o atributo `data-nabi-sortable`).
- O realce de sintaxe de código usa por padrão um tokenizador embutido, sem depender de nada externo. Para usar um realçador externo como o Shiki, passe-o pela opção `{ locale: 'pt', highlight }`.
- O bundle global `NabiNote` não inclui esse ponto de entrada do viewer — para manter o tamanho do bundle otimizado em páginas somente leitura, ele é fornecido separadamente como o módulo `nabi-note/viewer`.

---

## Próximos documentos

- [{{ t('menu_intro_usage') }}](./usage) — instalação do pacote npm e uso detalhado do editor
- [{{ t('menu_wing_custom') }}](../wing/custom) — criar seu próprio wing de formatação personalizado

<script setup lang="ts">
import CdnDemo from '../../.vitepress/ui/CdnDemo.vue'
import { useTranslate } from '../../.vitepress/src/langs.ts'
// o número da versão referencia dinamicamente a versão do pacote
import { CDN_BUNDLE, CDN_SHEET } from '../../.vitepress/src/version.ts'

const { t } = useTranslate()
</script>
