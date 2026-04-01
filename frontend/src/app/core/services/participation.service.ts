import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ParticipationService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  save(sessionCode: string, scoreTotal: number, tempsTotal: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/participation/save`, {
      sessionCode,
      userId: 1,
      scoreTotal,
      tempsTotal
    });
  }
}