// Injectable permet de déclarer cette classe comme service Angular.
import { Injectable } from '@angular/core';

// CanActivate permet de contrôler l'accès à une route.
import { CanActivate, Router } from '@angular/router';

// Service d'authentification utilisé pour savoir si l'utilisateur est connecté.
import { AuthService } from '../services/auth.service';

// Le guard est disponible dans toute l'application.
@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {

  // Injection du service d'authentification et du routeur.
  constructor(private auth: AuthService, private router: Router) {}

  // Méthode appelée automatiquement avant d'ouvrir une route protégée.
  canActivate(): boolean {
    // Si l'utilisateur possède un token, il peut accéder à la page.
    if (this.auth.isAuthenticated()) {
      return true;
    }

    // Sinon, il est redirigé vers la page de connexion.
    this.router.navigate(['/login'], { queryParams: { returnUrl: '/dashboard' }});

    return false;
  }
}