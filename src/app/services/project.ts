import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
} from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private apiUrl = `${environment.apiUrl}/projects`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error("Aucun token d'authentification trouvé");
    }
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  }

  async getAll(): Promise<any[]> {
    try {
      console.log('🔄 Chargement de tous les projets...');
      const res: any = await firstValueFrom(
        this.http.get<any>(this.apiUrl, { headers: this.getHeaders() })
      );
      console.log('✅ Projets chargés:', res.data?.length || 0);
      return res.data || [];
    } catch (error) {
      console.error('❌ Erreur chargement projets:', error);
      throw error;
    }
  }

  async get(id: string): Promise<any> {
    try {
      console.log(`🔄 Chargement du projet ${id}...`);
      const res: any = await firstValueFrom(
        this.http.get<any>(`${this.apiUrl}/${id}`, {
          headers: this.getHeaders(),
        })
      );
      console.log('✅ Projet chargé:', res.data);
      return res.data;
    } catch (error) {
      console.error(`❌ Erreur chargement projet ${id}:`, error);
      throw error;
    }
  }

  async create(data: any): Promise<any> {
    try {
      console.log('🆕 Création nouveau projet...', data);

      // Nettoyer les données pour la création
      const cleanData = this.cleanProjectData(data);
      console.log('🧹 Données nettoyées pour création:', cleanData);

      const res: any = await firstValueFrom(
        this.http.post<any>(this.apiUrl, cleanData, {
          headers: this.getHeaders(),
        })
      );
      console.log('✅ Projet créé avec succès:', res.data);
      return res.data;
    } catch (error) {
      console.error('❌ Erreur création projet:', error);
      throw error;
    }
  }

  async update(id: string, data: any): Promise<any> {
    try {
      console.log(`🔄 Mise à jour du projet ${id}...`, data);

      // Nettoyer les données pour la modification
      const cleanData = this.cleanProjectData(data, true);
      console.log('🧹 Données nettoyées pour modification:', cleanData);

      // Vérifier qu'il reste des données à mettre à jour
      if (Object.keys(cleanData).length === 0) {
        throw new Error('Aucune donnée valide à mettre à jour');
      }

      const res: any = await firstValueFrom(
        this.http.put<any>(`${this.apiUrl}/${id}`, cleanData, {
          headers: this.getHeaders(),
        })
      );
      console.log('✅ Projet mis à jour avec succès:', res.data);
      return res.data;
    } catch (error: any) {
      console.error(`❌ Erreur détaillée mise à jour projet ${id}:`, error);

      if (error instanceof HttpErrorResponse) {
        console.error('📋 Status:', error.status);
        console.error('📋 Status Text:', error.statusText);
        console.error('📋 URL:', error.url);
        console.error('📋 Error Body:', error.error);

        if (error.error) {
          console.error('📋 Message du serveur:', error.error.message);
        }
      }

      throw error;
    }
  }

  async delete(id: string): Promise<any> {
    try {
      console.log(`🗑️ Suppression du projet ${id}...`);
      const res: any = await firstValueFrom(
        this.http.delete<any>(`${this.apiUrl}/${id}`, {
          headers: this.getHeaders(),
        })
      );
      console.log('✅ Projet supprimé avec succès');
      return res.data;
    } catch (error) {
      console.error(`❌ Erreur suppression projet ${id}:`, error);
      throw error;
    }
  }

  /**
   * Nettoie les données du projet avant envoi à l'API
   */
  private cleanProjectData(data: any, isUpdate: boolean = false): any {
    const cleaned: any = {};

    // Champs texte obligatoires
    if (this.isValidString(data.titre)) {
      cleaned.titre = String(data.titre).trim();
    } else if (!isUpdate) {
      throw new Error('Le titre est obligatoire');
    }

    if (this.isValidString(data.description)) {
      cleaned.description = String(data.description).trim();
    } else if (!isUpdate) {
      throw new Error('La description est obligatoire');
    }

    // Chef de projet
    if (this.isValidString(data.chefDeProjet)) {
      const chefId = String(data.chefDeProjet).trim();
      cleaned.chefDeProjet = chefId;
    } else if (!isUpdate) {
      throw new Error('Le chef de projet est obligatoire');
    }

    // DATES
    if (this.isValidDate(data.dateDebut)) {
      cleaned.dateDebut = new Date(
        data.dateDebut + 'T00:00:00.000Z'
      ).toISOString();
    } else if (!isUpdate) {
      throw new Error('La date de début est obligatoire');
    }

    if (this.isValidDate(data.dateFin)) {
      cleaned.dateFin = new Date(data.dateFin + 'T00:00:00.000Z').toISOString();
    } else if (!isUpdate) {
      throw new Error('La date de fin est obligatoire');
    }

    // Statut et priorité
    const allowedStatus = ['en attente', 'en cours', 'terminé', 'annulé'];
    const allowedPriorities = ['basse', 'moyenne', 'haute'];

    if (data.statut && allowedStatus.includes(data.statut)) {
      cleaned.statut = data.statut;
    } else if (!isUpdate) {
      cleaned.statut = 'en attente';
    }

    if (data.priorite && allowedPriorities.includes(data.priorite)) {
      cleaned.priorite = data.priorite;
    } else if (!isUpdate) {
      cleaned.priorite = 'moyenne';
    }

    // Budget
    if (this.isValidBudget(data.budget)) {
      cleaned.budget = Number(data.budget);
    } else if (!isUpdate) {
      cleaned.budget = 0;
    }

    // CORRECTION : Gestion simplifiée des membres
    if (data.membres !== undefined && data.membres !== null) {
      if (Array.isArray(data.membres)) {
        // Garder tous les membres, la validation se fera côté backend
        cleaned.membres = data.membres.filter(
          (m: any) => m && String(m).trim().length > 0
        );
      } else {
        cleaned.membres = [];
      }
    } else {
      cleaned.membres = [];
    }

    console.log('📊 Données finales nettoyées:', cleaned);
    return cleaned;
  }

  // Méthodes de validation helpers
  private isValidString(value: any): boolean {
    return (
      value !== undefined && value !== null && String(value).trim().length > 0
    );
  }

  private isValidDate(dateString: string): boolean {
    if (!this.isValidString(dateString)) return false;

    try {
      const date = new Date(dateString);
      return !isNaN(date.getTime());
    } catch {
      return false;
    }
  }

  private isValidBudget(budget: any): boolean {
    if (budget === undefined || budget === null) return false;

    const num = Number(budget);
    return !isNaN(num) && num >= 0;
  }
}
