---
title: Link
description: Conecta endereços web seguros e mostra anexos enviados.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Link

Selecione texto e associe um endereço a ele. Se você inserir um endereço sem selecionar texto, o próprio endereço é inserido como texto do link. Digitar um endereço `http://` ou `https://` e depois pressionar Espaço ou Enter também o transforma em link.

Links guardam apenas `http:`, `https:` e caminhos do mesmo site que começam com `.` ou `/`. Endereços cuja origem não possa ser identificada claramente, como `javascript:` ou `//example.com`, são rejeitados. Links de anexos criados por uploads também guardam informações de arquivo e não podem ser criados manualmente como links comuns.

<WingDemo path="/wing/inline/link" />

```ts
const selected = wings().use('a').build()
```

## Estilos CSS

Estilize links comuns com `.nabi-content a`, e links de anexo separadamente com `.nabi-content a[data-nabi-file]`.

```css
.article-body a:not([data-nabi-file]) {
  color: var(--nabi-accent);
  text-decoration-thickness: .08em;
  text-underline-offset: .16em;
}

.article-body a[data-nabi-file] {
  display: inline-flex;
  gap: .35em;
  padding: .25em .55em;
  background: var(--nabi-soft);
}
```

As partes `::before` e `::after` de links de anexo são usadas para mostrar o ícone do arquivo e a extensão, então normalmente é melhor não substituir nem remover seu `content`.
