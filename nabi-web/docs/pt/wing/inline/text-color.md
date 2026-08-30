---
title: Cor do texto
description: Aplica um nome de cor permitido ao texto selecionado.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Cor do texto

Aplique um nome de cor ao texto selecionado. O valor salvo não é uma string de cor CSS; é um nome permitido, e a cor real é definida pela variável CSS `--nabi-tc-<name>`. Assim o mesmo documento continua legível em temas claros e escuros.

<WingDemo path="/wing/inline/text-color" />

```ts
const selected = wings().use('tc', {
  values: ['green', 'coral', 'blue'],
}).build()
```

Se `values` for omitido, a paleta padrão é `green`, `coral`, `violet`, `amber` e `blue`. Se você reduzir a lista, outras cores são rejeitadas por comandos e ao carregar documentos.

## Estilos CSS

O documento guarda apenas nomes de cor. Defina as cores reais do editor e da vista publicada com variáveis CSS.

```css
.nabi-content { --nabi-tc-blue: #2563eb; }
```

Verifique o contraste junto com a cor de fundo. Em um tema escuro, o mesmo nome de cor pode receber outro valor.

```css
.dark .article-body {
  --nabi-tc-blue: #93c5fd;
  --nabi-tc-green: #86efac;
}
```
