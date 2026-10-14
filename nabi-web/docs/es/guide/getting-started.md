---
title: Uso básico
description: Monta un editor NABI NOTE en el navegador y guarda y restaura sus documentos.
---

# Uso básico

Esta guía describe un editor renderizado en el cliente (CSR) en el navegador: elegir wings, montar el editor y su interfaz, y guardar y restaurar JSON de NABI TREE.

## Instalación y HTML base

```bash
npm install nabi-note
```

Carga la misma hoja de estilos tanto para el editor como para el contenido publicado. No añadas `contenteditable` por tu cuenta; `mountSurface()` se encarga de ello.

```ts
import 'nabi-note/nabi.css'
```

```html
<div class="nabi">
  <div id="toolbar" class="nabi-toolbar"></div>
  <div id="content" class="nabi-content"></div>
</div>
```

## Montar un editor

`allBasic()` selecciona los wings oficiales que funcionan sin cableado específico de la aplicación. Añade wings conectados a servicios, como subida, almacenamiento de archivos o comparación de documentos, siguiendo sus guías propias.

```ts
import { createNabiWith, mountSurface, mountToolbar, wings } from 'nabi-note'

const content = document.querySelector<HTMLElement>('#content')!
const toolbarRoot = document.querySelector<HTMLElement>('#toolbar')!

const { nabi, registry } = createNabiWith(wings().allBasic(), {
  locale: 'en',
  onError: (error) => console.error(error),
  undoLimit: 200,
  typingMergeMs: 1000,
})

const surface = mountSurface({
  nabi,
  registry,
  root: content,
  locale: 'en',
  placeholder: 'Write something.',
})
const toolbar = mountToolbar({
  nabi,
  registry,
  root: toolbarRoot,
  surface: content,
  locale: 'en',
})
```

`locale` controla la barra de herramientas y los textos auxiliares; pasa el mismo valor a todos los montajes de UI. `placeholder` solo aparece cuando el editor está vacío. `onError` recibe fallos aislados de comandos y callbacks. `undoLimit` es la cantidad de entradas de deshacer (200 por defecto). `typingMergeMs` es el intervalo que fusiona escritura consecutiva en un solo paso de deshacer; ponlo en `0` si quieres que cada inserción quede separada.

El intervalo predeterminado entre pulsaciones consecutivas de Enter para salir de un contenedor de bloques es 180ms. La doble pulsación de Esc y Shift conserva los 350ms. Definir `doubleEnterMs` explícitamente en `mountSurface()` cambia tanto el intervalo de Enter como el de doble Esc.

Cada editor necesita raíces de contenido y barra de herramientas propias, sin solaparse. En una página con varios editores, pasa a cada barra su propia superficie mediante `surface`, para que el foco y los atajos no se crucen.

## Configurar la barra de herramientas

La barra predeterminada agrupa títulos, formato de texto, alineación, listas, inserción y herramientas del documento, en ese orden y con separadores verticales. En escritorio muestra todas las herramientas en varias filas; en móvil, las rápidas y el botón de todas las herramientas en una fila. Las propiedades de tablas, imágenes y regiones flotantes aparecen debajo y se pueden usar junto con las herramientas del texto.

`groups` cambia el orden de los grupos y `quick` el de las herramientas rápidas móviles. Por ejemplo, un editor que inserta imágenes a menudo puede mover el grupo `media` al principio.

```ts
import { TOOLBAR_GROUPS, mountToolbar } from 'nabi-note'

const toolbar = mountToolbar({
  nabi,
  registry,
  root: toolbarRoot,
  surface: content,
  locale: 'es',
  groups: ['media', ...TOOLBAR_GROUPS.filter((group) => group !== 'media')],
  quick: ['b', 'i', 'tc', 'img'],
})
```

Las herramientas rápidas respetan el orden indicado y no añaden separadores. Dentro de cada grupo se sigue el orden de registro de las alas. Al prerenderizar la barra con SSR, pasa el mismo orden de grupos al servidor y al navegador. [Temas CSS](./style#umbral-del-modo-movil) explica la disposición según el ancho de pantalla.

Conecta `mountHints()` para elegir herramientas con el teclado pulsando Shift dos veces. Tab cambia de grupo y las flechas se desplazan entre iconos del mismo grupo. En escritorio y pantalla completa se usa la barra visible; en móvil, la paleta de todas las herramientas.

Los paneles de imagen, campos de URL y selectores de archivo recuerdan la selección al abrirse. Si solo mueves el cursor, insertan en la posición original; si editas o reemplazas el documento, cancelan la entrada y muestran un aviso. Deshacer hasta recuperar el mismo contenido no permite reutilizar la selección anterior.

## Elegir wings

Usa `use()` y `drop()` para dejar solo las funciones que necesitas. Cada página de wing documenta las opciones que acepta.

```ts
const selected = wings()
  .allBasic()
  .drop('youtube')
  .use('upload')

const { nabi, registry } = createNabiWith(selected, { locale: 'en' })
```

Para un bundle más pequeño, pasa solo los wings necesarios, como `boldWing` e `imageWing`, en un array. Los nombres desconocidos, las opciones inválidas y las dependencias faltantes fallan de inmediato al crear el editor.

## Guardar y cargar

Guarda la salida de `getJson()` como JSON de NABI TREE cuando el documento vaya a editarse de nuevo. `getHtml()` es para salida publicada. Nunca guardes el resultado de solo editor de `getEditorHtml()`.

```ts
const json = nabi.getJson()
await saveToServer(json)

const saved = await loadFromServer()
if (!nabi.setJson(saved)) showError('The saved document could not be read.')

const publishedHtml = nabi.getHtml()
```

Usa `setHtml()` para importar HTML externo. El editor del navegador ya aporta su parser HTML, así que no hace falta una opción de parser. `setJson()` y `setHtml()` devuelven `false` ante una entrada no vacía inválida y dejan intacto el documento actual.

```ts
nabi.setHtml('<p>Imported document</p>')
```

JSON y HTML son entradas no confiables. NABI NOTE las lee mediante los wings registrados y sus reglas permitidas, pero eso no sustituye la autorización de subida ni la política de seguridad de tu servicio.

## API usadas con frecuencia

| Tarea | API |
| --- | --- |
| Crear un editor | `createNabiWith`, `wings` |
| Montar la superficie y la barra | `mountSurface`, `mountToolbar` |
| Guardar y restaurar | `getJson`, `setJson`, `getHtml`, `setHtml` |
| Observar cambios | `nabi.onChange(listener)` |
| Deshacer y rehacer | `nabi.undo()`, `nabi.redo()` |
| Renderizar HTML en un servidor | `renderStoredHtml` de `nabi-note/ssr` |
| Añadir comportamiento a la página publicada | `attachViewer` de `nabi-note/viewer` |
| Comparar documentos | `diffDocs` de `nabi-note/diff` |

Para los tipos exactos y todos los argumentos, revisa primero las declaraciones del paquete instalado. Las herramientas de automatización también pueden usar la [referencia de API en inglés](https://nabi.saro.me/llms/api-reference.md).

## Desmontar

Desmonta en el orden inverso al de creación. No modifiques directamente el `innerHTML` de la raíz de edición; cambia documentos mediante API públicas como `setJson()`, `setHtml()` o `applyCommand()`.

```ts
function dispose() {
  toolbar.unmount()
  surface.unmount()
}
```
