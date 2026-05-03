// Component permet de déclarer un composant Angular.
// OnInit permet d’exécuter du code au chargement du composant.
// ChangeDetectorRef permet de forcer Angular à mettre à jour l'affichage si nécessaire.
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';

// CommonModule donne accès aux directives Angular courantes comme *ngIf et *ngFor.
import { CommonModule } from '@angular/common';

// ActivatedRoute permet de récupérer les paramètres dans l'URL.
// Router permet de naviguer vers une autre page.
import { ActivatedRoute, Router } from '@angular/router';

// Service utilisé pour récupérer les informations de session depuis le backend.
import { SessionService, Session } from '../core/services/session.service';

// forkJoin permet d'exécuter plusieurs requêtes en parallèle et d'attendre leurs résultats.
import { forkJoin } from 'rxjs';

// Déclaration du composant Angular représentant la page d’une session.
@Component({
  selector: 'app-session',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './session.html',
  styleUrls: ['./session.css']
})
export class SessionComponent implements OnInit {
  // Contient les informations de la session récupérée depuis le backend.
  session: Session | null = null;

  // Contient la liste des jeux associés à la session.
  games: any[] = [];

  // Indique si les données sont en cours de chargement.
  isLoading = true;

  // Message d’erreur affiché si la session n'est pas trouvée.
  error = '';

  // Nom du joueur récupéré depuis le localStorage.
  playerName = '';

  // Injection des services nécessaires au fonctionnement de la page.
  constructor(
    private route: ActivatedRoute,
    private sessionService: SessionService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  // Méthode appelée automatiquement au chargement du composant.
  ngOnInit(): void {
    // Récupère le paramètre dynamique "code" dans l’URL /session/:code.
    const code = this.route.snapshot.paramMap.get('code');

    // Récupère le nom du joueur stocké lors de l'étape "rejoindre une session".
    this.playerName = localStorage.getItem('player_name') || 'Joueur';

    // Si un code existe dans l'URL, on charge la session et ses jeux.
    if (code) {
      this.loadSessionAndGames(code);
    }
  }

  // Charge en parallèle les informations de la session et les jeux associés.
  loadSessionAndGames(code: string): void {
    this.isLoading = true;

    // forkJoin attend que les deux requêtes soient terminées avant d'exécuter next.
    forkJoin({
      session: this.sessionService.getSessionByCode(code),
      games: this.sessionService.getSessionGames(code)
    }).subscribe({
      next: ({ session, games }) => {
        // Stocke les données reçues du backend dans les variables du composant.
        this.session = session;
        this.games = games;

        // Sauvegarde les jeux et le titre de la session pour les pages suivantes.
        localStorage.setItem('session_games', JSON.stringify(games));
        localStorage.setItem('session_title', session.titre);

        // Fin du chargement.
        this.isLoading = false;

        // Force la mise à jour de l'interface.
        this.cdr.detectChanges();
      },

      // Si une des deux requêtes échoue, on affiche une erreur.
      error: () => {
        this.error = 'Session non trouvée';
        this.isLoading = false;

        // Force la mise à jour de l'interface après l'erreur.
        this.cdr.detectChanges();
      }
    });
  }

  // Lance le parcours de jeux de la session.
  startGames(): void {
    // Si la session ou les jeux ne sont pas disponibles, on arrête la méthode.
    if (!this.session || this.games.length === 0) return;

    // Enregistre l'heure de début pour calculer la durée plus tard.
    localStorage.setItem('session_start_time', String(Date.now()));

    // Redirige vers le premier jeu de la session.
    this.navigateToGame(this.games[0]);
  }

  // Redirige l'utilisateur vers le composant correspondant au type de jeu.
  navigateToGame(game: any): void {
    const code = this.session?.code;

    // Selon le type du jeu, on choisit une route différente.
    switch (game.type) {
      case 'crossword':
        this.router.navigate(['/session/crossword', code]);
        break;

      case 'association':
        this.router.navigate(['/session/association', game.id]);
        break;

      case 'formulation':
        this.router.navigate(['/session/formulation', code]);
        break;
    }
  }

  // Retourne vers la page d'accueil.
  goBack(): void {
    this.router.navigate(['/']);
  }
}