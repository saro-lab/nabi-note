---
title: Tamanho do texto
description: Altere o tamanho do texto dentro dos passos permitidos.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Tamanho do texto

Altere o texto selecionado para um passo de tamanho. Se houver um intervalo selecionado, o passo é aplicado a esse intervalo; se houver apenas o cursor, ele altera o tamanho do texto do parágrafo atual. Os dados salvos mantêm apenas passos permitidos, não valores arbitrários como `px`.

<WingDemo path="/wing/etc/font-size" />

```ts
const selected = wings().use('fs', {
  values: ['sm', 'lg', 'xl'],
}).build()
```

Se `values` for omitido, os passos `xs`, `sm`, `lg` e `xl` são usados. Se você reduzir a lista, outros passos já presentes em documentos antigos são removidos ao carregar.

## Estilos CSS

Você pode alterar tamanhos por seletores de passos salvos, como `.nabi-content [data-nabi-size="xs"]`. Não invente passos arbitrários que não estão no documento; ajuste o CSS apenas dentro dos `values` registrados.

```css
.article-body [data-nabi-size="xs"] { font-size: .78em; }
.article-body [data-nabi-size="sm"] { font-size: .9em; }
.article-body [data-nabi-size="lg"] { font-size: 1.3em; }
.article-body [data-nabi-size="xl"] { font-size: 1.65em; }
```

Manter consistente a diferença entre os passos preserva o significado escolhido pelo autor no editor quando o documento é publicado.
