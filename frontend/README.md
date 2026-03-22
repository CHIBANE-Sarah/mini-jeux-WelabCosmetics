# Frontend

Ce dossier contiendra toute la partie frontend avec Angular du projet.
Il y aura ici tous les détails et les explications concernant le front de l'Application

# Partie Authentification et Session (réalisé par Christian BITODI)

Cette partie gère :
- la page d'Accueil
- la page de Connexion
- la page de Dashboard 
- la page pour rejoindre une session 

## Installation des dépendances

Pour installer l'ensemble des dépendances et bibliothèques requises par le projet Angular (définies dans le fichier `package.json`), exécutez la commande suivante :

```bash
npm install
```

## Commandes de génération (Angular CLI)

- Pour entrer sur Angular : `docker compose exec angular  bash`

Voici les commandes utilisées pour générer la structure de cette partie :

### Composants
```bash
ng generate component auth/login
ng generate component admin/dashboard
ng generate component join
ng generate component session
```

### Services
```bash
ng generate service core/services/auth
ng generate service core/services/session
```

### Interfaces
```bash
ng generate interface interfaces/user
```