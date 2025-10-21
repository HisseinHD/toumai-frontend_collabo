import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from '../core/services/auth.service';

export interface User {
  _id: string;
  nom: string;
  prenom: string;
  email: string;
  poste: string;
  role: string;
  statut: string;
  telephone?: string;
  avatar?: string;
  dateCreation?: Date;
  dateModification?: Date;
}

export interface UsersResponse {
  success: boolean;
  data: User[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface UserResponse {
  success: boolean;
  data: User;
}

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getAuthHeaders(): HttpHeaders {
    // Utilisez AuthService pour récupérer le token
    const token =
      this.authService.getToken() || localStorage.getItem('auth_token');

    if (!token) {
      throw new Error("Aucun token d'authentification trouvé");
    }

    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  }

  /**
   * Récupérer tous les utilisateurs avec pagination et filtres
   */
  async getUsers(params?: any): Promise<UsersResponse> {
    try {
      console.log('🔄 Chargement des utilisateurs...');

      const response = await firstValueFrom(
        this.http.get<UsersResponse>(this.apiUrl, {
          headers: this.getAuthHeaders(),
          params,
        })
      );

      console.log('✅ Utilisateurs chargés:', response.data?.length);

      if (!response?.success) {
        throw new Error('Erreur lors de la récupération des utilisateurs');
      }

      return response;
    } catch (error: any) {
      console.error('❌ Erreur récupération utilisateurs:', error);

      if (error.status === 401) {
        this.authService.logout();
      }

      throw error;
    }
  }

  /**
   * Récupérer un utilisateur par son ID
   */
  async getUser(id: string): Promise<User> {
    try {
      console.log(`🔄 Chargement de l'utilisateur ${id}...`);

      const response = await firstValueFrom(
        this.http.get<UserResponse>(`${this.apiUrl}/${id}`, {
          headers: this.getAuthHeaders(),
        })
      );

      if (!response?.success) {
        throw new Error('Utilisateur non trouvé');
      }

      console.log('✅ Utilisateur chargé:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Erreur récupération utilisateur:', error);
      throw error;
    }
  }

  /**
   * Mettre à jour un utilisateur
   */
  async updateUser(id: string, data: any): Promise<User> {
    try {
      console.log(`🔄 Mise à jour de l'utilisateur ${id}...`);

      const response = await firstValueFrom(
        this.http.put<UserResponse>(`${this.apiUrl}/${id}`, data, {
          headers: this.getAuthHeaders(),
        })
      );

      if (!response?.success) {
        throw new Error('Erreur lors de la mise à jour');
      }

      console.log('✅ Utilisateur mis à jour:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Erreur mise à jour utilisateur:', error);
      throw error;
    }
  }

  /**
   * Supprimer un utilisateur
   */
  async deleteUser(id: string): Promise<any> {
    try {
      console.log(`🔄 Suppression de l'utilisateur ${id}...`);

      const response = await firstValueFrom(
        this.http.delete<any>(`${this.apiUrl}/${id}`, {
          headers: this.getAuthHeaders(),
        })
      );

      if (!response?.success) {
        throw new Error('Erreur lors de la suppression');
      }

      console.log('✅ Utilisateur supprimé');
      return response;
    } catch (error: any) {
      console.error('❌ Erreur suppression utilisateur:', error);
      throw error;
    }
  }

  /**
   * Récupérer les utilisateurs actifs seulement
   */
  async getActiveUsers(): Promise<User[]> {
    try {
      const response = await this.getUsers({ statut: 'actif' });
      return response.data;
    } catch (error) {
      console.error('❌ Erreur récupération utilisateurs actifs:', error);
      throw error;
    }
  }

  /**
   * Récupérer les chefs de projet potentiels
   */
  async getPotentialProjectManagers(): Promise<User[]> {
    try {
      const response = await this.getUsers({
        statut: 'actif',
        role: 'chef de projet',
      });
      return response.data;
    } catch (error) {
      console.error('❌ Erreur récupération chefs de projet:', error);
      // Fallback: retourner tous les utilisateurs actifs
      return this.getActiveUsers();
    }
  }

  /**
   * Récupérer les membres d'équipe (non admin)
   */
  async getTeamMembers(): Promise<User[]> {
    try {
      const response = await this.getUsers({
        statut: 'actif',
        role: { $ne: 'admin' }, // Exclure les admins si nécessaire
      });
      return response.data;
    } catch (error) {
      console.error('❌ Erreur récupération membres équipe:', error);
      return this.getActiveUsers();
    }
  }

  /**
   * Rechercher des utilisateurs par nom, prénom ou email
   */
  async searchUsers(query: string): Promise<User[]> {
    try {
      const response = await this.getUsers({ search: query });
      return response.data;
    } catch (error) {
      console.error('❌ Erreur recherche utilisateurs:', error);
      throw error;
    }
  }

  /**
   * Obtenir le nom complet d'un utilisateur
   */
  getUserFullName(user: User): string {
    return `${user.prenom} ${user.nom}`.trim();
  }

  /**
   * Obtenir l'initiale pour l'avatar
   */
  getUserInitial(user: User): string {
    return user.prenom?.charAt(0) || user.nom?.charAt(0) || '?';
  }

  /**
   * Filtrer les utilisateurs par rôle
   */
  filterUsersByRole(users: User[], role: string): User[] {
    return users.filter((user) => user.role === role);
  }

  /**
   * Vérifier si un utilisateur peut être chef de projet
   */
  canBeProjectManager(user: User): boolean {
    const allowedRoles = ['admin', 'chef de projet', 'manager'];
    return allowedRoles.includes(user.role) && user.statut === 'actif';
  }

  /**
   * Obtenir la couleur basée sur le rôle
   */
  getRoleColor(role: string): string {
    const colors: { [key: string]: string } = {
      admin: 'danger',
      'chef de projet': 'primary',
      manager: 'secondary',
      membre: 'success',
      utilisateur: 'medium',
    };
    return colors[role] || 'tertiary';
  }

  /**
   * Obtenir l'icône basée sur le poste
   */
  getPositionIcon(poste: string): string {
    const icons: { [key: string]: string } = {
      développeur: 'code',
      designer: 'color-palette',
      manager: 'people',
      commercial: 'trending-up',
      admin: 'shield',
      'chef de projet': 'ribbon',
    };
    return icons[poste?.toLowerCase()] || 'person';
  }
}
