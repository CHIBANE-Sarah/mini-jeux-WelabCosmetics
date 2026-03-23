# WeLab Cosmetic - API Backend (Symfony)

Ce dossier contient le code source de l'API REST développée avec le framework **Symfony**. Elle gère l'accès à la base de données, l'authentification des administrateurs et la persistance des données de jeu.

> Ps. Le projet tourne entièrement via **Docker**. Il ne faut pas installer PHP ou Composer directement sur votre machine. Toutes les commandes s'exécutent à l'intérieur du conteneur Docker `welab-symfony`.

## Prérequis
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installé et démarré
- Git

## Installation et Démarrage

1. **Démarrer les conteneurs Docker (depuis la racine du projet) :**
   ```bash
   docker compose up -d
   ```
   > Lance les 3 conteneurs en arrière-plan : `welab-symfony` (PHP/Symfony), `welab-angular` (Angular) et `welab-web` (Nginx). Vérifiez qu'ils sont bien actifs avec `docker compose ps`.

2. **Installer les dépendances PHP :**
   ```bash
   docker exec welab-symfony composer install
   ```
   > Lit le fichier `composer.json` et télécharge toutes les bibliothèques PHP nécessaires au projet à l'intérieur du conteneur.

3. **Générer les clés JWT (sécurité) :**
   ```bash
   docker exec welab-symfony php bin/console lexik:jwt:generate-keypair --skip-if-exists
   ```
   > Crée les fichiers `private.pem` et `public.pem` dans `config/jwt/`. Ces clés servent à signer et vérifier les tokens d'authentification. Le flag `--skip-if-exists` évite d'écraser des clés déjà existantes.

4. **Créer la base de données :**
   ```bash
   docker exec welab-symfony php bin/console doctrine:database:create --if-not-exists
   ```
   > Crée le fichier SQLite `var/data.db`. SQLite est une base de données légère qui ne nécessite pas de serveur séparé : tout est stocké dans un seul fichier.

5. **Créer les tables (migrations) :**
   ```bash
   docker exec welab-symfony php bin/console doctrine:migrations:migrate -n
   ```
   > Applique les fichiers de migration pour créer toutes les tables dans la base de données. Le flag `-n` répond automatiquement "oui" aux confirmations.

6. **Charger les données de test (Fixtures) :**
   ```bash
   docker exec welab-symfony php bin/console doctrine:fixtures:load -n
   ```
   > Injecte des données fictives pré-remplies (comptes admin, sessions exemple...) pour tester l'application.
   > Ps. Cette commande vide d'abord la base avant de la re-remplir.

## Démarrages suivants

Une fois la configuration initiale effectuée, il suffit de lancer :
```bash
docker compose up -d
```
Pour arrêter tous les conteneurs :
```bash
docker compose down
```

## Authentification

La route d'authentification est `POST http://localhost:8000/api/login`. Elle attend un payload JSON contenant `username` et `password` et retourne un token JWT.

> Ps. Cette route n'est accessible qu'en **POST**. L'ouvrir dans un navigateur (GET) affichera `Method Not Allowed` : c'est normal. Utilisez **Postman** pour la tester.

```json
{
  "username": "admin",
  "password": "welab"
}
```
---

## Commandes utiles (debug)

```bash
# Voir les logs du backend en temps réel
docker logs welab-symfony -f

# Ouvrir un terminal interactif dans le conteneur Symfony
docker exec -it welab-symfony bash

# Vérifier que les conteneurs tournent bien
docker compose ps
```
---