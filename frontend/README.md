# WeLab Cosmetic - Frontend (Angular)

Ce dossier contient l'interface utilisateur (Client) développée avec **Angular**. Il s'agit d'une **Single Page Application (SPA)** communicant avec l'API Symfony.

## Principes d'Architecture Front-End

L'intégration a été pensée avec une exigence de niveau professionnel :
- **Design Pixel-Perfect** : Reproduction exacte des maquettes Figma (Marges, ombres, couleurs).
- **Séparation des préoccupations (SoC)** : Le HTML et le CSS sont strictement séparés dans leurs propres fichiers pour une meilleure maintenabilité.
- **Variables CSS Globales** : La charte graphique de *WeLab Cosmetic* est centralisée dans `styles.css`, permettant de modifier les thèmes facilement.
- **Requêtes Asynchrones** : Utilisation d'`HttpClient` et de `RxJS` (Observables) pour la communication avec l'API (ex: Interception du JWT).

## Prérequis
- Node.js (v18+)
- Angular CLI (`npm install -g @angular/cli`)

## Installation et Démarrage

1. **Installer les dépendances Node :**
   ```bash
   npm install
   ```

2. **Lancer le serveur de développement Angular :**
   ```bash
   ng serve
   ```

3. **Accéder à l'application :**
   Ouvrez votre navigateur sur `http://localhost:4200/`.

## Structure principale
* `/src/styles.css` : Variables de couleurs globales WeLab.
* `/src/app/core/services/` : Services API (ex: `auth.service.ts` gérant le LocalStorage et JWT).
* `/src/app/home/` : Page d'accueil publique de la plateforme.
* `/src/app/auth/login/` : Page de connexion administrateur (Two-Way Data Binding).
* `/src/app/admin/dashboard/` : Tableau de bord dynamique affichant les données depuis l'API via `*ngFor`.