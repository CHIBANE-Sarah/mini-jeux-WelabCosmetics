// Component permet de déclarer un composant Angular.
// OnInit permet d'exécuter du code au chargement du composant.
// ChangeDetectorRef permet de forcer la mise à jour de l'affichage si nécessaire.
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';

// CommonModule permet d'utiliser les directives Angular comme *ngIf et *ngFor.
import { CommonModule } from '@angular/common';

// FormsModule permet d'utiliser les formulaires Angular pour l'avis utilisateur.
import { FormsModule } from '@angular/forms';

// ActivatedRoute permet de récupérer les paramètres de l'URL.
// Router permet de naviguer vers une autre page.
import { ActivatedRoute, Router } from '@angular/router';

// Service utilisé pour enregistrer la participation finale.
import { ParticipationService } from '../../core/services/participation.service';

// Service utilisé pour enregistrer un avis utilisateur.
import { ReviewService } from '../../core/services/review.service';

// Déclaration du composant Angular de la page de résultats.
@Component({
  selector: 'app-results',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.css'],
})
export class ResultsComponent implements OnInit {
  // Informations générales de la session et du joueur.
  sessionCode = '';
  playerName = '';
  sessionTitle = '';

  // Scores du jeu crossword.
  scoreCrossword: number | null = null;
  totalCrossword: number | null = null;

  // Scores du jeu association.
  scoreAssociation: number | null = null;
  totalAssociation: number | null = null;

  // Scores du jeu formulation.
  scoreFormulation: number | null = null;
  totalFormulation: number | null = null;

  // Score global final en pourcentage.
  scoreGlobal = 0;

  // Indique si le joueur a réussi selon le seuil choisi.
  reussie = false;

  // Date affichée sur la page de résultats.
  date = new Date();

  // Profil du joueur récupéré depuis le localStorage.
  playerProfile: any = null;

  // Données liées à l'avis utilisateur.
  reviewNote = 0;
  reviewComment = '';
  reviewSent = false;
  reviewError = '';

  // Injection des services nécessaires.
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private participationService: ParticipationService,
    private reviewService: ReviewService,
    private cdr: ChangeDetectorRef
  ) {}

  // Méthode appelée automatiquement au chargement de la page de résultats.
  ngOnInit(): void {
    // Récupère le code de session depuis l'URL /session/results/:sessionCode.
    this.sessionCode = this.route.snapshot.paramMap.get('sessionCode') || '';

    // Récupère le nom du joueur stocké pendant la session.
    this.playerName = localStorage.getItem('player_name') || 'Joueur';

    // Récupère le titre de la session.
    this.sessionTitle = localStorage.getItem('session_title') || 'Session de jeu';

    // Récupère le profil complet du participant si disponible.
    const storedProfile = localStorage.getItem('welab.participant');
    if (storedProfile) {
      try {
        this.playerProfile = JSON.parse(storedProfile);
      } catch {
        this.playerProfile = null;
      }
    }

    // Lit les scores stockés par chaque jeu.
    this.readScoresFromStorage();

    // Calcule le score global final.
    this.calculateGlobalScore();

    // Enregistre la participation en base de données.
    this.saveParticipation();
  }

  // Lit les scores de chaque mini-jeu depuis le localStorage.
  private readScoresFromStorage(): void {
    const sc = localStorage.getItem('score_crossword');
    const tc = localStorage.getItem('total_crossword');
    const sa = localStorage.getItem('score_association');
    const ta = localStorage.getItem('total_association');
    const sf = localStorage.getItem('score_formulation');
    const tf = localStorage.getItem('total_formulation');

    // Si un score crossword existe, on le convertit en nombre.
    if (sc !== null && tc !== null) {
      this.scoreCrossword = Number(sc);
      this.totalCrossword = Number(tc);
    }

    // Si un score association existe, on le convertit en nombre.
    if (sa !== null && ta !== null) {
      this.scoreAssociation = Number(sa);
      this.totalAssociation = Number(ta);
    }

    // Si un score formulation existe, on le convertit en nombre.
    if (sf !== null && tf !== null) {
      this.scoreFormulation = Number(sf);
      this.totalFormulation = Number(tf);
    }
  }

  // Vérifie si au moins un score de jeu existe.
  private hasAnyScore(): boolean {
    return (
      this.scoreCrossword !== null ||
      this.scoreAssociation !== null ||
      this.scoreFormulation !== null
    );
  }

  // Convertit un score brut en pourcentage.
  private scoreToPercent(score: number | null, total: number | null): number {
    // Si aucun score n’existe, on retourne 0.
    if (score === null) return 0;

    const s = Number(score);
    const t = Number(total) || 0;

    // Cas classique : score sur total.
    if (t > 0 && s <= t) {
      return Math.round((s / t) * 100);
    }

    // Si le score est déjà un pourcentage, on le limite entre 0 et 100.
    return Math.round(Math.max(0, Math.min(100, s)));
  }

  // Calcule le score global en faisant la moyenne des jeux réalisés.
  calculateGlobalScore(): void {
    const scores: number[] = [];

    // Ajoute le score crossword si le jeu a été réalisé.
    if (this.scoreCrossword !== null) {
      scores.push(this.scoreToPercent(this.scoreCrossword, this.totalCrossword));
    }

    // Ajoute le score association si le jeu a été réalisé.
    if (this.scoreAssociation !== null) {
      scores.push(this.scoreToPercent(this.scoreAssociation, this.totalAssociation));
    }

    // Ajoute le score formulation si le jeu a été réalisé.
    if (this.scoreFormulation !== null) {
      scores.push(this.scoreToPercent(this.scoreFormulation, this.totalFormulation));
    }

    // Moyenne des scores disponibles.
    this.scoreGlobal =
      scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0;

    // Considère la session réussie si le score global est supérieur ou égal à 50%.
    this.reussie = this.scoreGlobal >= 50;
  }

  // Méthode publique utilisée dans le HTML pour afficher un pourcentage.
  getPct(score: number | null, total: number | null): number {
    return this.scoreToPercent(score, total);
  }

  // Enregistre la participation du joueur dans la base via l'API.
  saveParticipation(): void {
    // Si aucun score n'existe, on n'enregistre rien.
    if (!this.hasAnyScore()) return;

    // Récupère le temps de début enregistré au lancement des jeux.
    const startTime = localStorage.getItem('session_start_time');

    // Clé unique pour éviter d'enregistrer plusieurs fois la même participation.
    const saveKey = `participation_saved_${this.sessionCode}_${this.playerName}_${startTime || 'no-start'}`;

    // Si cette participation a déjà été enregistrée, on arrête.
    if (localStorage.getItem(saveKey)) return;

    // Calcule la durée totale en secondes.
    const tempsTotal = startTime
      ? Math.round((Date.now() - parseInt(startTime, 10)) / 1000)
      : 0;

    // Appelle le service pour envoyer la participation au backend.
    this.participationService.save(this.sessionCode, this.scoreGlobal, tempsTotal).subscribe({
      next: () => {
        // Marque la participation comme enregistrée pour éviter les doublons.
        localStorage.setItem(saveKey, '1');
        localStorage.setItem('participation_saved', '1');
      },
    });
  }

  // Définit la note donnée par le joueur pour l'avis.
  setReviewNote(note: number): void {
    this.reviewNote = note;
  }

  // Envoie l'avis utilisateur au backend.
  submitReview(): void {
    this.reviewError = '';

    // Vérifie que la note est bien comprise entre 1 et 5.
    if (this.reviewNote < 1 || this.reviewNote > 5) {
      this.reviewError = 'Choisis une note entre 1 et 5 étoiles.';
      return;
    }

    // Récupère les informations du profil joueur.
    const profile = this.playerProfile || {};

    // Appelle le service d'avis pour créer un avis.
    this.reviewService.create({
      sessionCode: this.sessionCode,
      nom: profile.nom || '',
      prenom: profile.prenom || this.playerName,
      avatar: profile.avatar || 'bi-eyedropper',
      note: this.reviewNote,
      commentaire: this.reviewComment.trim(),
    }).subscribe({
      next: () => {
        // Indique que l'avis a bien été envoyé.
        this.reviewSent = true;
        this.cdr.detectChanges();
      },
      error: () => {
        // Affiche un message si l'avis n'a pas pu être enregistré.
        this.reviewError = 'Impossible d’enregistrer ton avis pour le moment.';
        this.cdr.detectChanges();
      },
    });
  }

  // Retourne vers la page d'accueil et nettoie les scores temporaires.
  goHome(): void {
    this.clearScores();
    this.router.navigate(['/'], { replaceUrl: true });
  }

  // Permet de recommencer une session depuis la page rejoindre.
  rejouer(): void {
    this.clearScores();
    this.router.navigate(['/join'], { replaceUrl: true });
  }

  // Supprime les scores temporaires du localStorage.
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