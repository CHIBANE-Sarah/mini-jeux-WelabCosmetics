import { Component, OnInit, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AssociationService } from '../../core/services/association';
import {
  AssociationQuestion,
  AssociationVerifyRequest,
  AssociationVerifyResponse,
} from '../../interfaces/association.interface';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
  CdkDrag,
  CdkDropList,
  CdkDropListGroup,
} from '@angular/cdk/drag-drop';

interface DefSlot {
  def: string;
  droppedItems: string[];
}

interface ParticipantInfo {
  nom: string;
  prenom: string;
  sessionCode?: string;
}

@Component({
  selector: 'app-association-game',
  standalone: true,
  imports: [CommonModule, CdkDrag, CdkDropList, CdkDropListGroup],
  templateUrl: './association-game.html',
  styleUrls: ['./association-game.css'],
})
export class AssociationGameComponent implements OnInit, OnDestroy {
  gameId!: number;
  questions: AssociationQuestion[] = [];
  availableTerms: string[] = [];
  definitionSlots: DefSlot[] = [];
  definitionDropListIds: string[] = [];
  userAnswers: { [terme: string]: string } = {};
  result: AssociationVerifyResponse | null = null;
  isLoading = true;
  isVerified = false;
  initialTime = 420;
  timeLeft = this.initialTime;
  timerInterval: ReturnType<typeof setInterval> | null = null;
  isVerifying = false;
  participantInfo: ParticipantInfo | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private associationService: AssociationService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('gameId') || this.route.snapshot.paramMap.get('id');
    this.gameId = Number(idParam);

    this.loadParticipantInfo();

    if (this.gameId && this.gameId > 0) {
      this.loadQuestions();
    } else {
      this.isLoading = false;
    }
  }

  ngOnDestroy(): void {
    this.clearTimer();
  }

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

  private clearTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  loadQuestions(): void {
    this.associationService.getQuestions(this.gameId).subscribe({
      next: (data) => {
        this.questions = data.questions;
        this.availableTerms = this.questions.map((q) => q.terme);

        const uniqueDefs = [...new Set(data.questions.flatMap((q) => q.definitions))];
        this.definitionSlots = this.shuffleArray(uniqueDefs).map((def) => ({
          def,
          droppedItems: [],
        }));

        this.definitionDropListIds = this.definitionSlots.map((_, index) => `def-list-${index}`);

        this.timeLeft = this.initialTime;
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

  drop(event: CdkDragDrop<string[]>) {
    if (this.isVerified) return;

    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      if (event.container.id.startsWith('def-list-') && event.container.data.length >= 1) {
        return;
      }
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
    this.updateUserAnswers();
  }

  removeTermFromDef(slot: DefSlot) {
    if (this.isVerified || slot.droppedItems.length === 0) return;
    const term = slot.droppedItems[0];
    slot.droppedItems = [];
    this.availableTerms.push(term);
    this.updateUserAnswers();
  }

  updateUserAnswers() {
    this.userAnswers = {};
    this.definitionSlots.forEach((slot) => {
      if (slot.droppedItems.length > 0) {
        this.userAnswers[slot.droppedItems[0]] = slot.def;
      }
    });
  }

  get allAnswered(): boolean {
    return (
      this.questions.length > 0 && Object.keys(this.userAnswers).length === this.questions.length
    );
  }

  
  verify(forceSubmit = false): void {
    if (this.result || this.isVerifying) return;
    if (!forceSubmit && !this.allAnswered) return;

    const reponses = this.questions
      .filter((q) => this.userAnswers[q.terme])
      .map((q) => ({
        questionId: q.id,
        reponse: this.userAnswers[q.terme],
      }));

    if (!forceSubmit && reponses.length === 0) return;

    const payload: AssociationVerifyRequest = { reponses };

    if (this.participantInfo) {
      payload.participant = {
        nom: this.participantInfo.nom,
        prenom: this.participantInfo.prenom,
      };
      payload.sessionCode = this.participantInfo.sessionCode;
    }

    payload.duree = this.initialTime - this.timeLeft;

    this.isVerifying = true;
    this.clearTimer();

    this.associationService.verifyAnswers(this.gameId, payload).subscribe({
      next: (result) => {
        this.result = result;
        this.isVerified = true;
        this.isVerifying = false;

        
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

  startTimer(): void {
    this.clearTimer();
    this.ngZone.runOutsideAngular(() => {
      this.timerInterval = setInterval(() => {
        this.ngZone.run(() => {
          if (this.timeLeft > 0) {
            this.timeLeft--;
            this.cdr.detectChanges();
            if (this.timeLeft === 0) {
              this.verify(true);
            }
          }
        });
      }, 1000);
    });
  }

  get formattedTime(): string {
    const min = Math.floor(this.timeLeft / 60).toString().padStart(2, '0');
    const sec = (this.timeLeft % 60).toString().padStart(2, '0');
    return `${min}:${sec}`;
  }

  shuffleArray<T>(arr: T[]): T[] {
    return [...arr].sort(() => Math.random() - 0.5);
  }

  abandonner(): void {
    if (!confirm('Abandonner ce jeu ? Votre score sera 0 pour cette partie.')) return;
    this.clearTimer();
    // Score 0 enregistré
    localStorage.setItem('score_association', '0');
    localStorage.setItem('total_association', String(this.questions.length));
    const sessionCode = localStorage.getItem('session_code') || '';
    const gamesRaw = localStorage.getItem('session_games');
    if (gamesRaw) {
      const games = JSON.parse(gamesRaw);
      const currentIndex = games.findIndex((g: any) => g.type === 'association');
      const next = games[currentIndex + 1];
      if (next) {
        switch (next.type) {
          case 'formulation': this.router.navigate(['/session/formulation', sessionCode]); break;
          case 'crossword':   this.router.navigate(['/session/crossword', sessionCode]);   break;
          default:            this.router.navigate(['/session/results', sessionCode]);
        }
      } else {
        this.router.navigate(['/session/results', sessionCode]);
      }
    } else {
      this.router.navigate(['/session/results', sessionCode]);
    }
  }

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

  getConnectedDropLists(index: number): string[] {
    return ['terms-list', ...this.definitionDropListIds.filter(id => id !== `def-list-${index}`)];
  }
}
