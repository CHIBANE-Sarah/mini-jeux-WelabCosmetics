// CommonModule permet d'utiliser les directives Angular courantes comme *ngIf et *ngFor.
import { CommonModule } from '@angular/common';

// Component permet de déclarer cette classe comme composant Angular.
import { Component } from '@angular/core';

// FormsModule permet d'utiliser les formulaires Angular avec ngModel.
import { FormsModule } from '@angular/forms';

// Router permet de rediriger l'utilisateur vers une autre page.
import { Router } from '@angular/router';

// Service qui communique avec l'API Symfony pour les sessions.
import { SessionService } from '../core/services/session.service';

// Service d'authentification, utilisé ici pour connaître l'état de connexion si besoin dans le HTML.
import { AuthService } from '../core/services/auth.service';

// Déclaration du composant Angular permettant à un joueur de rejoindre une session.
@Component({
  selector: 'app-join-session',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './join.html',
  styleUrls: ['./join.css'],
})
export class JoinSession {
  // Informations saisies par le joueur dans le formulaire.
  nom = '';
  prenom = '';
  sessionCode = '';

  // Avatar choisi par défaut pour le joueur.
  avatar = 'bi-eyedropper';

  // Liste des avatars disponibles, ici représentés par des classes Bootstrap Icons.
  avatars = ['bi-eyedropper', 'bi-flower1', 'bi-droplet', 'bi-tree', 'bi-droplet-half', 'bi-stars'];

  // Messages affichés dans l'interface selon le résultat de l'action.
  errorMessage = '';
  successMessage = '';

  // Indique si une requête est en cours pour éviter les doubles clics ou afficher un chargement.
  isLoading = false;

  // Injection du routeur, du service d'authentification et du service de session.
  constructor(
    private router: Router,
    public authService: AuthService,
    private sessionService: SessionService
  ) {}

  // Méthode appelée lorsque le joueur valide le formulaire pour rejoindre une session.
  join() {
    // Réinitialise les messages avant une nouvelle tentative.
    this.errorMessage = '';
    this.successMessage = '';

    // Vérifie que les champs obligatoires ne sont pas vides.
    // trim() supprime les espaces au début et à la fin.
    if (!this.nom.trim() || !this.prenom.trim() || !this.sessionCode.trim()) {
      this.errorMessage = 'Tous les champs sont obligatoires.';
      return;
    }

    // Normalise le code : suppression des espaces et passage en majuscules.
    const normalizedCode = this.sessionCode.trim().toUpperCase();

    // Vérifie une longueur minimale pour éviter d’envoyer un code manifestement invalide.
    if (normalizedCode.length < 4) {
      this.errorMessage = 'Le code de session doit contenir au moins 4 caractères.';
      return;
    }

    // Active l'état de chargement pendant les appels au backend.
    this.isLoading = true;

    // Premier appel API : vérifie que la session existe grâce à son code.
    this.sessionService.getSessionByCode(normalizedCode).subscribe({
      next: (session) => {

        // Deuxième appel API : demande au backend de rejoindre la session.
        this.sessionService
          .joinSession(normalizedCode, this.nom.trim(), this.prenom.trim())
          .subscribe({
            next: () => {
              // La requête est terminée, on désactive le chargement.
              this.isLoading = false;

              // Message de confirmation affiché au joueur.
              this.successMessage = `Bravo ${this.prenom} ${this.nom}, vous avez rejoint la session : ${session.titre} !`;

              // Stocke les informations du participant dans le localStorage.
              // Cela permet de les retrouver sur les pages suivantes sans refaire saisir les données.
              localStorage.setItem(
                'welab.participant',
                JSON.stringify({
                  nom: this.nom.trim(),
                  prenom: this.prenom.trim(),
                  sessionCode: session.code,
                  avatar: this.avatar,
                })
              );

              // Stocke aussi des informations simples utilisées par les autres pages du jeu.
              localStorage.setItem('player_name', this.prenom + ' ' + this.nom);
              localStorage.setItem('session_code', normalizedCode);

              // Nettoie les anciens scores et anciennes données de jeu.
              // Cela évite de garder les résultats d’une ancienne session.
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

              // Suppression supplémentaire de session_start_time.
              // Elle est déjà dans la liste au-dessus, donc cette ligne est redondante mais non bloquante.
              localStorage.removeItem('session_start_time');

              // Attend 1,5 seconde pour laisser le message de succès visible,
              // puis redirige vers la page de la session.
              setTimeout(() => {
                this.router.navigate(['/session', normalizedCode]);
              }, 1500);
            },

            // Erreur lors de l’appel pour rejoindre la session.
            error: () => {
              this.isLoading = false;
              this.errorMessage = 'Impossible de rejoindre cette session pour le moment.';
            },
          });
      },

      // Erreur lors de la recherche de la session par code.
      error: (err) => {
        this.isLoading = false;

        // Si le backend renvoie 404, cela signifie que le code n'existe pas.
        this.errorMessage =
          err.status === 404 ? 'Code de session introuvable.' : 'Erreur de connexion au serveur.';
      },
    });
  }
}