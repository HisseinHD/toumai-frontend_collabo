import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AuthService } from '../core/services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private apiUrl = `${environment.apiUrl}/dashboard`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();

    if (!token) {
      throw new Error('Token non trouvé');
    }

    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  }

  async getDashboardStats(): Promise<any> {
    try {
      const headers = this.getHeaders();

      console.log('🔄 Chargement des stats dashboard...');
      console.log('📡 URL:', this.apiUrl);

      const response: any = await this.http
        .get(this.apiUrl, { headers })
        .toPromise();

      console.log('✅ Réponse brute du serveur:', response);

      if (!response) {
        throw new Error('Réponse vide du serveur');
      }

      if (!response.success) {
        throw new Error(response.message || 'Erreur serveur');
      }

      console.log('📊 Données dashboard reçues:', response.data);
      console.log('📋 Total tâches:', response.data?.overview?.totalTasks);
      console.log('📝 Tâches récentes:', response.data?.tasks?.recent);

      return response;
    } catch (error: any) {
      console.error('❌ Erreur récupération dashboard:', error);

      if (error.status === 401) {
        throw new Error('Non authentifié - Veuillez vous reconnecter');
      } else if (error.status === 403) {
        throw new Error('Accès non autorisé');
      } else if (error.status === 404) {
        throw new Error('Endpoint dashboard non trouvé');
      } else if (error.error?.message) {
        throw new Error(error.error.message);
      } else {
        throw new Error('Erreur de connexion au serveur');
      }
    }
  }
}
