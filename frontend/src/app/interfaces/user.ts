// frontend/src/app/interfaces/user.ts
// On supprime Session d'ici car elle est déjà définie dans session.service.ts

export interface LoginRequest {
  login: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface User {
  id: number;
  login: string;
  nom: string;
  prenom: string;
  roles: string[];
}