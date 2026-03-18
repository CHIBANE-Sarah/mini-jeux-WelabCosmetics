import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-join-session',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './join.html',
  styleUrls: ['./join.css'],
})
export class JoinSession {
  nom = '';
  prenom = '';
  sessionCode = '';
  errorMessage = '';
  successMessage = '';
  isLoading = false;

  constructor(private router: Router, public authService: AuthService) {}

  join() {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.nom.trim() || !this.prenom.trim() || !this.sessionCode.trim()) {
      this.errorMessage = 'Tous les champs sont obligatoires.';
      return;
    }

    if (this.sessionCode.length < 4) {
      this.errorMessage = 'Le code de session doit contenir au moins 4 caractères.';
      return;
    }

    this.isLoading = true;

    // demo: backend absent, on simule la réussite
    setTimeout(() => {
      this.isLoading = false;
      this.successMessage = `Bravo ${this.prenom} ${this.nom}, vous avez rejoint la session ${this.sessionCode}.`;
      this.nom = '';
      this.prenom = '';
      this.sessionCode = '';

      setTimeout(() => {
        this.router.navigate(['/dashboard']);
      }, 1000);
    }, 800);
  }
}
