// Routes est le type Angular utilisé pour déclarer toutes les routes de l'application.
import { Routes } from '@angular/router';

// Import des composants affichés selon l'URL visitée.
import { Home } from './home/home';
import { JoinSession } from './join/join';
import { LoginComponent } from './auth/login/login';
import { DashboardComponent } from './admin/dashboard/dashboard';
import { SessionComponent } from './session/session';
import { AssociationGameComponent } from './session/association-game/association-game';
import { CrosswordComponent } from './game/crossword/crossword.component';
import { FormulationComponent } from './game/formulation/formulation.component';
import { ResultsComponent } from './game/results/results.component';
import { GamesListComponent } from './admin/games-list/games-list.component';
import { AboutComponent } from './about/about';
import { PlayerDashboardComponent } from './player-dashboard/player-dashboard';
import { GameEditComponent } from './admin/game-edit/game-edit.component';

// inject permet d’utiliser un service directement dans une fonction de route.
import { inject } from '@angular/core';

// Service utilisé pour vérifier si l'utilisateur est connecté.
import { AuthService } from './core/services/auth.service';

// Router permet de rediriger l'utilisateur vers une autre URL.
import { Router } from '@angular/router';

// Déclaration de toutes les routes Angular de l'application.
export const routes: Routes = [
  // Page d'accueil par défaut.
  { path: '', component: Home },

  // Page d'accueil accessible aussi avec /home.
  { path: 'home', component: Home },

  // Page de connexion.
  { path: 'login', component: LoginComponent },

  // Route protégée : dashboard administrateur.
  {
    path: 'dashboard',
    component: DashboardComponent,

    // Avant d’ouvrir la page, Angular vérifie si l'utilisateur est connecté.
    // Si oui : accès autorisé.
    // Sinon : redirection vers /login.
    canActivate: [
      () => inject(AuthService).isAuthenticated()
        ? true
        : inject(Router).parseUrl('/login')
    ]
  },

  // Route protégée : liste des jeux côté admin.
  {
    path: 'dashboard/games',
    component: GamesListComponent,
    canActivate: [
      () => inject(AuthService).isAuthenticated()
        ? true
        : inject(Router).parseUrl('/login')
    ]
  },

  // Route protégée : édition d'un jeu précis grâce au paramètre dynamique :id.
  {
    path: 'dashboard/games/:id',
    component: GameEditComponent,
    canActivate: [
      () => inject(AuthService).isAuthenticated()
        ? true
        : inject(Router).parseUrl('/login')
    ]
  },

  // Page permettant à un joueur de rejoindre une session.
  { path: 'join', component: JoinSession },

  // Page “à propos”.
  { path: 'about', component: AboutComponent },

  // Tableau de bord joueur.
  { path: 'player-dashboard', component: PlayerDashboardComponent },

  // Route du jeu d'association avec un identifiant de jeu dynamique.
  { path: 'session/association/:gameId', component: AssociationGameComponent },

  // Route du jeu mots croisés avec un code de session dynamique.
  { path: 'session/crossword/:sessionCode', component: CrosswordComponent },

  // Route du jeu formulation avec un code de session dynamique.
  { path: 'session/formulation/:sessionCode', component: FormulationComponent },

  // Route des résultats avec un code de session dynamique.
  { path: 'session/results/:sessionCode', component: ResultsComponent },

  // Page générale d'une session identifiée par son code.
  { path: 'session/:code', component: SessionComponent },

  // Route joker : si aucune route ne correspond, on redirige vers l'accueil.
  // Elle doit toujours être en dernier.
  { path: '**', redirectTo: '' }
];