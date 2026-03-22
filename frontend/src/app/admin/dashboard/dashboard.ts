// src/app/admin/dashboard/dashboard.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { SessionService, Session } from '../../core/services/session.service';

declare var bootstrap: any;

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {
  sessions: Session[] = [];
  isLoading = true;
  totalParticipants = 0;
  
  // Statistiques (valeurs par défaut pour l'instant)
  averageScore = 82;
  averageTime = 38;
  
  // Pour le modal
  newTitre = '';
  newDuree: number | null = null;
  isCreating = false;
  createError = '';

  constructor(
    private sessionService: SessionService,
    private authService: AuthService,
    public router: Router  // ← public pour accéder depuis le template
  ) {}

  ngOnInit(): void {
    this.loadSessions();
  }

  loadSessions(): void {
    this.isLoading = true;
    this.sessionService.getMySessions().subscribe({
      next: (sessions) => {
        this.sessions = sessions;
        this.totalParticipants = this.sessions.reduce(
          (total, s) => total + (s.nbParticipants || 0), 0
        );
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur chargement sessions', err);
        this.isLoading = false;
      }
    });
  }

  openCreateModal(): void {
    this.createError = '';
    this.newTitre = '';
    this.newDuree = null;
    const modalElement = document.getElementById('createSessionModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  closeCreateModal(): void {
    const modalElement = document.getElementById('createSessionModal');
    if (modalElement) {
      const modal = bootstrap.Modal.getInstance(modalElement);
      modal?.hide();
    }
  }

  createSession(): void {
    if (!this.newTitre || !this.newDuree) {
      this.createError = 'Veuillez remplir tous les champs';
      return;
    }

    this.isCreating = true;
    this.createError = '';

    this.sessionService.createSession({
      titre: this.newTitre,
      duree: this.newDuree
    }).subscribe({
      next: () => {
        this.isCreating = false;
        this.closeCreateModal();
        this.loadSessions();
      },
      error: (err) => {
        this.isCreating = false;
        this.createError = err.error?.message || 'Erreur lors de la création';
      }
    });
  }

  goToSession(code: string): void {
    this.router.navigate(['/session', code]);
  }

  copyCode(code: string): void {
    navigator.clipboard.writeText(code);
  }

  viewResults(): void {
    this.router.navigate(['/admin/results']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}