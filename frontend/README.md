# WeLab Cosmetic - Frontend (Angular)

Ce dossier contient l'interface utilisateur (Client) développée avec **Angular**. Il s'agit d'une **Single Page Application (SPA)** communicant avec l'API Symfony.

> Ps. Le frontend tourne entièrement via **Docker**.

## Principes d'Architecture Front-End

L'intégration a été pensée avec une exigence de niveau professionnel :
- **Design Pixel-Perfect** : Reproduction exacte des maquettes IHM (Marges, ombres, couleurs).
- **Séparation des préoccupations (SoC)** : Le HTML et le CSS sont strictement séparés dans leurs propres fichiers pour une meilleure maintenabilité.
- **Variables CSS Globales** : La charte graphique de *WeLab Cosmetic* est centralisée dans `styles.css`, permettant de modifier les thèmes facilement.
- **Requêtes Asynchrones** : Utilisation d'`HttpClient` et de `RxJS` (Observables) pour la communication avec l'API (ex: Interception du JWT).

## Prérequis
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installé et démarré
- Git

## Installation et Démarrage

1. **Démarrer les conteneurs Docker (depuis la racine du projet) :**
   ```bash
   docker compose up -d
   ```
   > Le conteneur `welab-angular` démarre automatiquement. Au premier lancement, il installe Angular CLI et toutes les dépendances (équivalent d'un `npm install`). Cela peut prendre quelques minutes.

2. **Vérifier que Angular est bien démarré :**
   ```bash
   docker logs welab-angular -f
   ```
   > Attendez le message `✔ Compiled successfully`. Appuyez sur `Ctrl+C` pour quitter l'affichage des logs (les conteneurs continuent de tourner).

3. **Accéder à l'application :**
   Ouvrez votre navigateur sur `http://localhost:4200`.

## Structure principale
- `/src/styles.css` : Variables de couleurs globales WeLab.
- `/src/app/core/services/` : Services API (ex: `auth.service.ts` gérant le LocalStorage et JWT).
- `/src/app/home/` : Page d'accueil publique de la plateforme.
- `/src/app/auth/login/` : Page de connexion administrateur (Two-Way Data Binding).
- `/src/app/admin/dashboard/` : Tableau de bord dynamique affichant les données depuis l'API via `*ngFor`.
- `/src/app/game/association/` : Jeu d'association termes / définitions.
---