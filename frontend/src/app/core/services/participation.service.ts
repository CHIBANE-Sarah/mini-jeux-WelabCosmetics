import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ParticipationService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  save(sessionCode: string, scoreTotal: number, tempsTotal: number): Observable<any> {
    const playerName = localStorage.getItem('player_name') || 'Joueur Inconnu';
    const parts = playerName.split(' ');
    const joueurPrenom = parts[0] || '';
    const joueurNom = parts.slice(1).join(' ') || '';

    return this.http.post(`${this.apiUrl}/participation/save`, {
      sessionCode,
      joueurNom,
      joueurPrenom,
      scoreTotal,
      tempsTotal
    });
  }
}