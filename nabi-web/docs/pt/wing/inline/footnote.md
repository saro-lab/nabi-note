---
title: "Nota de rodapé"
description: "Ligue explicações adicionais a números no texto e a uma lista no fim do documento."
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Nota de rodapé

Ligue explicações adicionais a números no texto e a uma lista no fim do documento.

Digite o conteúdo usando o botão de nota de rodapé na barra de ferramentas para inserir uma nota no cursor. Se houver texto selecionado, ela será inserida no fim da seleção sem substituir o texto. Os números não são armazenados; são atribuídos automaticamente na ordem do documento.

Clique em um número no texto para editar o conteúdo na linha de propriedades. Use a ferramenta de exclusão ou pressione Backspace ou Delete duas vezes ao lado da nota para selecioná-la e depois removê-la. A lista abaixo é somente leitura e desaparece quando não há notas.

Na prévia e em páginas publicadas com o viewer conectado, passe o ponteiro sobre um número, clique ou toque nele para ler o conteúdo. Apenas uma linha de texto simples é aceita, exibida em fonte sem serifa com 0,875 do tamanho base do corpo. HTML é exibido literalmente.

<WingDemo path="/wing/inline/footnote" />

```ts
const selected = wings().use('fn').build()
```
