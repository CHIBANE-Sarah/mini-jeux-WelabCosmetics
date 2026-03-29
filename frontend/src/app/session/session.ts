import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SessionService, Session } from '../core/services/session.service';

@Component({
  selector: 'app-session',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './session.html',
  styleUrls: ['./session.css']
})
export class SessionComponent implements OnInit {
  session: Session | null = null;
  games: any[] = [];
  isLoading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private sessionService: SessionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const code = this.route.snapshot.paramMap.get('code');
    if (code) {
      this.loadSessionAndGames(code);
    }
  }

  loadSessionAndGames(code: string): void {
    this.isLoading = true;
    
    // 1. Charger la session
    this.sessionService.getSessionByCode(code).subscribe({
      next: (session) => {
        this.session = session;
        
        // 2. Charger les jeux de la session
        this.sessionService.getSessionGames(code).subscribe({
          next: (games) => {
            this.games = games;
            this.isLoading = false;
            
            // 3. Si une seule jeu, lancer directement
            if (this.games.length === 1) {
              this.startGame(this.games[0]);
            }
            // Si plusieurs jeux, afficher la sélection
          },
          error: (err) => {
            console.error('Erreur chargement jeux:', err);
            this.isLoading = false;
          }
        });
      },
      error: (err) => {
        this.error = 'Session non trouvée';
        this.isLoading = false;
      }
    });
  }

  startGame(game: any): void {
    // Naviguer vers le jeu d'association avec l'ID du jeu
    this.router.navigate(['/session/association', game.id]);
  }

  copyCode(): void {
    if (this.session) {
      navigator.clipboard.writeText(this.session.code);
    }
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}