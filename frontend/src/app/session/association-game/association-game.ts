// Imports Angular pour gérer le cycle de vie du composant, l'affichage et le timer.
import { Component, OnInit, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';

// CommonModule permet d'utiliser les directives Angular comme *ngIf et *ngFor.
import { CommonModule } from '@angular/common';

// ActivatedRoute permet de récupérer les paramètres dans l'URL.
// Router permet de naviguer vers une autre page.
import { ActivatedRoute, Router } from '@angular/router';

// Service Angular qui communique avec le backend pour le jeu d'association.
import { AssociationService } from '../../core/services/association';

// Interfaces TypeScript utilisées pour typer les questions, la requête de vérification et la réponse.
import {
  AssociationQuestion,
  AssociationVerifyRequest,
  AssociationVerifyResponse,
} from '../../interfaces/association.interface';

// Imports Angular CDK utilisés pour le drag and drop.
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
  CdkDrag,
  CdkDropList,
  CdkDropListGroup,
} from '@angular/cdk/drag-drop';

// Représente une case de définition dans laquelle l'utilisateur peut déposer un terme.
interface DefSlot {
  def: string;
  droppedItems: string[];
}

// Représente les informations du participant stockées dans le localStorage.
interface ParticipantInfo {
  nom: string;
  prenom: string;
  sessionCode?: string;
}

// Déclaration du composant Angular du jeu d'association.
@Component({
  selector: 'app-association-game',
  standalone: true,
  imports: [CommonModule, CdkDrag, CdkDropList, CdkDropListGroup],
  templateUrl: './association-game.html',
  styleUrls: ['./association-game.css'],
})
export class AssociationGameComponent implements OnInit, OnDestroy {
  // Identifiant du jeu récupéré depuis l'URL.
  gameId!: number;

  // Liste des questions reçues depuis le backend.
  questions: AssociationQuestion[] = [];

  // Liste des termes que l'utilisateur peut déplacer.
  availableTerms: string[] = [];

  // Liste des définitions sous forme de zones de dépôt.
  definitionSlots: DefSlot[] = [];

  // Identifiants des listes de dépôt, nécessaires pour connecter les zones drag and drop.
  definitionDropListIds: string[] = [];

  // Réponses de l'utilisateur sous forme : terme -> définition choisie.
  userAnswers: { [terme: string]: string } = {};

  // Résultat renvoyé par le backend après vérification.
  result: AssociationVerifyResponse | null = null;

  // États d'affichage du composant.
  isLoading = true;
  isVerified = false;
  isVerifying = false;

  // Durée initiale et temps restant du jeu, en secondes.
  initialTime = 420;
  timeLeft = 420;

  // Référence du timer pour pouvoir l'arrêter.
  timerInterval: ReturnType<typeof setInterval> | null = null;

  // Informations du participant.
  participantInfo: ParticipantInfo | null = null;

  // Injection des services nécessaires.
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private associationService: AssociationService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
  ) {}

  // Méthode appelée automatiquement au chargement du composant.
  ngOnInit(): void {
    // Récupère l'identifiant du jeu depuis l'URL.
    const idParam =
      this.route.snapshot.paramMap.get('gameId') || this.route.snapshot.paramMap.get('id');

    // Conversion de l'identifiant en nombre.
    this.gameId = Number(idParam);

    // Applique la durée réelle du jeu si elle est présente dans le localStorage.
    this.applyGameDuration();

    // Charge les informations du participant.
    this.loadParticipantInfo();

    // Si l'identifiant est valide, on charge les questions.
    if (this.gameId && this.gameId > 0) {
      this.loadQuestions();
    } else {
      this.isLoading = false;
    }
  }

  // Méthode appelée automatiquement quand on quitte le composant.
  ngOnDestroy(): void {
    this.clearTimer();
  }

  // Récupère la durée configurée pour ce jeu depuis la liste des jeux de la session.
  private applyGameDuration(): void {
    const games = JSON.parse(localStorage.getItem('session_games') || '[]');
    const currentGame = games.find((g: any) => g.id === this.gameId);

    if (currentGame?.duree) {
      this.initialTime = currentGame.duree;
      this.timeLeft = currentGame.duree;
    }
  }

  // Récupère les informations du participant stockées lors de l'entrée dans la session.
  private loadParticipantInfo(): void {
    const stored = localStorage.getItem('welab.participant');

    if (stored) {
      try {
        this.participantInfo = JSON.parse(stored);
      } catch {
        this.participantInfo = null;
      }
    }
  }

  // Arrête le timer s'il existe.
  private clearTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  // Charge les questions d’association depuis le backend.
  loadQuestions(): void {
    this.associationService.getQuestions(this.gameId).subscribe({
      next: (data) => {
        // Stocke les questions reçues.
        this.questions = data.questions;

        // Extrait uniquement les termes à déplacer.
        this.availableTerms = this.questions.map((q) => q.terme);

        // Récupère toutes les définitions sans doublons.
        const uniqueDefs = [...new Set(data.questions.flatMap((q) => q.definitions))];

        // Mélange les définitions et crée les zones de dépôt.
        this.definitionSlots = this.shuffleArray(uniqueDefs).map((def) => ({
          def,
          droppedItems: [],
        }));

        // Génère les identifiants des zones de dépôt.
        this.definitionDropListIds = this.definitionSlots.map((_, index) => `def-list-${index}`);

        // Fin du chargement, démarrage du timer et mise à jour de l'affichage.
        this.isLoading = false;
        this.startTimer();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Erreur chargement questions:', err);
      },
    });
  }

  // Méthode appelée lorsqu'un élément est déplacé par drag and drop.
  drop(event: CdkDragDrop<string[]>): void {
    // Si le jeu est déjà vérifié, on bloque les modifications.
    if (this.isVerified) return;

    // Si l'élément est déplacé dans la même liste, on change simplement son ordre.
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      // Une définition ne peut recevoir qu'un seul terme.
      if (event.container.id.startsWith('def-list-') && event.container.data.length >= 1) {
        return;
      }

      // Déplace l'élément d'une liste vers une autre.
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }

    // Met à jour l'objet contenant les réponses utilisateur.
    this.updateUserAnswers();
  }

  // Permet de retirer un terme déjà déposé sur une définition.
  removeTermFromDef(slot: DefSlot): void {
    if (this.isVerified || slot.droppedItems.length === 0) return;

    const term = slot.droppedItems[0];
    slot.droppedItems = [];
    this.availableTerms.push(term);

    this.updateUserAnswers();
  }

  // Reconstruit les réponses utilisateur à partir des termes déposés.
  updateUserAnswers(): void {
    this.userAnswers = {};

    this.definitionSlots.forEach((slot) => {
      if (slot.droppedItems.length > 0) {
        this.userAnswers[slot.droppedItems[0]] = slot.def;
      }
    });
  }

  // Vérifie si toutes les questions ont une réponse.
  get allAnswered(): boolean {
    return (
      this.questions.length > 0 && Object.keys(this.userAnswers).length === this.questions.length
    );
  }

  // Envoie les réponses au backend pour calculer le score.
  verify(forceSubmit = false): void {
    // Évite les doubles validations.
    if (this.result || this.isVerifying) return;

    // Si on ne force pas l'envoi, toutes les réponses doivent être remplies.
    if (!forceSubmit && !this.allAnswered) return;

    // Transforme les réponses utilisateur au format attendu par l'API.
    const reponses = this.questions
      .filter((q) => this.userAnswers[q.terme])
      .map((q) => ({
        questionId: q.id,
        reponse: this.userAnswers[q.terme],
      }));

    if (!forceSubmit && reponses.length === 0) return;

    // Prépare le corps de la requête.
    const payload: AssociationVerifyRequest = { reponses };

    // Ajoute les informations du participant si elles existent.
    if (this.participantInfo) {
      payload.participant = {
        nom: this.participantInfo.nom,
        prenom: this.participantInfo.prenom,
      };
      payload.sessionCode = this.participantInfo.sessionCode;
    }

    // Calcule la durée réellement passée sur le jeu.
    payload.duree = this.initialTime - this.timeLeft;

    this.isVerifying = true;
    this.clearTimer();

    // Appel au backend pour vérifier les réponses.
    this.associationService.verifyAnswers(this.gameId, payload).subscribe({
      next: (result) => {
        this.result = result;
        this.isVerified = true;
        this.isVerifying = false;

        // Stocke le score pour l'écran final de résultats.
        localStorage.setItem('score_association', String(result.score));
        localStorage.setItem('total_association', String(result.total));

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur vérification:', err);
        this.isVerifying = false;
        this.cdr.detectChanges();
      },
    });
  }

  // Démarre le compte à rebours du jeu.
  startTimer(): void {
    this.clearTimer();

    // Le timer tourne hors Angular pour éviter trop de recalculs inutiles.
    this.ngZone.runOutsideAngular(() => {
      this.timerInterval = setInterval(() => {
        // On revient dans Angular pour mettre à jour l'interface.
        this.ngZone.run(() => {
          if (this.timeLeft > 0) {
            this.timeLeft--;
            this.cdr.detectChanges();

            // Si le temps est écoulé, on valide automatiquement.
            if (this.timeLeft === 0) {
              this.verify(true);
            }
          }
        });
      }, 1000);
    });
  }

  // Formate le temps en mm:ss.
  get formattedTime(): string {
    const min = Math.floor(this.timeLeft / 60)
      .toString()
      .padStart(2, '0');
    const sec = (this.timeLeft % 60).toString().padStart(2, '0');

    return `${min}:${sec}`;
  }

  // Mélange un tableau.
  shuffleArray<T>(arr: T[]): T[] {
    return [...arr].sort(() => Math.random() - 0.5);
  }

  // Abandonne le jeu et attribue un score de 0.
  abandonner(): void {
    if (!confirm('Abandonner ce jeu ? Votre score sera 0 pour cette partie.')) return;

    this.clearTimer();

    localStorage.setItem('score_association', '0');
    localStorage.setItem('total_association', String(this.questions.length));

    this.goNext();
  }

  // Redirige vers le jeu suivant ou vers la page de résultats.
  goNext(): void {
    const sessionCode = localStorage.getItem('session_code') || '';
    const gamesRaw = localStorage.getItem('session_games');

    if (gamesRaw) {
      const games = JSON.parse(gamesRaw);
      const currentIndex = games.findIndex((g: any) => g.type === 'association');
      const next = games[currentIndex + 1];

      if (next) {
        switch (next.type) {
          case 'formulation':
            this.router.navigate(['/session/formulation', sessionCode]);
            break;
          case 'crossword':
            this.router.navigate(['/session/crossword', sessionCode]);
            break;
          default:
            this.router.navigate(['/session/results', sessionCode]);
        }
      } else {
        this.router.navigate(['/session/results', sessionCode]);
      }
    } else {
      this.router.navigate(['/session/results', sessionCode]);
    }
  }

  // Retourne les listes connectées pour autoriser les déplacements entre zones.
  getConnectedDropLists(index: number): string[] {
    return ['terms-list', ...this.definitionDropListIds.filter((id) => id !== `def-list-${index}`)];
  }
}