import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonBadge,
  IonItem,
  IonLabel,
  IonList,
  ModalController,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-project-details-modal',
  templateUrl: './project-details-modal.page.html',
  styleUrls: ['./project-details-modal.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonBadge,

    IonItem,
    IonLabel,
    IonList,
  ],
})
export class ProjectDetailsModalPage {
  @Input() project: any;

  constructor(private modalController: ModalController) {}

  close() {
    this.modalController.dismiss();
  }

  getStatusColor(statut: string): string {
    const colors: { [key: string]: string } = {
      'en attente': 'warning',
      'en cours': 'primary',
      terminé: 'success',
      annulé: 'danger',
    };
    return colors[statut] || 'medium';
  }

  getPriorityColor(priorite: string): string {
    const colors: { [key: string]: string } = {
      basse: 'success',
      moyenne: 'warning',
      haute: 'danger',
    };
    return colors[priorite] || 'medium';
  }

  isProjectOverdue(): boolean {
    return (
      new Date(this.project.dateFin) < new Date() &&
      this.project.statut !== 'terminé'
    );
  }
  getCompletedTasks(): number {
    if (!this.project.tasks) return 0;
    return this.project.tasks.filter((task: any) => task.statut === 'terminée')
      .length;
  }
}
