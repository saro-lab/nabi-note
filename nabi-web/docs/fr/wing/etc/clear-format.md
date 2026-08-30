---
title: Effacer le formatage
description: Supprimer le formatage du texte et le formatage des paragraphes de la sélection.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Effacer le formatage

Supprimez le formatage du texte de la plage sélectionnée en une seule fois. Les marques par défaut enregistrées telles que le gras, la couleur et la police, ainsi que les attributs de paragraphe tels que l'en-tête, l'alignement et la lettrine sont incluses. Appuyer sur Échap deux fois rapidement effectue la même action.

Il ne convertit pas les structures du document telles que les listes, les tableaux, les citations ou les images en texte brut. L'alignement extérieur des images et des vidéos, ainsi que les liens de pièces jointes créés par les téléchargements, restent tels qu'ils sont.

<WingDemo path="/wing/etc/clear-format" />

```ts
const selected = wings()
  .use('b')
  .use('i')
  .use('clearFormat')
  .build()
```

Les wings de formatage que vous souhaitez effacer doivent également être sélectionnées, sinon leur formatage ne peut pas être supprimé.
