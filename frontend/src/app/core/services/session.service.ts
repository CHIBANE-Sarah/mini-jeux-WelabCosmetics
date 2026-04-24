import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Session {
  id: number;
  titre: string;
  code: string;
  duree: number; // en secondes dans la BDD
  createur: string;
  nbParticipants?: number;
}

export interface DashboardStats {
  totalSessions: number;
  totalParticipants: number;
  averageScore: number;
  averageTime: number; // en minutes (converti côté backend)
}

@Injectable({ providedIn: 'root' })
export class SessionService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  /**
   * CORRECTION BUG #8 : suppression de getAuthHeaders() manuel.
   * Le JWT est déjà injecté automatiquement par auth-interceptor.ts sur
   * TOUTES les requêtes HTTP. Ajouter les headers manuellement créait
   * un doublon d'Authorization header.
   */

  getMySessions(): Observable<Session[]> {
    return this.http.get<Session[]>(`${this.apiUrl}/sessions`);
  }

  getSessionByCode(code: string): Observable<Session> {
    return this.http.get<Session>(`${this.apiUrl}/session/${code}`);
  }

  getSessionGames(code: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/session/${code}/games`);
  }

  createSession(data: { titre: string; duree: number; gameTypes?: string[] }): Observable<any> {
    return this.http.post(`${this.apiUrl}/session`, data);
  }

  joinSession(code: string, nom: string, prenom: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/session/${code}/join`, { nom, prenom });
  }

  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/stats/dashboard`);
  }
}