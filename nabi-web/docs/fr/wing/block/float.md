---
title: Zone flottante
description: Placez du texte, des images et des tableaux à côté du corps du texte, avec les paragraphes suivants qui s’écoulent autour.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Zone flottante

Placez une courte description, une image ou un petit tableau à gauche ou à droite et laissez le corps du texte s’écouler à côté. Le contenu de la zone se modifie directement dans le même éditeur. Une bordure pointillée apparaît uniquement pendant l’édition ; l’aperçu et la vue publiée ne conservent que le contenu et la disposition.

Placez le curseur dans la zone de l’exemple ci-dessous et utilisez les outils de propriétés pour changer son côté et sa largeur maximale. Dans l’aperçu, vous verrez le texte s’écouler sans la bordure pointillée.

<WingDemo path="/wing/block/float" />

```ts
const selected = wings().allBasic().build()
```

Les zones flottantes font partie des ailes de base. Si vous assemblez uniquement les ailes nécessaires, utilisez `wings().use('float')` ou enregistrez directement `floatWing`. Enregistrez aussi les ailes des images, tableaux, listes et autres contenus utilisés dans la zone.

## Créer et positionner

Placez le curseur dans le corps du texte et cliquez sur **Zone flottante** pour créer une zone vide. Par défaut, elle se place à droite avec une largeur maximale de 40%. Si vous sélectionnez plusieurs paragraphes auparavant, tous les paragraphes touchés par la sélection sont enveloppés intégralement dans une seule zone. Vous ne pouvez pas envelopper à nouveau une zone flottante existante ni en créer une autre à l’intérieur.

```ts
nabi.applyCommand('insertFloat', { side: 'right', w: 40 })
```

Lorsque le curseur est dans la zone, les outils de propriétés permettent de choisir la gauche ou la droite et la largeur maximale. Les largeurs proposées sont 20%, 30%, 40% et 50%. Elles sont relatives à la largeur du corps du texte, et non de l’écran entier ; un contenu court peut rendre la zone plus étroite.

```ts
nabi.applyCommand('setFloatSide', { side: 'left' })
nabi.applyCommand('setFloatWidth', { w: 30 })
```

Le collage de texte, d’images et de tableaux, la conversion de blocs et les téléversements restent dans la zone. Supprimer un tableau interne ne supprime que ce tableau. L’insertion ou la conversion des blocs internes n’est pas disponible lorsqu’une sélection couvre à la fois l’intérieur et l’extérieur de la zone.

Le bouton **Dissocier la zone flottante**, à côté de la valeur de largeur, remet le contenu dans le corps du texte sans le supprimer. La création, les changements de disposition et la dissociation peuvent être annulés et rétablis.

```ts
nabi.applyCommand('unwrapFloat')
```

## Écoulement du texte autour de la zone

Les paragraphes suivants s’écoulent à côté de la zone, puis reprennent toute la largeur du texte après sa fin. Le prochain titre, tableau, bloc de code, séparateur ou nouvelle zone flottante commence sous la zone précédente.

Lorsque la largeur du texte est inférieure à `36rem`, la zone et le texte sont disposés sur une seule colonne. L’impression utilise aussi une colonne tout en conservant le côté et la largeur maximale enregistrés. La vue de comparaison des documents conserve le côté et la largeur maximale de chaque zone, mais affiche le bloc suivant séparément en dessous pour faciliter la lecture des changements.

## Enregistrer et charger

Le JSON enregistre `a.side` et `a.w` du nœud `float` ainsi que ses blocs internes. Le HTML utilise les attributs `data-nabi-float` et `data-nabi-float-width` sur un `div` à l’intérieur d’un paragraphe d’objet normal.

```html
<div data-nabi-p>
  <div data-nabi-float="right" data-nabi-float-width="40">
    <p>Une description à placer à côté du corps du texte.</p>
  </div>
</div>
<p>Ce paragraphe se poursuit à côté de la zone.</p>
```

L’export Markdown conserve la zone sous forme de HTML. Les styles CSS `float` arbitraires ne sont pas importés ; utilisez donc du JSON ou du HTML généré par NABI NOTE pour enregistrer et restaurer le contenu. Connectez les mêmes ailes et le même CSS dans l’éditeur, le SSR, l’aperçu et la vue publiée pour conserver le côté et la largeur.

## Styles CSS

Personnalisez les couleurs et les espacements de la zone avec le sélecteur `[data-nabi-float]`. Le paragraphe extérieur gère la disposition et la largeur maximale ; ne remplacez donc pas directement `float`, `display` ou la largeur.

```css
.brand-note .nabi-content [data-nabi-float] {
  background: var(--nabi-soft);
  border-radius: var(--nabi-radius);
  padding: .75rem;
}
```
