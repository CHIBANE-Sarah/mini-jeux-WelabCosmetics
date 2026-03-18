import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class DashboardAdmin {
  sessions = [
    { titre: 'Session WeLab 1', code: 'A12B3C', dateCreation: new Date(), duree: 20, nbParticipants: 10 },
    { titre: 'Session WeLab 2', code: 'D45E6F', dateCreation: new Date(), duree: 19, nbParticipants: 10 },
  ];
  totalParticipants = this.sessions.reduce((sum, s) => sum + (s.nbParticipants || 0), 0);

  isLoading = false;

  constructor(public authService: AuthService, private router: Router) {}

  logout() {
    this.authService.logout();
  }

  createSession() {
    alert('Création de session (mode démo)');
  }

  goToSession(code: string) {
    this.router.navigate(['/session', code]);
  }

  joinPage() {
    this.router.navigate(['/join']);
  }
}
