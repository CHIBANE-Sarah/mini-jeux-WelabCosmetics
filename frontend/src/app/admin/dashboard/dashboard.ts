// Imports Angular pour créer le composant, gérer son chargement et forcer l'affichage si besoin.
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';

// CommonModule permet d'utiliser les directives Angular courantes comme *ngIf et *ngFor.
import { CommonModule } from '@angular/common';

// FormsModule permet d'utiliser les formulaires Angular.
import { FormsModule } from '@angular/forms';

// Router et RouterModule permettent la navigation entre les pages Angular.
import { Router, RouterModule } from '@angular/router';

// HttpClient permet de faire des appels HTTP directs vers l’API.
import { HttpClient } from '@angular/common/http';

// forkJoin permet d'attendre plusieurs requêtes en parallèle.
// of permet de retourner une valeur Observable simple en cas d’erreur.
import { forkJoin, of } from 'rxjs';

// map transforme une réponse, catchError intercepte une erreur.
import { catchError, map } from 'rxjs/operators';

// Service d'authentification utilisé pour la déconnexion.
import { AuthService } from '../../core/services/auth.service';

// Service de session utilisé pour créer, lister et supprimer des sessions.
import { SessionService, Session } from '../../core/services/session.service';

// Déclaration de la variable globale bootstrap utilisée pour ouvrir/fermer une modale.
declare const bootstrap: any;

// Type TypeScript qui limite les noms possibles des panneaux du dashboard.
type DashboardPanel = 'sessions' | 'participants' | 'scores' | 'times' | null;

// Déclaration du composant Angular du dashboard administrateur.
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class DashboardComponent implements OnInit {
  // Liste des sessions créées par l’administrateur.
  sessions: Session[] = [];

  // Nombre de jeux par session, indexé par code de session.
  gameCounts: Record<string, number> = {};

  // Indique si les données principales sont en cours de chargement.
  isLoading = true;

  // Statistiques affichées sur le dashboard.
  totalParticipants = 0;
  averageScore = 0;
  averageTime = 0;

  // Panneau actuellement ouvert dans le dashboard.
  activePanel: DashboardPanel = null;

  // Titre saisi pour créer une nouvelle session.
  newTitre = '';

  // Jeux sélectionnés par défaut lors de la création d’une session.
  selectedGames = {
    association: true,
    crossword: true,
    formulation: true,
  };

  // Durées par défaut des jeux, en minutes côté formulaire.
  gameDurations = {
    association: 10,
    crossword: 15,
    formulation: 20,
  };

  // États liés à la création de session.
  isCreating = false;
  createError = '';

  // Liste des participations récupérées pour les statistiques détaillées.
  participations: any[] = [];

  // Indique si les résultats détaillés sont visibles.
  showResults = false;

  // Indique si les participations sont en cours de chargement.
  isLoadingResults = false;

  // Injection des services nécessaires au dashboard.
  constructor(
    private sessionService: SessionService,
    private authService: AuthService,
    public router: Router,
    private cdr: ChangeDetectorRef,
    private http: HttpClient,
  ) {}

  // Méthode appelée automatiquement au chargement du dashboard.
  ngOnInit(): void {
    this.loadSessions();
    this.loadStats();
  }

  // Charge les sessions créées par l'administrateur connecté.
  loadSessions(): void {
    this.isLoading = true;

    this.sessionService.getMySessions().subscribe({
      next: (sessions) => {
        this.sessions = sessions;
        this.isLoading = false;

        // Après avoir chargé les sessions, on charge le nombre de jeux par session.
        this.loadGameCounts();

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur chargement sessions', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  // Charge le nombre de jeux associés à chaque session.
  loadGameCounts(): void {
    if (this.sessions.length === 0) return;

    // Crée une requête par session pour récupérer ses jeux.
    const requests = this.sessions.map((s) =>
      this.sessionService.getSessionGames(s.code).pipe(
        // Transforme la réponse en objet { code, count }.
        map((games) => ({ code: s.code, count: games.length })),

        // Si une session provoque une erreur, on retourne 0 jeu au lieu de bloquer tout le dashboard.
        catchError(() => of({ code: s.code, count: 0 })),
      ),
    );

    // Attend que toutes les requêtes soient terminées.
    forkJoin(requests).subscribe((items) => {
      items.forEach((item) => {
        this.gameCounts[item.code] = item.count;
      });

      this.cdr.detectChanges();
    });
  }

  // Charge les statistiques globales du dashboard.
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

  // Ouvre ou ferme un panneau du dashboard.
  togglePanel(panel: DashboardPanel): void {
    this.activePanel = this.activePanel === panel ? null : panel;

    // Si le panneau demandé a besoin des participations, on les charge une seule fois.
    if (
      (panel === 'participants' || panel === 'scores' || panel === 'times') &&
      this.participations.length === 0
    ) {
      this.loadParticipations();
    }
  }

  // Affiche ou masque la liste détaillée des résultats.
  viewResults(): void {
    this.showResults = !this.showResults;

    if (this.showResults && this.participations.length === 0) {
      this.loadParticipations();
    }
  }

  // Charge toutes les participations depuis l'API.
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

  // Retourne les participations triées par score décroissant.
  get sortedScores(): any[] {
    return [...this.participations].sort((a, b) => Number(b.scoreTotal) - Number(a.scoreTotal));
  }

  // Retourne les participations triées par durée croissante.
  get sortedTimes(): any[] {
    return [...this.participations].sort((a, b) => Number(a.tempsTotal) - Number(b.tempsTotal));
  }

  // Retourne une liste sans doublons joueur/session.
  get uniquePlayers(): any[] {
    const seen = new Set<string>();

    return this.participations.filter((p) => {
      const key = `${p.userName}-${p.sessionCode}`;

      if (seen.has(key)) return false;

      seen.add(key);
      return true;
    });
  }

  // Calcule la largeur CSS d'une barre de score.
  getScoreBarWidth(score: number): string {
    const value = Math.max(0, Math.min(100, Number(score) || 0));
    return value + '%';
  }

  // Calcule la largeur CSS d'une barre de temps par rapport au temps le plus long.
  getTimeBarWidth(seconds: number): string {
    const times = this.sortedTimes.map((p) => Number(p.tempsTotal) || 0);
    const max = Math.max(...times, 1);
    const value = Number(seconds) || 0;

    return Math.max(8, Math.round((value / max) * 100)) + '%';
  }

  // Retourne une icône ou un rang selon la position dans le classement.
  getRankIcon(index: number): string {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';

    return `${index + 1}.`;
  }

  // Formate une durée en secondes sous forme Xm YYs.
  formatSeconds(seconds: number): string {
    const value = Number(seconds) || 0;
    const min = Math.floor(value / 60);
    const sec = value % 60;

    return `${min}m ${sec.toString().padStart(2, '0')}s`;
  }

  // Ouvre la modale Bootstrap de création de session.
  openCreateModal(): void {
    this.createError = '';
    this.newTitre = '';

    // Réinitialise les jeux sélectionnés.
    this.selectedGames = {
      association: true,
      crossword: true,
      formulation: true,
    };

    // Réinitialise les durées par défaut.
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

  // Ferme la modale Bootstrap de création de session.
  closeCreateModal(): void {
    const modalElement = document.getElementById('createSessionModal');

    if (modalElement) {
      const modal = bootstrap.Modal.getInstance(modalElement);
      modal?.hide();
    }
  }

  // Retourne la liste des types de jeux sélectionnés dans le formulaire.
  getSelectedGameTypes(): string[] {
    const types: string[] = [];

    if (this.selectedGames.association) types.push('association');
    if (this.selectedGames.crossword) types.push('crossword');
    if (this.selectedGames.formulation) types.push('formulation');

    return types;
  }

  // Calcule la durée totale estimée en additionnant les durées des jeux sélectionnés.
  getEstimatedDuration(): number {
    let total = 0;

    if (this.selectedGames.association) total += Number(this.gameDurations.association) || 0;
    if (this.selectedGames.crossword) total += Number(this.gameDurations.crossword) || 0;
    if (this.selectedGames.formulation) total += Number(this.gameDurations.formulation) || 0;

    return total;
  }

  // Crée une nouvelle session à partir du formulaire admin.
  createSession(): void {
    // Vérifie que le titre n’est pas vide.
    if (!this.newTitre.trim()) {
      this.createError = 'Veuillez saisir un titre';
      return;
    }

    const gameTypes = this.getSelectedGameTypes();

    // Vérifie qu'au moins un jeu est sélectionné.
    if (gameTypes.length === 0) {
      this.createError = 'Sélectionnez au moins un jeu';
      return;
    }

    // Prépare les durées envoyées au backend.
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

    // Envoie la demande de création au backend.
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

          // Ferme la modale et recharge les données.
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

  // Redirige vers la page de gestion des jeux.
  goToGames(): void {
    this.router.navigate(['/dashboard/games']);
  }

  // Déconnecte l'utilisateur et redirige vers la page login.
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // Supprime une session après confirmation.
  deleteSession(code: string): void {
    if (!confirm(`Supprimer la session "${code}" ? Cette action est irréversible.`)) {
      return;
    }

    this.sessionService.deleteSession(code).subscribe({
      next: () => {
        // Retire localement la session supprimée de la liste affichée.
        this.sessions = this.sessions.filter((s) => s.code !== code);
        this.cdr.detectChanges();
      },
      error: (err) => {
        alert('Impossible de supprimer cette session : ' + (err.error?.message || 'erreur serveur'));
      },
    });
  }
}