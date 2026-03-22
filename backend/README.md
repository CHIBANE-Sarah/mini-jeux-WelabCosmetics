# Backend

Ce dossier contiendra tout le code coté backend en Symfony du projet.
Il y aura ici tous les détails et les explications concernant le Backend de l'Application


# Partie Authentification et Session (réalisé par Christian BITODI)

Cette partie gère :
- L'authentification des administrateurs
- La création et gestion des sessions de jeu

## Installation des dépendances

Voici les principales commandes Composer utilisées pour installer les paquets nécessaires à cette partie :

`composer install` (installtion des dépendances)

# Dépendances utilisées 
composer require symfony/security-bundle (Sécurité et Authentification)

composer require symfony/orm-pack (ORM Doctrine (Base de données))

composer require --dev symfony/maker-bundle (Maker Bundle)

composer require --dev orm-fixtures (Fixtures)

## Commandes de génération (Symfony MakerBundle)

- Pour invoquer (exécuter) dans le conteneur backend : `docker compose exec symfony  bash` 

Voici les commandes utilisées pour générer la structure de cette partie :

### Entités (Entities & Repositories)
```bash
symfony console make:entity User
symfony console make:entity Session
```

### Contrôleurs (Controllers)
```bash
symfony console  make:controller SessionController
symfony console make:controller LoginController
```

### Fixtures (Données de test)
```bash
symfony console  make:fixtures
```
