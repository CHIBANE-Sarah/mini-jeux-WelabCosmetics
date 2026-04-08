import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API = 'http://localhost:8000/api/admin/games';

export interface GameAdmin {
  id: number;
  type: 'association' | 'crossword' | 'formulation';
  sessionId: number;
  sessionCode: string;
  sessionTitre: string;
  nbQuestions: number;
  questions?: AssocQuestion[] | CrosswordQuestion[];
  ingredients?: Ingredient[];
}

export interface AssocQuestion {
  id?: number;
  terme: string;
  definitions: string[];
  bonneReponse: string;
}

export interface CrosswordQuestion {
  id?: number;
  definition: string;
  motCorrect: string;
}

export interface Ingredient {
  id?: number;
  nom: string;
  categorie: string;
  estCorrect: boolean;
}

@Injectable({ providedIn: 'root' })
export class GameAdminService {
  constructor(private http: HttpClient) {}

  // ─── Jeux ───────────────────────────────────────

  /** Liste tous les jeux */
  getGames(): Observable<GameAdmin[]> {
    return this.http.get<GameAdmin[]>(API);
  }

  /** Détail complet d'un jeu (avec questions/ingrédients) */
  getGame(id: number): Observable<GameAdmin> {
    return this.http.get<GameAdmin>(`${API}/${id}`);
  }

  // ─── Association ─────────────────────────────────

  getAssocQuestions(gameId: number): Observable<AssocQuestion[]> {
    return this.http.get<AssocQuestion[]>(`${API}/${gameId}/association/questions`);
  }

  addAssocQuestion(gameId: number, q: AssocQuestion): Observable<AssocQuestion> {
    return this.http.post<AssocQuestion>(`${API}/${gameId}/association/questions`, q);
  }

  updateAssocQuestion(gameId: number, qId: number, q: AssocQuestion): Observable<AssocQuestion> {
    return this.http.put<AssocQuestion>(`${API}/${gameId}/association/questions/${qId}`, q);
  }

  deleteAssocQuestion(gameId: number, qId: number): Observable<void> {
    return this.http.delete<void>(`${API}/${gameId}/association/questions/${qId}`);
  }

  // ─── Crossword ────────────────────────────────────

  getCrosswordQuestions(gameId: number): Observable<CrosswordQuestion[]> {
    return this.http.get<CrosswordQuestion[]>(`${API}/${gameId}/crossword/questions`);
  }

  addCrosswordQuestion(gameId: number, q: CrosswordQuestion): Observable<CrosswordQuestion> {
    return this.http.post<CrosswordQuestion>(`${API}/${gameId}/crossword/questions`, q);
  }

  updateCrosswordQuestion(gameId: number, qId: number, q: CrosswordQuestion): Observable<CrosswordQuestion> {
    return this.http.put<CrosswordQuestion>(`${API}/${gameId}/crossword/questions/${qId}`, q);
  }

  deleteCrosswordQuestion(gameId: number, qId: number): Observable<void> {
    return this.http.delete<void>(`${API}/${gameId}/crossword/questions/${qId}`);
  }

  // ─── Formulation ─────────────────────────────────

  getIngredients(gameId: number): Observable<Ingredient[]> {
    return this.http.get<Ingredient[]>(`${API}/${gameId}/formulation/ingredients`);
  }

  addIngredient(gameId: number, i: Ingredient): Observable<Ingredient> {
    return this.http.post<Ingredient>(`${API}/${gameId}/formulation/ingredients`, i);
  }

  updateIngredient(gameId: number, iId: number, i: Ingredient): Observable<Ingredient> {
    return this.http.put<Ingredient>(`${API}/${gameId}/formulation/ingredients/${iId}`, i);
  }

  deleteIngredient(gameId: number, iId: number): Observable<void> {
    return this.http.delete<void>(`${API}/${gameId}/formulation/ingredients/${iId}`);
  }
}