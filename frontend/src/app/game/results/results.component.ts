import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ParticipationService } from '../../core/services/participation.service';
import { ReviewService } from '../../core/services/review.service';

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.css'],
})
export class ResultsComponent implements OnInit {
  sessionCode = '';
  playerName = '';
  sessionTitle = '';

  scoreCrossword: number | null = null;
  totalCrossword: number | null = null;
  scoreAssociation: number | null = null;
  totalAssociation: number | null = null;
  scoreFormulation: number | null = null;
  totalFormulation: number | null = null;

  scoreGlobal = 0;
  reussie = false;
  date = new Date();

  playerProfile: any = null;
  reviewNote = 0;
  reviewComment = '';
  reviewSent = false;
  reviewError = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private participationService: ParticipationService,
    private reviewService: ReviewService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.sessionCode = this.route.snapshot.paramMap.get('sessionCode') || '';
    this.playerName = localStorage.getItem('player_name') || 'Joueur';
    this.sessionTitle = localStorage.getItem('session_title') || 'Session de jeu';

    const storedProfile = localStorage.getItem('welab.participant');
    if (storedProfile) {
      try {
        this.playerProfile = JSON.parse(storedProfile);
      } catch {
        this.playerProfile = null;
      }
    }

    this.readScoresFromStorage();
    this.calculateGlobalScore();
    this.saveParticipation();
  }

  private readScoresFromStorage(): void {
    const sc = localStorage.getItem('score_crossword');
    const tc = localStorage.getItem('total_crossword');
    const sa = localStorage.getItem('score_association');
    const ta = localStorage.getItem('total_association');
    const sf = localStorage.getItem('score_formulation');
    const tf = localStorage.getItem('total_formulation');

    if (sc !== null && tc !== null) {
      this.scoreCrossword = Number(sc);
      this.totalCrossword = Number(tc);
    }

    if (sa !== null && ta !== null) {
      this.scoreAssociation = Number(sa);
      this.totalAssociation = Number(ta);
    }

    if (sf !== null && tf !== null) {
      this.scoreFormulation = Number(sf);
      this.totalFormulation = Number(tf);
    }
  }

  private hasAnyScore(): boolean {
    return (
      this.scoreCrossword !== null ||
      this.scoreAssociation !== null ||
      this.scoreFormulation !== null
    );
  }

  private scoreToPercent(score: number | null, total: number | null): number {
    if (score === null) return 0;

    const s = Number(score);
    const t = Number(total) || 0;

    if (t > 0 && s <= t) {
      return Math.round((s / t) * 100);
    }

    return Math.round(Math.max(0, Math.min(100, s)));
  }

  calculateGlobalScore(): void {
    const scores: number[] = [];

    if (this.scoreCrossword !== null) {
      scores.push(this.scoreToPercent(this.scoreCrossword, this.totalCrossword));
    }

    if (this.scoreAssociation !== null) {
      scores.push(this.scoreToPercent(this.scoreAssociation, this.totalAssociation));
    }

    if (this.scoreFormulation !== null) {
      scores.push(this.scoreToPercent(this.scoreFormulation, this.totalFormulation));
    }

    this.scoreGlobal =
      scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0;

    this.reussie = this.scoreGlobal >= 50;
  }

  getPct(score: number | null, total: number | null): number {
    return this.scoreToPercent(score, total);
  }

  saveParticipation(): void {
    if (!this.hasAnyScore()) return;

    const startTime = localStorage.getItem('session_start_time');
    const saveKey = `participation_saved_${this.sessionCode}_${this.playerName}_${startTime || 'no-start'}`;

    if (localStorage.getItem(saveKey)) return;

    const tempsTotal = startTime
      ? Math.round((Date.now() - parseInt(startTime, 10)) / 1000)
      : 0;

    this.participationService.save(this.sessionCode, this.scoreGlobal, tempsTotal).subscribe({
      next: () => {
        localStorage.setItem(saveKey, '1');
        localStorage.setItem('participation_saved', '1');
      },
    });
  }

  setReviewNote(note: number): void {
    this.reviewNote = note;
  }

  submitReview(): void {
    this.reviewError = '';

    if (this.reviewNote < 1 || this.reviewNote > 5) {
      this.reviewError = 'Choisis une note entre 1 et 5 étoiles.';
      return;
    }

    const profile = this.playerProfile || {};

    this.reviewService.create({
      sessionCode: this.sessionCode,
      nom: profile.nom || '',
      prenom: profile.prenom || this.playerName,
      avatar: profile.avatar || 'bi-eyedropper',
      note: this.reviewNote,
      commentaire: this.reviewComment.trim(),
    }).subscribe({
      next: () => {
        this.reviewSent = true;
        this.cdr.detectChanges();
      },
      error: () => {
        this.reviewError = 'Impossible d’enregistrer ton avis pour le moment.';
        this.cdr.detectChanges();
      },
    });
  }

  goHome(): void {
    this.clearScores();
    this.router.navigate(['/'], { replaceUrl: true });
  }

  rejouer(): void {
    this.clearScores();
    this.router.navigate(['/join'], { replaceUrl: true });
  }

  private clearScores(): void {
    [
      'score_crossword',
      'total_crossword',
      'score_association',
      'total_association',
      'score_formulation',
      'total_formulation',
      'participation_saved',
      'session_start_time',
    ].forEach((key) => localStorage.removeItem(key));
  }
}
