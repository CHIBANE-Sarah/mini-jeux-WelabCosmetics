// src/app/interfaces/user.ts

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