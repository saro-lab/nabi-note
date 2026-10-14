---
title: Región flotante
description: Coloca texto, imágenes y tablas junto al cuerpo del texto para que los párrafos siguientes fluyan a su lado.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Región flotante

Coloca una descripción breve, una imagen o una tabla pequeña a la izquierda o a la derecha y deja que el cuerpo del texto fluya a su lado. Puedes editar el contenido de la región directamente en el mismo editor. El borde discontinuo solo aparece durante la edición; la vista previa y la vista publicada muestran únicamente el contenido y la disposición.

Coloca el cursor dentro de la región del siguiente ejemplo y cambia su lado y anchura máxima desde las herramientas de propiedades. En la vista previa puedes comprobar cómo fluye el texto sin el borde discontinuo.

<WingDemo path="/wing/block/float" />

```ts
const selected = wings().allBasic().build()
```

Las regiones flotantes están incluidas en las alas básicas. Si solo ensamblas las alas que necesitas, usa `wings().use('float')` o registra `floatWing` directamente. Registra también las alas de imágenes, tablas, listas y demás contenido que vayas a usar dentro de la región.

## Crear y colocar

Coloca el cursor en el cuerpo del texto y pulsa **Región flotante** para crear una región vacía. Los valores predeterminados son el lado derecho y una anchura máxima del 40%. Si seleccionas varios párrafos antes de pulsar, todos los párrafos alcanzados por la selección se envuelven completos en una sola región. No puedes volver a envolver una región flotante existente ni crear otra dentro de ella.

```ts
nabi.applyCommand('insertFloat', { side: 'right', w: 40 })
```

Con el cursor dentro de la región, cambia el lado y la anchura máxima con las herramientas de propiedades. Puedes elegir 20%, 30%, 40% o 50%. El porcentaje se refiere a la anchura del cuerpo del texto, no a toda la pantalla; si el contenido es corto, la región puede ser más estrecha.

```ts
nabi.applyCommand('setFloatSide', { side: 'left' })
nabi.applyCommand('setFloatWidth', { w: 30 })
```

Pegar texto, imágenes y tablas, convertir bloques y subir archivos mantiene el contenido dentro de la región. Al eliminar una tabla interna, solo desaparece esa tabla. No se pueden insertar ni convertir bloques internos cuando la selección abarca a la vez el interior y el exterior de la región.

El botón **Deshacer región flotante**, junto al valor de anchura, devuelve el contenido al cuerpo del texto sin eliminarlo. Crear, cambiar la disposición y desenvolver admiten deshacer y rehacer.

```ts
nabi.applyCommand('unwrapFloat')
```

## Cómo fluye el texto alrededor

Los párrafos siguientes fluyen junto a la región y vuelven a ocupar toda la anchura del texto cuando esta termina. El siguiente título, tabla, bloque de código, separador o nueva región flotante empieza debajo de la región anterior.

Cuando la anchura del texto es inferior a `36rem`, la región y el cuerpo del texto se disponen en una sola columna. Al imprimir también se usa una columna, pero se conservan el lado y la anchura máxima guardados. La vista de comparación de documentos conserva el lado y la anchura máxima de cada región, pero muestra el bloque siguiente por separado debajo para facilitar la lectura de los cambios.

## Guardar y cargar

El JSON guarda `a.side` y `a.w` del nodo `float`, junto con sus bloques internos. El HTML usa los atributos `data-nabi-float` y `data-nabi-float-width` en un `div` dentro de un párrafo de objeto normal.

```html
<div data-nabi-p>
  <div data-nabi-float="right" data-nabi-float-width="40">
    <p>Una descripción para colocar junto al cuerpo del texto.</p>
  </div>
</div>
<p>Este párrafo continúa junto a la región.</p>
```

La exportación a Markdown conserva la región como HTML. No se importan estilos CSS `float` arbitrarios, así que usa JSON o HTML generado por NABI NOTE para guardar y restaurar. Conecta las mismas alas y el mismo CSS en el editor, SSR, vista previa y vista publicada para mantener el lado y la anchura.

## Estilos CSS

Personaliza los colores y el espaciado de la región con el selector `[data-nabi-float]`. El párrafo exterior controla la disposición y la anchura máxima, por lo que no debes sobrescribir directamente `float`, `display` ni la anchura.

```css
.brand-note .nabi-content [data-nabi-float] {
  background: var(--nabi-soft);
  border-radius: var(--nabi-radius);
  padding: .75rem;
}
```
