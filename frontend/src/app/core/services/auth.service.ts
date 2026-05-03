// HttpClient permet d'envoyer des requêtes HTTP vers le backend Symfony.
import { HttpClient } from '@angular/common/http';

// Injectable permet de déclarer cette classe comme service Angular.
import { Injectable } from '@angular/core';

// Router permet de rediriger l'utilisateur vers une autre page.
import { Router } from '@angular/router';

// Observable représente une réponse asynchrone, map permet de transformer cette réponse.
import { Observable, map } from 'rxjs';

// Le service est disponible dans toute l'application grâce à providedIn: 'root'.
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // Clés utilisées pour stocker les informations dans le navigateur.
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'auth_user';

  // URL de base de l'API Symfony.
  private readonly apiUrl = 'http://localhost:8000/api';

  // Injection du client HTTP et du routeur Angular.
  constructor(private http: HttpClient, private router: Router) {}

  // Envoie les identifiants au backend pour obtenir un token JWT.
  login(login: string, password: string): Observable<any> {
    // LexikJWT attend un champ "username", même si dans notre projet l'attribut s'appelle login.
    return this.http.post<{ token: string }>(
      `${this.apiUrl}/login`,
      { username: login, password }
    ).pipe(
      // Si le backend renvoie un token, on le stock dans le localStorage.
      map((response) => {
        if (response.token) {
          localStorage.setItem(this.TOKEN_KEY, response.token);
        }

        return response;
      })
    );
  }

  // Déconnecte l'utilisateur en supprimant le token et en redirigeant vers la page login.
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.router.navigate(['/login']);
  }

  // Récupère le token JWT stocké dans le navigateur.
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // Vérifie si l'utilisateur est connecté.
  // Le double !! transforme la valeur en booléen : true si token présent, false sinon.
  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}