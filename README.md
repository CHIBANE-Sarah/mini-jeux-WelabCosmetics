# Plateforme de Mini-Jeux - WeLab Cosmetic

> **Projet Universitaire - Licence 3 MIAGE - Université d'Orléans**

Ce projet consiste en la conception et le développement d'une plateforme web ludique et éducative pour le laboratoire **WeLab Cosmetic**.

L'application permet à un formateur/administrateur de créer des sessions interactives, puis aux participants de rejoindre une session à l'aide d'un code afin de réaliser plusieurs mini-jeux autour de la cosmétique :

- Mots croisés
- Association de termes et définitions
- Formulation de produits cosmétiques

L'objectif principal est de proposer une expérience pédagogique simple, interactive et accessible, tout en permettant le suivi des scores, du temps de participation et des résultats des joueurs.

---

## Architecture technique

Le projet est organisé en deux grandes parties :

- **Backend - API REST** : Symfony, PHP 8, Doctrine, LexikJWT
- **Frontend - SPA** : Angular, TypeScript, HTML/CSS
- **Base de données** : SQLite en développement
- **Conteneurisation** : Docker / Docker Compose
- **Serveur web** : Nginx

L'application repose sur une architecture séparée :

```txt
Utilisateur
↓
Frontend Angular
↓ Requêtes HTTP / JSON
Backend Symfony
↓
Base de données SQLite
```

---

## Fonctionnalités principales

### Espace administrateur / formateur

- Connexion sécurisée avec JWT
- Accès à un dashboard administrateur
- Création de sessions de jeu avec code unique
- Sélection des mini-jeux à inclure dans une session
- Configuration des durées de jeu
- Consultation des statistiques globales
- Consultation des résultats et participations
- Gestion de certains contenus de jeux

### Espace participant

- Accès sans compte via un code de session
- Saisie du nom, prénom et avatar
- Accès aux jeux associés à la session
- Enchaînement des mini-jeux
- Calcul des scores par jeu
- Calcul d'un score global final
- Enregistrement du score et du temps total
- Possibilité de laisser un avis après la session

---

## Mini-jeux disponibles

### Jeu d'association

Le joueur doit associer des termes cosmétiques à leurs définitions à l'aide d'un système de glisser-déposer.

### Jeu de mots croisés

Le joueur complète une grille à partir de définitions liées au vocabulaire cosmétique.

### Jeu de formulation

Le joueur sélectionne les bons ingrédients afin de constituer une formulation cosmétique cohérente.

---

## Équipe et répartition des tâches - Groupe 8

Le travail a été organisé en deux grandes phases :

- **Phase 1 : Conception, analyse et modélisation**
- **Phase 2 : Développement, intégration, tests et documentation**

La réalisation du projet a nécessité une collaboration entre les membres du groupe, avec une répartition des responsabilités sur la conception, le backend, le frontend, les mini-jeux, l'interface utilisateur et la documentation.

---

### Sarah CHIBANE

#### Phase 1 - Conception et organisation

- Planification générale du projet
- Organisation du travail et répartition initiale des tâches
- Participation à la documentation du projet
- Préparation de la structure fonctionnelle de la plateforme
- Suivi de l'avancement global du projet

#### Phase 2 - Développement et intégration

- Participation à la mise en place de l'architecture globale Angular/Symfony
- Développement et intégration du jeu d'association
- Travail sur les entités et routes liées aux jeux
- Mise en place des échanges entre le frontend Angular et l'API Symfony
- Correction et amélioration de plusieurs pages Angular
- Refonte et harmonisation d'une partie de l'interface utilisateur
- Participation à la correction des bugs d'intégration entre les pages
- Participation à la rédaction et à la structuration des README et du rapport

---

### Christian BITODI

#### Phase 1 - Modélisation du système d'information

- Conception du modèle conceptuel de données
- Transformation du MCD en modèle logique de données
- Participation à l'analyse des entités principales du projet
- Travail sur la structure des données nécessaires aux sessions, utilisateurs et participations

#### Phase 2 - Développement backend et authentification

- Mise en place de la base du backend Symfony
- Création et configuration des entités principales, notamment `User` et `Session`
- Mise en place de la configuration Doctrine
- Participation à la configuration de l'authentification
- Intégration de LexikJWT pour la sécurisation de l'espace administrateur
- Contribution à la structure initiale du frontend Angular
- Participation au routing et aux premières pages de l'application

---

### Kamilia HACINI

#### Phase 1 - IHM, UX/UI et conception visuelle

- Conception des maquettes d'interface
- Définition de la direction graphique
- Travail sur l'expérience utilisateur côté administrateur et côté joueur
- Participation à la cohérence visuelle de l'application

#### Phase 2 - Développement des jeux, résultats et expérience joueur

- Développement du jeu de mots croisés
- Développement du jeu de formulation
- Mise en place de la logique de calcul des scores
- Création de la page de résultats finale
- Enregistrement des participations avec score et temps total
- Développement ou amélioration des fonctionnalités liées aux avis joueurs
- Amélioration de l'expérience utilisateur : feedbacks, animations, navigation et affichages dynamiques
- Participation à l'amélioration du dashboard administrateur

---

## Améliorations fonctionnelles et UX

Au cours du développement, plusieurs améliorations ont été ajoutées :

- Dashboard administrateur enrichi
- Affichage des scores et temps de participation
- Classements et statistiques
- Gestion du profil joueur via `localStorage`
- Choix d'un avatar participant
- Système d'avis/reviews
- Messages de chargement, succès et erreur
- Navigation plus fluide entre les pages
- Interface plus homogène et responsive

---

## Corrections et optimisations réalisées

Plusieurs corrections ont été apportées pendant l'intégration :

- Correction de la gestion des durées de session et de jeu
- Correction de l'enchaînement des mini-jeux
- Nettoyage des anciens scores avant une nouvelle session
- Amélioration de l'enregistrement des participations
- Sécurisation des routes administrateur avec JWT
- Harmonisation des données échangées entre Angular et Symfony
- Correction de certains problèmes liés au stockage temporaire dans `localStorage`

---

## Structure du projet

```txt
mini-jeux-WelabCosmetics
├── Dockerfile
├── docker-compose.yml
├── default.conf
├── README.md
├── backend
│   ├── README.md
│   ├── config
│   ├── migrations
│   ├── public
│   └── src
│       ├── Controller
│       ├── DataFixtures
│       ├── Entity
│       └── Repository
└── frontend
    ├── README.md
    ├── public
    └── src
        ├── app
        ├── assets
        ├── index.html
        ├── main.ts
        └── styles.css
```

---

## Installation et lancement

Le projet est prévu pour être lancé avec Docker.

Depuis la racine du projet :

```bash
docker compose up --build
```

ou, après une première installation :

```bash
docker compose up -d
```

Accès à l'application :

```txt
Frontend Angular : http://localhost:4200
Backend Symfony : http://localhost:8000
```

Pour les détails d'installation et de lancement :

- Backend : [`backend/README.md`](./backend/README.md)
- Frontend : [`frontend/README.md`](./frontend/README.md)

---

## Comptes et données de test

Les données de test sont chargées via les fixtures Symfony.

Compte administrateur principal :

```txt
Login : admin
Mot de passe : admin123
```

Exemples de codes de session selon les fixtures chargées :

```txt
SESS01
SESS03
```

Les codes exacts peuvent varier selon les fixtures présentes dans la version finale du projet.

---

## Objectif pédagogique

Ce projet a permis de travailler sur :

- la conception d'une application web complète
- la séparation frontend/backend
- la communication via API REST
- l'authentification avec JWT
- l'utilisation de Docker
- la gestion d'une base de données avec Doctrine
- la création d'interfaces Angular
- la manipulation de données côté client avec `localStorage`
- la collaboration en groupe sur un projet informatique complet
