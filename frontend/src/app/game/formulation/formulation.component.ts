// Imports Angular pour le composant, le cycle de vie, la détection de changements et le timer.
import { Component, OnInit, ChangeDetectorRef, OnDestroy, NgZone } from '@angular/core';

// CommonModule permet d'utiliser les directives Angular courantes.
import { CommonModule } from '@angular/common';

// ActivatedRoute permet de récupérer le code de session dans l’URL.
// Router permet de naviguer vers une autre page.
import { ActivatedRoute, Router } from '@angular/router';

// Service qui communique avec le backend pour le jeu de formulation.
import { FormulationService, Ingredient } from '../../core/services/formulation.service';

// Interface représentant un regroupement d’ingrédients par catégorie.
interface IngredientsByCategory {
  [categorie: string]: Ingredient[];
}

// Déclaration du composant Angular du jeu de formulation.
@Component({
  selector: 'app-formulation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './formulation.component.html',
  styleUrls: ['./formulation.component.css'],
})
export class FormulationComponent implements OnInit, OnDestroy {
  // Liste complète des ingrédients reçus depuis le backend.
  ingredients: Ingredient[] = [];

  // Ingrédients regroupés par catégorie.
  ingredientsByCategory: IngredientsByCategory = {};

  // Liste ordonnée des catégories à afficher.
  categories: string[] = [];

  // Identifiants des ingrédients sélectionnés par l'utilisateur.
  selectedIds: number[] = [];

  // Code de session récupéré depuis l'URL.
  sessionCode = '';

  // États d'affichage.
  isLoading = true;
  isValidating = false;

  // Résultats du jeu après validation.
  score: number | null = null;
  total: number | null = null;
  corrections: any[] = [];

  // Temps restant du jeu, en secondes.
  timeLeft = 600;

  // Référence du timer.
  timer: any;

  // Injection des services nécessaires.
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formulationService: FormulationService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
  ) {}

  // Méthode appelée au chargement du composant.
  ngOnInit(): void {
    this.sessionCode = this.route.snapshot.paramMap.get('sessionCode') || '';

    this.applyGameDuration();
    this.loadIngredients();
    this.startTimer();
  }

  // Récupère la durée spécifique du jeu formulation depuis le localStorage.
  private applyGameDuration(): void {
    const games = JSON.parse(localStorage.getItem('session_games') || '[]');
    const currentGame = games.find((g: any) => g.type === 'formulation');

    if (currentGame?.duree) {
      this.timeLeft = currentGame.duree;
    }
  }

  // Charge les ingrédients depuis le backend.
  loadIngredients(): void {
    this.formulationService.getIngredients(this.sessionCode).subscribe({
      next: (ingredients) => {
        this.ingredients = ingredients;
        this.ingredientsByCategory = {};

        // Classe les ingrédients par catégorie.
        ingredients.forEach((ing) => {
          if (!this.ingredientsByCategory[ing.categorie]) {
            this.ingredientsByCategory[ing.categorie] = [];
          }
          this.ingredientsByCategory[ing.categorie].push(ing);
        });

        // Ordre privilégié d'affichage des catégories.
        const ordreCategories = ['Phase Aqueuse', 'Phase Grasse', 'Actifs', 'Parfum'];

        // Garde uniquement les catégories présentes dans les ingrédients.
        this.categories = ordreCategories.filter((c) => this.ingredientsByCategory[c]);

        // Ajoute les catégories imprévues à la fin.
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

  // Sélectionne ou désélectionne un ingrédient.
  toggleIngredient(id: number): void {
    // Si le score existe déjà, le jeu est terminé donc on bloque les modifications.
    if (this.score !== null) return;

    const index = this.selectedIds.indexOf(id);

    // Si l'ingrédient n'est pas encore sélectionné, on l'ajoute.
    if (index === -1) {
      this.selectedIds.push(id);

    // Sinon, on le retire.
    } else {
      this.selectedIds.splice(index, 1);
    }
  }

  // Vérifie si un ingrédient est sélectionné.
  isSelected(id: number): boolean {
    return this.selectedIds.includes(id);
  }

  // Retourne les ingrédients sélectionnés pour une catégorie donnée.
  getSelectedForCategory(categorie: string): Ingredient[] {
    return (this.ingredientsByCategory[categorie] || []).filter((ing) =>
      this.selectedIds.includes(ing.id),
    );
  }

  // Réinitialise la sélection.
  reset(): void {
    this.selectedIds = [];
  }

  // Envoie la sélection au backend pour correction.
  validate(): void {
    clearInterval(this.timer);
    this.isValidating = true;

    this.formulationService.validate(this.sessionCode, this.selectedIds).subscribe({
      next: (result) => {
        this.score = result.score;
        this.total = result.total;
        this.corrections = result.corrections;
        this.isValidating = false;

        // Stocke le score pour la page finale de résultats.
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

  // Formate le temps restant en mm:ss.
  get formattedTime(): string {
    const m = Math.floor(this.timeLeft / 60)
      .toString()
      .padStart(2, '0');
    const s = (this.timeLeft % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  // Démarre le compte à rebours.
  startTimer(): void {
    this.timer = setInterval(() => {
      this.ngZone.run(() => {
        this.timeLeft--;

        // Si le temps est écoulé, validation automatique.
        if (this.timeLeft <= 0) {
          clearInterval(this.timer);
          this.validate();
        }
      });
    }, 1000);
  }

  // Génère une classe CSS à partir du nom de la catégorie.
  getCatClass(cat: string): string {
    return 'cat-' + cat.toLowerCase().replace(/\s+/g, '-');
  }

  // Génère une classe CSS pour les emplacements liés à une catégorie.
  getSlotClass(cat: string): string {
    return 'slot-' + cat.toLowerCase().replace(/\s+/g, '-');
  }

  // Abandonne le jeu et attribue un score de 0.
  abandonner(): void {
    if (!confirm('Abandonner ce jeu ? Votre score sera 0 pour cette partie.')) return;

    clearInterval(this.timer);

    localStorage.setItem('score_formulation', '0');
    localStorage.setItem('total_formulation', String(this.ingredients.length || 12));

    this.nextGame();
  }

  // Redirige vers le jeu suivant ou vers la page de résultats.
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

  // Nettoie le timer quand on quitte le composant.
  ngOnDestroy(): void {
    clearInterval(this.timer);
  }
}