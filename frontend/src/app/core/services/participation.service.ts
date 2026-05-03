// Injectable permet de déclarer cette classe comme service Angular.
import { Injectable } from '@angular/core';

// HttpClient permet d'envoyer des requêtes HTTP vers le backend Symfony.
import { HttpClient } from '@angular/common/http';

// Observable représente une réponse asynchrone d'une requête HTTP.
import { Observable } from 'rxjs';

// Le service est disponible dans toute l'application.
@Injectable({ providedIn: 'root' })
export class ParticipationService {
  // URL de base de l'API Symfony.
  private apiUrl = 'http://localhost:8000/api';

  // Injection du client HTTP Angular.
  constructor(private http: HttpClient) {}

  // Enregistre la participation finale d'un joueur après la fin des jeux.
  save(sessionCode: string, scoreTotal: number, tempsTotal: number): Observable<any> {
    // Récupère le profil du participant stocké lors de l'entrée dans la session.
    const storedProfile = localStorage.getItem('welab.participant');

    // Variables qui contiendront le nom et le prénom du joueur.
    let joueurNom = '';
    let joueurPrenom = '';

    // Si un profil complet existe dans le localStorage, on essaie de le lire.
    if (storedProfile) {
      try {
        const profile = JSON.parse(storedProfile);
        joueurNom = profile.nom || '';
        joueurPrenom = profile.prenom || '';
      } catch {
        // Si le JSON est invalide, on garde des valeurs vides.
        joueurNom = '';
        joueurPrenom = '';
      }
    }

    // Si le profil complet n'existe pas, on tente de récupérer le nom depuis player_name.
    if (!joueurNom && !joueurPrenom) {
      const playerName = localStorage.getItem('player_name') || 'Joueur Inconnu';

      // Découpe le nom complet en plusieurs parties.
      const parts = playerName.trim().split(' ');

      // La première partie est considérée comme le prénom.
      joueurPrenom = parts[0] || '';

      // Le reste est considéré comme le nom.
      joueurNom = parts.slice(1).join(' ') || '';
    }

    // Envoie au backend les informations de participation à enregistrer.
    return this.http.post(`${this.apiUrl}/participation/save`, {
      sessionCode,
      joueurNom,
      joueurPrenom,

      // Sécurise le score : nombre entre 0 et 100, arrondi.
      scoreTotal: Math.round(Math.max(0, Math.min(100, Number(scoreTotal) || 0))),

      // Sécurise le temps : nombre positif ou 0.
      tempsTotal: Math.max(0, Number(tempsTotal) || 0),
    });
  }
}