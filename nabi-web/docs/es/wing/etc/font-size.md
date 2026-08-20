---
title: Tamaño del texto
---

# Tamaño del texto

## Descripción

`fontSizeWing` (nombre `fs`) es una **marca de valor en línea.** Es formato que se pone
sobre el texto, no un atributo de párrafo. Al salir se dibuja como
`<span data-nabi-size="lg">`.

Los valores son cuatro — `xs`, `sm`, `lg`, `xl` — y el tamaño predeterminado no es un
quinto valor, sino **que directamente no hay atributo.**

- Hace pareja con la tipografía (`tf`) — un solo wing lleva todos los valores, y el
  lugar para elegir es la barra contextual. Solo que la tipografía despliega cuatro
  casillas, y el tamaño usa una sola escala.
- **La barra contextual usa una escala (`range`).** Como el tamaño es un valor con
  orden (de pequeño a grande), en vez de desplegar casillas se desliza con un solo
  control. El valor puesto ahora se ve en la posición del control, y junto a él aparece
  una etiqueta con el nombre de ese valor.
- **La primera casilla de la escala es "predeterminado".** La razón de que sea la
  primera y no la del medio es que la lista va de pequeño a grande, y ese primer lugar
  es justamente el de "sin ningún atributo puesto". Al moverse a esa casilla, no se
  escribe un valor como `base`, sino que **se le quita la marca.**
- **La etiqueta de la casilla sigue el idioma local** — en español es "Predeterminado ·
  Muy pequeño · Pequeño · Grande · Muy grande".
- Al pulsar el botón de la barra de herramientas se aplica **`lg` (grande)**. Como la
  escala empieza por lo pequeño, si se dejara sin más se aplicaría la primera casilla,
  `xs`, y nadie espera que al pulsar el botón de tamaño la letra se haga más pequeña.
- **Con solo cursor, se aplica a todo el párrafo.** Es raro querer agrandar solo una
  palabra, así que sin un rango seleccionado apunta al párrafo entero (a diferencia del
  resaltado y el color de texto, que apuntan solo al tramo de la marca actual).
- Si se pulsa en un párrafo sin ni una letra, queda como **reserva** — el próximo
  carácter que se escriba sale ya con ese tamaño.
- Si se vuelve a aplicar el mismo valor, se quita.

## Ejemplo de uso

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, fontSizeWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// la lista de wings arma juntos el conocimiento de tipo, los comandos y el ensamblador — eso es `registry`
const { nabi, registry } = createNabiWith([fontSizeWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/etc/font-size" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
