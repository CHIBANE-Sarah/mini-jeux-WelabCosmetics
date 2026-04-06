import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { SessionService, Session } from '../../core/services/session.service';
declare const bootstrap: any;

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class DashboardComponent implements OnInit {
  sessions: Session[] = [];
  isLoading = true;
  totalParticipants = 0;
  averageScore = 0;
  averageTime = 0;
  newTitre = '';
  newDuree: number | null = null;
  isCreating = false;
  createError = '';
  participations: any[] = [];
  showResults = false;
  isLoadingResults = false;

  constructor(
    private sessionService: SessionService,
    private authService: AuthService,
    public router: Router,
    private cdr: ChangeDetectorRef,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadSessions();
    this.loadStats();
  }

  loadSessions(): void {
    this.isLoading = true;
    this.sessionService.getMySessions().subscribe({
      next: (sessions) => {
        this.sessions = sessions;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur chargement sessions', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  loadStats(): void {
    this.sessionService.getDashboardStats().subscribe({
      next: (stats) => {
        this.totalParticipants = stats.totalParticipants;
        this.averageScore = stats.averageScore;
        this.averageTime = stats.averageTime;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erreur chargement stats', err),
    });
  }

  viewResults(): void {
    this.showResults = !this.showResults;
    if (this.showResults && this.participations.length === 0) {
      this.loadParticipations();
    }
  }

  loadParticipations(): void {
    this.isLoadingResults = true;
    this.http.get<any[]>('http://localhost:8000/api/participation').subscribe({
      next: (data) => {
        this.participations = data;
        this.isLoadingResults = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur chargement participations', err);
        this.isLoadingResults = false;
        this.cdr.detectChanges();
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
    this.sessionService
      .createSession({ titre: this.newTitre, duree: this.newDuree })
      .subscribe({
        next: () => {
          this.isCreating = false;
          this.closeCreateModal();
          this.loadSessions();
          this.loadStats();
        },
        error: (err) => {
          this.isCreating = false;
          this.createError = err.error?.message || 'Erreur lors de la création';
        },
      });
  }

  goToSession(code: string): void {
    this.router.navigate(['/session', code]);
  }

  copyCode(code: string): void {
    navigator.clipboard.writeText(code);
  }

  goToGames(): void {
    alert('Fonctionnalité disponible prochainement');
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}