import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AuthService } from '../core/services/auth.service';

export interface Notification {
  _id: string;
  type: string;
  titre: string;
  message: string;
  utilisateur: string;
  lien?: string;
  estVu: boolean;
  dateVu?: Date;
  metadata: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationsResponse {
  success: boolean;
  data: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  unreadCount: number;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private apiUrl = `${environment.apiUrl}/notifications`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  }

  /**
   * Récupérer les notifications de l'utilisateur
   */
  async getNotifications(params?: {
    limit?: number;
    page?: number;
    unreadOnly?: boolean;
  }): Promise<NotificationsResponse> {
    try {
      const headers = this.getHeaders();

      const response = await this.http
        .get<NotificationsResponse>(this.apiUrl, {
          headers,
          params,
        })
        .toPromise();

      if (!response?.success) {
        throw new Error('Erreur lors de la récupération des notifications');
      }

      return response;
    } catch (error) {
      console.error('❌ Erreur récupération notifications:', error);
      throw error;
    }
  }

  /**
   * Marquer une notification comme lue
   */
  async markAsRead(notificationId: string): Promise<any> {
    try {
      const headers = this.getHeaders();

      const response = await this.http
        .put(`${this.apiUrl}/${notificationId}/mark-read`, {}, { headers })
        .toPromise();

      return response;
    } catch (error) {
      console.error('❌ Erreur marquer notification comme lue:', error);
      throw error;
    }
  }

  /**
   * Marquer toutes les notifications comme lues
   */
  async markAllAsRead(): Promise<any> {
    try {
      const headers = this.getHeaders();

      const response = await this.http
        .put(`${this.apiUrl}/mark-all-read`, {}, { headers })
        .toPromise();

      return response;
    } catch (error) {
      console.error(
        '❌ Erreur marquer toutes notifications comme lues:',
        error
      );
      throw error;
    }
  }

  /**
   * Récupérer le nombre de notifications non lues
   */
  async getUnreadCount(): Promise<number> {
    try {
      const response = await this.getNotifications({
        limit: 1,
        unreadOnly: true,
      });
      return response.unreadCount;
    } catch (error) {
      console.error('❌ Erreur récupération compteur non lus:', error);
      return 0;
    }
  }
}
