---
title: Superíndice
---

# Superíndice

## Descripción

`superscriptWing` es el propietario (claim) de `<sup>`. Se usa en potencias de
unidades o en números de nota al pie.

- La única etiqueta que reconoce es `<sup>`. No conserva atributos.
- No tiene atajo en el modo pista ni tecla rápida (es uno de los wings que no muestran
  insignia, como el de subir archivo). En la barra de herramientas forma grupo con el
  subíndice bajo `script`, y este va primero según el orden de registro.
- Si lo pulsa con texto seleccionado, funciona como interruptor.
- El aspecto lo pone la hoja de estilos que este wing lleva en `Wing.styles`.

```css
.nabi-content sub, .nabi-content sup { font-size: .72em; line-height: 0; position: relative; }
.nabi-content sup { vertical-align: super; }
```

**Esta hoja se comparte con el subíndice.** Los dos wings llevan el mismo texto, así
que aunque se registren ambos, solo se inyecta **una vez** en el documento
(`collectSheets` retira las hojas repetidas). En el valor guardado (HTML) solo queda la
etiqueta `<sup>`; el estilo en sí no viaja con él.

## Ejemplo de uso

```ts
import { createNabiWith, mountSurface, mountToolbar, superscriptWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// la lista de wings construye juntos el conocimiento de tipo, los comandos y el ensamblador — eso es `registry`
const { nabi, registry } = createNabiWith([superscriptWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/inline/superscript" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
