---
title: Tabla
description: Incluye varios párrafos y bloques en las celdas y edita fondos, combinaciones y alineación.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Tabla

Elige filas y columnas en la barra de herramientas para crear una tabla. Las celdas pueden contener varios párrafos, imágenes, listas, citas, código, secciones plegables y vídeos. Coloca el cursor en una celda para editar filas, columnas, combinaciones, encabezados y colores de fondo con las herramientas de propiedades situadas debajo.

Prueba a editar los párrafos y las listas de las celdas del siguiente ejemplo y arrastra sobre varias celdas para cambiar sus fondos a la vez. Pulsa **Seleccionar tabla** en las herramientas de propiedades para alinear la tabla desde la barra de herramientas principal.

<WingDemo path="/wing/block/table" />

```ts
const selected = wings().use('table').build()
```

Registra también las alas que quieras usar dentro de las celdas. Para un editor con todas las alas básicas, ensámblalo con `wings().allBasic()`.

## Escribir dentro de las celdas

| Entrada | Comportamiento |
| --- | --- |
| Enter en un párrafo normal | Crea un nuevo párrafo en la misma celda. |
| Shift+Enter | Inserta un salto de línea en el párrafo o elemento de lista actual. |
| Tab / Shift+Tab en un párrafo normal | Va a la celda siguiente / anterior. |
| Tab / Shift+Tab en una lista o código | Utiliza el aumento / la reducción de sangría de ese bloque. |

Enter en listas y código sigue las reglas de entrada de cada bloque. Aunque ya no se pueda reducir la sangría del código, Shift+Tab no pasa a la celda anterior. Backspace o Delete al principio o al final de una celda no la combina con una celda vecina ni con un párrafo fuera de la tabla.

El pegado y la inserción de imágenes o bloques permanecen en la celda donde comenzó la operación. No se pueden insertar bloques ni pegar en selecciones que cruzan los límites entre celdas. No se pueden anidar tablas ni [regiones flotantes](./float) dentro de las celdas; al importar o pegar esas estructuras, su contenido se despliega en orden.

Las celdas normales admiten títulos, pero el formato de título no se aplica a las celdas de encabezado. Al convertir una celda en encabezado, sus títulos pasan a ser párrafos normales y se conservan el texto y los demás formatos.

## Colores de fondo de las celdas

El color de fondo se aplica a una celda o a un rango rectangular seleccionado arrastrando. Aunque solo se seleccione parte del texto, cambia el fondo de toda la celda que lo contiene. Los colores suaves se adaptan a los temas claro y oscuro. Si las celdas seleccionadas tienen colores distintos, no se muestra un único color como seleccionado.

También puedes cambiar el color mediante un comando sin perder la selección actual de celdas.

```ts
nabi.applyCommand('setCellColor', { bg: 'cyan' })
```

Los valores permitidos son `yellow`, `green`, `cyan`, `pink`, `purple` y `orange`. Para recuperar el fondo predeterminado, elige **Predeterminado** en las herramientas de propiedades o pasa una cadena vacía.

```ts
nabi.applyCommand('setCellColor', { bg: '' })
```

Eliminar contenido, cortar y borrar el formato no elimina los colores de fondo. Al combinar se usa el color de la celda superior izquierda; al dividir, las celdas nuevas reciben ese mismo color. Las filas y columnas añadidas empiezan con el fondo predeterminado. Los cambios de color de fondo admiten deshacer y rehacer.

## Alinear el contenido y la tabla

Cuando el cursor está en una celda, la alineación se aplica a sus párrafos o imágenes. Si seleccionas varias celdas, se aplica a todos sus párrafos y objetos alineables, excepto el código. El estado de las herramientas de título, alineación y letra capitular también refleja los párrafos internos realmente seleccionados. Si los valores de los párrafos seleccionados difieren, no se muestran como un solo valor.

Para alinear la tabla, pulsa **Seleccionar tabla** en las herramientas de propiedades y usa los botones de alineación de la barra principal. La misma alineación está disponible al colocar el cursor antes o después del párrafo que envuelve la tabla, cuando aparece un borde discontinuo. Ese borde solo indica el destino; no convierte el cursor en una selección de toda la tabla.

```ts
nabi.applyCommand('selectTable')
nabi.applyCommand('setAlign', { value: 'c' })
```

Añadir o eliminar filas y columnas, combinar y dividir actúan sobre las celdas seleccionadas. Al combinar, los bloques de cada celda se conservan en orden de filas. Al dividir, el contenido permanece en la celda original y las demás quedan vacías.

## Copiar y guardar

Al copiar varias celdas seleccionadas se copia el rango rectangular visible hasta la última celda incluida. El HTML y el formato interno del portapapeles conservan las celdas vacías, combinaciones, bloques, formato del texto y colores de fondo. El texto plano separa las celdas mediante tabulaciones y saltos de línea, y conserva los saltos entre bloques de una celda y las direcciones de imágenes y vídeos. Cortar solo vacía el contenido de las celdas seleccionadas y se revierte con una sola acción de deshacer.

Si el cursor está antes o después de una tabla y aparece el borde discontinuo, copiar y cortar se aplican a todo el párrafo que la envuelve. Cortar elimina el párrafo y la tabla después de escribir correctamente en el portapapeles. Cortar o eliminar una tabla dentro de una región flotante mantiene la región flotante exterior.

Guardar en JSON o HTML conserva los bloques y colores de fondo de las celdas. Las tablas simples se exportan como tablas Markdown; las que tienen varios bloques o colores de fondo permanecen como HTML para conservar el contenido. En HTML, el nombre del color se guarda en el atributo `data-nabi-cell-color` de `td` o `th`. Los estilos de fondo arbitrarios de HTML externo no se importan como colores de fondo de celda.

Para ordenar columnas en la vista publicada, guarda la tabla como ordenable y conecta `attachViewer()` de `nabi-note/viewer`. Las tablas con celdas combinadas quedan excluidas de la ordenación por columnas.

## Estilos CSS

Aplica estilos a las tablas con `.nabi-content table` y a las celdas con `.nabi-content :is(th, td)`. Aplica las franjas y los fondos de encabezado solo a las celdas sin color para no sobrescribir los fondos asignados.

```css
.article-body table { inline-size: 100%; border-collapse: collapse; }
.article-body :is(th, td) { padding: .6rem .75rem; border: 1px solid var(--nabi-line); }
.article-body th { font-weight: 700; }
.article-body th:not([data-nabi-cell-color]) { background: var(--nabi-soft); }
.article-body tr:nth-child(even) td:not([data-nabi-cell-color]) {
  background: color-mix(in srgb, var(--nabi-soft) 45%, transparent);
}
```

Cambia los propios colores de fondo con variables CSS que incluyen el nombre del color, como `--nabi-cell-yellow`. Carga el siguiente CSS después del CSS del paquete y asigna la clase `table-note` y el valor `data-nabi-theme` del tema actual directamente al elemento `.nabi` del editor o al elemento `.nabi-content` de la vista publicada.

```css
.table-note:is(.nabi, .nabi-content)[data-nabi-theme="light"] {
  --nabi-cell-cyan: #e2f4f7;
}
.table-note:is(.nabi, .nabi-content)[data-nabi-theme="dark"] {
  --nabi-cell-cyan: #183b43;
}
```

Si el viewer está conectado, conserva el botón `.nabi-sort`. Sobrescribir a la fuerza el `position` o el padding derecho de las celdas puede provocar solapamientos con el botón de ordenación.
