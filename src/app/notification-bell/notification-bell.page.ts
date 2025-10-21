import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonicModule,
  InfiniteScrollCustomEvent,
  RefresherCustomEvent,
} from '@ionic/angular';
import { Router } from '@angular/router';
import {
  NotificationService,
  Notification,
} from '../services/notification';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './notification-bell.page.html',
  styleUrls: ['./notification-bell.page.scss'],
})
export class NotificationsPage implements OnInit {
  notifications: Notification[] = [];
  unreadCount = 0;
  loading = true;
  currentPage = 1;
  totalPages = 1;
  limit = 20;

  constructor(
    private notificationService: NotificationService,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.loadNotifications();
  }

  async loadNotifications(refresh = false) {
    try {
      if (refresh) {
        this.currentPage = 1;
        this.notifications = [];
      }

      this.loading = true;

      const response = await this.notificationService.getNotifications({
        page: this.currentPage,
        limit: this.limit,
        unreadOnly: false,
      });

      if (refresh) {
        this.notifications = response.data;
      } else {
        this.notifications = [...this.notifications, ...response.data];
      }

      this.unreadCount = response.unreadCount;
      this.totalPages = response.pagination.pages;
    } catch (error) {
      console.error('Erreur chargement notifications:', error);
    } finally {
      this.loading = false;
    }
  }

  async handleRefresh(event: any) {
    await this.loadNotifications(true);
    event.target.complete();
  }

  async loadMore(event: any) {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      await this.loadNotifications();
    }
    (event as InfiniteScrollCustomEvent).target.complete();
  }

  async markAsRead(notification: Notification) {
    try {
      await this.notificationService.markAsRead(notification._id);

      notification.estVu = true;
      notification.dateVu = new Date();
      this.unreadCount = Math.max(0, this.unreadCount - 1);
    } catch (error) {
      console.error('Erreur marquage comme lu:', error);
    }
  }

  async markAllAsRead() {
    try {
      await this.notificationService.markAllAsRead();

      this.notifications.forEach((notification) => {
        notification.estVu = true;
        notification.dateVu = new Date();
      });
      this.unreadCount = 0;
    } catch (error) {
      console.error('Erreur marquage tout comme lu:', error);
    }
  }

  handleNotificationClick(notification: Notification) {
    if (!notification.estVu) {
      this.markAsRead(notification);
    }

    if (notification.lien) {
      this.router.navigate([notification.lien]);
    }
  }

  getNotificationIcon(type: string): string {
    const icons: { [key: string]: string } = {
      nouvelle_tache: 'document-text-outline',
      tache_terminee: 'checkmark-done-outline',
      echeance_approche: 'time-outline',
      commentaire: 'chatbubble-outline',
      projet_assigné: 'folder-outline',
      statut_modifie: 'sync-outline',
    };
    return icons[type] || 'notifications-outline';
  }

  getNotificationColor(type: string): string {
    const colors: { [key: string]: string } = {
      nouvelle_tache: 'primary',
      tache_terminee: 'success',
      echeance_approche: 'warning',
      commentaire: 'tertiary',
      projet_assigné: 'secondary',
      statut_modifie: 'medium',
    };
    return colors[type] || 'medium';
  }
}
