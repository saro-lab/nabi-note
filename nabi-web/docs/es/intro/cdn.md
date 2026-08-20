---
title: Usar con CDN
description: Ejemplo de CDN
---

# Usar con CDN

<CdnDemo />

---

## Qué se acaba de hacer

No hace falta leerlo para que el archivo de arriba funcione. Lea esto solo cuando quiera
modificarlo.

### Dos etiquetas son la instalación entera

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/nabi-note@latest/dist/nabi.css">
<script src="https://cdn.jsdelivr.net/npm/nabi-note@latest"></script>
```

**Todo** lo que exporta el paquete cuelga de un único global, `NabiNote`. **La hoja de
estilos se conecta a mano** — los `mount*` no inyectan CSS, así que si falta el
`<link>`, el editor se ve desnudo.

### El esqueleto

```html
<div id="app" class="nabi">                    <!-- la raíz donde viven color, bordes y tipografía -->
  <div id="chrome" class="nabi-toolbar">        <!-- la barra de herramientas y la contextual se pegan juntas -->
    <div class="nabi-toolbar-row">
      <span id="tools"></span>                 <!-- vista previa · pantalla completa (extremo derecho) -->
      <div id="toolbar"></div>
    </div>
    <div id="context"></div>                   <!-- se llena sola según lo que toque el cursor -->
  </div>
  <div id="editor" class="nabi-content" contenteditable="true"></div>
</div>
```

El `id` puede ser cualquier nombre — lo que se le pasa al `mount` es el **elemento**, no
el nombre. Las cuatro clases (`nabi`, `nabi-toolbar`, `nabi-toolbar-row`,
`nabi-content`) son los tiradores que agarra la hoja de estilos, así que déjelas tal
cual. Si no va a usar vista previa ni pantalla completa, puede borrar juntos el
`<span id="tools">` y la línea de `mountViewTools`. El recipiente se le puede pasar
donde sea — `mountViewTools` levanta su propia caja que flota sola al extremo derecho,
así que pasarle la barra de herramientas tal cual no desordena la fila de botones.

### Elegir los wings

Elegir wings es una sola línea con el constructor. El archivo de arriba parte de los
veintinueve wings por defecto, quita la subida y limita la tipografía a dos.

```js
var wings = N.wings().all().drop('upload').use('tf', { values: ['sans', 'serif'] })
```

- `all()` arranca con todos los wings oficiales. **Si no se llama, empieza con las manos
  vacías** — solo se cargan los que se agregan con `use()`.
- `use('nombre', opciones?)` agrega uno más. Si se llama sobre un wing que ya está,
  solo le pone las opciones — así es `use('tf', { values: [...] })` de arriba. Si hace
  falta un wing del que depende (la subida necesita que haya imagen o enlace), se trae
  en silencio junto con él.
- `drop('nombre')` quita uno de los que están. Si se intenta quitar uno del que depende
  otro wing, lanza una excepción ahí mismo y avisa cuál hay que quitar junto con él.
- El nombre es la clave corta que queda escrita en el valor guardado — como `b`
  (negrita), `tf` (tipografía), `upload`. La lista completa se ve con
  `console.log(N.wingNames())`.
- **Si se llama mal, lanza una excepción en esa misma línea.** Un nombre mal escrito,
  una clave de opción desconocida, un valor fuera de la lista — todo eso lanza, y el
  mensaje trae cómo corregirlo — `use('bod')` responde "¿tal vez 'b' (negrita)?". No hay
  ningún lugar donde se ignore en silencio.

`createNabiWith` recibe el constructor tal cual, así que no hace falta llamar a
`build()` — `build()` solo entrega un arreglo donde hace falta un arreglo. Cuando se
eligen solo unos pocos, el arreglo sigue siendo la respuesta.

```js
var wings = [N.boldWing, N.italicWing, N.headingWing, N.bulletListWing]
```

Un wing hecho a mano se agrega como objeto — como en `N.wings().all().use(customWing)`.
El `w` de ese wing debe empezar con `ex` (`exNote`) — porque si coincide con un nombre
oficial futuro en el valor guardado, un documento ya guardado se leería con otro
sentido. Cómo construirlo está en
[{{ t('menu_wing_custom') }}](../wing/custom).

Cada wing por separado se ve en [{{ t('menu_wing') }}](../wing/inline/bold).

### Preguntar y notificar

El archivo de arriba conectó `alert` y `confirm` del navegador con `ask` — una pregunta
como "hay texto sin guardar, ¿de todos modos quiere abrirlo?" va a esa caja. Si no se
conecta, la respuesta a la pregunta es "no", y un mensaje que no necesita respuesta lo
muestra el recipiente de toast que ya trae el núcleo, debajo de la barra de
herramientas — no hay nada aparte que conectar para avisos como un error de subida. Los
detalles están en [{{ t('menu_intro_usage') }}](./usage).

### Sacar el valor

| | |
|---|---|
| `nabi.getHtml()` | el HTML que se guarda o se publica |
| `nabi.getJson()` | el árbol de nabi (JSON) |
| `nabi.setHtml(html)` · `nabi.setJson(json)` | para volver a cargarlo |
| `nabi.onChange(fn)` | cada vez que cambia el valor |
| `N.renderStoredHtml(json, registry)` | el valor guardado a HTML sin levantar el editor (ver [Lado de solo lectura](#lado-de-solo-lectura) abajo) |

---

## Direcciones

Para fijar una versión, ponga el número de versión en la dirección. unpkg entrega el
mismo archivo.

**No use la dirección sin versión (`/npm/nabi-note`)** — jsDelivr la cachea por mucho
tiempo en ese lugar, y el paquete y la hoja de estilos podrían quedar mezclados entre
versiones distintas.

| | Dirección |
|---|---|
| **Paquete (última)** | `https://cdn.jsdelivr.net/npm/nabi-note@latest` |
| **Paquete (fija)** | <code>{{ CDN_BUNDLE }}</code> |
| **Hoja de estilos (última)** | `https://cdn.jsdelivr.net/npm/nabi-note@latest/dist/nabi.css` |
| **Hoja de estilos (fija)** | <code>{{ CDN_SHEET }}</code> |
| **Paquete** (unpkg) | `https://unpkg.com/nabi-note` |

El paquete viaja incluido dentro de lo que se publica en npm, así que **no existe una
distribución de CDN aparte.**

---

## Lado de solo lectura

Una página que **solo muestra** el HTML guardado no levanta el editor. Con la misma
hoja de estilos y el valor puesto dentro de `.nabi-content`, sale exactamente igual que
se veía en el editor.

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/nabi-note@latest/dist/nabi.css">

<div class="nabi-content">
  <!-- el valor guardado con getHtml() -->
</div>
```

Si lo que se guardó **no es HTML sino el árbol de nabi (JSON)**, se dibuja ahí mismo sin
levantar el editor. Lo que recibe son dos cosas: el valor guardado y la lista de wings
registrados.

```html
<script>
  var registry = N.makeRegistry(N.wings().all().build())

  var saved = [{ w: 'p', ch: ['una línea de comentario'] }]   // árbol de nabi recibido del servidor
  document.querySelector('.nabi-content').innerHTML = N.renderStoredHtml(saved, registry)
</script>
```

Si no es un árbol de nabi responde `null`, y el valor que pasa no difiere ni un
carácter del `getHtml()` que produce el editor — el filtrado de XSS ocurre en el mismo
lugar. Esta puerta no usa DOM, así que corre igual en el servidor (Node.js), y por la
misma puerta se abre **la vía de generar el HTML de antemano en el servidor y
enviarlo** (vea [{{ t('menu_intro_ssr') }}](./ssr#solo-dibujar-el-valor-guardado-sin-levantar-el-editor)).

Un servidor que se conecta por npm usa **`nabi-note/ssr`** en vez del paquete global —
es el punto de entrada que solo trae lo necesario para dibujar, así que ni la
superficie de edición ni las herramientas de pantalla se cargan.

Un solo archivo de hoja de estilos **lleva el CSS de todos los wings** — el archivo no
puede saber qué wings se registraron, así que los incluye todos.

Lo que se ve lo cubre por completo la hoja de estilos, pero **ordenar tablas y colorear
código son tareas que le tocan a JavaScript del lado de lectura** — pulsar un
encabezado de columna para reordenar filas, o trocear el código y ponerle color, son
cosas que el CSS no puede hacer. Si hace falta, se conecta el runtime del lado de
lectura con una sola línea.

```html
<script type="module">
  import { attachViewer } from 'https://cdn.jsdelivr.net/npm/nabi-note@latest/dist/viewer/index.js'

  attachViewer(document.querySelector('.nabi-content'), { locale: 'es' })
</script>
```

- Sin conectarlo, el documento se ve perfectamente bien — solo que una tabla con el
  orden activado no ordena y el código queda en un solo color.
- El orden de tabla solo se conecta a las tablas que tenían el orden activado en el
  editor (queda la marca `data-nabi-sortable`).
- El coloreado de código lo responde el tokenizador integrado, así que no necesita
  ninguna dependencia. Para usar un resaltador como Shiki, se conecta como gancho —
  `{ locale: 'es', highlight }` — y ese peso corre por cuenta de la página que lo
  conecta.
- El paquete global `NabiNote` no tiene esta puerta — para que una página de lectura no
  cargue el editor completo, `nabi-note/viewer` vive aparte. Un host que se conecta por
  npm también conecta la misma puerta en la vista previa, como en
  [{{ t('menu_intro_usage') }}](./usage#se-conecta-el-runtime-del-lado-de-lectura-a-la-vista-previa).

---

## Próximos documentos

- [{{ t('menu_intro_usage') }}](./usage) — la vía con npm, ensamblaje, entrada y salida completos
- [{{ t('menu_wing_custom') }}](../wing/custom) — crear a mano un formato que no existe

<script setup lang="ts">
import CdnDemo from '../../.vitepress/ui/CdnDemo.vue'
import { useTranslate } from '../../.vitepress/src/langs.ts'
// el número de versión no se escribe a mano — se lee directamente del package.json de nabi-npm
import { CDN_BUNDLE, CDN_SHEET } from '../../.vitepress/src/version.ts'

const { t } = useTranslate()
</script>
