// src/app/core/services/session.service.ts

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

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  getMySessions(): Observable<Session[]> {
    return this.http.get<Session[]>(`${this.apiUrl}/sessions`);
  }

  createSession(data: { titre: string; duree: number }): Observable<{ message: string; session: Session }> {
   
    return this.http.post<{ message: string; session: Session }>(`${this.apiUrl}/session`, data);
  }

  getSessionByCode(code: string): Observable<Session> {
    return this.http.get<Session>(`${this.apiUrl}/session/${code}`);
  }
}