import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AssociationService } from '../../core/services/association';
import { AssociationQuestion, AssociationVerifyResponse } from '../../interfaces/association.interface';
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

interface DefSlot {
  def: string;
  droppedItems: string[];
}

@Component({
  selector: 'app-association-game',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  templateUrl: './association-game.html',
  styleUrl: './association-game.css'
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

  timeLeft = 420;
  timerInterval: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private associationService: AssociationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.gameId = Number(this.route.snapshot.paramMap.get('gameId'));
    if (this.gameId && this.gameId > 0) {
      this.loadQuestions();
      this.startTimer();
    } else {
      this.isLoading = false;
    }
  }

  ngOnDestroy(): void {
    clearInterval(this.timerInterval);
  }

  loadQuestions(): void {
    this.associationService.getQuestions(this.gameId).subscribe({
      next: (data) => {
        this.questions = data.questions;
        this.availableTerms = this.questions.map(q => q.terme);

        const uniqueDefs = [...new Set(
          data.questions.flatMap((q: AssociationQuestion) => q.definitions)
        )];

        this.definitionSlots = this.shuffleArray(uniqueDefs).map(def => ({ def, droppedItems: [] }));
        this.definitionDropListIds = this.definitionSlots.map((_, index) => `def-list-${index}`);

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Erreur chargement questions:', err);
      }
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
        event.currentIndex,
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
    this.definitionSlots.forEach(slot => {
      if (slot.droppedItems.length > 0) {
        this.userAnswers[slot.droppedItems[0]] = slot.def;
      }
    });
  }

  get allAnswered(): boolean {
    return this.questions.length > 0 &&
           Object.keys(this.userAnswers).length === this.questions.length;
  }

  verify(): void {
    if (!this.allAnswered) return;

    const reponses = this.questions
      .filter(q => this.userAnswers[q.terme])
      .map(q => ({
        questionId: q.id,
        reponse: this.userAnswers[q.terme]
      }));

    this.associationService.verifyAnswers(this.gameId, { reponses }).subscribe({
      next: (result) => {
        this.result = result;
        this.isVerified = true;
        clearInterval(this.timerInterval);
      },
      error: (err) => console.error('Erreur vérification:', err)
    });
  }

  startTimer(): void {
    this.timerInterval = setInterval(() => {
      if (this.timeLeft > 0) this.timeLeft--;
      else {
        clearInterval(this.timerInterval);
        this.verify();
      }
    }, 1000);
  }

  get formattedTime(): string {
    const min = Math.floor(this.timeLeft / 60).toString().padStart(2, '0');
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
    return ['terms-list', ...this.definitionDropListIds.filter(id => id !== `def-list-${index}`)];
  }
}