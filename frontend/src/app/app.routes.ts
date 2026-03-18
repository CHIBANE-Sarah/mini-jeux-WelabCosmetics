import { Routes } from '@angular/router';
import { Home } from './home/home';
import { JoinSession } from './join/join';
import { Login } from './auth/login/login';
import { DashboardAdmin } from './admin/dashboard/dashboard';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'home', component: Home },
  { path: 'login', component: Login },
  { path: 'dashboard', component: DashboardAdmin },
  { path: 'join', component: JoinSession },
  { path: '**', redirectTo: '' },
];
