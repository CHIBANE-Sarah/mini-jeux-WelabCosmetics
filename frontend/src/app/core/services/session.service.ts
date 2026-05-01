import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Session {
  id: number;
  titre: string;
  code: string;
  duree: number;
  createur: string;
  nbParticipants?: number;
}

export interface GameDurationConfig {
  association?: number;
  crossword?: number;
  formulation?: number;
  [key: string]: number | undefined;
}

export interface CreateSessionPayload {
  titre: string;
  duree: number;
  gameTypes?: string[];
  gameDurations?: GameDurationConfig;
}

export interface DashboardStats {
  totalSessions: number;
  totalParticipants: number;
  averageScore: number;
  averageTime: number;
}

@Injectable({ providedIn: 'root' })
export class SessionService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  getMySessions(): Observable<Session[]> {
    return this.http.get<Session[]>(`${this.apiUrl}/sessions`);
  }

  getSessionByCode(code: string): Observable<Session> {
    return this.http.get<Session>(`${this.apiUrl}/session/${code}`);
  }

  getSessionGames(code: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/session/${code}/games`);
  }

  createSession(data: CreateSessionPayload): Observable<any> {
    return this.http.post(`${this.apiUrl}/session`, data);
  }

  deleteSession(code: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/session/${code}`);
  }

  joinSession(code: string, nom: string, prenom: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/session/${code}/join`, { nom, prenom });
  }

  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/stats/dashboard`);
  }
}
