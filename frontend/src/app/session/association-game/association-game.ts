import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
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
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.gameId = Number(this.route.snapshot.paramMap.get('gameId'));
    this.loadParticipantInfo();
    if (this.gameId && this.gameId > 0) {
      this.loadQuestions();
      this.startTimer();
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
    if (this.result || this.isVerifying) {
      return;
    }
    if (!forceSubmit && !this.allAnswered) {
      return;
    }

    const reponses = this.questions
      .filter((q) => this.userAnswers[q.terme])
      .map((q) => ({
        questionId: q.id,
        reponse: this.userAnswers[q.terme],
      }));

    if (!forceSubmit && reponses.length === 0) {
      return;
    }

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
    this.associationService.verifyAnswers(this.gameId, payload).subscribe({
      next: (result) => {
        this.result = result;
        this.isVerified = true;
        this.isVerifying = false;
        this.clearTimer();
      },
      error: (err) => {
        console.error('Erreur vérification:', err);
        this.isVerifying = false;
      },
    });
  }

  startTimer(): void {
    this.clearTimer();
    this.timerInterval = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
        if (this.timeLeft === 0) {
          this.verify(true);
        }
      } else {
        this.verify(true);
      }
    }, 1000);
  }

  get formattedTime(): string {
    const min = Math.floor(this.timeLeft / 60)
      .toString()
      .padStart(2, '0');
    const sec = (this.timeLeft % 60).toString().padStart(2, '0');
    return `${min}:${sec}`;
  }

  shuffleArray<T>(arr: T[]): T[] {
    return [...arr].sort(() => Math.random() - 0.5);
  }

  goNext(): void {
    this.router.navigate(['/']);
  }

  getConnectedDropLists(index: number): string[] {
    return ['terms-list', ...this.definitionDropListIds.filter((id) => id !== `def-list-${index}`)];
  }
}