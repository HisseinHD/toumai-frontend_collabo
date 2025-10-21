import { Component, OnInit } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { IonicModule, AlertController, ToastController } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { UsersService } from '../services/users'; // ✅ Correction du nom du fichier

@Component({
  selector: 'app-users',
  templateUrl: './users.page.html',
  styleUrls: ['./users.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule, TitleCasePipe],
})
export class UsersPage implements OnInit {
  users: any[] = [];
  loading = true;

  constructor(
    private usersService: UsersService,
    private alertController: AlertController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.loadUsers();
  }

  async loadUsers() {
    this.loading = true;
    try {
      const response = await this.usersService.getUsers();
      this.users = response.data;
    } catch (error: any) {
      console.error('Erreur chargement utilisateurs:', error);

      // Gestion d'erreur plus détaillée
      let errorMessage = 'Impossible de charger les utilisateurs.';

      if (error.status === 401) {
        errorMessage = 'Session expirée. Veuillez vous reconnecter.';
      } else if (error.status === 403) {
        errorMessage =
          "Vous n'avez pas les droits pour accéder à cette ressource.";
      } else if (error.status === 0) {
        errorMessage = 'Impossible de contacter le serveur.';
      }

      this.showToast(errorMessage);
    } finally {
      this.loading = false;
    }
  }

  async deleteUser(user: any) {
    const alert = await this.alertController.create({
      header: 'Confirmer la suppression',
      message: `Voulez-vous vraiment supprimer l'utilisateur <strong>${user.nom}</strong> ?`,
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Supprimer',
          role: 'destructive',
          handler: async () => {
            try {
              await this.usersService.deleteUser(user._id);
              this.users = this.users.filter((u) => u._id !== user._id);
              this.showToast('Utilisateur supprimé avec succès.');
            } catch (error: any) {
              console.error('Erreur suppression:', error);

              let errorMessage = "Impossible de supprimer l'utilisateur.";
              if (error.status === 401) {
                errorMessage = 'Non autorisé à supprimer cet utilisateur.';
              } else if (error.status === 404) {
                errorMessage = 'Utilisateur non trouvé.';
              }

              this.showToast(errorMessage);
            }
          },
        },
      ],
    });
    await alert.present();
  }

  onRefresh(event: any) {
    this.loadUsers().finally(() => {
      if (event && event.target) {
        event.target.complete();
      }
    });
  }

  getAdminCount(): number {
    return this.users.filter((user) => user.role === 'admin').length;
  }

  getMemberCount(): number {
    return this.users.filter((user) => user.role === 'membre').length;
  }

  trackByUserId(index: number, user: any): string {
    return user._id;
  }

  private async showToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'top',
      color: message.includes('succès') ? 'success' : 'danger',
    });
    await toast.present();
  }
}
