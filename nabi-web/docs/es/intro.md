---
title: Introducción
description: NABI NOTE es un editor WYSIWYG de código abierto que corre en el navegador.
---

# ¿Qué es NABI NOTE?

NABI NOTE es un editor WYSIWYG **de código abierto** que corre en el navegador.

## Árbol de nabi

Procesar HTML de forma directa trae problemas irresolubles en un servidor sin DOM, así
que el documento se maneja como un objeto de JavaScript llamado **árbol de nabi**, que se
serializa en ambos sentidos hacia JSON y HTML. Además, durante la conversión entre el
árbol de nabi y HTML se eliminan los elementos de XSS.

> Todos los wings que trae NABI NOTE soportan la eliminación de XSS, pero en el caso de
> un `wing personalizado (plugin externo)` hay que confirmar con su propio desarrollador
> si ofrece o no esa protección.

<FlowHub :sources="hubSources" :core="hubCore" :targets="hubTargets" caption="" />

## Soporte de SSR sin DOM (lado del servidor)

Se puede **leer tal cual en el servidor (Node.js)** el árbol de nabi guardado y ensamblar
con él el HTML que se va a enviar. Lo único que necesita DOM es la **entrada**
(`setHtml()`) y los `mount*` que se pegan a la pantalla.

Un lugar que solo muestra el documento no necesita ni levantar el editor — basta una sola
función. Recibe el valor guardado y el `registry` (la lista de wings registrados), y
devuelve una cadena HTML.

**En el servidor se importa desde `nabi-note/ssr`** — es el punto de entrada que solo
trae lo necesario para dibujar, así que ni la superficie de edición ni las herramientas
de pantalla se cargan en absoluto.

```ts
import { makeRegistry, defaultWings, renderStoredHtml } from 'nabi-note/ssr'

// La lista de wings se arma una sola vez cuando arranca el servidor — todos los valores guardados la comparten.
const registry = makeRegistry(defaultWings)

const saved = [{ w: 'p', ch: ['una línea de comentario'] }]   // árbol de nabi leído de la base de datos
renderStoredHtml(saved, registry)
// '<p>una línea de comentario</p>'
```

**Si no es un árbol de nabi, devuelve `null`** — la regla de rechazo es la misma que en
`setJson()`. El valor que pasa **no difiere ni un carácter** del `getHtml()` que produce
el editor, porque atraviesa los mismos pasos (normalización → ensamblaje), así que el
filtrado de XSS ocurre en el mismo lugar.

Para dibujar de antemano el editor en el servidor se usa la función pareja — lo único que
se agrega es `data-key`.

```ts
import { renderStoredEditorHtml } from 'nabi-note/ssr'

renderStoredEditorHtml(saved, registry)
// '<p data-key="n0">una línea de comentario</p>'
```

El mismo valor guardado siempre obtiene la misma `data-key`, así que se puede enviar tal
cual este HTML y, en el navegador, recogerlo con
`mountSurface({ nabi, registry, root, hydrate: true })` sin que la pantalla se vuelva a
dibujar. **La demo de inicio de este sitio funciona exactamente así** — el documento de
la primera pantalla lo dibujó el servidor, y el editor despierta encima de él.

### Tres puntos de entrada

| Se importa | Qué trae | Cuándo |
|---|---|---|
| `nabi-note` | El editor completo — ensamblaje, superficie, herramientas de pantalla | Donde se **escribe** |
| `nabi-note/ssr` | Solo lo necesario para dibujar el valor guardado como HTML | En el servidor, o en una página de solo lectura |
| `nabi-note/viewer` | Comportamiento del lado de lectura (ordenar tablas, colorear código) | Donde se **muestra** el HTML publicado |

`nabi-note/ssr` **no carga ni un solo archivo** de la superficie de edición (`surface`)
ni de las herramientas de pantalla (`ui`) — una red que recorre el código fuente lo
garantiza. Así no hay forma de que código con DOM se mezcle en el paquete de servidor.

## Todo el formato son wings

Lo que en otros editores se llama "plugin" aquí se llama **wing**. Lo único que el
núcleo ve directamente es el párrafo (`p`), la línea (`br`) y el texto plano — el
encabezado, la lista, la tabla, la negrita, todo eso son wings.

```ts
import { createNabiWith, parseNodes, boldWing } from 'nabi-note'

const bare = createNabiWith([], { parseHtml: parseNodes }).nabi
bare.setHtml('<p><b>negrita</b> <i>cursiva</i></p>')
bare.getHtml()
// '<p>negrita cursiva</p>'                    — sin wings declarados, todo cae a texto plano.

const bold = createNabiWith([boldWing], { parseHtml: parseNodes }).nabi
bold.setHtml('<p><b>negrita</b> <i>cursiva</i></p>')
bold.getHtml()
// '<p><b>negrita</b> cursiva</p>'              — solo se declaró boldWing, así que solo la negrita sobrevive y el resto cae a texto plano.
```

El marcado no registrado como wing **se convierte en texto plano.** Por eso el HTML no
declarado queda excluido, y todos los wings que NABI NOTE soporta oficialmente eliminan
los scripts maliciosos.

## Interfaz

El documento solo se puede cambiar a través de `applyCommand()`.

```ts
nabi.applyCommand('toggleMark', { w: 'b' })     // Negrita
nabi.applyCommand('setHeading', { value: 2 })   // H2
nabi.undo()
nabi.redo()
```

El comando **devuelve si tuvo éxito como `boolean`.** Si no cambia nada, responde
`false` y no deja historial ni hace ninguna modificación.

## Capas del código

No significa que el valor fluya en este orden. Es la **dirección de dependencia**
apilada de abajo hacia arriba, y la regla es una sola — **la capa de abajo no conoce la
de arriba.** Por eso las capas de abajo (`schema`·`doc`·`html`) no tocan el DOM, y esa es
la razón por la que corren igual en el servidor. El camino por donde entra y sale el
valor es el diagrama del árbol de nabi de arriba.

<LayerStack
  :layers="layers"
  caption=""
/>

Este orden no es una promesa escrita — **una red lo vigila mecánicamente.** Si aparece un
solo import que vaya contra la capa, la prueba falla en el acto.

## Glosario

| Palabra | Sentido |
|---|-------------------------------------------------------|
| **marca (mark)** | Formato de texto, p. ej. `<b>` · `<i>` · `<a>` |
| **bloque (block)** | p. ej. párrafo · encabezado · lista · tabla · imagen |
| **atributo de párrafo (paragraph attribute)** | Un atributo del párrafo, p. ej. alineación · letra capital |
| **párrafo envoltorio** | El párrafo que envuelve objetos de un solo párrafo como tablas, listas o imágenes |
| **posesión (claim)** | El juicio de a qué wing pertenece un marcado dado |
| **piezas (parts)** | Una pieza interna de un wing, p. ej. las filas y celdas de una tabla, la línea de resumen de un plegable |

### Pantalla de edición

| Palabra                      | Sentido                                                                                                                  |
|-------------------------------|---------------------------------------------------------------------------------------------------------------------------|
| **cursor (caret)**            | El cursor de selección dentro del editor                                                                                 |
| **barra contextual (context row)** | La barra de herramientas que controla lo que el cursor tiene seleccionado ahora mismo, p. ej. los comandos de fila y columna de una tabla, la casilla de lenguaje del código, las casillas de dirección y nombre de un enlace, los niveles H1~H6 de un encabezado |

### Núcleo

| Palabra | Sentido                                                                                                                                                              |
|---|-----------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **cocoon** | El paso de normalización del árbol de nabi. **Corre después de cada comando**, así que ningún comando puede dejar un documento que rompa las reglas               |
| **conexión (attach)** | El gancho que un wing declara cuando necesita tocar la pantalla, p. ej. arrastrar celdas de una tabla, colorear código, alternar una casilla — todo eso es esto. `mountSurface` conecta junto con el resto lo que traen los wings registrados |
| **conversión automática (input rule)** | Una conversión que ocurre solo con escribir, p. ej. un guion y un espacio se vuelven lista, `#` y un espacio se vuelven encabezado                                  |

## Próximos documentos

- [{{ t('menu_intro_usage') }}](./intro/usage) — ensamblaje, entrada y salida completos
- [{{ t('menu_intro_cdn') }}](./intro/cdn) — con un solo `<script>`, sin herramientas de compilación
- [{{ t('menu_wing_custom') }}](./wing/custom) — crear a mano un formato que no existe

<script setup lang="ts">
import FlowHub from '../.vitepress/ui/FlowHub.vue'
import LayerStack from '../.vitepress/ui/LayerStack.vue'
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

const layers = [
  { name: 'locale', what: 'idioma' },
  { name: 'code', what: 'el tokenizador puro que comparten la pantalla de edición y el lado de lectura' },
  { name: 'schema', what: 'la forma del árbol de nabi y la definición de Cocoon' },
  { name: 'doc', what: 'insertar · borrar · dividir · rangos — sin DOM' },
  { name: 'caret', what: 'posición del cursor, selección, bordes' },
  { name: 'html', what: 'árbol de nabi ↔ HTML' },
  { name: 'editor', what: 'la instancia con la interfaz de comandos' },
  { name: 'wing', what: 'verificación de los wings en el momento del registro' },
  { name: 'wings', what: 'los wings oficiales (bold, italic ... table, upload...)' },
  { name: 'surface', what: 'ajusta el caret, el IME y la entrada al árbol' },
  { name: 'ui', what: 'la capa de UI' },
  { name: 'viewer', what: 'solo lectura' },
]
</script>
