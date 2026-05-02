import { Routes } from '@angular/router';
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
import { inject } from '@angular/core';
import { AuthService } from './core/services/auth.service';
import { Router } from '@angular/router';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'home', component: Home },
  { path: 'login', component: LoginComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [() => inject(AuthService).isAuthenticated() ? true : inject(Router).parseUrl('/login')]
  },
  {
    path: 'dashboard/games',
    component: GamesListComponent,
    canActivate: [() => inject(AuthService).isAuthenticated() ? true : inject(Router).parseUrl('/login')]
  },
  {
    path: 'dashboard/games/:id',
    component: GameEditComponent,
    canActivate: [() => inject(AuthService).isAuthenticated() ? true : inject(Router).parseUrl('/login')]
  },
  { path: 'join', component: JoinSession },
  { path: 'about', component: AboutComponent },
  { path: 'player-dashboard', component: PlayerDashboardComponent },
  { path: 'session/association/:gameId', component: AssociationGameComponent },
  { path: 'session/crossword/:sessionCode', component: CrosswordComponent },
  { path: 'session/formulation/:sessionCode', component: FormulationComponent },
  { path: 'session/results/:sessionCode', component: ResultsComponent },
  { path: 'session/:code', component: SessionComponent },
  { path: '**', redirectTo: '' }  // ← toujours en DERNIER
];