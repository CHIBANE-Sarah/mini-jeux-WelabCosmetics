// HttpInterceptorFn permet d'intercepter toutes les requêtes HTTP Angular.
import { HttpInterceptorFn } from '@angular/common/http';

// inject permet d'utiliser un service sans passer par un constructeur.
import { inject } from '@angular/core';

// Service qui permet de récupérer le token JWT.
import { AuthService } from '../services/auth.service';

// Interceptor exécuté automatiquement avant chaque requête HTTP.
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Récupération du service d'authentification.
  const authService = inject(AuthService);

  // Récupération du token JWT stocké dans le localStorage.
  const token = authService.getToken();

  // Si un token existe, on l'ajoute dans le header Authorization.
  if (token) {
    // Les requêtes Angular sont immuables, donc on doit les cloner pour les modifier.
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    // On envoie la requête modifiée.
    return next(cloned);
  }

  // Si aucun token n'existe, on envoie la requête originale.
  return next(req);
};