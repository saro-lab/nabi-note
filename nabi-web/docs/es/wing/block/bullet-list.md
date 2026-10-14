---
title: Lista con viñetas
description: Enumera varios elementos sin numerarlos.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Lista con viñetas

Una lista con viñetas presenta varios elementos sin orden. Escribe `-` seguido de Space en un párrafo vacío o cambia el tipo desde la barra de herramientas. También puedes agrupar varios párrafos seleccionados en una lista de una sola vez.

Dentro de la lista, Tab aumenta la sangría un nivel y Shift+Tab la reduce. Enter crea el siguiente elemento; al pulsarlo de nuevo en un elemento vacío, sales de la lista. Shift+Enter inserta un salto de línea dentro del elemento sin dividirlo.

Las listas dentro de celdas siguen las mismas reglas de entrada. En una lista, Tab aumenta la sangría en lugar de pasar a otra celda.

<WingDemo path="/wing/block/bullet-list" />

```ts
const selected = wings().use('ul').build()
```
