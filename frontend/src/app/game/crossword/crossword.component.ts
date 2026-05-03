// Imports Angular pour le composant, son cycle de vie, la détection de changements et le timer.
import {
  Component,
  OnInit,
  ChangeDetectorRef,
  OnDestroy,
  NgZone,
  ChangeDetectionStrategy,
} from '@angular/core';

// CommonModule permet d'utiliser les directives Angular courantes.
import { CommonModule } from '@angular/common';

// FormsModule permet de gérer les saisies utilisateur.
import { FormsModule } from '@angular/forms';

// ActivatedRoute permet de récupérer le code de session dans l'URL.
// Router permet de naviguer vers une autre page.
import { ActivatedRoute, Router } from '@angular/router';

// Service qui communique avec l'API Symfony pour le jeu de mots croisés.
import { CrosswordService } from '../../core/services/crossword.service';

// Représente une cellule de la grille de mots croisés.
interface CellData {
  letter: string;
  isBlack: boolean;
  wordIndex: number;
  letterIndex: number;
  number?: number;
}

// Représente un mot à placer dans la grille.
interface WordConfig {
  id: number;
  definition: string;
  motCorrect: string;
  row: number;
  col: number;
  direction: 'horizontal' | 'vertical';
  number: number;
}

// Déclaration du composant Angular du jeu de mots croisés.
@Component({
  selector: 'app-crossword',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crossword.component.html',
  styleUrls: ['./crossword.component.css'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class CrosswordComponent implements OnInit, OnDestroy {
  // Grille du jeu.
  grid: CellData[][] = [];

  // Liste des mots et définitions.
  words: WordConfig[] = [];

  // Lettres saisies par l’utilisateur.
  userInputs: string[][] = [];

  // États et résultats du jeu.
  isLoading = true;
  score: number | null = null;
  total: number | null = null;
  corrections: any[] = [];

  // Code de session récupéré dans l’URL.
  sessionCode = '';

  // Temps restant du jeu, en secondes.
  timeLeft = 420;

  // Référence du timer.
  timer: any;

  // Cellule actuellement sélectionnée.
  selectedCell: { row: number; col: number } | null = null;

  // Dimensions fixes de la grille.
  private readonly GRID_ROWS = 12;
  private readonly GRID_COLS = 13;

  // Positions prédéfinies des mots dans la grille.
  private readonly WORD_POSITIONS = [
    { row: 0, col: 0, direction: 'horizontal' as const, number: 1 },
    { row: 3, col: 1, direction: 'horizontal' as const, number: 2 },
    { row: 1, col: 9, direction: 'vertical' as const, number: 3 },
    { row: 7, col: 0, direction: 'horizontal' as const, number: 4 },
    { row: 7, col: 11, direction: 'vertical' as const, number: 5 },
  ];

  // Injection des services nécessaires.
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private crosswordService: CrosswordService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
  ) {}

  // Méthode appelée au chargement du composant.
  ngOnInit(): void {
    this.sessionCode = this.route.snapshot.paramMap.get('sessionCode') || '';
    this.applyGameDuration();
    this.loadQuestions();
    this.startTimer();
  }

  // Récupère la durée configurée pour le jeu crossword dans le localStorage.
  private applyGameDuration(): void {
    const games = JSON.parse(localStorage.getItem('session_games') || '[]');
    const currentGame = games.find((g: any) => g.type === 'crossword');

    if (currentGame?.duree) {
      this.timeLeft = currentGame.duree;
    }
  }

  // Charge les questions de mots croisés depuis le backend.
  loadQuestions(): void {
    this.crosswordService.getQuestions(this.sessionCode).subscribe({
      next: (questions) => {
        // On limite le nombre de questions au nombre de positions prévues.
        this.words = questions.slice(0, this.WORD_POSITIONS.length).map((q, i) => ({
          ...q,
          ...this.WORD_POSITIONS[i],
        }));

        // Construit la grille à partir des mots.
        this.buildGrid();

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  // Construit la grille de mots croisés.
  buildGrid(): void {
    // Crée une grille noire par défaut.
    this.grid = Array.from({ length: this.GRID_ROWS }, () =>
      Array.from({ length: this.GRID_COLS }, () => ({
        letter: '',
        isBlack: true,
        wordIndex: -1,
        letterIndex: -1,
      })),
    );

    // Initialise la grille des réponses utilisateur.
    this.userInputs = Array.from({ length: this.GRID_ROWS }, () => Array(this.GRID_COLS).fill(''));

    // Place chaque mot dans la grille selon sa position et sa direction.
    this.words.forEach((word, wi) => {
      for (let i = 0; i < word.motCorrect.length; i++) {
        const r = word.direction === 'horizontal' ? word.row : word.row + i;
        const c = word.direction === 'horizontal' ? word.col + i : word.col;

        // Sécurité : si le mot dépasse la grille, on ignore la lettre.
        if (r < 0 || r >= this.GRID_ROWS || c < 0 || c >= this.GRID_COLS) {
          console.warn(
            `Mot "${word.motCorrect}" dépasse la grille à la position (${r}, ${c}). Lettre ignorée.`,
          );
          continue;
        }

        // Rend la cellule utilisable et y stocke les informations du mot.
        this.grid[r][c] = {
          letter: word.motCorrect[i],
          isBlack: false,
          wordIndex: wi,
          letterIndex: i,
          number: i === 0 ? word.number : undefined,
        };
      }
    });
  }

  // Sélectionne une cellule si elle est jouable.
  selectCell(row: number, col: number): void {
    if (this.grid[row][col].isBlack || this.score !== null) return;
    this.selectedCell = { row, col };
  }

  // Gère la saisie clavier dans une cellule.
  onKeyInput(event: KeyboardEvent, row: number, col: number): void {
    if (this.score !== null) return;

    const key = event.key.toUpperCase();

    // Si l’utilisateur tape une lettre, on l’enregistre.
    if (/^[A-Z]$/.test(key)) {
      this.userInputs[row][col] = key;
      this.moveToNext(row, col);

    // Si l’utilisateur appuie sur Backspace, on efface la cellule.
    } else if (event.key === 'Backspace') {
      this.userInputs[row][col] = '';
    }

    this.cdr.detectChanges();
  }

  // Déplace la sélection vers la cellule suivante du mot.
  moveToNext(row: number, col: number): void {
    const cell = this.grid[row][col];

    if (cell.wordIndex === -1) return;

    const word = this.words[cell.wordIndex];
    const nextRow = word.direction === 'horizontal' ? row : row + 1;
    const nextCol = word.direction === 'horizontal' ? col + 1 : col;

    if (
      nextRow < this.GRID_ROWS &&
      nextCol < this.GRID_COLS &&
      !this.grid[nextRow][nextCol].isBlack
    ) {
      this.selectedCell = { row: nextRow, col: nextCol };
    }
  }

  // Indique si une cellule est actuellement sélectionnée.
  isSelected(row: number, col: number): boolean {
    return this.selectedCell?.row === row && this.selectedCell?.col === col;
  }

  // Formate le temps restant en mm:ss.
  get formattedTime(): string {
    const m = Math.floor(this.timeLeft / 60)
      .toString()
      .padStart(2, '0');
    const s = (this.timeLeft % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  // Valide les réponses saisies par l'utilisateur.
  validate(): void {
    clearInterval(this.timer);

    // Reconstruit les mots saisis à partir de la grille utilisateur.
    const reponses = this.words.map((word) => {
      let rep = '';

      for (let i = 0; i < word.motCorrect.length; i++) {
        const r = word.direction === 'horizontal' ? word.row : word.row + i;
        const c = word.direction === 'horizontal' ? word.col + i : word.col;

        if (r < this.GRID_ROWS && c < this.GRID_COLS) {
          rep += this.userInputs[r][c] || '_';
        }
      }

      return { id: word.id, reponse: rep };
    });

    // Envoie les réponses au backend pour correction.
    this.crosswordService.validate(reponses).subscribe({
      next: (result) => {
        this.ngZone.run(() => {
          this.score = result.score;
          this.total = result.total;
          this.corrections = result.corrections;

          // Stocke le score pour la page de résultats.
          localStorage.setItem('score_crossword', String(result.score));
          localStorage.setItem('total_crossword', String(result.total));

          this.cdr.detectChanges();
        });
      },
    });
  }

  // Démarre le compte à rebours.
  startTimer(): void {
    this.timer = setInterval(() => {
      this.timeLeft--;
      this.cdr.detectChanges();

      // Si le temps est écoulé, validation automatique.
      if (this.timeLeft <= 0) {
        clearInterval(this.timer);
        this.validate();
      }
    }, 1000);
  }

  // Réinitialise la grille.
  resetGrid(): void {
    this.buildGrid();
  }

  // Abandonne le jeu et attribue un score de 0.
  abandonner(): void {
    if (!confirm('Abandonner ce jeu ? Votre score sera 0 pour cette partie.')) return;

    clearInterval(this.timer);

    localStorage.setItem('score_crossword', '0');
    localStorage.setItem('total_crossword', String(this.words.length || 5));

    this.nextGame();
  }

  // Redirige vers le jeu suivant ou vers les résultats.
  nextGame(): void {
    const games = JSON.parse(localStorage.getItem('session_games') || '[]');
    const currentIndex = games.findIndex((g: any) => g.type === 'crossword');
    const nextGame = games[currentIndex + 1];

    if (!nextGame) {
      this.router.navigate(['/session/results', this.sessionCode]);
      return;
    }

    switch (nextGame.type) {
      case 'association':
        this.router.navigate(['/session/association', nextGame.id]);
        break;
      case 'formulation':
        this.router.navigate(['/session/formulation', this.sessionCode]);
        break;
      default:
        this.router.navigate(['/session/results', this.sessionCode]);
    }
  }

  // Nettoie le timer quand on quitte la page.
  ngOnDestroy(): void {
    clearInterval(this.timer);
  }

  // Retourne les indices des lignes pour l'affichage HTML.
  getRows(): number[] {
    return Array.from({ length: this.GRID_ROWS }, (_, i) => i);
  }

  // Retourne les indices des colonnes pour l'affichage HTML.
  getCols(): number[] {
    return Array.from({ length: this.GRID_COLS }, (_, i) => i);
  }

  // Retourne uniquement les mots horizontaux pour l'affichage des définitions.
  get horizontalWords(): WordConfig[] {
    return this.words.filter((w) => w.direction === 'horizontal');
  }

  // Retourne uniquement les mots verticaux pour l'affichage des définitions.
  get verticalWords(): WordConfig[] {
    return this.words.filter((w) => w.direction === 'vertical');
  }
}