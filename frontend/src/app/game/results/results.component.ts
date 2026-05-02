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
    this.sessionCode  = this.route.snapshot.paramMap.get('sessionCode') || '';
    this.playerName   = localStorage.getItem('player_name')  || 'Joueur';
    this.sessionTitle = localStorage.getItem('session_title') || 'Session de jeu';

    const storedProfile = localStorage.getItem('welab.participant');
    if (storedProfile) {
      try {
        this.playerProfile = JSON.parse(storedProfile);
      } catch {
        this.playerProfile = null;
      }
    }

    const sc = localStorage.getItem('score_crossword');
    const tc = localStorage.getItem('total_crossword');
    const sa = localStorage.getItem('score_association');
    const ta = localStorage.getItem('total_association');
    const sf = localStorage.getItem('score_formulation');
    const tf = localStorage.getItem('total_formulation');

    if (sc && tc) { this.scoreCrossword  = +sc; this.totalCrossword  = +tc; }
    if (sa && ta) { this.scoreAssociation = +sa; this.totalAssociation = +ta; }
    if (sf && tf) { this.scoreFormulation = +sf; this.totalFormulation = +tf; }

    this.calculateGlobalScore();
    this.saveParticipation();
  }

  calculateGlobalScore(): void {
    const scores: number[] = [];
    if (this.scoreCrossword  !== null && this.totalCrossword)
      scores.push(Math.round((this.scoreCrossword  / this.totalCrossword)  * 100));
    if (this.scoreAssociation !== null && this.totalAssociation)
      scores.push(Math.round((this.scoreAssociation / this.totalAssociation) * 100));
    if (this.scoreFormulation !== null && this.totalFormulation)
      scores.push(Math.round((this.scoreFormulation / this.totalFormulation) * 100));

    if (scores.length > 0) {
      this.scoreGlobal = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    }
    this.reussie = this.scoreGlobal >= 50;
  }

  getPct(score: number | null, total: number | null): number {
    if (score === null || !total) return 0;
    return Math.round((score / total) * 100);
  }

  saveParticipation(): void {
    if (localStorage.getItem('participation_saved')) return;
    const startTime  = localStorage.getItem('session_start_time');
    const tempsTotal = startTime ? Math.round((Date.now() - parseInt(startTime)) / 1000) : 0;

    this.participationService.save(this.sessionCode, this.scoreGlobal, tempsTotal).subscribe({
      next: () => localStorage.setItem('participation_saved', '1'),
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

  /** AJOUT : retour à la page d'accueil */
  goHome(): void {
    this.clearScores();
    this.router.navigate(['/']);
  }

  rejouer(): void {
    this.clearScores();
    this.router.navigate(['/join']);
  }

  private clearScores(): void {
    ['score_crossword','total_crossword','score_association','total_association',
     'score_formulation','total_formulation','participation_saved'].forEach(k =>
      localStorage.removeItem(k)
    );
  }
}