# Plateforme de Mini-Jeux - WeLab Cosmetic

> **Projet Universitaire - Licence 3 MIAGE (Université d'Orléans)**

Ce projet consiste en la conception et le développement d'une plateforme web ludique et éducative pour le laboratoire **WeLab Cosmetic**. L'application permet aux formateurs de créer des sessions interactives, et aux participants d'y accéder via un code pour jouer à trois mini-jeux axés sur la cosmétique : Mots croisés, Association de termes, et Formulation de produits.

## Architecture Technique
- **Backend (API REST)** : Symfony, PHP 8, API Platform / LexikJWT.
- **Frontend (SPA)** : Angular 17+, HTML/CSS, TypeScript.
- **Base de données** : SQLite (Développement) / MySQL.

---

## Équipe et Répartition des Tâches (Groupe 8)

Le travail a été divisé en deux grandes phases : la **Phase 1 (Conception & Modélisation)** et la **Phase 2 (Développement technique)**.

### Sarah CHIBANE
* **Phase 1 (Conception)** : Planification du projet (Diagramme de Gantt), organisation globale, documentation et répartition des tâches.
* **Phase 2 (Développement) - Responsable Jeu d'Association & Lead Front-end :**
  * **Backend (API Jeux)** : Création de la structure globale des jeux (Entités `Game`, `AssociationQuestion`), développement des routes de récupération et de validation des réponses (calcul des scores, retours JSON).
  * **Frontend (Jeu Association)** : Développement de l'interface du jeu en deux colonnes, gestion des événements de sélection, appel API et affichage dynamique du score.
  * **Refonte & Intégration Globale** : Reprise complète, correction et refactoring de l'architecture Angular initiale (Pages Login, Dashboard, Join). Application stricte du "Pixel-Perfect" selon les IHM, séparation propre du CSS, création des variables globales et résolution des bugs d'authentification.

### Christian BITODI
* **Phase 1 (Conception)** : Modélisation du Système d'Information (création du MCD et transformation en MLDR).
* **Phase 2 (Développement) - Base Authentification & Sessions :**
  * **Backend** : Configuration initiale de la base de données via Doctrine. Création des entités `User` et `Session`. Mise en place de la sécurité et des routes d'authentification (intégration de LexikJWT).
  * **Frontend** : Initialisation de l'environnement Angular, paramétrage du routing de base et ébauche initiale des composants d'authentification.


### Kamilia HACINI
* **Phase 1 (Conception)** : Conception des maquettes et interfaces utilisateur (IHM via Figma/Canva), définition de l'UX/UI et de la charte graphique.
* **Phase 2 (Développement) - Responsable Jeux Mots Croisés, Formulation & Participations :**
  * **Backend** : Modélisation et création des entités `Participation`, `CrosswordQuestion`, `Ingredient`. Logique métier de vérification des mots et comparaison des listes d'ingrédients. Enregistrement des scores globaux et du temps total.
  * **Frontend** : Développement des interfaces spécifiques pour la grille de Mots Croisés et le jeu de Formulation (sélection de cartes interactives). Développement de la page récapitulative des résultats et connexion aux services API associés.

---

## Fonctionnalités Principales
- **Espace Formateur (Admin)** : Connexion sécurisée (JWT), création de sessions avec code unique, consultation des statistiques en temps réel.
- **Espace Participant** : Accès instantané via un code session (sans création de compte), enchaînement fluide des 3 mini-jeux, affichage d'un bilan de compétences en fin de partie.

Pour les détails d’installation et lancement :
- Backend : [`backend/README.md`](./backend/README.md)
- Frontend : [`frontend/README.md`](./frontend/README.md)