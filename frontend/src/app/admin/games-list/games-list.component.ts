import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GameAdminService, GameAdmin } from '../../core/services/game-admin.service';

@Component({
  selector: 'app-games-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './games-list.component.html',
  styleUrls: ['./games-list.component.css'],
})
export class GamesListComponent implements OnInit {
  games: GameAdmin[] = [];
  isLoading = true;
  error = '';

  constructor(
    private gameAdminService: GameAdminService,
    public router: Router,
    private cdr: ChangeDetectorRef   // ← AJOUT
  ) {}

  ngOnInit(): void {
    this.loadGames();
  }

  loadGames(): void {
    this.isLoading = true;
    this.gameAdminService.getGames().subscribe({
      next: (games) => {
        this.games = games;
        this.isLoading = false;
        this.cdr.detectChanges();    // ← AJOUT
      },
      error: () => {
        this.error = 'Impossible de charger les jeux.';
        this.isLoading = false;
        this.cdr.detectChanges();    // ← AJOUT
      },
    });
  }

  goToEdit(gameId: number): void {
    this.router.navigate(['/dashboard/games', gameId]);
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      association: 'Association Termes & Définitions',
      crossword: 'Mots Croisés Cosmétiques',
      formulation: 'Formulation de Produit',
    };
    return labels[type] ?? type;
  }

  getTypeIcon(type: string): string {
    const icons: Record<string, string> = {
      association: 'bi-arrows-angle-contract',
      crossword: 'bi-grid-3x3',
      formulation: 'bi-droplet',
    };
    return icons[type] ?? 'bi-controller';
  }

  getTypeDuration(type: string): string {
    const durations: Record<string, string> = {
      association: '10 min',
      crossword: '15 min',
      formulation: '20 min',
    };
    return durations[type] ?? '—';
  }

  getTypeClass(type: string): string {
    const classes: Record<string, string> = {
      association: 'type-assoc',
      crossword: 'type-cross',
      formulation: 'type-form',
    };
    return classes[type] ?? '';
  }
}