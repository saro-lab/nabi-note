---
title: Tipo de letra
description: Aplique uma família tipográfica ao texto selecionado ou a um parágrafo.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Tipo de letra

Aplique uma família tipográfica ao texto selecionado. Se houver um intervalo selecionado, somente esse intervalo muda; se houver apenas o cursor, ela se aplica ao texto do parágrafo atual. Os arquivos de fonte reais e os valores de `font-family` são definidos pelo CSS do serviço.

As famílias padrão são `sans`, `serif`, `mono` e `cursive`. Especialmente em serviços que incluem coreano ou outro conteúdo multilíngue, é melhor decidir explicitamente quais fontes cada família deve usar.

<WingDemo path="/wing/etc/typeface" />

```ts
const selected = wings().use('tf', {
  values: ['sans', 'serif', 'mono'],
}).build()
```

Se `values` for omitido, todas as famílias padrão serão usadas. Somente valores incluídos em `values` são permitidos nos documentos.

## Estilos CSS

O documento armazena apenas o nome da família, e o CSS escolhe os arquivos de fonte. Altere as variáveis no mesmo contêiner para o editor e para a visualização publicada.

```css
.nabi-content {
  --nabi-font-serif: "Noto Serif", "Noto Serif KR", serif;
  --nabi-font-mono: "JetBrains Mono", monospace;
}
```

Se usar fontes da web, carregue esses arquivos de fonte primeiro. `cursive` muitas vezes não tem boa cobertura para vários idiomas, então é melhor oferecê-la somente depois de escolher a fonte real que o serviço vai usar.
