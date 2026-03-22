// src/app/app.routes.ts

import { Routes } from '@angular/router';
import { Home } from './home/home';
import { JoinSession } from './join/join';
import { LoginComponent } from './auth/login/login';  // ← import direct
import { DashboardComponent } from './admin/dashboard/dashboard';
import { SessionComponent } from './session/session';
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
  { path: 'join', component: JoinSession },
  { path: 'session/:code', component: SessionComponent },
  { path: '**', redirectTo: '' }
];