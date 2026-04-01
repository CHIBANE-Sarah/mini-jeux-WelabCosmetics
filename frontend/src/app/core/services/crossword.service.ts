import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CrosswordQuestion {
  id: number;
  definition: string;
  motCorrect: string;
}

export interface CrosswordValidation {
  score: number;
  total: number;
  corrections: { id: number; correct: boolean; motCorrect: string }[];
}

@Injectable({ providedIn: 'root' })
export class CrosswordService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  getQuestions(sessionCode: string): Observable<CrosswordQuestion[]> {
    return this.http.get<CrosswordQuestion[]>(`${this.apiUrl}/crossword/${sessionCode}`);
  }

  validate(reponses: { id: number; reponse: string }[]): Observable<CrosswordValidation> {
    return this.http.post<CrosswordValidation>(`${this.apiUrl}/crossword/validate`, { reponses });
  }
}