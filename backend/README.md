# WeLab Cosmetic - API Backend (Symfony)

Ce dossier contient le code source de l'API REST développée avec le framework **Symfony**.
Elle gère l'accès à la base de données, l'authentification des administrateurs et la
persistance des données de jeu.

> Le projet tourne entièrement via **Docker**. Il ne faut pas installer PHP ou Composer
> directement sur votre machine. Toutes les commandes s'exécutent à l'intérieur du
> conteneur Docker `welab-symfony`.

## Prérequis
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installé et démarré
- Git

## Installation et Démarrage (première fois)

### 1. Démarrer les conteneurs Docker (depuis la racine du projet)
```bash
docker compose up -d
```
Lance les 3 conteneurs en arrière-plan : `welab-symfony` (PHP/Symfony),
`welab-angular` (Angular) et `welab-web` (Nginx).
Vérifiez qu'ils sont bien actifs avec `docker compose ps`.

### 2. Entrer dans le conteneur Symfony
```bash
docker exec -it welab-symfony bash
```

### 3. Vider le cache
```bash
symfony console cache:clear
```
Permet d'éviter les conflits de cache lors du premier démarrage.

### 4. Installer les dépendances PHP
```bash
composer install
```
Lit le fichier `composer.json` et installe toutes les bibliothèques PHP nécessaires.

### 5. Générer les clés JWT
```bash
symfony console lexik:jwt:generate-keypair --skip-if-exists
```
Crée les fichiers `private.pem` et `public.pem` dans `config/jwt/`.
Ces clés servent à signer et vérifier les tokens d'authentification JWT.
Le flag `--skip-if-exists` évite d'écraser des clés déjà existantes.

### 6. Créer le schéma de base de données
```bash
symfony console doctrine:schema:create
```
Crée directement toutes les tables dans le fichier SQLite `var/data.db`
à partir des entités Symfony. Cette commande est utilisée à la place des
migrations car SQLite ne supporte pas toutes les opérations de migration
standard de Doctrine.

### 7. Charger les données de test (Fixtures)
```bash
symfony console doctrine:fixtures:load -n
```
Injecte des données fictives pré-remplies dans la base de données :
- Compte administrateur (`admin` / `admin123`)
- Sessions de test avec codes : `SESS01`, `SESS02`, `SESS03`, `LAB2026`
- Questions pour les mots croisés et le jeu d'association
- Ingrédients pour le jeu de formulation

> ⚠️ Cette commande vide d'abord la base avant de la re-remplir.

---

## Démarrages suivants

Une fois la configuration initiale effectuée, il suffit de lancer :
```bash
docker compose up -d
```

Pour arrêter tous les conteneurs :
```bash
docker compose down
```

---

## Authentification

La route d'authentification est `POST http://localhost:8000/api/login`.

Elle attend un payload JSON contenant `username` et `password`
et retourne un token JWT valide.

> ⚠️ Cette route n'est accessible qu'en POST. L'ouvrir dans un navigateur (GET)
> affichera `Method Not Allowed` : c'est normal. Utilisez Postman pour la tester.

```json
{
  "username": "admin",
  "password": "admin123"
}
```

---

## Routes API principales

| Méthode | Route | Description | Auth requise |
|---------|-------|-------------|--------------|
| POST | `/api/login` | Authentification admin, retourne un JWT | Non |
| GET | `/api/sessions` | Liste des sessions de l'admin connecté | Oui |
| POST | `/api/session` | Créer une nouvelle session | Oui |
| GET | `/api/session/{code}` | Détail d'une session par son code | Non |
| DELETE | `/api/session/{code}` | Supprimer une session | Oui |
| GET | `/api/session/{code}/games` | Jeux d'une session | Non |
| POST | `/api/session/{code}/join` | Rejoindre une session | Non |
| GET | `/api/association/{gameId}/questions` | Questions du jeu d'association | Non |
| POST | `/api/association/{gameId}/verify` | Vérifier les réponses d'association | Non |
| GET | `/api/crossword/{sessionCode}` | Questions des mots croisés | Non |
| POST | `/api/crossword/validate` | Valider la grille de mots croisés | Non |
| GET | `/api/formulation/{sessionCode}` | Ingrédients du jeu de formulation | Non |
| POST | `/api/formulation/validate` | Valider la sélection d'ingrédients | Non |
| GET | `/api/admin/games` | Liste tous les jeux (admin) | Oui |
| POST | `/api/admin/games/{id}/association/questions` | Ajouter une question d'association | Oui |
| DELETE | `/api/admin/games/{id}/association/questions/{qId}` | Supprimer une question | Oui |
| POST | `/api/participation/save` | Enregistrer les résultats d'un joueur | Non |
| GET | `/api/participation` | Consulter tous les résultats | Non |
| GET | `/api/stats/dashboard` | Statistiques du dashboard | Oui |

---

## Commandes utiles (debug)

```bash
# Voir les logs du backend en temps réel
docker logs welab-symfony -f

# Ouvrir un terminal interactif dans le conteneur Symfony
docker exec -it welab-symfony bash

# Vérifier que les conteneurs tournent bien
docker compose ps

# Vider le cache manuellement si symfony console cache:clear échoue
rm -rf var/cache/* && chmod -R 777 var/
```