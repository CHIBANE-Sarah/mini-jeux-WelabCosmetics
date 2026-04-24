import { Component, OnInit, ChangeDetectorRef, OnDestroy, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormulationService, Ingredient } from '../../core/services/formulation.service';

interface IngredientsByCategory {
  [categorie: string]: Ingredient[];
}

@Component({
  selector: 'app-formulation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './formulation.component.html',
  styleUrls: ['./formulation.component.css'],
})
export class FormulationComponent implements OnInit, OnDestroy {
  ingredients: Ingredient[] = [];
  ingredientsByCategory: IngredientsByCategory = {};
  categories: string[] = [];
  selectedIds: number[] = [];
  sessionCode = '';
  isLoading = true;
  isValidating = false;
  score: number | null = null;
  total: number | null = null;
  corrections: any[] = [];
  timeLeft = 600;
  timer: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formulationService: FormulationService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.sessionCode = this.route.snapshot.paramMap.get('sessionCode') || '';
    this.loadIngredients();
    this.startTimer();
  }

  loadIngredients(): void {
    this.formulationService.getIngredients(this.sessionCode).subscribe({
      next: (ingredients) => {
        this.ingredients = ingredients;
        this.ingredientsByCategory = {};
        ingredients.forEach((ing) => {
          if (!this.ingredientsByCategory[ing.categorie]) {
            this.ingredientsByCategory[ing.categorie] = [];
          }
          this.ingredientsByCategory[ing.categorie].push(ing);
        });
        // Ordre des catégories conforme aux IHM
        const ordreCategories = ['Phase Aqueuse', 'Phase Grasse', 'Actifs', 'Parfum'];
        this.categories = ordreCategories.filter((c) => this.ingredientsByCategory[c]);
        // Ajouter les catégories éventuellement non prévues
        Object.keys(this.ingredientsByCategory).forEach((c) => {
          if (!this.categories.includes(c)) {
            this.categories.push(c);
          }
        });
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  toggleIngredient(id: number): void {
    if (this.score !== null) return;
    const index = this.selectedIds.indexOf(id);
    if (index === -1) {
      this.selectedIds.push(id);
    } else {
      this.selectedIds.splice(index, 1);
    }
  }

  isSelected(id: number): boolean {
    return this.selectedIds.includes(id);
  }

  getSelectedForCategory(categorie: string): Ingredient[] {
    return (this.ingredientsByCategory[categorie] || []).filter((ing) =>
      this.selectedIds.includes(ing.id)
    );
  }

  reset(): void {
    this.selectedIds = [];
  }

  validate(): void {
    clearInterval(this.timer);
    this.isValidating = true;
    this.formulationService.validate(this.sessionCode, this.selectedIds).subscribe({
      next: (result) => {
        this.score = result.score;
        this.total = result.total;
        this.corrections = result.corrections;
        this.isValidating = false;
        localStorage.setItem('score_formulation', String(result.score));
        localStorage.setItem('total_formulation', String(result.total));
        this.cdr.detectChanges();
      },
      error: () => {
        this.isValidating = false;
        this.cdr.detectChanges();
      },
    });
  }

  get formattedTime(): string {
    const m = Math.floor(this.timeLeft / 60).toString().padStart(2, '0');
    const s = (this.timeLeft % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  startTimer(): void {
    this.timer = setInterval(() => {
      this.ngZone.run(() => {
        this.timeLeft--;
        if (this.timeLeft <= 0) {
          clearInterval(this.timer);
          this.validate();
        }
      });
    }, 1000);
  }

  /**
   * CORRECTION BUG #5 — méthodes pour les classes dynamiques.
   * [ngClass] accepte une string et la FUSIONNE avec class="" statique.
   * Contrairement à [class]="..." qui remplace TOUT.
   */
  getCatClass(cat: string): string {
    return 'cat-' + cat.toLowerCase().replace(/\s+/g, '-');
  }

  getSlotClass(cat: string): string {
    return 'slot-' + cat.toLowerCase().replace(/\s+/g, '-');
  }

  abandonner(): void {
    if (!confirm('Abandonner ce jeu ? Votre score sera 0 pour cette partie.')) return;
    clearInterval(this.timer);
    localStorage.setItem('score_formulation', '0');
    localStorage.setItem('total_formulation', String(this.ingredients.length || 12));
    this.nextGame();
  }

  nextGame(): void {
    const games = JSON.parse(localStorage.getItem('session_games') || '[]');
    const currentIndex = games.findIndex((g: any) => g.type === 'formulation');
    const nextGame = games[currentIndex + 1];

    if (!nextGame) {
      this.router.navigate(['/session/results', this.sessionCode]);
      return;
    }

    switch (nextGame.type) {
      case 'association':
        this.router.navigate(['/session/association', nextGame.id]);
        break;
      case 'crossword':
        this.router.navigate(['/session/crossword', this.sessionCode]);
        break;
      default:
        this.router.navigate(['/session/results', this.sessionCode]);
    }
  }

  ngOnDestroy(): void {
    clearInterval(this.timer);
  }
}