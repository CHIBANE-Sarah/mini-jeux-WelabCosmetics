// src/app/join/join.ts

import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SessionService } from '../core/services/session.service';
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

  constructor(
    private router: Router,
    public authService: AuthService,
    private sessionService: SessionService
  ) {}

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

    this.sessionService.getSessionByCode(this.sessionCode).subscribe({
      next: (session) => {
        this.isLoading = false;
        this.successMessage = `Bravo ${this.prenom} ${this.nom}, vous avez rejoint la session : ${session.titre} !`;
        
        // ✅ Redirection vers la page de la session
        setTimeout(() => {
          this.router.navigate(['/session', this.sessionCode]);
        }, 1500);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.status === 404 ? 'Code de session introuvable.' : 'Erreur de connexion au serveur.';
      }
    });
  }
}