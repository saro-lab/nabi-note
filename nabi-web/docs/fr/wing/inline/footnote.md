---
title: "Note de bas de page"
description: "Reliez des explications complémentaires à des numéros dans le texte et à une liste en fin de document."
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Note de bas de page

Reliez des explications complémentaires à des numéros dans le texte et à une liste en fin de document.

Saisissez le texte avec le bouton de note de bas de page de la barre d’outils pour insérer une note au curseur. Si du texte est sélectionné, la note est ajoutée à la fin de la sélection sans remplacer le texte. Les numéros ne sont pas enregistrés ; ils suivent automatiquement l’ordre du document.

Cliquez sur un numéro dans le texte pour modifier son contenu dans la ligne des propriétés. Utilisez l’outil de suppression ou appuyez deux fois sur Backspace ou Delete à côté de la note pour la sélectionner puis la supprimer. La liste en dessous est en lecture seule et disparaît lorsqu’il n’y a plus de notes.

Dans l’aperçu et sur les pages publiées avec le viewer, survolez un numéro, cliquez dessus ou touchez-le pour lire son contenu. Celui-ci accepte une seule ligne de texte brut et s’affiche en caractères sans empattement à 0,875 fois la taille de base du corps du texte. Le HTML s’affiche littéralement.

<WingDemo path="/wing/inline/footnote" />

```ts
const selected = wings().use('fn').build()
```
