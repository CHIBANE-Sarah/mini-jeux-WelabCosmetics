# Plateforme de Mini-Jeux - WeLab Cosmetic

> **Projet Universitaire - Licence 3 MIAGE (Université d'Orléans)**

Ce projet consiste en la conception et le développement d'une plateforme web ludique et éducative pour le laboratoire **WeLab Cosmetic**. L'application permet aux formateurs de créer des sessions interactives, et aux participants d'y accéder via un code pour jouer à trois mini-jeux : Mots croisés, Association de termes et Formulation de produits.

## Architecture Technique
- **Backend (API REST)** : Symfony, PHP 8, API Platform / LexikJWT
- **Frontend (SPA)** : Angular 17+, HTML/CSS, TypeScript
- **Base de données** : SQLite (Développement) / MySQL

---

## Équipe et Répartition des Tâches (Groupe 8)

### Sarah CHIBANE
* **Phase 1** : Planification, organisation, documentation.
* **Phase 2** :
  * Backend des jeux (structure, logique, API)
  * Frontend du jeu d’association
  * Refonte globale Angular (auth, structure, CSS)

### Christian BITODI
* **Phase 1** : Modélisation du SI (MCD, MLDR)
* **Phase 2** :
  * Backend : Authentification JWT, entités `User` et `Session`
  * Frontend : Initialisation Angular et routing

### Kamilia HACINI
* **Phase 1** : Conception IHM et définition UX/UI
* **Phase 2 - UX/UI & Expérience Joueur :**
  * **Backend** : Participation, logique des jeux, enregistrement des scores et temps
  * **Frontend** :
    * Jeux Mots Croisés et Formulation
    * Page de résultats avec score global
    * Système de participation et reviews joueurs
    * Profil joueur (localStorage + avatar)
    * Améliorations UX/UI : navbar globale, footer, animations, dashboard interactif, slider dynamique

---

## Fonctionnalités Principales

### Espace Formateur (Admin)
- Connexion sécurisée (JWT)
- Création et gestion de sessions
- Consultation des statistiques et résultats

### Espace Participant
- Accès via code session (sans compte)
- Enchaînement des mini-jeux
- Résultats détaillés en fin de session
- Enregistrement des performances (score + temps)
- Possibilité de laisser un avis (review)

---

## Améliorations UX & Fonctionnelles

- Navbar globale dynamique (admin / joueur)
- Footer harmonisé
- Dashboard enrichi (classement, scores, temps)
- Système de reviews avec notation
- Profil joueur avec avatar
- Animations et micro-interactions modernes
- Slider dynamique sur la page d’accueil

---

## Corrections & Optimisations

- Correction du calcul de la durée des sessions
- Amélioration de la gestion des participations (évite l’écrasement des données)
- Nettoyage de certaines logiques fallback pour fiabiliser les résultats

---

Pour les détails d’installation :
- Backend : [`backend/README.md`](./backend/README.md)
- Frontend : [`frontend/README.md`](./frontend/README.md)

