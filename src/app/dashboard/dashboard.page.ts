import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController } from '@ionic/angular';
import { ChartData, ChartOptions } from 'chart.js';
import { logOutOutline, notifications } from 'ionicons/icons';
import { AuthService } from '../core/services/auth.service';
import { DashboardService } from '../services/dasboard';
import { NotificationBellComponent } from '../notificatio/notification.page';
import { addIcons } from 'ionicons';
import { notificationsOutline } from 'ionicons/icons';
import { BaseChartDirective,  } from 'ng2-charts'; // Import manquant ajouté

addIcons({
  'notifications-outline': notificationsOutline,
});

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    BaseChartDirective,
    RouterLink,
    NotificationBellComponent, // Module Chart.js ajouté ici
  ],
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {
  currentUser: any = null;
  stats: any = null;
  loading = true;
  logOutIcon = logOutOutline;

  // Graphiques
  taskStatusData: ChartData<'doughnut'> = { labels: [], datasets: [] };
  taskPriorityData: ChartData<'doughnut'> = { labels: [], datasets: [] };

  chartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' },
    },
  };

  constructor(
    private authService: AuthService,
    private dashboardService: DashboardService,
    private alertController: AlertController,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  async loadData(): Promise<void> {
    try {
      this.loading = true;
      this.currentUser = this.authService.getCurrentUser();
      const response = await this.dashboardService.getDashboardStats();
      this.stats = response.data;
      this.updateCharts();
    } catch (error) {
      console.error('Erreur tableau de bord :', error);
    } finally {
      this.loading = false;
    }
  }

  doRefresh(event: any): void {
    this.loadData().then(() => event.target.complete());
  }

  async confirmLogout(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Déconnexion',
      message: 'Veux-tu te déconnecter ?',
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        {
          text: 'Oui',
          handler: () => {
            this.authService.logout();
            this.router.navigate(['/login']);
          },
        },
      ],
    });
    await alert.present();
  }

  updateCharts(): void {
    if (!this.stats) return;

    // Graphique des statuts
    const taskStatus = this.stats.tasks?.byStatus || {};
    this.taskStatusData = {
      labels: Object.keys(taskStatus),
      datasets: [
        {
          data: Object.values(taskStatus) as number[],
          backgroundColor: ['#fbbf24', '#10b981', '#3b82f6', '#ef4444'],
        },
      ],
    };

    // Graphique des priorités
    const taskPriority = this.stats.tasks?.byPriority || {};
    this.taskPriorityData = {
      labels: Object.keys(taskPriority),
      datasets: [
        {
          data: Object.values(taskPriority) as number[],
          backgroundColor: ['#ef4444', '#f59e0b', '#10b981'],
        },
      ],
    };
  }

  /**
   * Retourne les statistiques principales avec lien vers la page correspondante
   */
  getOverviewStats() {
    if (!this.stats) return [];
    return [
      {
        label: 'Projets',
        value: this.stats.overview?.totalProjects ?? 0,
        link: '/projects', // carte cliquable vers projets
      },
      {
        label: 'Tâches',
        value: this.stats.overview?.totalTasks ?? 0,
        link: '/tasks', // carte cliquable vers tâches
      },
      {
        label: 'Utilisateurs',
        value: this.stats.overview?.activeUsers ?? 0,
        link: '/users', // carte cliquable vers utilisateurs
      },
      {
        label: 'Complétées',
        value: this.stats.tasks?.byStatus?.terminée ?? 0,
      },
    ];
  }

  /**
   * Retourne la couleur correspondant au statut d'une tâche ou projet
   */
  getStatusColor(status: string | null | undefined): string {
    if (!status) return 'medium';
    const lower = status.toLowerCase();
    switch (lower) {
      case 'terminée':
      case 'done':
        return 'success';
      case 'en cours':
      case 'in progress':
        return 'warning';
      case 'en attente':
      case 'pending':
        return 'medium';
      case 'annulée':
      case 'canceled':
        return 'danger';
      default:
        return 'tertiary';
    }
  }

  /**
   * Retourne la couleur correspondant à la priorité d'une tâche ou projet
   */
  getPriorityColor(priority: string | null | undefined): string {
    if (!priority) return 'medium';
    const lower = priority.toLowerCase();
    switch (lower) {
      case 'haute':
      case 'élevée':
      case 'high':
        return 'danger';
      case 'moyenne':
      case 'medium':
        return 'warning';
      case 'basse':
      case 'low':
        return 'success';
      default:
        return 'tertiary';
    }
  }
}
