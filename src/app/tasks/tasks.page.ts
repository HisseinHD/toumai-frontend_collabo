import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  IonButtons,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonInput,
  IonChip,
  IonBadge,
  IonProgressBar,
  IonRouterLink,
  IonFooter,
  IonLoading,
  AlertController,
  LoadingController,
  ModalController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  add,
  create,
  trash,
  chevronBack,
  chevronForward,
  timeOutline,
  playOutline,
  eyeOutline,
  checkmarkDoneOutline,
  alertCircleOutline,
  helpOutline,
} from 'ionicons/icons';

import { TaskService } from '../services/task';
import { Task } from '../models/task.model';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.page.html',
  styleUrls: ['./tasks.page.scss'],
  standalone: true,
  imports: [
    RouterLink,
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButton,
    IonButtons,
    IonIcon,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonGrid,
    IonRow,
    IonCol,
    IonItem,
    IonLabel,
    IonSelect,
    IonSelectOption,
    IonInput,
    IonChip,
    IonBadge,
    IonProgressBar,
    IonRouterLink,
    IonFooter,
    IonLoading,
  ],
  providers: [DatePipe],
})
export class TasksPage implements OnInit {
  private taskService = inject(TaskService);
  private loadingCtrl = inject(LoadingController);
  private alertCtrl = inject(AlertController);
  private modalCtrl = inject(ModalController);
  private datePipe = inject(DatePipe);
  private router = inject(Router);

  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  currentPage = 1;
  totalPages = 1;
  limit = 10;
  isLoading = false;

  filters = {
    statut: '',
    priorite: '',
    searchTerm: '',
  };

  // CORRECTION : Ajout de la propriété manquante
  filtersExpanded = false;

  constructor() {
    addIcons({
      add,
      create,
      trash,
      chevronBack,
      chevronForward,
      'time-outline': timeOutline,
      'play-outline': playOutline,
      'eye-outline': eyeOutline,
      'checkmark-done-outline': checkmarkDoneOutline,
      'alert-circle-outline': alertCircleOutline,
      'help-outline': helpOutline,
    });
  }

  ngOnInit() {
    this.loadTasks();
  }

  async loadTasks(page = 1) {
    const loading = await this.loadingCtrl.create({
      message: 'Chargement des tâches...',
    });
    await loading.present();
    this.isLoading = true;

    try {
      const params: any = { page, limit: this.limit };
      if (this.filters.statut) params.statut = this.filters.statut;
      if (this.filters.priorite) params.priorite = this.filters.priorite;

      const response = await this.taskService.getTasks(params);
      console.log('Réponse backend:', response);

      if (response.success) {
        this.tasks = response.data;
        this.currentPage = response.currentPage;
        this.totalPages = response.totalPages;
        this.applyFilters();
      } else {
        this.showError('Aucune donnée reçue du serveur.');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des tâches:', error);
      this.showError('Erreur lors du chargement des tâches.');
    } finally {
      await loading.dismiss();
      this.isLoading = false;
    }
  }

  applyFilters() {
    this.filteredTasks = this.tasks.filter((task) => {
      let matches = true;

      if (this.filters.statut && task.statut !== this.filters.statut)
        matches = false;
      if (this.filters.priorite && task.priorite !== this.filters.priorite)
        matches = false;

      if (this.filters.searchTerm) {
        const term = this.filters.searchTerm.toLowerCase();
        const matchesSearch =
          task.titre.toLowerCase().includes(term) ||
          (task.description && task.description.toLowerCase().includes(term)) ||
          task.tags?.some((tag: string) => tag.toLowerCase().includes(term));
        if (!matchesSearch) matches = false;
      }

      return matches;
    });
  }

  onFilterChange() {
    this.applyFilters();
  }

  async updateTaskStatus(task: Task, newStatus: Task['statut']) {
    try {
      await this.taskService.updateTask(task._id!, { statut: newStatus });
      await this.loadTasks(this.currentPage);
    } catch (err) {
      console.error('Erreur lors de la mise à jour du statut:', err);
      this.showError('Erreur lors de la mise à jour du statut.');
    }
  }

  async deleteTask(task: Task) {
    const alert = await this.alertCtrl.create({
      header: 'Confirmer la suppression',
      message: `Êtes-vous sûr de vouloir supprimer "${task.titre}" ?`,
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        {
          text: 'Supprimer',
          handler: async () => {
            try {
              await this.taskService.deleteTask(task._id!);
              await this.loadTasks(this.currentPage);
            } catch (error) {
              console.error('Erreur lors de la suppression:', error);
              this.showError('Erreur lors de la suppression.');
            }
          },
        },
      ],
    });
    await alert.present();
  }

  private async showError(message: string) {
    const alert = await this.alertCtrl.create({
      header: 'Erreur',
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }

  loadPreviousPage() {
    if (this.currentPage > 1) this.loadTasks(this.currentPage - 1);
  }

  loadNextPage() {
    if (this.currentPage < this.totalPages)
      this.loadTasks(this.currentPage + 1);
  }

  getStatusColor(statut: string): string {
    switch (statut) {
      case 'terminée':
        return 'success';
      case 'en cours':
        return 'warning';
      case 'bloquée':
        return 'danger';
      case 'en revue':
        return 'tertiary';
      default:
        return 'medium';
    }
  }

  getPriorityColor(priorite: string): string {
    switch (priorite) {
      case 'urgente':
        return 'danger';
      case 'haute':
        return 'warning';
      case 'moyenne':
        return 'primary';
      case 'basse':
        return 'success';
      default:
        return 'medium';
    }
  }

  // CORRECTION : Méthode getTasksByStatus avec type sécurisé
  getTasksByStatus(status: string) {
    return this.tasks.filter((task) => task.statut === status);
  }

  // CORRECTION : Méthode getStatusIcon avec type sécurisé
  getStatusIcon(status: string): string {
    const icons: Record<string, string> = {
      'à faire': 'time-outline',
      'en cours': 'play-outline',
      'en revue': 'eye-outline',
      terminée: 'checkmark-done-outline',
      bloquée: 'alert-circle-outline',
    };
    return icons[status] || 'help-outline';
  }

  getProgressColor(progress: number): string {
    if (progress === 100) return 'success';
    if (progress >= 75) return 'warning';
    if (progress >= 50) return 'primary';
    return 'medium';
  }

  // CORRECTION : Méthode toggleFilters
  toggleFilters() {
    this.filtersExpanded = !this.filtersExpanded;
  }

  setStatusFilter(status: string) {
    this.filters.statut = status;
    this.onFilterChange();
  }

  clearStatusFilter() {
    this.filters.statut = '';
    this.onFilterChange();
  }

  isOverdue(task: Task): boolean {
    return new Date(task.echeance) < new Date() && task.statut !== 'terminée';
  }

  goToCreatePage() {
    this.router.navigate(['/create-task']);
  }

  formatDate(date: string | Date): string {
    return this.datePipe.transform(date, 'dd/MM/yyyy') || '';
  }

  // CORRECTION : Ajout de la méthode openTaskForm manquante
  async openTaskForm(task?: Task) {
    try {
      console.log('Ouvrir le formulaire de tâche:', task);

      // Option 1: Navigation vers la page de création
      if (!task) {
        this.goToCreatePage();
        return;
      }

      // Option 2: Ouverture d'un modal pour l'édition
      // Importer dynamiquement le composant
      const { CreateTaskPage } = await import(
        '../create-task/create-task.page'
      );

      const modal = await this.modalCtrl.create({
        component: CreateTaskPage,
        componentProps: {
          task: task,
          projectId: task.projetId,
        },
        cssClass: 'task-form-modal',
        breakpoints: [0, 0.5, 0.8, 1],
        initialBreakpoint: 0.8,
      });

      await modal.present();

      const { data } = await modal.onWillDismiss();
      if (data) {
        await this.loadTasks(this.currentPage);
        this.showError('Tâche mise à jour avec succès');
      }
    } catch (error) {
      console.error("Erreur lors de l'ouverture du formulaire:", error);
      this.showError("Erreur lors de l'ouverture du formulaire");
    }
  }
}
