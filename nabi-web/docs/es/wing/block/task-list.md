---
title: Checklist
description: Una lista que guarda el estado de completado con el documento.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Checklist

Una lista con estado de finalización. Escribe `[ ]` o `[x]` seguido de Space en un párrafo vacío o créala desde la barra, y pulsa las casillas para cambiar su estado.

El estado de la casilla se guarda en el documento como atributo del elemento. Al dividir un elemento, el estado sigue al elemento que conserva el texto, no al elemento vacío anterior, de modo que dividir una tarea completada no intercambia su estado.

Enter divide un elemento y Shift+Enter solo introduce un salto de línea dentro de él. Tab y Shift+Tab aumentan y reducen la sangría. Las mismas reglas se aplican en las celdas y también se guarda el estado de la casilla.

<WingDemo path="/wing/block/task-list" />

```ts
const selected = wings().use('tl').build()
```
