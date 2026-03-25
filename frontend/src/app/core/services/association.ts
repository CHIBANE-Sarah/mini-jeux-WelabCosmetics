import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  AssociationQuestion,
  AssociationVerifyRequest,
  AssociationVerifyResponse
} from '../../interfaces/association.interface';

@Injectable({
  providedIn: 'root'
})
export class AssociationService {

  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  getQuestions(gameId: number): Observable<{ gameId: number; questions: AssociationQuestion[] }> {
    return this.http.get<{ gameId: number; questions: AssociationQuestion[] }>(
      `${this.apiUrl}/association/${gameId}/questions`
    );
  }

  verifyAnswers(gameId: number, body: AssociationVerifyRequest): Observable<AssociationVerifyResponse> {
    return this.http.post<AssociationVerifyResponse>(
      `${this.apiUrl}/association/${gameId}/verify`,
      body
    );
  }
}