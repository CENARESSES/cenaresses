# Site web CENARESSES

Ce dépôt contient les deux parties du site du **Centre Africain de Recherches
et d'Études en Sciences Sociales, Environnementales et de la Santé
(CENARESSES)** :

```
cenaresses-website/
├── frontend/   → Site public (React), déployé sur GitHub Pages
└── backend/    → API de contenu (Express), déployée séparément
```

## 1. Frontend (`frontend/`)

Application React (Create React App) contenant le site vitrine et le
panneau d'administration (ajout/modification/suppression de projets,
publications, membres de l'équipe et actualités).

### Installation et test en local
```bash
cd frontend
npm install
npm start
```
Le site s'ouvre sur `http://localhost:3000`.

### Déploiement sur GitHub Pages
```bash
cd frontend
npm run deploy
```
Ceci exécute `npm run build` puis publie automatiquement le contenu du
dossier `build/` sur la branche `gh-pages` du dépôt GitHub, à l'adresse
indiquée dans le champ `homepage` de `package.json` :
`https://CENARESSES.github.io/cenaresses-website/`

⚠️ **Avant de déployer en production**, ouvrez `src/CenaressesWebsite.jsx`
et remplacez :
```js
const API_BASE_URL = 'http://localhost:4000';
```
par l'URL publique de votre backend déployé (voir section suivante).

## 2. Backend (`backend/`)

Petit serveur Express qui sert et modifie le contenu du site
(`backend/data/content.json`). Voir `backend/README.md` pour le détail
complet des endpoints, de la sécurité et des options de déploiement
(Render, Railway, Fly.io, VPS).

### Installation et test en local
```bash
cd backend
cp .env.example .env    # puis modifiez ADMIN_PASSWORD dans .env
npm install
npm start
```
Le serveur démarre sur `http://localhost:4000`.

## 3. Ordre de mise en ligne recommandé

1. Déployez d'abord le **backend** (Render/Railway/Fly.io) et notez son URL publique.
2. Renseignez cette URL dans `API_BASE_URL` du frontend.
3. Déployez ensuite le **frontend** sur GitHub Pages (`npm run deploy`).
4. Vérifiez que le site chargé en production affiche bien le contenu venant du backend (et non le contenu par défaut de secours).

## 4. Contenu à compléter avant la mise en ligne

Dans `backend/data/content.json`, les 4 membres de l'équipe sont encore
des valeurs à renseigner (`"À compléter"`). Pensez à les remplacer par
les vrais noms, rôles et spécialités avant la publication.
