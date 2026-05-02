# WeLab Cosmetic - Frontend (Angular)

Ce dossier contient l'interface utilisateur développée avec **Angular**.
Il s'agit d'une **Single Page Application (SPA)** communiquant avec l'API Symfony.

> Le frontend tourne entièrement via **Docker**.

---

## Prérequis

- Docker Desktop
- Git

---

## Installation et Démarrage

    docker compose up -d

Le conteneur `welab-angular` démarre automatiquement et installe les dépendances.

Pour suivre le démarrage :

    docker logs welab-angular -f

Une fois prêt, accéder à :

    http://localhost:4200

---

## Architecture Frontend

- Composants Angular standalone (sans NgModule)
- Routing centralisé (`app.routes.ts`)
- Services HTTP avec `HttpClient`
- Interceptor JWT pour l’authentification admin
- Utilisation de `localStorage` pour le mode joueur

---

## Structure du projet

    src/
    ├── app/
    │   ├── home/                → Page d’accueil
    │   ├── join/                → Rejoindre une session
    │   ├── about/               → Page À propos
    │   ├── auth/                → Connexion admin
    │   ├── admin/
    │   │   ├── dashboard/       → Dashboard admin
    │   │   ├── games-list/      → Liste des jeux
    │   │   └── game-edit/       → Édition des jeux
    │   ├── session/             → Parcours joueur
    │   ├── game/
    │   │   ├── crossword/       → Mots croisés
    │   │   ├── formulation/     → Formulation
    │   │   └── results/         → Résultats + reviews
    │   ├── core/
    │   │   ├── services/        → API services
    │   │   ├── interceptors/    → JWT interceptor
    │   │   └── guards/          → Auth guard

---

## Fonctionnalités principales

### Côté joueur

- Accès via code session (sans compte)
- Saisie nom / prénom
- Enchaînement des mini-jeux :
  - Mots croisés
  - Association
  - Formulation
- Calcul du score global
- Enregistrement automatique de la participation
- Temps de session mesuré

### Résultats & expérience joueur

- Page de résultats détaillée :
  - Score global
  - Score par jeu
  - Statut réussite / échec
- Possibilité de rejouer ou revenir à l’accueil

---

## Fonctionnalités UX/UI  

- Refonte globale de l’interface (UI moderne et cohérente)
- Navbar globale persistante (navigation dynamique)
- Footer harmonisé
- Dashboard admin amélioré :
  - Classement des joueurs
  - Top scores (médailles)
  - Temps de jeu
  - Animations et hover interactifs
- Slider dynamique sur la page d’accueil (images cosmétiques)
- Animations et micro-interactions sur les cartes
- Amélioration des formulaires (feedback utilisateur)

---

## Profil joueur

- Stockage local (localStorage)
- Informations conservées :
  - Nom
  - Prénom
  - Session
- Sélection d’un avatar
- Pas d’authentification requise

---

## Reviews joueurs

- Système de notation avec étoiles
- Ajout d’un commentaire
- Choix d’un avatar
- Envoi vers le backend
- Affichage possible des avis récents

---

## Gestion des données côté frontend

- Stockage temporaire :
  - scores par jeu
  - temps de session
- Nettoyage après chaque session
- Synchronisation avec le backend via API

---

## Améliorations UX

- Feedback visuel (loading, succès, erreurs)
- Navigation fluide entre les pages
- Interface responsive
- Interactions utilisateur dynamiques
- Expérience orientée joueur

---

## Commandes utiles

    docker logs welab-angular -f
    docker compose ps

