---
title: Tamaño de texto
description: Cambia el tamaño del texto dentro de los pasos permitidos.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Tamaño de texto

Cambia el texto seleccionado a un paso de tamaño. Si hay un rango seleccionado, el paso se aplica a ese rango; si solo hay cursor, cambia el tamaño del texto del párrafo actual. Los datos guardados conservan solo pasos permitidos, no valores arbitrarios como `px`.

<WingDemo path="/wing/etc/font-size" />

```ts
const selected = wings().use('fs', {
  values: ['sm', 'lg', 'xl'],
}).build()
```

Si se omite `values`, se usan los pasos `xs`, `sm`, `lg` y `xl`. Si reduces la lista, los demás pasos que ya existan en documentos antiguos se eliminan al cargarlos.

## Estilos CSS

Puedes cambiar los tamaños con selectores de pasos guardados como `.nabi-content [data-nabi-size="xs"]`. No inventes pasos arbitrarios que no estén en el documento; ajusta el CSS solo dentro de los `values` registrados.

```css
.article-body [data-nabi-size="xs"] { font-size: .78em; }
.article-body [data-nabi-size="sm"] { font-size: .9em; }
.article-body [data-nabi-size="lg"] { font-size: 1.3em; }
.article-body [data-nabi-size="xl"] { font-size: 1.65em; }
```

Mantener consistente la diferencia entre pasos conserva el significado que eligió el autor en el editor cuando el documento se publica.
