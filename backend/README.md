# WeLab Cosmetic - API Backend (Symfony)

Ce dossier contient le code source de l'API REST développée avec le framework **Symfony**.
Elle gère l'accès à la base de données, l'authentification des administrateurs et la persistance des données de jeu.

> Le projet tourne entièrement via **Docker**.

---

## Prérequis

- Docker Desktop
- Git

---

## Installation et Démarrage

    docker compose up -d
    docker exec -it welab-symfony bash
    symfony console cache:clear
    composer install
    symfony console lexik:jwt:generate-keypair --skip-if-exists
    symfony console doctrine:schema:create
    symfony console doctrine:fixtures:load -n

---

## Authentification

Route : `POST /api/login`

Payload attendu :

    {
      "username": "admin",
      "password": "admin123"
    }

---

## Routes API principales

| Méthode | Route | Description | Auth |
|--------|------|-------------|------|
| POST | `/api/login` | Authentification admin | Non |
| GET | `/api/sessions` | Liste des sessions de l'admin connecté | Oui |
| POST | `/api/session` | Créer une session | Oui |
| GET | `/api/session/{code}` | Détail d'une session | Non |
| DELETE | `/api/session/{code}` | Supprimer une session | Oui |
| GET | `/api/session/{code}/games` | Jeux d'une session | Non |
| POST | `/api/session/{code}/join` | Rejoindre une session | Non |
| GET | `/api/association/{gameId}/questions` | Questions association | Non |
| POST | `/api/association/{gameId}/verify` | Vérifier association | Non |
| GET | `/api/crossword/{sessionCode}` | Questions mots croisés | Non |
| POST | `/api/crossword/validate` | Valider mots croisés | Non |
| GET | `/api/formulation/{sessionCode}` | Ingrédients formulation | Non |
| POST | `/api/formulation/validate` | Valider formulation | Non |
| POST | `/api/participation/save` | Enregistrer score et temps | Non |
| GET | `/api/participation` | Consulter les résultats | Non |
| POST | `/api/reviews` | Ajouter un avis joueur | Non |
| GET | `/api/reviews/latest` | Derniers avis joueurs | Non |
| GET | `/api/stats/dashboard` | Statistiques dashboard | Oui |
| GET | `/api/admin/games` | Gestion des jeux | Oui |

---

## Fonctionnalités Backend

### Participations

- Enregistrement du score global d'un joueur
- Enregistrement du temps total de session
- Données utilisées pour les statistiques et le dashboard admin

### Reviews joueurs

- Ajout d'un avis après une session
- Note de 1 à 5 étoiles
- Commentaire libre
- Avatar du joueur
- Affichage des derniers avis côté frontend

---

## Sécurité

- Authentification JWT pour l'espace administrateur
- Routes publiques pour les joueurs :
  - jeux
  - sessions publiques
  - participations
  - reviews

Extraits `security.yaml` :

    - { path: ^/api/participation, roles: PUBLIC_ACCESS }
    - { path: ^/api/reviews, roles: PUBLIC_ACCESS }

---

## Corrections & Optimisations

- Correction du calcul de la durée des sessions
- Gestion plus fiable des données par session
- Suppression de certains fallbacks incorrects
- Amélioration de la cohérence des scores, temps et participations

---

## Commandes utiles

    docker logs welab-symfony -f
    docker exec -it welab-symfony bash
    docker compose ps
    docker exec welab-symfony php bin/console cache:clear

