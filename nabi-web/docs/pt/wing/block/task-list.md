---
title: Checklist
description: Uma lista que salva o estado de conclusão junto com o documento.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Checklist

Uma lista com estado de conclusão. Digite `[ ]` ou `[x]` seguido de Space em um parágrafo vazio ou crie-a pela barra, e clique nas caixas para mudar o estado.

O estado da caixa é salvo no documento como atributo do item. Ao dividir um item, o estado acompanha o item que mantém o texto, não o item vazio anterior, de modo que dividir uma tarefa concluída não troca seu estado.

Enter divide um item e Shift+Enter apenas insere uma quebra de linha dentro dele. Tab e Shift+Tab aumentam e reduzem o recuo. As mesmas regras valem nas células, e o estado de marcação também é salvo.

<WingDemo path="/wing/block/task-list" />

```ts
const selected = wings().use('tl').build()
```
