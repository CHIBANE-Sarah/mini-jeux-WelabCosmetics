import { Component, OnInit, ChangeDetectorRef, OnDestroy, NgZone, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CrosswordService } from '../../core/services/crossword.service';

interface CellData {
  letter: string;
  isBlack: boolean;
  wordIndex: number;
  letterIndex: number;
  number?: number;
}

interface WordConfig {
  id: number;
  definition: string;
  motCorrect: string;
  row: number;
  col: number;
  direction: 'horizontal' | 'vertical';
  number: number;
}

@Component({
  selector: 'app-crossword',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crossword.component.html',
  styleUrls: ['./crossword.component.css'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class CrosswordComponent implements OnInit, OnDestroy {
  grid: CellData[][] = [];
  words: WordConfig[] = [];
  userInputs: string[][] = [];
  isLoading = true;
  score: number | null = null;
  total: number | null = null;
  corrections: any[] = [];
  sessionCode = '';
  timeLeft = 420;
  timer: any;
  selectedCell: {row: number, col: number} | null = null;

  private readonly GRID_ROWS = 12;
  private readonly GRID_COLS = 13;

  private readonly WORD_POSITIONS = [
    { row: 0, col: 0, direction: 'horizontal' as const, number: 1 },
    { row: 3, col: 1, direction: 'horizontal' as const, number: 2 },
    { row: 1, col: 9, direction: 'vertical' as const,   number: 3 },
    { row: 7, col: 0, direction: 'horizontal' as const, number: 4 },
    { row: 7, col: 11, direction: 'vertical' as const,   number: 5 },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private crosswordService: CrosswordService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.sessionCode = this.route.snapshot.paramMap.get('sessionCode') || '';
    this.loadQuestions();
    this.startTimer();
  }

  loadQuestions(): void {
  console.log('loadQuestions appelé, sessionCode:', this.sessionCode);
  this.crosswordService.getQuestions(this.sessionCode).subscribe({
    next: (questions) => {
      console.log('questions reçues:', questions);
      this.words = questions.map((q, i) => ({
        ...q,
        ...this.WORD_POSITIONS[i]
      }));
      this.buildGrid();
      this.isLoading = false;
      this.cdr.markForCheck();
      this.cdr.detectChanges();
    },
    error: (err) => {
      console.log('erreur:', err);
      this.isLoading = false;
      this.cdr.markForCheck();
      this.cdr.detectChanges();
    }
  });
}

  buildGrid(): void {
    this.grid = Array.from({ length: this.GRID_ROWS }, () =>
      Array.from({ length: this.GRID_COLS }, () => ({
        letter: '',
        isBlack: true,
        wordIndex: -1,
        letterIndex: -1
      }))
    );

    this.userInputs = Array.from({ length: this.GRID_ROWS }, () =>
      Array(this.GRID_COLS).fill('')
    );

    this.words.forEach((word, wi) => {
      for (let i = 0; i < word.motCorrect.length; i++) {
        const r = word.direction === 'horizontal' ? word.row : word.row + i;
        const c = word.direction === 'horizontal' ? word.col + i : word.col;
        this.grid[r][c] = {
          letter: word.motCorrect[i],
          isBlack: false,
          wordIndex: wi,
          letterIndex: i,
          number: i === 0 ? word.number : undefined
        };
      }
    });
  }

  selectCell(row: number, col: number): void {
    if (this.grid[row][col].isBlack || this.score !== null) return;
    this.selectedCell = { row, col };
  }

  onKeyInput(event: KeyboardEvent, row: number, col: number): void {
    if (this.score !== null) return;
    const key = event.key.toUpperCase();
    if (/^[A-Z]$/.test(key)) {
      this.userInputs[row][col] = key;
      this.moveToNext(row, col);
    } else if (event.key === 'Backspace') {
      this.userInputs[row][col] = '';
    }
    this.cdr.detectChanges();
  }

  moveToNext(row: number, col: number): void {
    const cell = this.grid[row][col];
    if (cell.wordIndex === -1) return;
    const word = this.words[cell.wordIndex];
    const nextRow = word.direction === 'horizontal' ? row : row + 1;
    const nextCol = word.direction === 'horizontal' ? col + 1 : col;
    if (nextRow < this.GRID_ROWS && nextCol < this.GRID_COLS && !this.grid[nextRow][nextCol].isBlack) {
      this.selectedCell = { row: nextRow, col: nextCol };
    }
  }

  isSelected(row: number, col: number): boolean {
    return this.selectedCell?.row === row && this.selectedCell?.col === col;
  }
  
  get formattedTime(): string {
  const m = Math.floor(this.timeLeft / 60).toString().padStart(2, '0');
  const s = (this.timeLeft % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}
  validate(): void {
    clearInterval(this.timer);
    const reponses = this.words.map(word => {
      let rep = '';
      for (let i = 0; i < word.motCorrect.length; i++) {
        const r = word.direction === 'horizontal' ? word.row : word.row + i;
        const c = word.direction === 'horizontal' ? word.col + i : word.col;
        rep += this.userInputs[r][c] || '_';
      }
      return { id: word.id, reponse: rep };
    });

    this.crosswordService.validate(reponses).subscribe({
      next: (result) => {
        this.ngZone.run(() => {
          this.score = result.score;
          this.total = result.total;
          this.corrections = result.corrections;
          localStorage.setItem('score_crossword', String(result.score));
          localStorage.setItem('total_crossword', String(result.total));
        });
      }
    });
  }

  startTimer(): void {
  this.timer = setInterval(() => {
    this.timeLeft--;
    this.cdr.detectChanges();
    if (this.timeLeft <= 0) {
      clearInterval(this.timer);
      this.validate();
    }
  }, 1000);
}

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

  ngOnDestroy(): void {
    clearInterval(this.timer);
  }

  getRows(): number[] {
    return Array.from({ length: this.GRID_ROWS }, (_, i) => i);
  }

  getCols(): number[] {
    return Array.from({ length: this.GRID_COLS }, (_, i) => i);
  }

  get horizontalWords(): WordConfig[] {
    return this.words.filter(w => w.direction === 'horizontal');
  }

  get verticalWords(): WordConfig[] {
    return this.words.filter(w => w.direction === 'vertical');
  }
}