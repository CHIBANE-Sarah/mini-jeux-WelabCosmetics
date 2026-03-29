export interface AssociationQuestion {
  id: number;
  terme: string;
  definitions: string[];
}

export interface AssociationVerifyRequest {
  reponses: { questionId: number; reponse: string }[];
  participant?: { nom: string; prenom: string };
  sessionCode?: string;
  duree?: number;
}

export interface AssociationVerifyResponse {
  score: number;
  total: number;
  pourcentage: number;
  corrections: {
    questionId: number;
    terme: string;
    reponse: string;
    bonneReponse: string;
    estCorrect: boolean;
  }[];
}