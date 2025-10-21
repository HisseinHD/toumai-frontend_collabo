import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AuthService } from '../core/services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    console.log('Token récupéré:', token); // Debug

    if (!token) {
      throw new Error('Token non trouvé');
    }

    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  }

  async createTask(taskData: any): Promise<any> {
    try {
      const headers = this.getHeaders();

      // Formater les données pour le backend
      const backendData = {
        titre: taskData.titre,
        description: taskData.description,
        priorite: taskData.priorite,
        echeance: taskData.echeance,
        projetId: taskData.projetId,
        assigneA: taskData.assigneA,
        statut: taskData.statut,
        progression: taskData.progression || 0,
        tags: taskData.tags || [],
        tempsEstime: taskData.tempsEstime || null,
      };

      console.log('📤 Création tâche - Données:', backendData);
      console.log('📤 Création tâche - URL:', `${environment.apiUrl}/tasks`);

      const response = await this.http
        .post(`${environment.apiUrl}/tasks`, backendData, { headers })
        .toPromise();

      console.log('✅ Tâche créée - Réponse:', response);
      return response;
    } catch (error: any) {
      console.error('❌ Erreur création tâche:', error);

      // Améliorer le message d'erreur
      if (error.status === 401) {
        throw new Error('Non authentifié');
      } else if (error.status === 403) {
        throw new Error('Permissions insuffisantes');
      } else if (error.status === 404) {
        throw new Error('Projet non trouvé');
      } else if (error.error?.message) {
        throw new Error(error.error.message);
      } else {
        throw error;
      }
    }
  }

  // ALIAS pour compatibilité - getTasks appelle getAll
  async getTasks(params?: any): Promise<any> {
    return this.getAll(params);
  }

  async getAll(params?: any): Promise<any> {
    try {
      const headers = this.getHeaders();
      return await this.http
        .get(`${environment.apiUrl}/tasks`, { headers, params })
        .toPromise();
    } catch (error) {
      console.error('❌ Erreur chargement tâches:', error);
      throw error;
    }
  }

  async getById(taskId: string): Promise<any> {
    try {
      const headers = this.getHeaders();
      return await this.http
        .get(`${environment.apiUrl}/tasks/${taskId}`, { headers })
        .toPromise();
    } catch (error) {
      console.error('❌ Erreur chargement tâche:', error);
      throw error;
    }
  }

  // ALIAS pour compatibilité - updateTask appelle update
  async updateTask(taskId: string, taskData: any): Promise<any> {
    return this.update(taskId, taskData);
  }

  async update(taskId: string, taskData: any): Promise<any> {
    try {
      const headers = this.getHeaders();
      return await this.http
        .put(`${environment.apiUrl}/tasks/${taskId}`, taskData, { headers })
        .toPromise();
    } catch (error) {
      console.error('❌ Erreur mise à jour tâche:', error);
      throw error;
    }
  }

  // ALIAS pour compatibilité - deleteTask appelle delete
  async deleteTask(taskId: string): Promise<any> {
    return this.delete(taskId);
  }

  async delete(taskId: string): Promise<any> {
    try {
      const headers = this.getHeaders();
      return await this.http
        .delete(`${environment.apiUrl}/tasks/${taskId}`, { headers })
        .toPromise();
    } catch (error) {
      console.error('❌ Erreur suppression tâche:', error);
      throw error;
    }
  }

  async getByProject(projectId: string): Promise<any> {
    try {
      const headers = this.getHeaders();
      return await this.http
        .get(`${environment.apiUrl}/tasks/project/${projectId}`, { headers })
        .toPromise();
    } catch (error) {
      console.error('❌ Erreur chargement tâches par projet:', error);
      throw error;
    }
  }

  // Méthodes utilitaires supplémentaires
  async updateStatus(taskId: string, status: string): Promise<any> {
    return this.update(taskId, { statut: status });
  }

  async updateProgress(taskId: string, progress: number): Promise<any> {
    return this.update(taskId, { progression: progress });
  }

  // Méthode pour les statistiques des tâches
  async getStats(): Promise<any> {
    try {
      const headers = this.getHeaders();
      return await this.http
        .get(`${environment.apiUrl}/tasks/stats`, { headers })
        .toPromise();
    } catch (error) {
      console.error('❌ Erreur chargement stats tâches:', error);
      throw error;
    }
  }
}
