---
title: Lista numerada
description: Convierte elementos ordenados en una lista numerada.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Lista numerada

Crea una lista numerada para elementos cuyo orden importa. En un párrafo vacío, escribe un número y un punto como `1.` seguido de Space, o convierte los párrafos seleccionados desde la barra de herramientas.

Los números se calculan a partir de la posición de los elementos, por lo que continúan automáticamente al añadir elementos o cambiar la sangría. No se guarda el número inicial escrito para empezar la numeración desde un valor arbitrario.

Enter crea el siguiente elemento y Shift+Enter solo introduce un salto de línea dentro del actual. Tab y Shift+Tab aumentan y reducen la sangría; dentro de las celdas, la sangría de la lista también tiene prioridad sobre el desplazamiento entre celdas.

<WingDemo path="/wing/block/ordered-list" />

```ts
const selected = wings().use('ol').build()
```
