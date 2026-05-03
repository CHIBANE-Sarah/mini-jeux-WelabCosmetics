import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ParticipationService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  save(sessionCode: string, scoreTotal: number, tempsTotal: number): Observable<any> {
    const storedProfile = localStorage.getItem('welab.participant');
    let joueurNom = '';
    let joueurPrenom = '';

    if (storedProfile) {
      try {
        const profile = JSON.parse(storedProfile);
        joueurNom = profile.nom || '';
        joueurPrenom = profile.prenom || '';
      } catch {
        joueurNom = '';
        joueurPrenom = '';
      }
    }

    if (!joueurNom && !joueurPrenom) {
      const playerName = localStorage.getItem('player_name') || 'Joueur Inconnu';
      const parts = playerName.trim().split(' ');
      joueurPrenom = parts[0] || '';
      joueurNom = parts.slice(1).join(' ') || '';
    }

    return this.http.post(`${this.apiUrl}/participation/save`, {
      sessionCode,
      joueurNom,
      joueurPrenom,
      scoreTotal: Math.round(Math.max(0, Math.min(100, Number(scoreTotal) || 0))),
      tempsTotal: Math.max(0, Number(tempsTotal) || 0),
    });
  }
}
