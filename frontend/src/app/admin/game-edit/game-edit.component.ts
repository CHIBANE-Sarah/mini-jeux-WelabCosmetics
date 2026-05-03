// Imports Angular pour créer le composant, gérer son chargement et mettre à jour l'affichage.
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';

// CommonModule permet d'utiliser les directives Angular courantes.
import { CommonModule } from '@angular/common';

// FormsModule permet d'utiliser les formulaires Angular.
import { FormsModule } from '@angular/forms';

// ActivatedRoute permet de récupérer l'id dans l'URL.
// Router permet de naviguer vers une autre page.
import { ActivatedRoute, Router } from '@angular/router';

// Service admin et interfaces liées à la gestion des jeux.
import {
  GameAdminService,
  GameAdmin,
  AssocQuestion,
  CrosswordQuestion,
  Ingredient,
} from '../../core/services/game-admin.service';

// Déclaration du composant Angular d'édition d’un jeu.
@Component({
  selector: 'app-game-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './game-edit.component.html',
  styleUrls: ['./game-edit.component.css'],
})
export class GameEditComponent implements OnInit {
  // Jeu actuellement édité.
  game: GameAdmin | null = null;

  // États d'affichage.
  isLoading = true;
  isSaving = false;
  error = '';
  successMsg = '';

  // Données et formulaire pour les questions d’association.
  assocQuestions: AssocQuestion[] = [];
  newAssocTerme = '';
  newAssocDefinitions = '';
  newAssocBonneReponse = '';
  addingAssoc = false;

  // Données et formulaire pour les questions de mots croisés.
  crosswordQuestions: CrosswordQuestion[] = [];
  newCrossDefinition = '';
  newCrossMotCorrect = '';
  addingCross = false;

  // Données et formulaire pour les ingrédients de formulation.
  ingredients: Ingredient[] = [];
  newIngNom = '';
  newIngCategorie = '';
  newIngEstCorrect = true;
  addingIng = false;

  // Catégories proposées dans le formulaire d'ingrédient.
  readonly CATEGORIES = ['Phase Aqueuse', 'Phase Grasse', 'Actifs', 'Parfum'];

  // Injection des services nécessaires.
  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private gameAdminService: GameAdminService,
    private cdr: ChangeDetectorRef
  ) {}

  // Méthode appelée automatiquement au chargement du composant.
  ngOnInit(): void {
    // Récupère l'id du jeu dans l'URL /dashboard/games/:id.
    const id = Number(this.route.snapshot.paramMap.get('id'));

    // Si aucun id valide n'est trouvé, on affiche une erreur.
    if (!id) {
      this.error = 'Identifiant du jeu manquant.';
      this.isLoading = false;
      return;
    }

    // Charge les informations du jeu.
    this.loadGame(id);
  }

  // Charge le jeu à éditer depuis l'API.
  loadGame(id: number): void {
    this.isLoading = true;

    this.gameAdminService.getGame(id).subscribe({
      next: (game) => {
        this.game = game;
        this.isLoading = false;

        // Charge ensuite le contenu spécifique selon le type du jeu.
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

  // Charge les questions ou ingrédients selon le type du jeu.
  private loadContent(game: GameAdmin): void {
    if (game.type === 'association') {
      this.gameAdminService.getAssocQuestions(game.id).subscribe({
        next: (qs) => {
          this.assocQuestions = qs;
          this.cdr.detectChanges();
        },
      });

    } else if (game.type === 'crossword') {
      this.gameAdminService.getCrosswordQuestions(game.id).subscribe({
        next: (qs) => {
          this.crosswordQuestions = qs;
          this.cdr.detectChanges();
        },
      });

    } else if (game.type === 'formulation') {
      this.gameAdminService.getIngredients(game.id).subscribe({
        next: (is) => {
          this.ingredients = is;
          this.cdr.detectChanges();
        },
      });
    }
  }

  // Ajoute une question au jeu d'association.
  addAssocQuestion(): void {
    // Vérifie que les champs obligatoires sont remplis.
    if (!this.game || !this.newAssocTerme.trim() ||
        !this.newAssocDefinitions.trim() || !this.newAssocBonneReponse.trim()) {
      return;
    }

    // Les définitions sont saisies dans un champ texte séparées par des points-virgules.
    const defs = this.newAssocDefinitions.split(';').map(d => d.trim()).filter(Boolean);

    // Prépare l'objet question à envoyer au backend.
    const q: AssocQuestion = {
      terme: this.newAssocTerme.trim(),
      definitions: defs,
      bonneReponse: this.newAssocBonneReponse.trim(),
    };

    this.addingAssoc = true;

    // Appelle l'API pour créer la question.
    this.gameAdminService.addAssocQuestion(this.game.id, q).subscribe({
      next: (created) => {
        // Ajoute la question créée à la liste affichée.
        this.assocQuestions.push(created);

        // Réinitialise le formulaire.
        this.newAssocTerme = '';
        this.newAssocDefinitions = '';
        this.newAssocBonneReponse = '';
        this.addingAssoc = false;

        this.showSuccess('Question ajoutée avec succès.');
        this.cdr.detectChanges();
      },
      error: () => {
        this.addingAssoc = false;
        this.cdr.detectChanges();
      },
    });
  }

  // Supprime une question d'association.
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

  // Ajoute une question au jeu de mots croisés.
  addCrossQuestion(): void {
    if (!this.game || !this.newCrossDefinition.trim() || !this.newCrossMotCorrect.trim()) return;

    // Le mot correct est mis en majuscules pour faciliter la comparaison.
    const q: CrosswordQuestion = {
      definition: this.newCrossDefinition.trim(),
      motCorrect: this.newCrossMotCorrect.trim().toUpperCase(),
    };

    this.addingCross = true;

    this.gameAdminService.addCrosswordQuestion(this.game.id, q).subscribe({
      next: (created) => {
        this.crosswordQuestions.push(created);

        // Réinitialise le formulaire.
        this.newCrossDefinition = '';
        this.newCrossMotCorrect = '';
        this.addingCross = false;

        this.showSuccess('Question ajoutée avec succès.');
        this.cdr.detectChanges();
      },
      error: () => {
        this.addingCross = false;
        this.cdr.detectChanges();
      },
    });
  }

  // Supprime une question de mots croisés.
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

  // Ajoute un ingrédient au jeu de formulation.
  addIngredient(): void {
    if (!this.game || !this.newIngNom.trim() || !this.newIngCategorie) return;

    // Prépare l’ingrédient à envoyer au backend.
    const i: Ingredient = {
      nom: this.newIngNom.trim(),
      categorie: this.newIngCategorie,
      estCorrect: this.newIngEstCorrect,
    };

    this.addingIng = true;

    this.gameAdminService.addIngredient(this.game.id, i).subscribe({
      next: (created) => {
        this.ingredients.push(created);

        // Réinitialise le formulaire.
        this.newIngNom = '';
        this.newIngCategorie = '';
        this.newIngEstCorrect = true;
        this.addingIng = false;

        this.showSuccess('Ingrédient ajouté avec succès.');
        this.cdr.detectChanges();
      },
      error: () => {
        this.addingIng = false;
        this.cdr.detectChanges();
      },
    });
  }

  // Supprime un ingrédient.
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

  // Retourne à la liste des jeux.
  goBack(): void {
    this.router.navigate(['/dashboard/games']);
  }

  // Retourne le libellé lisible du type de jeu.
  getTypeLabel(): string {
    const labels: Record<string, string> = {
      association: 'Association Termes & Définitions',
      crossword: 'Mots Croisés Cosmétiques',
      formulation: 'Formulation de Produit',
    };

    return labels[this.game?.type ?? ''] ?? this.game?.type ?? '';
  }

  // Retourne une description du type de jeu.
  getTypeDesc(): string {
    const desc: Record<string, string> = {
      association: 'Associez les termes cosmétiques à leur définition',
      crossword: 'Découvrez le vocabulaire essentiel de la cosmétique',
      formulation: 'Créez une formulation cosmétique en combinant les bons ingrédients',
    };

    return desc[this.game?.type ?? ''] ?? '';
  }

  // Affiche temporairement un message de succès.
  private showSuccess(msg: string): void {
    this.successMsg = msg;

    setTimeout(() => {
      this.successMsg = '';
      this.cdr.detectChanges();
    }, 3000);
  }
}