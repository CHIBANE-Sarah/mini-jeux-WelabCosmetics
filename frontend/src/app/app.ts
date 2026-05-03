import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  currentUrl(): string {
    return this.router.url.split('?')[0].split('#')[0];
  }

  isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }

  isPlayerInSession(): boolean {
    return !!localStorage.getItem('session_code') || !!localStorage.getItem('welab.participant');
  }

  isLoginPage(): boolean {
    return this.currentUrl() === '/login';
  }

  isDashboardPage(): boolean {
    return this.currentUrl() === '/dashboard';
  }

  isAboutPage(): boolean {
    return this.currentUrl() === '/about';
  }

  isJoinPage(): boolean {
    return this.currentUrl() === '/join';
  }

  isSessionFlow(): boolean {
    return this.currentUrl().startsWith('/session');
  }

  showJoinLink(): boolean {
    return !this.isJoinPage() && !this.isSessionFlow();
  }

  showDashboardLink(): boolean {
    return this.isLoggedIn() && !this.isDashboardPage();
  }

  showLoginLink(): boolean {
    return !this.isLoggedIn() && !this.isPlayerInSession() && !this.isLoginPage();
  }

  showPlayerProfileLink(): boolean {
    return this.isPlayerInSession() && !this.isLoginPage() && this.currentUrl() !== '/player-dashboard';
  }

  logout(): void {
    this.authService.logout();
  }

  goBack(): void {
    window.history.back();
  }
}
