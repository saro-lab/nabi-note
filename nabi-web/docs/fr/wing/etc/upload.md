---
title: Téléversement de fichiers
description: Connectez le transfert de fichiers à l'uploader de votre service.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Téléversement de fichiers

Connectez les opérations de sélection de fichiers, de glisser-déposer et de collage qui ne contiennent que des fichiers à un flux de téléversement. La démonstration sur cette page n'envoie pas de fichiers à un serveur ; dans un service réel, vous devez connecter un uploader qui reçoit un fichier et retourne une URL.

Pour insérer les résultats du téléversement en tant que blocs d'image, vous avez besoin de la wing image. Pour insérer d'autres fichiers en tant que liens de pièce jointe, vous avez besoin de la wing lien. Si votre service accepte les deux formats, sélectionnez explicitement les deux wings. Pendant le téléversement, l'éditeur est verrouillé, et les fichiers réussis sont insérés ensemble en une seule étape d'annulation.

<WingDemo path="/wing/etc/upload" />

```ts
const selected = wings()
  .use('img')
  .use('a')
  .use('upload', { allowLocalUrls: false })
  .build()
```

Si vous sélectionnez uniquement `upload`, il fournit automatiquement celle des dépendances image ou lien qui manque. Le transfert est connecté avec `mountUpload()`, et l'interface utilisateur de progression de l'écran d'édition est généralement connectée avec `mountUploadView()`. Si le serveur retourne des URL HTTPS, l'option d'URL locale n'est pas nécessaire.

## Contrat d'API du serveur

NABI NOTE n'envoie pas les fichiers à votre serveur par lui-même. La fonction `uploader` envoie un fichier au serveur et, en cas de succès, retourne uniquement une URL publique ou authentifiée `https:`. Le contrat d'API le plus simple ressemble à ceci.

```text
POST /api/uploads
Content-Type: multipart/form-data
Field name: file

Success: { "url": "https://cdn.example.com/uploads/8f2c.webp" }
Failure: 4xx or 5xx response
```

Le serveur ne doit pas faire confiance uniquement au nom de fichier original, à l'extension ou à la valeur MIME envoyés par le navigateur. Vérifiez d'abord l'authentification et les autorisations, limitez la taille des fichiers pendant le streaming, et inspectez le type réel du fichier. Créez le nom enregistré sur le serveur. Pour les images, réencodez-les ou créez des vignettes si nécessaire. Si les fichiers téléversés ne doivent pas être téléchargeables par tout le monde, retournez un chemin de téléchargement nécessitant une authentification au lieu d'une URL publique.

| Vérifier sur le serveur | Pourquoi |
| --- | --- |
| Utilisateur connecté et autorisation de téléversement | Empêche l'écriture dans le stockage d'un autre utilisateur |
| Taille par fichier et taille totale de la requête | Empêche l'épuisement de la mémoire et du stockage |
| Type MIME réel autorisé et extension | Bloque les fichiers exécutables avec des extensions renommées |
| Nom stocké aléatoire et stockage isolé | Empêche la manipulation de chemin et l'écrasement de fichiers existants |
| Accès à l'URL de réponse et politique d'expiration | Empêche l'exposition de fichiers privés par l'URL seule |

Les `extensions` et `maxFileSize` côté client ne sont que la première étape pour fournir un retour rapide à l'utilisateur. Appliquez les mêmes limites sur le serveur également.

## Connexion de l'uploader dans le navigateur

L'exemple ci-dessous est la connexion réelle attendue par NABI NOTE. Il utilise `XMLHttpRequest` car le `fetch()` standard du navigateur ne fournit pas de progression de téléversement. Retournez uniquement l'`url` de la réponse du serveur ; les images deviennent des blocs d'image, et les autres fichiers deviennent des liens de pièce jointe.

```ts
import {
  createNabiWith,
  mountSurface,
  mountUpload,
  mountUploadView,
  wings,
  type UploadTask,
} from 'nabi-note'

const content = document.querySelector<HTMLElement>('#content')!
const { nabi, registry } = createNabiWith(
  wings().use('img').use('a').use('upload').build(),
  { locale: 'fr' },
)

function sendUpload(task: UploadTask): Promise<{ uri: string } | null> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest()
    request.open('POST', '/api/uploads')
    request.responseType = 'json'

    request.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) task.onProgress((event.loaded / event.total) * 100)
    })

    request.addEventListener('load', () => {
      const url = request.response?.url
      if (request.status >= 200 && request.status < 300 && typeof url === 'string') {
        resolve({ uri: url })
      } else {
        resolve(null)
      }
    })
    request.addEventListener('error', () => reject(new Error('Upload request failed.')))
    task.signal.addEventListener('abort', () => request.abort(), { once: true })

    const body = new FormData()
    body.append('file', task.file as File, task.name)
    request.send(body)
  })
}

let uploadView: ReturnType<typeof mountUploadView>
const upload = mountUpload({
  nabi,
  root: content,
  uploader: sendUpload,
  extensions: ['png', 'jpg', 'jpeg', 'webp', 'pdf'],
  maxFileSize: 10 * 1024 * 1024,
  maxTotalSize: 20 * 1024 * 1024,
  locale: 'fr',
  onStart: (tasks) => uploadView.start(tasks),
  onProgress: (id, percent) => uploadView.progress(id, percent),
  onSettle: () => uploadView.settle(),
  onDone: () => uploadView.done(),
})

uploadView = mountUploadView({ nabi, surface: content, upload, locale: 'fr' })

const surface = mountSurface({
  nabi,
  registry,
  root: content,
  fileSink: upload.take,
  locale: 'fr',
})
```

Connectez `fileSink: upload.take` pour que les opérations de glisser-déposer et de collage qui ne contiennent que des fichiers entrent dans le flux de téléversement. L'interface de la wing upload transmet les résultats du bouton de sélection de fichiers à `upload.take()`. Pendant le téléversement, l'éditeur est verrouillé, et les fichiers réussis de chaque lot sont insérés en une seule étape d'annulation. `upload.cancel()` ou le bouton d'annulation dans `uploadView` annule les requêtes en cours via `AbortSignal`.

## Échec et nettoyage

Si le serveur retourne une réponse d'erreur ou si l'`uploader` retourne `null`, ce fichier n'est pas inséré dans le document. Les autres fichiers du même lot continuent d'être traités. Si la limite de taille totale est dépassée, le lot entier ne démarre pas. Lors de la fermeture de l'écran, démontez les éléments dans l'ordre inverse de leur création.

```ts
function dispose() {
  surface.unmount()
  uploadView.unmount()
  upload.unmount()
}
```

Pendant le développement uniquement, vous pouvez utiliser des URL `blob:` pour un aperçu immédiat. Dans ce cas, activez `allowLocalUrls: true` dans l'assemblage de l'éditeur, la wing image et la wing upload. Si les téléversements réels du serveur retournent des URL HTTPS, il est plus sûr de ne pas activer cette option.

## Styles CSS

Les fichiers ordinaires terminés sont affichés via la wing lien en tant que `a[data-nabi-file]`. Utilisez ce sélecteur lorsque vous souhaitez uniquement modifier l'apparence de la pièce jointe dans la vue publiée.

```css
.article-body a[data-nabi-file] {
  padding: .3em .6em;
  border: 1px solid var(--nabi-line);
  border-radius: 8px;
  background: var(--nabi-soft);
}
```

Les résultats du téléversement d'images suivent le CSS de la wing image. La progression du téléversement apparaît uniquement dans la vue d'édition, donc le CSS de la vue publiée n'a pas besoin de créer un état de progression.
