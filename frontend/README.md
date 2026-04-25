# WeLab Cosmetic - Frontend (Angular)

Ce dossier contient l'interface utilisateur développée avec **Angular 19**.
Il s'agit d'une **Single Page Application (SPA)** communicant avec l'API Symfony.

> Le frontend tourne entièrement via **Docker**.

## Principes d'Architecture Front-End

- **Design WeLab** : Variables CSS globales centralisées dans `styles.css`
  reproduisant la charte graphique du laboratoire (couleurs, typographie, espacements).
- **Séparation des préoccupations** : HTML, CSS et TypeScript sont strictement
  séparés dans leurs propres fichiers pour une meilleure maintenabilité.
- **Standalone Components** : Tous les composants Angular utilisent l'architecture
  standalone (sans NgModule), conformément aux bonnes pratiques Angular 19.
- **Interceptor JWT** : Le token d'authentification est automatiquement injecté
  dans toutes les requêtes HTTP via `auth-interceptor.ts`, sans duplication de code.
- **Requêtes Asynchrones** : Utilisation d'`HttpClient` et de `RxJS` (Observables)
  pour toute la communication avec l'API backend.

## Prérequis
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installé et démarré
- Git

## Installation et Démarrage

### 1. Démarrer les conteneurs Docker (depuis la racine du projet)
```bash
docker compose up -d
```
Le conteneur `welab-angular` démarre automatiquement. Au premier lancement,
il installe Angular CLI et toutes les dépendances npm. Cela peut prendre
plusieurs minutes.

### 2. Vérifier que Angular est bien démarré
```bash
docker logs welab-angular -f
```
Attendez le message `✔ Compiled successfully`.
Appuyez sur `Ctrl+C` pour quitter l'affichage des logs
(les conteneurs continuent de tourner).

### 3. Accéder à l'application
Ouvrez votre navigateur sur `http://localhost:4200`.

---

## Structure du projet
src/
├── styles.css                    → Variables CSS globales WeLab (couleurs, polices)
└── app/
├── app.routes.ts             → Définition de toutes les routes de l'application
├── home/                     → Page d'accueil publique
├── join/                     → Page rejoindre une session (côté joueur)
├── auth/login/               → Page de connexion administrateur
├── admin/
│   ├── dashboard/            → Tableau de bord admin (sessions, stats, résultats)
│   ├── games-list/           → Liste des jeux disponibles par session
│   └── game-edit/            → Éditeur de questions et ingrédients par jeu
├── session/
│   ├── session/              → Page d'introduction de la session (côté joueur)
│   └── association-game/     → Jeu d'association termes & définitions (drag & drop)
├── game/
│   ├── crossword/            → Jeu de mots croisés (grille interactive)
│   ├── formulation/          → Jeu de formulation de produit (sélection d'ingrédients)
│   └── results/              → Page de résultats finale
├── core/
│   ├── services/             → Services HTTP (auth, session, jeux, participation)
│   ├── interceptors/         → Interceptor JWT (injection automatique du token)
│   └── guards/               → Guard d'authentification (protection des routes admin)
└── interfaces/               → Interfaces TypeScript partagées

## Accès à l'application

| Page | URL | Rôle |
|------|-----|------|
| Accueil | http://localhost:4200 | Public |
| Rejoindre une session | http://localhost:4200/join | Joueur |
| Connexion admin | http://localhost:4200/login | Admin |
| Dashboard admin | http://localhost:4200/dashboard | Admin |
| Gérer les jeux | http://localhost:4200/dashboard/games | Admin |