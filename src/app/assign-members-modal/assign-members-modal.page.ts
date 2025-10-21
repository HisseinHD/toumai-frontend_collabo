import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  IonButtons,
  IonList,
  IonItem,
  IonLabel,
  IonFooter,
  IonRadioGroup,
  IonRadio,
  IonSpinner,

} from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';
import { UsersService } from '../services/users';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-assign-members-modal',
  templateUrl: './assign-members-modal.page.html',
  styleUrls: ['./assign-members-modal.page.scss'],
  standalone: true,
  imports: [
  
    CommonModule,
    FormsModule,
    RouterLink,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButton,
    IonButtons,
    IonList,
    IonItem,
    IonLabel,
    IonFooter,
    IonRadioGroup,
    IonRadio,
    IonSpinner,
  ],
})
export class AssignMembersModalPage implements OnInit {
  @Input() project: any;

  users: any[] = [];
  loading = true;
  selectedUserId: string | null = null;

  constructor(
    private usersService: UsersService,
    private toastController: ToastController
  ) {}

  async ngOnInit() {
    await this.loadUsers();
  }

  async loadUsers() {
    this.loading = true;
    try {
      const response = await this.usersService.getUsers();
      this.users = response.data;
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs :', error);
      this.showToast('Impossible de charger la liste des utilisateurs.');
    } finally {
      this.loading = false;
    }
  }

  async assignProjectToUser() {
    if (!this.selectedUserId) {
      this.showToast('Veuillez sélectionner un membre à assigner.');
      return;
    }

    console.log('👤 Utilisateur sélectionné :', this.selectedUserId);
    console.log('📁 Projet à assigner :', this.project);

    // 🔥 Exemple d’appel API (tu peux adapter selon ton backend)
    // await this.projectService.assignProject(this.project._id, this.selectedUserId)

    this.showToast('Projet assigné avec succès ✅', 'success');
  }

  async showToast(message: string, color: string = 'danger') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'top',
      color,
    });
    await toast.present();
  }

  cancel() {
    console.log('❌ Assignation annulée');
  }
}
