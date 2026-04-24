import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { SessionService, Session } from '../../core/services/session.service';
declare const bootstrap: any;

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class DashboardComponent implements OnInit {
  sessions: Session[] = [];
  isLoading = true;
  totalParticipants = 0;
  averageScore = 0;
  averageTime = 0;

  // ── Création session ──
  newTitre = '';
  newDuree: number | null = null;
  selectedGames = {
    association: true,
    crossword: true,
    formulation: true,
  };
  isCreating = false;
  createError = '';

  // ── Résultats ──
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
        this.averageScore      = stats.averageScore;
        this.averageTime       = stats.averageTime;
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
      },
    });
  }

  openCreateModal(): void {
    this.createError = '';
    this.newTitre = '';
    this.newDuree = null;
    this.selectedGames = { association: true, crossword: true, formulation: true };
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

  getSelectedGameTypes(): string[] {
    const types: string[] = [];
    if (this.selectedGames.association) types.push('association');
    if (this.selectedGames.crossword)   types.push('crossword');
    if (this.selectedGames.formulation) types.push('formulation');
    return types;
  }

  /** Durée estimée en MINUTES selon les jeux sélectionnés */
  getEstimatedDuration(): number {
    let total = 0;
    if (this.selectedGames.association) total += 10;
    if (this.selectedGames.crossword)   total += 15;
    if (this.selectedGames.formulation) total += 20;
    return total;
  }

  createSession(): void {
    if (!this.newTitre.trim()) {
      this.createError = 'Veuillez saisir un titre';
      return;
    }
    const gameTypes = this.getSelectedGameTypes();
    if (gameTypes.length === 0) {
      this.createError = 'Sélectionnez au moins un jeu';
      return;
    }

    this.isCreating = true;
    this.createError = '';

    // CORRECTION BUG #3 (côté frontend) :
    // La BDD stocke la durée en SECONDES. On envoie les minutes saisies × 60.
    // SessionController.php multiplie aussi par 60 côté backend pour la cohérence
    // avec les fixtures (900 = 15 min, 600 = 10 min…).
    const dureeMinutes = this.newDuree ?? this.getEstimatedDuration();

    this.sessionService
      .createSession({ titre: this.newTitre.trim(), duree: dureeMinutes, gameTypes })
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

  goToGames(): void {
    this.router.navigate(['/dashboard/games']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}