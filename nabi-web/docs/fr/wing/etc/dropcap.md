---
title: Lettrine
description: Commencer le texte du corps par une première lettre de grande taille.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Lettrine

Placez la première lettre d'un paragraphe à une taille plus grande et laissez les lignes suivantes s'écouler à côté. Il s'agit d'une mise en forme au niveau du paragraphe, elle ne s'applique donc pas à une partie seulement d'un mot sélectionné.

La vue de publication et la vue d'édition conservent la même apparence. Lors de l'édition, la première lettre est enveloppée dans un élément réel afin que les positions du curseur et de la suppression ne dérivent pas ; cet élément n'est pas inclus dans le contenu du document sauvegardé.

<WingDemo path="/wing/etc/dropcap" />

```ts
const selected = wings().use('dc').build()
```

## Styles CSS

La vue de publication et la vue d'édition utilisent des sélecteurs différents pour la première lettre. La vue de publication utilise `[data-nabi-dropcap="1"]::first-letter`, tandis que la vue d'édition utilise l'élément réel `[data-nabi-dropcap-letter]`. Lors de la modification de valeurs visibles telles que la couleur, la police ou la taille, écrivez les deux sélecteurs ensemble afin que l'édition et la sortie publiée aient le même aspect.

```css
.article-body:not(.nabi-editing) [data-nabi-dropcap="1"]::first-letter,
.nabi-content.nabi-editing [data-nabi-dropcap-letter] {
  color: var(--nabi-accent);
  font-family: var(--nabi-font-serif);
}
```

Si vous modifiez la taille et la hauteur de ligne, appliquez les mêmes valeurs aux deux sélecteurs.

```css
.article-body:not(.nabi-editing) [data-nabi-dropcap="1"]::first-letter,
.nabi-content.nabi-editing [data-nabi-dropcap-letter] {
  font-size: 5.5em;
  line-height: .85;
}
```

Les lettrines calculent l'écoulement des lignes autour de la première lettre, donc modifier un seul côté ou rendre les valeurs trop grandes peut rompre la forme WYSIWYG. Évitez également d'ajouter une nouvelle règle `::first-letter` à l'éditeur. Dans l'éditeur, mettez en style uniquement l'existant `[data-nabi-dropcap-letter]`.
