# WeLab Cosmetic - Frontend Angular

Ce dossier contient l'interface utilisateur de l'application **WeLab Cosmetic**.

Le frontend est développé avec **Angular**.  
Il s'agit d'une **Single Page Application** qui communique avec le backend Symfony via des requêtes HTTP vers une API REST.

> Le frontend tourne via Docker avec le conteneur `welab-angular`.

---

## Prérequis

- Docker Desktop installé et démarré
- Git
- Un navigateur web récent

---

## Lancement du frontend

Depuis la racine du projet :

```bash
docker compose up --build
```

ou, si les conteneurs sont déjà construits :

```bash
docker compose up -d
```

Le conteneur Angular démarre automatiquement.

Pour suivre les logs du frontend :

```bash
docker logs welab-angular -f
```

Attendre que le serveur Angular soit prêt, puis ouvrir :

```txt
http://localhost:4200
```

---

## Architecture frontend

Le frontend repose sur :

- des composants Angular standalone
- un routing centralisé dans `app.routes.ts`
- des services Angular pour les appels API
- un interceptor JWT pour les requêtes administrateur
- un guard pour protéger les routes admin
- du stockage temporaire avec `localStorage` pour le parcours joueur
- des fichiers HTML/CSS/TypeScript séparés pour chaque composant

---

## Structure du projet

```txt
src/
├── app/
│   ├── app.routes.ts             → Routes principales de l'application
│   ├── app.config.ts             → Configuration globale Angular
│   ├── home/                     → Page d'accueil
│   ├── about/                    → Page À propos
│   ├── join/                     → Page pour rejoindre une session
│   ├── player-dashboard/         → Tableau de bord côté joueur
│   ├── auth/
│   │   └── login/                → Connexion administrateur
│   ├── admin/
│   │   ├── dashboard/            → Dashboard administrateur
│   │   ├── games-list/           → Liste des jeux administrables
│   │   └── game-edit/            → Édition des questions/ingrédients
│   ├── session/
│   │   ├── session.ts            → Page de session côté joueur
│   │   └── association-game/     → Jeu d'association
│   ├── game/
│   │   ├── crossword/            → Jeu de mots croisés
│   │   ├── formulation/          → Jeu de formulation
│   │   └── results/              → Page de résultats finale
│   ├── core/
│   │   ├── services/             → Services HTTP
│   │   ├── interceptors/         → Interceptor JWT
│   │   └── guards/               → Guard d'authentification
│   └── interfaces/               → Interfaces TypeScript partagées
├── assets/                       → Images et ressources
├── index.html
├── main.ts
└── styles.css                    → Styles globaux
```

---

## Pages principales

| Page | URL | Rôle |
|------|-----|------|
| Accueil | `http://localhost:4200` | Public |
| Rejoindre une session | `http://localhost:4200/join` | Joueur |
| Connexion admin | `http://localhost:4200/login` | Admin |
| Dashboard admin | `http://localhost:4200/dashboard` | Admin |
| Gestion des jeux | `http://localhost:4200/dashboard/games` | Admin |
| Résultats joueur | `/session/results/{sessionCode}` | Joueur |

---

## Fonctionnement général côté joueur

Le parcours joueur fonctionne ainsi :

```txt
Accueil
↓
Rejoindre une session avec un code
↓
Saisie nom / prénom / avatar
↓
Page de session
↓
Mini-jeux
↓
Page de résultats
↓
Enregistrement de la participation
↓
Avis joueur facultatif
```

Le joueur n'a pas besoin de compte.  
Ses informations temporaires sont stockées dans le navigateur avec `localStorage`.

---

## Fonctionnement général côté administrateur

Le parcours administrateur fonctionne ainsi :

```txt
Connexion admin
↓
Réception du token JWT
↓
Stockage du token dans localStorage
↓
Accès au dashboard
↓
Création et gestion des sessions
↓
Consultation des statistiques et résultats
```

Les routes administrateur sont protégées par :

- un guard Angular côté frontend
- une vérification JWT côté backend

---

## Services Angular principaux

Les services situés dans `src/app/core/services` centralisent les appels API.

Exemples :

```txt
auth.service.ts              → connexion, déconnexion, token JWT
session.service.ts           → sessions, création, suppression, statistiques
association.ts               → jeu d'association
crossword.service.ts         → mots croisés
formulation.service.ts       → formulation
participation.service.ts     → enregistrement des résultats
review.service.ts            → avis joueurs
game-admin.service.ts        → gestion admin des jeux
```

---

## Authentification frontend

L'authentification administrateur repose sur un token JWT.

Étapes :

```txt
1. L'admin se connecte sur /login
2. Angular envoie username/password à Symfony
3. Symfony retourne un token JWT
4. Angular stocke le token dans localStorage
5. L'interceptor ajoute le token aux requêtes HTTP
6. Les routes admin deviennent accessibles
```

Fichiers concernés :

```txt
auth/login/login.ts
core/services/auth.service.ts
core/interceptors/auth-interceptor.ts
core/guards/auth-guard.ts
app.routes.ts
```

---

## Gestion du joueur avec localStorage

Le mode joueur utilise `localStorage` pour stocker temporairement :

```txt
welab.participant
player_name
session_code
session_games
session_title
session_start_time
score_crossword
score_association
score_formulation
total_crossword
total_association
total_formulation
```

Ces données permettent :

- de conserver le nom du joueur pendant la session
- de savoir quels jeux enchaîner
- de calculer les scores
- de mesurer le temps total
- d'afficher les résultats finaux

---

## Mini-jeux

### Association

Fichier principal :

```txt
session/association-game/association-game.ts
```

Fonctionnalités :

- chargement des questions depuis l'API
- affichage des termes et définitions
- glisser-déposer avec Angular CDK
- vérification des réponses
- stockage du score

### Mots croisés

Fichier principal :

```txt
game/crossword/crossword.component.ts
```

Fonctionnalités :

- génération d'une grille
- saisie des lettres par le joueur
- validation des réponses
- calcul du score
- timer

### Formulation

Fichier principal :

```txt
game/formulation/formulation.component.ts
```

Fonctionnalités :

- affichage des ingrédients par catégorie
- sélection des ingrédients corrects
- validation auprès du backend
- calcul du score
- timer

---

## Page de résultats

Fichier principal :

```txt
game/results/results.component.ts
```

La page de résultats :

- lit les scores depuis `localStorage`
- calcule le score global
- affiche le score par jeu
- détermine si la session est réussie
- enregistre automatiquement la participation
- permet de laisser un avis

---

## Fonctionnalités UX/UI

Le frontend intègre plusieurs améliorations d'expérience utilisateur :

- interface responsive
- feedbacks visuels de chargement et d'erreur
- messages de succès
- navigation fluide entre les pages
- dashboard administrateur enrichi
- classement des joueurs
- affichage des scores et temps
- avatars joueurs
- système d'avis avec note
- animations et effets de survol
- slider visuel sur la page d'accueil

---

## Commandes utiles

### Voir les logs Angular

```bash
docker logs welab-angular -f
```

### Vérifier les conteneurs

```bash
docker compose ps
```

### Redémarrer le projet

```bash
docker compose down
docker compose up -d
```

### Lancer avec reconstruction complète

```bash
docker compose up --build
```

---

## Points techniques importants

- Angular affiche les pages et gère l'interaction utilisateur.
- Les services Angular communiquent avec Symfony via HTTP.
- Les réponses API sont au format JSON.
- `localStorage` sert au stockage temporaire côté joueur.
- Le token JWT sert uniquement à protéger l'espace administrateur.
- Les composants sont standalone, donc ils déclarent directement leurs imports.
- Les fichiers HTML, CSS et TypeScript sont séparés pour faciliter la maintenance.

---

## Compte administrateur de test

Après chargement des fixtures backend :

```txt
Login : admin
Mot de passe : admin123
```
