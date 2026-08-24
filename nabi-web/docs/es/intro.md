---
title: Introducción
description: NABI NOTE es un editor WYSIWYG de código abierto que corre en el navegador.
---

# ¿Qué es NABI NOTE?

NABI NOTE es un editor WYSIWYG **de código abierto** que corre en el navegador.


## El árbol de nabi

Manipular HTML directamente trae problemas en el lado del servidor (Node.js y similares),
donde no hay DOM disponible. Por eso NABI NOTE administra el documento como un objeto de
árbol de JavaScript puro llamado **árbol de nabi**, con serialización en ambos sentidos
hacia JSON y HTML. Además, durante esa conversión entre el árbol de nabi y HTML se
eliminan automáticamente los elementos maliciosos que podrían provocar XSS.

> Todos los wings por defecto que NABI NOTE soporta oficialmente manejan la prevención de
> XSS. Sin embargo, al escribir o incorporar un `wing personalizado (plugin externo)`,
> hay que confirmar con su propio autor si hace lo mismo.

<FlowHub :sources="hubSources" :core="hubCore" :targets="hubTargets" caption="" />

## Soporte de SSR sin DOM (renderizado en el servidor)

Un árbol de nabi guardado en una base de datos o en otro lugar puede **leerse tal cual en
el servidor (Node.js y similares)** y ensamblarse en el HTML que se envía al cliente. El
único trabajo que necesita una API de DOM es la **entrada** desde una cadena HTML externa
(`setHtml()`) y las funciones `mount*` que renderizan el editor en la pantalla.

Una pantalla que solo muestra un documento de forma de solo lectura no necesita levantar
ningún editor — basta con llamar a la función de renderizado única (`renderStoredHtml`).
Recibe como argumentos el valor del árbol de nabi guardado y el `registry` (la lista de
wings registrados), y devuelve una cadena HTML segura.

**En un entorno de servidor, se usa la entrada `nabi-note/ssr`** — un punto de entrada
ligero que solo trae la lógica central que necesita el renderizado, de modo que el código
del área de edición (`surface`) o de las herramientas de pantalla (`ui`) nunca termina en
el paquete del servidor.

```ts
import { makeRegistry, defaultWings, renderStoredHtml } from 'nabi-note/ssr'

// La lista de wings se arma una sola vez cuando arranca el servidor, y se reutiliza en cada solicitud.
const registry = makeRegistry(defaultWings)

const saved = [{ w: 'p', ch: ['una línea de comentario'] }]   // árbol de nabi leído de la base de datos
renderStoredHtml(saved, registry)
// '<p>una línea de comentario</p>'
```

**Cualquier valor que no sea un árbol de nabi válido recibe `null` de vuelta** — la regla
de validación es idéntica a la de `setJson()`. Un valor que pasa la validación **coincide
exactamente** con el resultado de `getHtml()` llamado sobre una instancia del editor,
porque atraviesa el mismo proceso de normalizar y luego ensamblar — así que el filtrado
de XSS se aplica en el mismo punto.

Para pre-renderizar (SSR) en el servidor la propia pantalla de edición del editor, se usa
la función `renderStoredEditorHtml`. Produce HTML con un atributo `data-key` agregado a
cada nodo.

```ts
import { renderStoredEditorHtml } from 'nabi-note/ssr'

renderStoredEditorHtml(saved, registry)
// '<p data-key="n0">una línea de comentario</p>'
```

Los mismos datos guardados siempre producen el mismo `data-key`. Así que se puede enviar
el HTML renderizado en el servidor tal cual y, en el navegador, hidratarlo con
`mountSurface({ nabi, registry, root, hydrate: true })` — el editor toma el control sin
volver a dibujar la pantalla. **La propia demo de inicio de este sitio funciona
exactamente así** — el documento de la primera pantalla fue pre-renderizado por el
servidor, y en el cliente el editor se activa directamente sobre ese DOM.

### Puntos de entrada del paquete

| Entrada | Qué trae | Cuándo |
|---|---|---|
| `nabi-note` | El editor completo (el modelo del documento, el área de edición, la barra de herramientas y las herramientas de UI) | Una pantalla para **escribir/editar** un documento |
| `nabi-note/ssr` | Un módulo ligero, solo para SSR, que renderiza un árbol de nabi a HTML | Un entorno de servidor o una página de solo lectura |
| `nabi-note/viewer` | Comportamiento de solo lectura (ordenar columnas de tablas, resaltado de código, etc.) | Una pantalla para **ver** HTML publicado |

`nabi-note/ssr` **nunca hace referencia** al área de edición (`surface`) ni a las
herramientas de UI (`ui`). Una prueba unitaria a nivel de arquitectura verifica esto de
forma estricta, así que no hay riesgo de que código dependiente del DOM se filtre en el
paquete del servidor.

## Todo formato es un wing

Lo que otros editores llaman "plugin", NABI NOTE lo llama **wing**. El núcleo del editor
maneja directamente solo el párrafo base (`p`), el salto de línea (`br`) y el texto
plano — todo formato y extensión, desde encabezados y listas hasta tablas y negrita, se
ofrece como un wing independiente.

```ts
import { createNabiWith, parseNodes, boldWing } from 'nabi-note'

const bare = createNabiWith([], { parseHtml: parseNodes }).nabi
bare.setHtml('<p><b>negrita</b> <i>cursiva</i></p>')
bare.getHtml()
// '<p>negrita cursiva</p>'                    — no hay ningún wing registrado, así que las etiquetas se eliminan y todo cae a texto plano.

const bold = createNabiWith([boldWing], { parseHtml: parseNodes }).nabi
bold.setHtml('<p><b>negrita</b> <i>cursiva</i></p>')
bold.getHtml()
// '<p><b>negrita</b> cursiva</p>'              — solo boldWing está registrado, así que solo la negrita se conserva y el resto cae a texto plano.
```

El marcado no registrado como wing **se convierte automáticamente en texto plano.** Por
eso cualquier elemento HTML no declarado queda excluido de forma segura, y todos los
wings que NABI NOTE soporta oficialmente filtran a fondo los scripts maliciosos.


## Interfaz

El documento solo puede cambiarse de forma segura a través de `applyCommand()`.

```ts
nabi.applyCommand('toggleMark', { w: 'b' })     // Alternar negrita
nabi.applyCommand('setHeading', { value: 2 })   // Establecer encabezado H2
nabi.undo()
nabi.redo()
```
Un comando **devuelve si tuvo éxito como un `boolean`.** Cuando no cambia nada, devuelve
`false` y no deja ni una entrada de historial ni realiza ningún trabajo innecesario.


## Capas del código

La estructura de abajo no es el orden en que se ejecutan los datos — muestra las
**catorce capas** organizadas en el directorio `src/`. El principio central es que
**una capa inferior nunca hace referencia a una superior.** Por eso las capas inferiores
(`schema`, `doc`, `html`, etc.) no dependen del DOM en absoluto, y corren sin cambios
también en un entorno de servidor (Node.js).

```
src/
├── style/     la hoja de estilos principal — el CSS que comparten la pantalla de edición y el visor
├── locale/    el diccionario multilingüe
├── code/      el tokenizador puro compartido por la pantalla de edición y el visor
├── schema/    la estructura del árbol de nabi y la definición del cocoon (normalización)
├── doc/       operaciones de insertar · borrar · dividir · rango sobre nodos — sin DOM
├── caret/     posición del cursor · selección · manejo de bordes
├── html/      serialización bidireccional árbol de nabi ↔ HTML
├── io/        manejo de entrada/salida — candidatos de pegado · guardar · abrir · markdown
├── editor/    la interfaz de comandos y la instancia del editor
├── wing/      validación de wings y gestión del registro
├── wings/     la colección oficial de wings (negrita · cursiva … tabla · carga)
├── surface/   sincroniza el caret · IME · eventos de entrada con el árbol
├── ui/        la capa de UI — barra de herramientas · barra contextual · popups
├── viewer/    comportamiento del visor de solo lectura
├── index.ts   el punto de entrada principal — `nabi-note`
└── ssr.ts     el punto de entrada solo para SSR — `nabi-note/ssr` (no hace referencia a surface · ui)
```

**El orden de las líneas es el orden de las capas** — dispuesto no alfabéticamente sino
**de la capa más baja a la más alta.** `style` es la capa más baja y `viewer` es la más
alta.

Esta regla de dependencia entre capas no es solo una recomendación — se **verifica
mecánicamente mediante pruebas unitarias.** En el momento en que aparece un `import` que
viola la regla de capas, la etapa de compilación y pruebas falla de inmediato.


## Glosario

| Palabra | Significado |
|---|---|
| **marca (mark)** | Formato de texto en línea — p. ej. `<b>`, `<i>`, `<a>` |
| **bloque (block)** | Un elemento de nivel de bloque — p. ej. párrafo, encabezado, lista, tabla, imagen |
| **atributo de párrafo (paragraph attribute)** | Un atributo aplicado a un párrafo completo — p. ej. alineación, letra capital |
| **párrafo envoltorio** | El párrafo contenedor que envuelve un objeto de bloque independiente como una tabla o una imagen |
| **posesión (claim)** | La regla que decide a qué wing pertenece un fragmento de marcado HTML de entrada |
| **piezas (parts)** | Los subelementos que forman el interior de un wing — p. ej. las filas/columnas de una tabla, la línea de resumen de un bloque plegable |
| **filtro IO (IO filter)** | Un punto de extensión que maneja el pegado desde el portapapeles (entrada) y guardar/abrir (salida). Opera fuera del contrato de wing, así que no crea ningún nodo propio en el árbol de nabi |

### En la pantalla de edición

| Palabra | Significado |
|---|---|
| **cursor (caret)** | El cursor de texto y la selección dentro del editor |
| **barra contextual (context row)** | La barra de herramientas auxiliar que se muestra dinámicamente según el estado de bloque/formato en el que está el cursor — p. ej. los controles de fila/columna de una tabla, el selector de lenguaje de código, el campo de dirección de un enlace, el selector de nivel de un encabezado |

### Núcleo

| Palabra | Significado |
|---|---|
| **cocoon** | El paso de normalización del árbol de nabi. **Se ejecuta justo después de cada comando**, garantizando que nunca se produzca un árbol anómalo que rompa las reglas del esquema |
| **conexión (attach)** | Un gancho que un wing declara cuando necesita controlar el DOM directamente — p. ej. arrastrar para seleccionar celdas de una tabla, resaltado de sintaxis de código, alternar una casilla. Los ganchos de cada wing registrado se conectan juntos cuando se ejecuta `mountSurface` |
| **regla de entrada (input rule)** | Una regla abreviada que convierte el formato automáticamente al escribir — p. ej. escribir `- ` se convierte en una lista, escribir `# ` se convierte en un encabezado |


## Próximos documentos

- [{{ t('menu_intro_usage') }}](./intro/usage) — la guía completa de ensamblaje, entrada y salida
- [{{ t('menu_intro_cdn') }}](./intro/cdn) — usar una sola etiqueta `<script>` sin herramientas de compilación
- [{{ t('menu_wing_custom') }}](./wing/custom) — construye tú mismo un wing de formato personalizado totalmente nuevo

<script setup lang="ts">
import FlowHub from '../.vitepress/ui/FlowHub.vue'
import { useTranslate } from '../.vitepress/src/langs.ts'

const { t } = useTranslate()

const hubSources = [
  { label: 'HTML · JSON', note: 'escrito a mano · pegado · cargado', kind: 'in' },
  { label: 'setHtml() · setJson()', note: 'entrada por función', kind: 'gate' },
];

const hubCore = { label: 'Árbol de nabi', note: 'Tree Object', kind: 'core' }

const hubTargets = [
  { label: 'getHtml()', note: 'Output HTML', kind: 'out' },
  { label: 'getJson()', note: 'Output JSON', kind: 'out' },
  { label: 'getEditorHtml()', note: 'HTML del editor', kind: 'out' },
];

</script>
