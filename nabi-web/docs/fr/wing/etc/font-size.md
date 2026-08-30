---
title: Taille de police
description: Modifiez la taille du texte selon les étapes autorisées.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Taille de police

Modifiez le texte sélectionné pour qu'il corresponde à une étape de taille. Si une plage est sélectionnée, l'étape s'applique à cette plage ; si seul un curseur (caret) est présent, elle modifie la taille du texte du paragraphe actuel. Les données stockées conservent uniquement les étapes autorisées, et non des valeurs arbitraires telles que `px`.

<WingDemo path="/wing/etc/font-size" />

```ts
const selected = wings().use('fs', {
  values: ['sm', 'lg', 'xl'],
}).build()
```

Si `values` est omis, les étapes `xs`, `sm`, `lg` et `xl` sont utilisées. Si vous restreignez la liste, les autres étapes déjà présentes dans les documents plus anciens seront supprimées lors du chargement.

## Styles CSS

Vous pouvez modifier les tailles via des sélecteurs d'étape stockée tels que `.nabi-content [data-nabi-size="xs"]`. N'inventez pas d'étapes arbitraires qui ne figurent pas dans le document ; ajustez le CSS uniquement au sein des `values` enregistrées.

```css
.article-body [data-nabi-size="xs"] { font-size: .78em; }
.article-body [data-nabi-size="sm"] { font-size: .9em; }
.article-body [data-nabi-size="lg"] { font-size: 1.3em; }
.article-body [data-nabi-size="xl"] { font-size: 1.65em; }
```

Conserver une différence de taille constante entre les étapes préserve la signification choisie par l'auteur dans l'éditeur lorsque le document est publié.
