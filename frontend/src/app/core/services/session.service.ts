// Injectable permet de déclarer cette classe comme service Angular.
import { Injectable } from '@angular/core';

// HttpClient permet d'envoyer des requêtes HTTP vers l'API Symfony.
import { HttpClient } from '@angular/common/http';

// Observable représente une réponse asynchrone d'une requête HTTP.
import { Observable } from 'rxjs';

// Interface TypeScript décrivant la structure d'une session reçue du backend.
export interface Session {
  id: number;
  titre: string;
  code: string;
  duree: number;
  createur: string;
  nbParticipants?: number;
}

// Interface décrivant les durées possibles pour chaque type de jeu.
export interface GameDurationConfig {
  association?: number;
  crossword?: number;
  formulation?: number;

  // Permet d'accepter d'autres clés de type string si besoin.
  [key: string]: number | undefined;
}

// Interface décrivant les données envoyées lors de la création d'une session.
export interface CreateSessionPayload {
  titre: string;
  duree: number;
  gameTypes?: string[];
  gameDurations?: GameDurationConfig;
}

// Interface décrivant les statistiques affichées dans le dashboard admin.
export interface DashboardStats {
  totalSessions: number;
  totalParticipants: number;
  averageScore: number;
  averageTime: number;
}

// Le service est disponible dans toute l'application.
@Injectable({ providedIn: 'root' })
export class SessionService {
  // URL de base de l’API Symfony.
  private apiUrl = 'http://localhost:8000/api';

  // Injection du client HTTP Angular.
  constructor(private http: HttpClient) {}

  // Récupère les sessions créées par l’administrateur connecté.
  getMySessions(): Observable<Session[]> {
    return this.http.get<Session[]>(`${this.apiUrl}/sessions`);
  }

  // Récupère une session à partir de son code.
  getSessionByCode(code: string): Observable<Session> {
    return this.http.get<Session>(`${this.apiUrl}/session/${code}`);
  }

  // Récupère la liste des jeux associés à une session.
  getSessionGames(code: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/session/${code}/games`);
  }

  // Crée une nouvelle session côté backend.
  createSession(data: CreateSessionPayload): Observable<any> {
    return this.http.post(`${this.apiUrl}/session`, data);
  }

  // Supprime une session à partir de son code.
  deleteSession(code: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/session/${code}`);
  }

  // Permet à un joueur de rejoindre une session.
  joinSession(code: string, nom: string, prenom: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/session/${code}/join`, { nom, prenom });
  }

  // Récupère les statistiques du dashboard administrateur.
  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/stats/dashboard`);
  }
}