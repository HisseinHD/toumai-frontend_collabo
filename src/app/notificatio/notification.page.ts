import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { NotificationService } from '../services/notification';

@Component({
  selector: 'app-notificatio',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <ion-buttons slot="end">
      <ion-button
        (click)="openNotifications()"
        fill="clear"
        class="notification-button"
        [disabled]="loading"
        [class.pulse]="unreadCount > 0 && !loading"
      >
        <div class="notification-wrapper">
          <!-- Icône de notification avec état animé -->
          <div class="icon-container">
            <ion-icon
              name="notifications-outline"
              class="notification-icon"
              [class.has-notifications]="unreadCount > 0"
              [class.loading]="loading"
            ></ion-icon>

            <!-- Effet de halo pour les nouvelles notifications -->
            <div
              *ngIf="unreadCount > 0 && !loading"
              class="notification-halo"
            ></div>
          </div>

          <!-- Badge avec animations -->
          <ion-badge
            *ngIf="unreadCount > 0"
            color="danger"
            class="notification-badge"
            [class.badge-pulse]="hasNewNotifications"
          >
            {{ unreadCount > 99 ? '99+' : unreadCount }}
          </ion-badge>

          <!-- Indicateur de chargement -->
          <div *ngIf="loading" class="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>

        <!-- Tooltip au survol -->
        <ion-text class="notification-tooltip">
          {{
            unreadCount > 0
              ? unreadCount + ' notification(s)'
              : 'Aucune notification'
          }}
        </ion-text>
      </ion-button>
    </ion-buttons>
  `,
  styles: [
    `
      :host {
        --bell-size: 44px;
        --badge-size: 20px;
        --pulse-color: rgba(var(--ion-color-primary-rgb), 0.3);
        --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .notification-button {
        position: relative;
        --padding-start: 4px;
        --padding-end: 4px;
        --border-radius: 12px;
        margin: 0 4px;
        transition: var(--transition);

        &:hover {
          --background: rgba(var(--ion-color-primary-rgb), 0.08);
          transform: scale(1.05);

          .notification-tooltip {
            opacity: 1;
            transform: translateY(0);
          }
        }

        &:active {
          transform: scale(0.95);
        }

        &.pulse {
          animation: gentlePulse 2s ease-in-out infinite;
        }

        &[disabled] {
          opacity: 0.6;
          pointer-events: none;
        }
      }

      .notification-wrapper {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: var(--bell-size);
        height: var(--bell-size);
      }

      .icon-container {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .notification-icon {
        font-size: 26px;
        transition: var(--transition);
        position: relative;
        z-index: 2;

        &.has-notifications {
          color: var(--ion-color-primary);
          filter: drop-shadow(
            0 2px 4px rgba(var(--ion-color-primary-rgb), 0.3)
          );
        }

        &.loading {
          opacity: 0.7;
          animation: spin 1.5s linear infinite;
        }
      }

      .notification-halo {
        position: absolute;
        top: 50%;
        left: 50%;
        width: calc(var(--bell-size) + 8px);
        height: calc(var(--bell-size) + 8px);
        background: var(--pulse-color);
        border-radius: 50%;
        transform: translate(-50%, -50%) scale(0.8);
        opacity: 0;
        animation: haloPulse 2s ease-in-out infinite;
        z-index: 1;
      }

      .notification-badge {
        position: absolute;
        top: 6px;
        right: 6px;
        font-size: 10px;
        font-weight: 700;
        min-width: var(--badge-size);
        height: var(--badge-size);
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid var(--ion-color-light);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        z-index: 3;
        transition: var(--transition);

        &.badge-pulse {
          animation: badgePulse 1.5s ease-in-out infinite;
        }
      }

      .loading-dots {
        position: absolute;
        display: flex;
        gap: 2px;
        bottom: -2px;

        span {
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: var(--ion-color-medium);
          animation: loadingDots 1.4s ease-in-out infinite both;

          &:nth-child(1) {
            animation-delay: -0.32s;
          }
          &:nth-child(2) {
            animation-delay: -0.16s;
          }
          &:nth-child(3) {
            animation-delay: 0s;
          }
        }
      }

      .notification-tooltip {
        position: absolute;
        bottom: -30px;
        left: 50%;
        transform: translateX(-50%) translateY(10px);
        background: var(--ion-color-dark);
        color: white;
        padding: 6px 12px;
        border-radius: 8px;
        font-size: 12px;
        font-weight: 500;
        white-space: nowrap;
        opacity: 0;
        pointer-events: none;
        transition: var(--transition);
        z-index: 1000;

        &::before {
          content: '';
          position: absolute;
          top: -4px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 4px solid transparent;
          border-right: 4px solid transparent;
          border-bottom: 4px solid var(--ion-color-dark);
        }
      }

      /* Animations */
      @keyframes gentlePulse {
        0%,
        100% {
          transform: scale(1);
        }
        50% {
          transform: scale(1.05);
        }
      }

      @keyframes haloPulse {
        0%,
        100% {
          transform: translate(-50%, -50%) scale(0.8);
          opacity: 0;
        }
        50% {
          transform: translate(-50%, -50%) scale(1);
          opacity: 1;
        }
      }

      @keyframes badgePulse {
        0%,
        100% {
          transform: scale(1);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }
        50% {
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(var(--ion-color-danger-rgb), 0.4);
        }
      }

      @keyframes spin {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }

      @keyframes loadingDots {
        0%,
        80%,
        100% {
          transform: scale(0);
        }
        40% {
          transform: scale(1);
        }
      }

      /* Responsive */
      @media (max-width: 480px) {
        :host {
          --bell-size: 40px;
          --badge-size: 18px;
        }

        .notification-icon {
          font-size: 24px;
        }

        .notification-badge {
          top: 4px;
          right: 4px;
          font-size: 9px;
        }
      }

      @media (min-width: 768px) {
        :host {
          --bell-size: 48px;
        }

        .notification-button {
          --padding-start: 8px;
          --padding-end: 8px;
          margin: 0 8px;
        }
      }

      /* Dark mode support */
      @media (prefers-color-scheme: dark) {
        .notification-tooltip {
          background: var(--ion-color-light);
          color: var(--ion-color-dark);

          &::before {
            border-bottom-color: var(--ion-color-light);
          }
        }
      }
    `,
  ],
})
export class NotificationBellComponent implements OnInit, OnDestroy {
  unreadCount = 0;
  loading = false;
  hasNewNotifications = false;
  private refreshInterval: any;
  private lastCount = 0;

  constructor(
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit() {
    console.log('🔔 Initialisation composant notification bell');
    this.loadUnreadCount();

    // Rafraîchir toutes les 25 secondes
    this.refreshInterval = setInterval(() => {
      this.loadUnreadCount();
    }, 25000);
  }

  ngOnDestroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  async loadUnreadCount() {
    try {
      this.loading = true;
      const newCount = await this.notificationService.getUnreadCount();

      // Animation si nouveau nombre de notifications
      if (newCount > this.lastCount && this.lastCount > 0) {
        this.triggerNewNotificationEffect();
      }

      this.unreadCount = newCount;
      this.lastCount = newCount;

      console.log(`🔔 ${this.unreadCount} notification(s) non lue(s)`);
    } catch (error) {
      console.error('❌ Erreur chargement compteur notifications:', error);
      this.unreadCount = 0;
    } finally {
      this.loading = false;
    }
  }

  private triggerNewNotificationEffect() {
    this.hasNewNotifications = true;

    // Effet de pulsation temporaire
    setTimeout(() => {
      this.hasNewNotifications = false;
    }, 2000);
  }

  openNotifications() {
    console.log('📱 Ouverture page notifications');
    this.router.navigate(['/notification-bell']);
  }
}
