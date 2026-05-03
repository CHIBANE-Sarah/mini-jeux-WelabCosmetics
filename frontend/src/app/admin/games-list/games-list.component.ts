// Imports Angular pour créer le composant, gérer son chargement et forcer l'affichage.
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';

// CommonModule permet d'utiliser les directives Angular comme *ngIf et *ngFor.
import { CommonModule } from '@angular/common';

// Router permet de naviguer vers une autre page.
import { Router } from '@angular/router';

// Service admin permettant de récupérer la liste des jeux.
import { GameAdminService, GameAdmin } from '../../core/services/game-admin.service';

// Déclaration du composant Angular qui affiche la liste des jeux côté admin.
@Component({
  selector: 'app-games-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './games-list.component.html',
  styleUrls: ['./games-list.component.css'],
})
export class GamesListComponent implements OnInit {
  // Liste des jeux reçus depuis le backend.
  games: GameAdmin[] = [];

  // État de chargement.
  isLoading = true;

  // Message d'erreur affiché si le chargement échoue.
  error = '';

  // Injection du service admin, du routeur et du détecteur de changement.
  constructor(
    private gameAdminService: GameAdminService,
    public router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  // Méthode appelée automatiquement au chargement du composant.
  ngOnInit(): void {
    this.loadGames();
  }

  // Charge la liste des jeux depuis l'API admin.
  loadGames(): void {
    this.isLoading = true;

    this.gameAdminService.getGames().subscribe({
      next: (games) => {
        this.games = games;
        this.isLoading = false;

        // Force la mise à jour de l'interface.
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Impossible de charger les jeux.';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  // Redirige vers la page d'édition d'un jeu précis.
  goToEdit(gameId: number): void {
    this.router.navigate(['/dashboard/games', gameId]);
  }

  // Retourne au dashboard admin.
  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  // Convertit le type technique du jeu en libellé lisible.
  getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      association: 'Association Termes & Définitions',
      crossword: 'Mots Croisés Cosmétiques',
      formulation: 'Formulation de Produit',
    };

    return labels[type] ?? type;
  }

  // Retourne l'icône Bootstrap associée au type de jeu.
  getTypeIcon(type: string): string {
    const icons: Record<string, string> = {
      association: 'bi-arrows-angle-contract',
      crossword: 'bi-grid-3x3',
      formulation: 'bi-droplet',
    };

    return icons[type] ?? 'bi-controller';
  }

  // Retourne la durée indicative du type de jeu.
  getTypeDuration(type: string): string {
    const durations: Record<string, string> = {
      association: '10 min',
      crossword: '15 min',
      formulation: '20 min',
    };

    return durations[type] ?? '—';
  }

  // Retourne une classe CSS selon le type de jeu.
  getTypeClass(type: string): string {
    const classes: Record<string, string> = {
      association: 'type-assoc',
      crossword: 'type-cross',
      formulation: 'type-form',
    };

    return classes[type] ?? '';
  }
}