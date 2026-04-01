import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SessionService, Session } from '../core/services/session.service';
import { forkJoin } from 'rxjs';

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
  playerName = '';

  constructor(
    private route: ActivatedRoute,
    private sessionService: SessionService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const code = this.route.snapshot.paramMap.get('code');
    this.playerName = localStorage.getItem('player_name') || 'Joueur';
    if (code) {
      this.loadSessionAndGames(code);
    }
  }

  loadSessionAndGames(code: string): void {
    this.isLoading = true;
    forkJoin({
      session: this.sessionService.getSessionByCode(code),
      games: this.sessionService.getSessionGames(code)
    }).subscribe({
      next: ({ session, games }) => {
        this.session = session;
        this.games = games;
        localStorage.setItem('session_games', JSON.stringify(games));
        localStorage.setItem('session_title', session.titre);
        this.isLoading = false;
        this.cdr.detectChanges(); 
      },
      error: () => {
        this.error = 'Session non trouvée';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  startGames(): void {
    if (!this.session || this.games.length === 0) return;
    this.navigateToGame(this.games[0]);
  }

  navigateToGame(game: any): void {
    const code = this.session?.code;
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

  goBack(): void {
    this.router.navigate(['/']);
  }
}