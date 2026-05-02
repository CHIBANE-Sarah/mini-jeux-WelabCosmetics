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
  avatar = 'bi-eyedropper';
  avatars = ['bi-eyedropper', 'bi-flower1', 'bi-droplet', 'bi-tree', 'bi-droplet-half', 'bi-stars'];
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

    const normalizedCode = this.sessionCode.trim().toUpperCase();
    if (normalizedCode.length < 4) {
      this.errorMessage = 'Le code de session doit contenir au moins 4 caractères.';
      return;
    }

    this.isLoading = true;

    this.sessionService.getSessionByCode(normalizedCode).subscribe({
      next: (session) => {
        
        this.sessionService
          .joinSession(normalizedCode, this.nom.trim(), this.prenom.trim())
          .subscribe({
            next: () => {
              this.isLoading = false;

              
              this.successMessage = `Bravo ${this.prenom} ${this.nom}, vous avez rejoint la session : ${session.titre} !`;

              
              localStorage.setItem(
                'welab.participant',
                JSON.stringify({
                  nom: this.nom.trim(),
                  prenom: this.prenom.trim(),
                  sessionCode: session.code,
                  avatar: this.avatar,
                })
              );

              
              localStorage.setItem('player_name', this.prenom + ' ' + this.nom);
              localStorage.setItem('session_code', normalizedCode);
              localStorage.removeItem('session_start_time');

      
              setTimeout(() => {
                this.router.navigate(['/session', normalizedCode]);
              }, 1500);
            },
            error: () => {
              this.isLoading = false;
              this.errorMessage = 'Impossible de rejoindre cette session pour le moment.';
            },
          });
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage =
          err.status === 404 ? 'Code de session introuvable.' : 'Erreur de connexion au serveur.';
      },
    });
  }
}
