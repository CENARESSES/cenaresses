# Backend CENARESSES

Backend minimal (Express + fichier JSON) qui remplace `window.storage` pour
que le panneau d'administration du site (ajout/modification/suppression de
projets, publications, membres de l'équipe et actualités) fonctionne une
fois le site déployé en dehors de Claude.ai.

## Installation

```bash
cd backend
npm install
```

## Lancer en local

```bash
npm start
```

Le serveur démarre sur `http://localhost:4000`. Le fichier `CenaressesWebsite.jsx`
est déjà configuré pour appeler cette adresse (`API_BASE_URL`).

## Mot de passe administrateur

Par défaut : `cenaresses2026` (défini dans `server.js`).

Pour le changer sans modifier le code, définissez une variable d'environnement
avant de lancer le serveur :

```bash
ADMIN_PASSWORD="votre_nouveau_mot_de_passe" npm start
```

## Où sont stockées les données ?

Dans `backend/data/content.json`. Chaque modification faite depuis le site
(en tant qu'administrateur) réécrit ce fichier. C'est volontairement simple :
suffisant pour un site vitrine à faible fréquence de mise à jour. Si vous
avez besoin de plusieurs administrateurs simultanés, d'un historique des
modifications, ou d'un plus gros volume de contenu, il vaudra mieux migrer
vers une vraie base de données (SQLite, PostgreSQL, etc.) — le code est
structuré pour que seule la fonction de lecture/écriture soit à remplacer.

## Déploiement

Ce backend est un petit serveur Node.js classique. Options simples :

| Plateforme | Notes |
|---|---|
| **Render** | Gratuit pour un usage léger, déploiement via GitHub |
| **Railway** | Simple, bon plan gratuit de démarrage |
| **Fly.io** | Plus de contrôle, toujours simple à configurer |
| **VPS classique** (ex. OVH, DigitalOcean) | Nécessite de gérer PM2/systemd soi-même |

⚠️ **Le fichier `content.json` doit être sur un disque persistant.** Sur
certaines plateformes (notamment les hébergements "serverless"), le système
de fichiers est réinitialisé à chaque déploiement — vérifiez que la
plateforme choisie propose un volume/disque persistant, ou passez à une
vraie base de données hébergée.

### Étapes générales de déploiement

1. Poussez le dossier `backend/` dans un dépôt Git (peut être le même dépôt
   que le frontend, ou un dépôt séparé).
2. Sur la plateforme choisie, créez un nouveau service "Web Service" /
   "Node.js app" pointant vers ce dossier.
3. Renseignez la variable d'environnement `ADMIN_PASSWORD`.
4. Une fois déployé, notez l'URL publique (ex. `https://cenaresses-backend.onrender.com`).
5. Dans `CenaressesWebsite.jsx`, remplacez :
   ```js
   const API_BASE_URL = 'http://localhost:4000';
   ```
   par l'URL de production :
   ```js
   const API_BASE_URL = 'https://cenaresses-backend.onrender.com';
   ```
6. Redéployez le frontend.

### Sécuriser les origines autorisées (CORS)

Par défaut, `cors()` autorise toutes les origines — pratique en développement,
trop permissif en production. Avant la mise en ligne finale, restreignez-le :

```js
app.use(cors({ origin: 'https://votre-site.org' }));
```

## Endpoints disponibles

| Méthode | Route | Auth requise | Description |
|---|---|---|---|
| GET | `/api/content` | Non | Récupère tout le contenu du site |
| PUT | `/api/content` | Oui (Bearer token) | Remplace tout le contenu |
| POST | `/api/admin/login` | Non | `{ "password": "..." }` → `{ "token": "..." }` |
| POST | `/api/admin/logout` | Oui | Invalide le token |
| GET | `/api/health` | Non | Vérification que le serveur répond |

## Limite connue de cette version

Les sessions admin sont stockées **en mémoire** : redémarrer le serveur
déconnecte tous les administrateurs actifs (ils doivent juste se reconnecter,
aucune perte de données). C'est un compromis acceptable pour un site à faible
trafic administrateur ; à faire évoluer vers des JWT ou une session persistante
si plusieurs personnes gèrent le site quotidiennement.
