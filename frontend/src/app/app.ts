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

  isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }

  isPlayerInSession(): boolean {
    return !!localStorage.getItem('session_code');
  }

  logout(): void {
    this.authService.logout();
  }

  goBack(): void {
    window.history.back();
  }

  isLoginPage(): boolean {
    return this.router.url === '/login';
  }
}
