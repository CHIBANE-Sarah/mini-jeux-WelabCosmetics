import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  GameAdminService,
  GameAdmin,
  AssocQuestion,
  CrosswordQuestion,
  Ingredient,
} from '../../core/services/game-admin.service';

@Component({
  selector: 'app-game-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './game-edit.component.html',
  styleUrls: ['./game-edit.component.css'],
})
export class GameEditComponent implements OnInit {

  game: GameAdmin | null = null;
  isLoading = true;
  isSaving = false;
  error = '';
  successMsg = '';

  // ── Questions association ──
  assocQuestions: AssocQuestion[] = [];
  newAssocTerme = '';
  newAssocDefinitions = '';   // saisie libre séparée par ";"
  newAssocBonneReponse = '';
  addingAssoc = false;

  // ── Questions crossword ──
  crosswordQuestions: CrosswordQuestion[] = [];
  newCrossDefinition = '';
  newCrossMotCorrect = '';
  addingCross = false;

  // ── Ingrédients formulation ──
  ingredients: Ingredient[] = [];
  newIngNom = '';
  newIngCategorie = '';
  newIngEstCorrect = true;
  addingIng = false;

  readonly CATEGORIES = ['Phase Aqueuse', 'Phase Grasse', 'Actifs', 'Parfum'];

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private gameAdminService: GameAdminService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.error = 'Identifiant du jeu manquant.';
      this.isLoading = false;
      return;
    }
    this.loadGame(id);
  }

  loadGame(id: number): void {
    this.isLoading = true;
    this.gameAdminService.getGame(id).subscribe({
      next: (game) => {
        this.game = game;
        this.isLoading = false;
        this.loadContent(game);
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Impossible de charger ce jeu.';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  private loadContent(game: GameAdmin): void {
    if (game.type === 'association') {
      this.gameAdminService.getAssocQuestions(game.id).subscribe({
        next: (qs) => { this.assocQuestions = qs; this.cdr.detectChanges(); },
      });
    } else if (game.type === 'crossword') {
      this.gameAdminService.getCrosswordQuestions(game.id).subscribe({
        next: (qs) => { this.crosswordQuestions = qs; this.cdr.detectChanges(); },
      });
    } else if (game.type === 'formulation') {
      this.gameAdminService.getIngredients(game.id).subscribe({
        next: (is) => { this.ingredients = is; this.cdr.detectChanges(); },
      });
    }
  }

  // ── Association ──────────────────────────────────

  addAssocQuestion(): void {
    if (!this.game || !this.newAssocTerme.trim() ||
        !this.newAssocDefinitions.trim() || !this.newAssocBonneReponse.trim()) {
      return;
    }
    const defs = this.newAssocDefinitions.split(';').map(d => d.trim()).filter(Boolean);
    const q: AssocQuestion = {
      terme: this.newAssocTerme.trim(),
      definitions: defs,
      bonneReponse: this.newAssocBonneReponse.trim(),
    };
    this.addingAssoc = true;
    this.gameAdminService.addAssocQuestion(this.game.id, q).subscribe({
      next: (created) => {
        this.assocQuestions.push(created);
        this.newAssocTerme = '';
        this.newAssocDefinitions = '';
        this.newAssocBonneReponse = '';
        this.addingAssoc = false;
        this.showSuccess('Question ajoutée avec succès.');
        this.cdr.detectChanges();
      },
      error: () => { this.addingAssoc = false; this.cdr.detectChanges(); },
    });
  }

  deleteAssocQuestion(q: AssocQuestion): void {
    if (!this.game || !q.id) return;
    if (!confirm(`Supprimer la question "${q.terme}" ?`)) return;
    this.gameAdminService.deleteAssocQuestion(this.game.id, q.id).subscribe({
      next: () => {
        this.assocQuestions = this.assocQuestions.filter(x => x.id !== q.id);
        this.showSuccess('Question supprimée.');
        this.cdr.detectChanges();
      },
    });
  }

  // ── Crossword ─────────────────────────────────────

  addCrossQuestion(): void {
    if (!this.game || !this.newCrossDefinition.trim() || !this.newCrossMotCorrect.trim()) return;
    const q: CrosswordQuestion = {
      definition: this.newCrossDefinition.trim(),
      motCorrect: this.newCrossMotCorrect.trim().toUpperCase(),
    };
    this.addingCross = true;
    this.gameAdminService.addCrosswordQuestion(this.game.id, q).subscribe({
      next: (created) => {
        this.crosswordQuestions.push(created);
        this.newCrossDefinition = '';
        this.newCrossMotCorrect = '';
        this.addingCross = false;
        this.showSuccess('Question ajoutée avec succès.');
        this.cdr.detectChanges();
      },
      error: () => { this.addingCross = false; this.cdr.detectChanges(); },
    });
  }

  deleteCrossQuestion(q: CrosswordQuestion): void {
    if (!this.game || !q.id) return;
    if (!confirm(`Supprimer la question "${q.definition}" ?`)) return;
    this.gameAdminService.deleteCrosswordQuestion(this.game.id, q.id).subscribe({
      next: () => {
        this.crosswordQuestions = this.crosswordQuestions.filter(x => x.id !== q.id);
        this.showSuccess('Question supprimée.');
        this.cdr.detectChanges();
      },
    });
  }

  // ── Formulation ──────────────────────────────────

  addIngredient(): void {
    if (!this.game || !this.newIngNom.trim() || !this.newIngCategorie) return;
    const i: Ingredient = {
      nom: this.newIngNom.trim(),
      categorie: this.newIngCategorie,
      estCorrect: this.newIngEstCorrect,
    };
    this.addingIng = true;
    this.gameAdminService.addIngredient(this.game.id, i).subscribe({
      next: (created) => {
        this.ingredients.push(created);
        this.newIngNom = '';
        this.newIngCategorie = '';
        this.newIngEstCorrect = true;
        this.addingIng = false;
        this.showSuccess('Ingrédient ajouté avec succès.');
        this.cdr.detectChanges();
      },
      error: () => { this.addingIng = false; this.cdr.detectChanges(); },
    });
  }

  deleteIngredient(i: Ingredient): void {
    if (!this.game || !i.id) return;
    if (!confirm(`Supprimer l'ingrédient "${i.nom}" ?`)) return;
    this.gameAdminService.deleteIngredient(this.game.id, i.id).subscribe({
      next: () => {
        this.ingredients = this.ingredients.filter(x => x.id !== i.id);
        this.showSuccess('Ingrédient supprimé.');
        this.cdr.detectChanges();
      },
    });
  }

  // ── Navigation ────────────────────────────────────

  goBack(): void {
    this.router.navigate(['/dashboard/games']);
  }

  // ── Helpers ──────────────────────────────────────

  getTypeLabel(): string {
    const labels: Record<string, string> = {
      association: 'Association Termes & Définitions',
      crossword: 'Mots Croisés Cosmétiques',
      formulation: 'Formulation de Produit',
    };
    return labels[this.game?.type ?? ''] ?? this.game?.type ?? '';
  }

  getTypeDesc(): string {
    const desc: Record<string, string> = {
      association: 'Associez les termes cosmétiques à leur définition',
      crossword: 'Découvrez le vocabulaire essentiel de la cosmétique',
      formulation: 'Créez une formulation cosmétique en combinant les bons ingrédients',
    };
    return desc[this.game?.type ?? ''] ?? '';
  }

  private showSuccess(msg: string): void {
    this.successMsg = msg;
    setTimeout(() => { this.successMsg = ''; this.cdr.detectChanges(); }, 3000);
  }
}