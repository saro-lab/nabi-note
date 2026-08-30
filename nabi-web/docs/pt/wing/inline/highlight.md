---
title: Realce
description: Aplica uma cor de realce permitida atrás do texto selecionado.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Realce

Aplique uma cor de realce atrás do texto selecionado. Os dados salvos mantêm apenas nomes de cor permitidos, não valores CSS arbitrários, para que os dados do documento e o estilo visual fiquem separados.

<WingDemo path="/wing/inline/highlight" />

```ts
const selected = wings().use('hl', {
  values: ['yellow', 'green', 'cyan'],
}).build()
```

Se `values` for omitido, a paleta padrão é `yellow`, `green`, `cyan`, `pink`, `purple` e `orange`. Se você reduzir a lista, cores não registradas não serão preservadas nem ao carregar um documento existente.

## Estilos CSS

O documento guarda apenas nomes de cor. Altere as cores do editor e da vista publicada por variáveis CSS.

```css
.nabi-content { --nabi-hl-yellow: #fff0a6; }
```

Alterar várias cores ao mesmo tempo permite manter os nomes de cor do documento e adaptar apenas o clima visual do produto.

```css
.article-body {
  --nabi-hl-yellow: #fff0a6;
  --nabi-hl-green: #c8f0d8;
  --nabi-hl-pink: #ffd6e5;
}
```
