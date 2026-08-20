---
title: Subíndice
---

# Subíndice

## Descripción

`subscriptWing` es el propietario (claim) de `<sub>`. Se usa en fórmulas químicas o
en números que se escriben abajo.

- La única etiqueta que reconoce es `<sub>`. No conserva atributos.
- No tiene atajo en el modo pista ni tecla rápida. En la barra de herramientas forma
  grupo con el superíndice bajo `script` (el superíndice va primero, según el orden de
  registro).
- Si lo pulsa con texto seleccionado, funciona como interruptor.
- El aspecto lo pone la hoja de estilos que este wing lleva en `Wing.styles`.

```css
.nabi-content sub, .nabi-content sup { font-size: .72em; line-height: 0; position: relative; }
.nabi-content sub { vertical-align: sub; }
```

**Esta hoja se comparte con el superíndice.** Los dos wings llevan el mismo texto, así
que aunque se registren ambos, solo se inyecta **una vez** en el documento
(`collectSheets` retira las hojas repetidas). En el valor guardado (HTML) solo queda la
etiqueta `<sub>`; el estilo en sí no viaja con él.

## Ejemplo de uso

```ts
import { createNabiWith, mountSurface, mountToolbar, subscriptWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// la lista de wings construye juntos el conocimiento de tipo, los comandos y el ensamblador — eso es `registry`
const { nabi, registry } = createNabiWith([subscriptWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/inline/subscript" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
