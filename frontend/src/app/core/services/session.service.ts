import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Session {
  id: number;
  titre: string;
  code: string;
  duree: number;
  createur: string;
  nbParticipants?: number;
}

@Injectable({ providedIn: 'root' })
export class SessionService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');

    if (!token) {
      console.error('Aucun token trouvé');
      throw new Error('Utilisateur non connecté');
    }

    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getMySessions(): Observable<Session[]> {
    // CORRECTION 2 : Backticks
    return this.http.get<Session[]>(`${this.apiUrl}/sessions`, { headers: this.getAuthHeaders() });
  }

  getSessionByCode(code: string): Observable<Session> {
    return this.http.get<Session>(`${this.apiUrl}/session/${code}`);
  }

  getSessionGames(code: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/session/${code}/games`);
  }

  createSession(data: { titre: string; duree: number }): Observable<Session> {
    return this.http.post<Session>(`${this.apiUrl}/session`, data, { headers: this.getAuthHeaders() });
  }

  joinSession(code: string, nom: string, prenom: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/session/${code}/join`, { nom, prenom });
  }
}