---
title: Usar con CDN
description: Cómo usar NABI NOTE solo con etiquetas HTML, sin ninguna herramienta de build.
---

# Usar con CDN

<CdnDemo />

---

## Estructura básica y cómo funciona

El ejemplo de arriba funciona con un solo archivo HTML, sin bundler ni herramienta de build.

### Dos etiquetas HTML para integrarlo

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/nabi-note@latest/dist/nabi.css">
<script src="https://cdn.jsdelivr.net/npm/nabi-note@latest"></script>
```

Todo lo que exporta el paquete queda colgado del objeto global `NabiNote` (o su forma corta `N`). **La hoja de estilos hay que enlazarla a mano.** Las funciones de montaje no inyectan CSS por su cuenta, así que si falta la etiqueta `<link>`, todo se muestra sin ningún estilo aplicado.

### Estructura HTML

```html
<div id="app" class="nabi">                    <!-- raíz: tema de color, bordes, tipografía -->
  <div id="chrome" class="nabi-toolbar">        <!-- cabecera fija que envuelve la barra de herramientas y la barra contextual -->
    <div class="nabi-toolbar-row">
      <span id="tools"></span>                 <!-- botones de vista previa y pantalla completa (alineados a la derecha) -->
      <div id="toolbar"></div>
    </div>
    <div id="context"></div>                   <!-- barra contextual que aparece dinámicamente según la posición del cursor -->
  </div>
  <div id="editor" class="nabi-content" contenteditable="true"></div>
</div>
```

El `id` de cada elemento se puede elegir libremente. Lo que se le pasa a las funciones de montaje es el objeto DOM real, no una cadena de id. Las cuatro clases (`nabi`, `nabi-toolbar`, `nabi-toolbar-row`, `nabi-content`) son clases obligatorias que usa la hoja de estilos, así que hay que dejarlas tal cual. Si no necesita vista previa ni pantalla completa, puede omitir juntos el elemento `<span id="tools">` y la llamada a `mountViewTools`. `mountViewTools` construye automáticamente su propia zona de botones dentro del contenedor que se le pase.

### Elegir los wings

Elegir los wings se hace con una sola cadena del constructor. El ejemplo de arriba parte de los 26 wings básicos —los que funcionan sin integración adicional del host—, agrega guardar y abrir, y limita las opciones de tipografía a dos.

```js
var wings = N.wings().allBasic().use('save').use('open').use('tf', { values: ['sans', 'serif'] })
```

- `all()` activa todos los wings oficiales. Si no se llama, los wings por defecto no se incluyen — solo se registran los que se declaren explícitamente con `use()`.
- `allBasic()` selecciona, de entre los wings oficiales, **los 26 que funcionan sin integración adicional de la aplicación anfitriona.** Subida, guardar y abrir quedan fuera porque necesitan algo que el host debe proveer, como un endpoint de servidor o un almacenamiento de archivos — por eso el ejemplo de arriba declara guardar y abrir aparte con `use()`.
- `use('nombre', opciones?)` agrega un wing en concreto. Si se llama sobre uno ya registrado, solo actualiza sus opciones (por ejemplo, `use('tf', { values: [...] })`). Si un wing depende de otro (la subida necesita el wing de imagen o el de enlace), esa dependencia se registra automáticamente junto con él.
- `drop('nombre')` quita un wing de la lista registrada. Si se intenta quitar uno del que depende otro wing, lanza una excepción indicando los wings relacionados que habría que quitar junto con él.
- El nombre del wing es la clave corta y única (`w`) que se guarda en el nabi-tree (por ejemplo, `b` para negrita, `tf` para tipografía, `upload`, etc.). La lista completa se puede consultar con `console.log(N.wingNames())`.
- **Pasar un nombre u opción incorrectos lanza un error de inmediato.** Errores de tipeo, claves de opción no soportadas, valores fuera del rango válido, etc., generan un mensaje de error que indica cómo corregirlo.

`createNabiWith` puede recibir directamente una instancia del constructor, así que no es necesario llamar a `build()` por separado. También se pueden pasar los wings como un array directamente.

```js
var wings = [N.boldWing, N.italicWing, N.headingWing, N.bulletListWing]
```

Un wing personalizado que se haya creado se pasa como objeto (`N.wings().all().use(customWing)`). Se recomienda que el identificador `w` de un wing personalizado empiece con el prefijo `ex` (por ejemplo, `exNote`) para evitar colisiones con los identificadores de los wings oficiales. Para ver cómo construirlo en detalle, consulte [{{ t('menu_wing_custom') }}](../wing/custom).

Las especificaciones detalladas de cada wing se pueden consultar en el menú [{{ t('menu_wing') }}](../wing/inline/bold).

### Diálogos y notificaciones

El ejemplo de arriba conecta, mediante la opción `ask`, el `alert` y el `confirm` propios del navegador. Por ejemplo, un mensaje de confirmación como "Hay contenido sin guardar. ¿Desea continuar?" se puede mostrar como un popup nativo del navegador.

Si no se pasa `ask`, la respuesta por defecto de los cuadros de confirmación se procesa como cancelar (`false`), y los mensajes simples de aviso se muestran automáticamente con la interfaz de toast integrada en el núcleo, debajo de la barra de herramientas. Para más detalles, consulte [{{ t('menu_intro_usage') }}](./usage).

`ask` también incluye una función `choose` para elegir una opción entre varias. Sin embargo, **el popup de selección de formato al pegar desde el portapapeles funciona por defecto sin ninguna configuración adicional** — al montarse `mountToolbar`, el núcleo conecta automáticamente su propia interfaz de popup, así que cualquier página que use la barra de herramientas obtiene ese popup de selección sin implementación extra. Solo hace falta pasar `ask.choose` si se quiere sustituirlo por una interfaz modal propia.

### Métodos de entrada y salida

| Método | Descripción |
|---|---|
| `nabi.getHtml()` | devuelve el HTML para guardar y publicar |
| `nabi.getJson()` | devuelve los datos del árbol de nabi (JSON) |
| `nabi.setHtml(html)` · `nabi.setJson(json)` | reemplaza el documento con datos nuevos |
| `nabi.onChange(fn)` | registra un listener para los cambios del documento |
| `N.renderStoredHtml(json, registry)` | convierte un árbol de nabi en HTML sin usar el editor (ver [Visor de solo lectura](#visor-de-solo-lectura-viewer) más abajo) |

---

## Direcciones de distribución CDN

Para fijar una versión concreta, indique el número de versión en la URL del CDN. Se admiten tanto jsDelivr como unpkg.

Una URL sin versión indicada (`/npm/nabi-note`) puede hacer que el script y el CSS queden en versiones distintas por problemas de caché del CDN, así que se recomienda fijar la versión o usar la etiqueta `@latest`.

| Tipo | Dirección |
|---|---|
| **Script empaquetado (última)** | `https://cdn.jsdelivr.net/npm/nabi-note@latest` |
| **Script empaquetado (versión fija)** | <code>{{ CDN_BUNDLE }}</code> |
| **Hoja de estilos (última)** | `https://cdn.jsdelivr.net/npm/nabi-note@latest/dist/nabi.css` |
| **Hoja de estilos (versión fija)** | <code>{{ CDN_SHEET }}</code> |
| **Script empaquetado (unpkg)** | `https://unpkg.com/nabi-note` |

El paquete del CDN es idéntico al resultado de build en `dist/` dentro del paquete publicado en npm.

---

## Visor de solo lectura (Viewer)

En una página que solo **muestra** un documento HTML guardado, no es necesario crear una instancia del editor. Basta con enlazar la misma hoja de estilos y renderizar el HTML dentro de un contenedor `.nabi-content` para obtener el mismo aspecto que tenía en el editor.

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/nabi-note@latest/dist/nabi.css">

<div class="nabi-content">
  <!-- cadena HTML guardada con nabi.getHtml() -->
</div>
```

Si el documento se guardó **en forma de árbol de nabi (JSON)**, se puede llamar a la función de renderizado para convertirlo en HTML con JavaScript puro. Recibe como argumentos los datos JSON guardados y la lista de wings registrados (`registry`).

```html
<script>
  var registry = N.makeRegistry(N.wings().all().build())

  var saved = [{ w: 'p', ch: ['una línea de comentario'] }]   // árbol de nabi cargado desde el servidor
  document.querySelector('.nabi-content').innerHTML = N.renderStoredHtml(saved, registry)
</script>
```

Si no es un árbol de nabi válido, devuelve `null`, y el resultado del renderizado es idéntico, carácter por carácter, al que produce el `getHtml()` de una instancia del editor — se aplican las mismas reglas de filtrado de XSS. Como no depende del DOM, funciona igual en un servidor (Node.js, etc.) (ver [{{ t('menu_intro_ssr') }}](./ssr)).

En un entorno de servidor que use el paquete de npm, se usa el módulo ligero **`nabi-note/ssr`** en lugar del bundle global — solo incluye la lógica necesaria para renderizar, así que el área de edición y el código de UI nunca terminan en el bundle del servidor.

La hoja de estilos CSS **incluye los estilos de todos los wings.**

El formato básico se expresa solo con CSS, pero **ordenar tablas y resaltar la sintaxis del código requieren JavaScript del lado del cliente.** Si se necesita ordenar filas al hacer clic en el encabezado de columna, o tokenizar y colorear el código, se puede conectar el runtime ligero del visor.

```html
<script type="module">
  import { attachViewer } from 'https://cdn.jsdelivr.net/npm/nabi-note@latest/dist/viewer/index.js'

  attachViewer(document.querySelector('.nabi-content'), { locale: 'es' })
</script>
```

- El documento se muestra correctamente incluso sin conectar el visor — solo se pierden el ordenamiento de tablas y el coloreado de código.
- El ordenamiento de tablas solo funciona en las tablas donde se activó esa opción en el editor (marcadas con el atributo `data-nabi-sortable`).
- El resaltado de sintaxis de código viene con un tokenizador integrado, sin depender de nada externo. Para usar un resaltador externo como Shiki, se puede pasar mediante la opción `{ locale: 'es', highlight }`.
- El bundle global `NabiNote` no incluye el punto de entrada del visor — se distribuye por separado como `nabi-note/viewer` para mantener livianas las páginas de solo lectura.

---

## Próximos documentos

- [{{ t('menu_intro_usage') }}](./usage) — instalación vía npm y el uso detallado del editor
- [{{ t('menu_wing_custom') }}](../wing/custom) — crear un nuevo wing de formato personalizado

<script setup lang="ts">
import CdnDemo from '../../.vitepress/ui/CdnDemo.vue'
import { useTranslate } from '../../.vitepress/src/langs.ts'
// el número de versión se referencia dinámicamente desde la versión del paquete
import { CDN_BUNDLE, CDN_SHEET } from '../../.vitepress/src/version.ts'

const { t } = useTranslate()
</script>
