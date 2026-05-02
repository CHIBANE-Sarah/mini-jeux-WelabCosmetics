import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ReviewPayload {
  sessionCode: string;
  nom: string;
  prenom: string;
  avatar?: string;
  note: number;
  commentaire: string;
}

export interface Review {
  id: number;
  sessionCode: string;
  sessionTitre: string;
  userName: string;
  avatar: string;
  note: number;
  commentaire: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  create(payload: ReviewPayload): Observable<any> {
    return this.http.post(`${this.apiUrl}/reviews`, payload);
  }

  latest(): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/reviews/latest`);
  }
}
