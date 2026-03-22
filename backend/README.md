# WeLab Cosmetic - API Backend (Symfony)

Ce dossier contient le code source de l'API REST développée avec le framework **Symfony**. Elle gère l'accès à la base de données, l'authentification des administrateurs et la persistance des données de jeu.

## Prérequis
- PHP 8.1+
- Composer

## Installation et Démarrage

1. **Installer les dépendances PHP :**
   ```bash
   composer install
   ```

2. **Configuration de la Base de données :**
   Le projet utilise SQLite par défaut en développement. Vérifiez le fichier `.env` :
   ```env
   DATABASE_URL="sqlite:///%kernel.project_dir%/var/data.db"
   ```

3. **Générer la base de données et les données de test (Fixtures) :**
   ```bash
   php bin/console doctrine:database:create
   php bin/console doctrine:migrations:migrate -n
   php bin/console doctrine:fixtures:load -n
   ```

4. **Configuration JWT (LexikJWT) :**
   Générez les clés SSL pour l'authentification par token :
   ```bash
   php bin/console lexik:jwt:generate-keypair
   ```

5. **Lancer le serveur :**
   ```bash
   symfony server:start -d
   ```
   *L'API sera accessible sur `http://localhost:8000`.*

## Authentification
La route d'authentification est `/api/login_check`. Elle attend un payload JSON contenant `username` et `password` et retourne un token JWT.