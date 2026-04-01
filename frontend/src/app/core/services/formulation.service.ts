import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Ingredient {
  id: number;
  nom: string;
  categorie: string;
}

export interface FormulationValidation {
  score: number;
  total: number;
  corrections: { id: number; nom: string; categorie: string; selectionne: boolean; correct: boolean }[];
}

@Injectable({ providedIn: 'root' })
export class FormulationService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  getIngredients(sessionCode: string): Observable<Ingredient[]> {
    return this.http.get<Ingredient[]>(`${this.apiUrl}/formulation/${sessionCode}`);
  }

  validate(sessionCode: string, ingredientIds: number[]): Observable<FormulationValidation> {
    return this.http.post<FormulationValidation>(`${this.apiUrl}/formulation/validate`, {
      sessionCode,
      ingredients: ingredientIds
    });
  }
}