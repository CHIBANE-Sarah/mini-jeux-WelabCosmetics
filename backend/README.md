# WeLab Cosmetic - API Backend Symfony

Ce dossier contient le code source du backend de l'application **WeLab Cosmetic**.

Le backend est développé avec **Symfony** et expose une API REST utilisée par le frontend Angular.  
Il gère notamment :

- l'authentification administrateur
- la gestion des sessions
- la gestion des jeux
- la récupération des questions et ingrédients
- la validation des réponses
- l'enregistrement des participations
- les statistiques du dashboard
- les avis joueurs

> Le projet est prévu pour fonctionner avec **Docker**.  
> Il n'est donc pas nécessaire d'installer PHP, Composer ou Symfony directement sur la machine.

---

## Prérequis

- Docker Desktop installé et démarré
- Git
- Un terminal PowerShell, CMD ou Git Bash

---

## Lancement global du projet

Depuis la racine du projet :

```bash
docker compose up --build
```

ou, si les images ont déjà été construites :

```bash
docker compose up -d
```

Cette commande lance les conteneurs suivants :

- `welab-angular` : frontend Angular
- `welab-symfony` : backend Symfony / PHP-FPM
- `welab-web` : serveur Nginx

Vérifier que les conteneurs tournent :

```bash
docker compose ps
```

---

## Entrer dans le conteneur Symfony

Les commandes Symfony doivent être exécutées dans le conteneur backend :

```bash
docker exec -it welab-symfony bash
```

Une fois dans le conteneur, le dossier de travail est :

```bash
/var/www/backend
```

---

## Installation backend - première utilisation

### 1. Installer les dépendances PHP

Dans le conteneur `welab-symfony` :

```bash
composer install
```

Cette commande installe les dépendances définies dans `composer.json`.

---

### 2. Vider le cache Symfony

```bash
symfony console cache:clear
```

Si cette commande échoue à cause des droits ou du cache, utiliser :

```bash
rm -rf var/cache/*
```

---

### 3. Générer les clés JWT

```bash
symfony console lexik:jwt:generate-keypair --skip-if-exists
```

Cette commande crée les clés :

```txt
config/jwt/private.pem
config/jwt/public.pem
```

Ces clés servent à signer et vérifier les tokens JWT utilisés pour l'authentification administrateur.

---

### 4. Créer la base de données SQLite

Dans la configuration principale Docker, la base de données utilisée est SQLite :

```txt
var/data.db
```

Créer le schéma de base de données :

```bash
symfony console doctrine:schema:create
```

Cette commande crée les tables à partir des entités Symfony.

> Remarque : le projet contient aussi des fichiers `backend/compose.yaml` et `backend/compose.override.yaml` générés par Symfony/Doctrine pour PostgreSQL.  
> Cependant, le lancement principal du projet utilise le fichier `docker-compose.yml` à la racine et une base SQLite.

---

### 5. Charger les données de test

```bash
symfony console doctrine:fixtures:load -n
```

Cette commande remplit la base avec des données fictives :

- utilisateur administrateur
- utilisateurs de test
- sessions de test
- jeux
- questions
- ingrédients

> Attention : cette commande vide la base avant de la re-remplir.

---

## Démarrages suivants

Une fois l'installation initiale effectuée, il suffit de lancer :

```bash
docker compose up -d
```

Pour arrêter les conteneurs :

```bash
docker compose down
```

Pour reconstruire les conteneurs :

```bash
docker compose up --build
```

---

## Authentification administrateur

La route de connexion est :

```txt
POST http://localhost:8000/api/login
```

Payload attendu :

```json
{
  "username": "admin",
  "password": "admin123"
}
```

Réponse attendue :

```json
{
  "token": "..."
}
```

Le token JWT doit ensuite être envoyé dans les requêtes protégées avec le header :

```txt
Authorization: Bearer <token>
```

> Cette route est uniquement accessible en POST.  
> Si elle est ouverte directement dans un navigateur, une erreur de type `Method Not Allowed` peut apparaître. C'est normal.

---

## Sécurité

La sécurité est configurée principalement dans :

```txt
config/packages/security.yaml
```

Le backend utilise :

- `json_login` pour la connexion
- LexikJWT pour générer et vérifier les tokens
- des routes publiques pour les joueurs
- des routes protégées pour l'administrateur

Exemples :

```yaml
- { path: ^/api/login, roles: PUBLIC_ACCESS }
- { path: ^/api/admin, roles: ROLE_ADMIN }
- { path: ^/api/sessions, roles: ROLE_ADMIN }
- { path: ^/api/participation, roles: PUBLIC_ACCESS }
- { path: ^/api/reviews, roles: PUBLIC_ACCESS }
```

---

## Routes API principales

| Méthode | Route | Description | Authentification |
|---------|-------|-------------|------------------|
| POST | `/api/login` | Connexion administrateur, retourne un JWT | Non |
| GET | `/api/sessions` | Liste des sessions de l'admin connecté | Oui |
| POST | `/api/session` | Créer une session | Oui |
| GET | `/api/session/{code}` | Récupérer une session par code | Non |
| DELETE | `/api/session/{code}` | Supprimer une session | Oui |
| GET | `/api/session/{code}/games` | Récupérer les jeux d'une session | Non |
| POST | `/api/session/{code}/join` | Rejoindre une session | Non |
| GET | `/api/association/{gameId}/questions` | Questions du jeu d'association | Non |
| POST | `/api/association/{gameId}/verify` | Vérifier les réponses d'association | Non |
| GET | `/api/crossword/{sessionCode}` | Questions des mots croisés | Non |
| POST | `/api/crossword/validate` | Valider les mots croisés | Non |
| GET | `/api/formulation/{sessionCode}` | Ingrédients du jeu de formulation | Non |
| POST | `/api/formulation/validate` | Valider la formulation | Non |
| POST | `/api/participation/save` | Enregistrer le score et le temps d'un joueur | Non |
| GET | `/api/participation` | Consulter les participations | Non |
| POST | `/api/reviews` | Ajouter un avis joueur | Non |
| GET | `/api/reviews/latest` | Récupérer les derniers avis | Non |
| GET | `/api/stats/dashboard` | Statistiques du dashboard admin | Oui |
| GET | `/api/admin/games` | Liste des jeux côté admin | Oui |
| GET | `/api/admin/games/{id}` | Détail d'un jeu côté admin | Oui |
| POST | `/api/admin/games/{id}/association/questions` | Ajouter une question d'association | Oui |
| DELETE | `/api/admin/games/{id}/association/questions/{questionId}` | Supprimer une question d'association | Oui |
| POST | `/api/admin/games/{id}/crossword/questions` | Ajouter une question de mots croisés | Oui |
| POST | `/api/admin/games/{id}/formulation/ingredients` | Ajouter un ingrédient | Oui |

---

## Entités principales

Le backend s'appuie sur plusieurs entités Doctrine :

```txt
User
Session
Game
AssociationQuestion
CrosswordQuestion
Ingredient
Participation
Review
```

### User

Représente un administrateur ou utilisateur de test.  
Il contient notamment le login, le mot de passe haché et les rôles.

### Session

Représente une session créée par un administrateur.  
Elle possède un titre, un code unique, une durée et une liste de jeux.

### Game

Représente un mini-jeu associé à une session.  
Les types principaux sont :

```txt
association
crossword
formulation
```

### Participation

Représente le résultat final d'un joueur :

- nom
- prénom
- score global
- durée totale
- session associée

### Review

Représente un avis laissé par un participant après une session.

---

## Données de test

Les fixtures sont situées dans :

```txt
src/DataFixtures
```

Elles permettent de créer rapidement des données fictives pour la démonstration.

Exemple de compte administrateur :

```txt
Login : admin
Mot de passe : admin123
```

Exemples de sessions selon les fixtures chargées :

```txt
SESS01
SESS03
```

---

## Commandes utiles

### Voir les logs du backend

```bash
docker logs welab-symfony -f
```

### Entrer dans le conteneur Symfony

```bash
docker exec -it welab-symfony bash
```

### Vérifier les conteneurs

```bash
docker compose ps
```

### Vider le cache

```bash
symfony console cache:clear
```

ou :

```bash
rm -rf var/cache/*
```

### Voir les routes Symfony

```bash
symfony console debug:router
```

### Vérifier la configuration de sécurité

```bash
symfony console debug:config security
```

---

## Points techniques importants

- Le backend fonctionne comme une API REST.
- Les réponses sont renvoyées au frontend au format JSON.
- Les routes admin sont protégées par JWT.
- Les routes joueur sont publiques pour permettre l'accès avec un simple code session.
- Doctrine permet de mapper les entités PHP vers les tables de la base de données.
- Les fixtures permettent de remplir rapidement la base pour la soutenance ou les tests.

---

## Corrections et améliorations réalisées

- Gestion des sessions avec code unique
- Calcul des durées de jeux et de session
- Enregistrement du score global et du temps total
- Ajout des statistiques dashboard
- Sécurisation de l'espace administrateur
- Gestion des avis joueurs
- Amélioration de la cohérence des réponses JSON envoyées au frontend
