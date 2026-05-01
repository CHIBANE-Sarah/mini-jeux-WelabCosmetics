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

  selectedGames = {
    association: true,
    crossword: true,
    formulation: true,
  };

  gameDurations = {
    association: 10,
    crossword: 15,
    formulation: 20,
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
    private http: HttpClient,
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
      },
    });
  }

  openCreateModal(): void {
    this.createError = '';
    this.newTitre = '';

    this.selectedGames = {
      association: true,
      crossword: true,
      formulation: true,
    };

    this.gameDurations = {
      association: 10,
      crossword: 15,
      formulation: 20,
    };

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
    if (this.selectedGames.crossword) types.push('crossword');
    if (this.selectedGames.formulation) types.push('formulation');

    return types;
  }

  getEstimatedDuration(): number {
    let total = 0;

    if (this.selectedGames.association) total += Number(this.gameDurations.association) || 0;
    if (this.selectedGames.crossword) total += Number(this.gameDurations.crossword) || 0;
    if (this.selectedGames.formulation) total += Number(this.gameDurations.formulation) || 0;

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

    const selectedDurations: Record<string, number> = {};

    if (this.selectedGames.association) {
      selectedDurations['association'] = Math.max(1, Number(this.gameDurations.association) || 10);
    }

    if (this.selectedGames.crossword) {
      selectedDurations['crossword'] = Math.max(1, Number(this.gameDurations.crossword) || 15);
    }

    if (this.selectedGames.formulation) {
      selectedDurations['formulation'] = Math.max(1, Number(this.gameDurations.formulation) || 20);
    }

    this.isCreating = true;
    this.createError = '';

    this.sessionService
      .createSession({
        titre: this.newTitre.trim(),
        duree: this.getEstimatedDuration(),
        gameTypes,
        gameDurations: selectedDurations,
      })
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
          this.cdr.detectChanges();
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

  deleteSession(code: string): void {
    if (!confirm(`Supprimer la session "${code}" ? Cette action est irréversible.`)) {
      return;
    }

    this.sessionService.deleteSession(code).subscribe({
      next: () => {
        this.sessions = this.sessions.filter((s) => s.code !== code);
        this.cdr.detectChanges();
      },
      error: (err) => {
        alert(
          'Impossible de supprimer cette session : ' + (err.error?.message || 'erreur serveur'),
        );
      },
    });
  }
}
