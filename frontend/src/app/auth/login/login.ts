// Imports Angular nécessaires pour déclarer un composant, utiliser les formulaires,
// afficher des directives Angular et naviguer entre les pages.
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

// Service personnel qui contient la logique d’authentification.
import { AuthService } from '../../core/services/auth.service';

// Déclaration du composant Angular de la page de connexion.
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {

  // Champs liés au formulaire de connexion.
  login = '';
  password = '';

  // Permet d’indiquer qu'une requête est en cours.
  loading = false;

  // Message affiché en cas d'erreur.
  errorMessage = '';

  // Injection du service d'authentification et du routeur Angular.
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  // Méthode appelée lors de la soumission du formulaire.
  onSubmit() {
    // Vérifie que les deux champs sont remplis.
    if (!this.login || !this.password) {
      this.errorMessage = 'Veuillez remplir tous les champs';
      return;
    }

    // Active l'état de chargement et réinitialise le message d’erreur.
    this.loading = true;
    this.errorMessage = '';

    // Appelle le service d'authentification pour envoyer les identifiants au backend.
    this.authService.login(this.login, this.password).subscribe({
      // Si la connexion réussit, on redirige vers le dashboard.
      next: () => {
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },

      // Si la connexion échoue, on affiche un message d’erreur.
      error: () => {
        this.loading = false;
        this.errorMessage = 'Identifiants incorrects';
      }
    });
  }
}