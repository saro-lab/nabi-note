---
title: Cita
description: Agrupa texto citado o un contexto separado en varios párrafos.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Cita

Agrupa una frase tomada de otro texto, o contenido que quieras separar del flujo principal, como una cita. Una cita puede contener varios párrafos y bloques. En una línea vacía, escribir `>` y pulsar Espacio también crea una cita.

<WingDemo path="/wing/block/quote" />

```ts
const selected = wings().use('quote').build()
```

## Estilos CSS

Usa `.nabi-content blockquote` para cambiar el aspecto de la cita. Mantén el espacio interior suficiente para que varios párrafos no queden pegados.

```css
.article-body blockquote {
  border-inline-start: 4px solid var(--nabi-accent);
  padding: .5rem 1rem;
  background: var(--nabi-soft);
}
```
