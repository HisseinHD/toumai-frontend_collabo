// src/app/models/task.model.ts
export interface Task {
  _id?: string;
  titre: string;
  description?: string;
  priorite: 'basse' | 'moyenne' | 'haute' | 'urgente';
  echeance: string | Date;
  projetId: string;
  assigneA: string;
  statut: 'à faire' | 'en cours' | 'en revue' | 'terminée' | 'bloquée';
  progression: number;
  tags?: string[];
  tempsEstime?: number;
  tempsReel?: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface TasksResponse {
  success: boolean;
  count: number;
  total: number;
  currentPage: number;
  totalPages: number;
  data: Task[];
}
