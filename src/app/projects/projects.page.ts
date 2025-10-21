import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonicModule,
  AlertController,
  ToastController,
  ModalController,
} from '@ionic/angular';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ProjectService } from '../services/project';
import { UsersService, User } from '../services/users';
import { ProjectDetailsModalPage } from '../project-details-modal/project-details-modal.page';
import { AssignMembersModalPage } from '../assign-members-modal/assign-members-modal.page';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule, RouterLink],
  templateUrl: './projects.page.html',
  styleUrls: ['./projects.page.scss'],
})
export class ProjectsPage implements OnInit {
  projects: any[] = [];
  users: User[] = [];
  loading = true;
  usersLoading = false;
  projectForm!: FormGroup;
  editingProjectId: string | null = null;
  formVisible = false;

  constructor(
    private projectService: ProjectService,
    private usersService: UsersService,
    private fb: FormBuilder,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private modalCtrl: ModalController
  ) {}

  async ngOnInit(): Promise<void> {
    await this.loadUsers();
    await this.loadProjects();
    this.initForm();
  }

  async loadUsers() {
    this.usersLoading = true;
    try {
      const response = await this.usersService.getUsers();
      this.users = response.data;
      console.log('👥 Utilisateurs chargés:', this.users.length);
    } catch (error) {
      console.error('❌ Erreur chargement utilisateurs', error);
      this.showToast('Erreur lors du chargement des utilisateurs', 'danger');
    } finally {
      this.usersLoading = false;
    }
  }

  initForm() {
    this.projectForm = this.fb.group({
      titre: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      chefDeProjet: ['', Validators.required],
      dateDebut: ['', Validators.required],
      dateFin: ['', Validators.required],
      membres: [[], ],
      statut: ['en attente'],
      priorite: ['moyenne'],
      budget: [0, [Validators.min(0)]],
    });

    // Écouter les changements du chef de projet pour mettre à jour les membres disponibles
    this.projectForm.get('chefDeProjet')?.valueChanges.subscribe(() => {
      this.updateAvailableMembers();
    });
  }

  // Méthode pour obtenir les membres disponibles (exclut le chef de projet)
  getAvailableMembers(): User[] {
    if (!this.users || this.users.length === 0) {
      return [];
    }

    const chefDeProjetId = this.projectForm.get('chefDeProjet')?.value;

    // Filtrer les utilisateurs actifs
    let availableUsers = this.users.filter((user) => user.statut === 'actif');

    // Exclure le chef de projet s'il est sélectionné
    if (chefDeProjetId) {
      availableUsers = availableUsers.filter(
        (user) => user._id !== chefDeProjetId
      );
    }

    return availableUsers;
  }

  // NOUVELLE MÉTHODE : Obtenir les membres sélectionnés avec leurs informations complètes
  getSelectedMembers(): User[] {
    const selectedMemberIds = this.projectForm.get('membres')?.value || [];
    if (!selectedMemberIds.length || !this.users.length) {
      return [];
    }

    return this.users.filter(
      (user) => selectedMemberIds.includes(user._id) && user.statut === 'actif'
    );
  }

  // Méthode pour forcer la mise à jour
  updateAvailableMembers() {
    const chefDeProjetId = this.projectForm.get('chefDeProjet')?.value;
    const currentMembers = this.projectForm.get('membres')?.value || [];

    if (chefDeProjetId && currentMembers.includes(chefDeProjetId)) {
      const updatedMembers = currentMembers.filter(
        (id: string) => id !== chefDeProjetId
      );
      this.projectForm.patchValue({ membres: updatedMembers });
    }
  }

  // Méthode pour comparer les utilisateurs dans le select multiple
  compareWith = (o1: any, o2: any): boolean => {
    if (Array.isArray(o1)) {
      return o1.some((item) => item === o2);
    }
    return o1 === o2;
  };

  // Retirer un membre de la sélection
  removeMember(memberId: string, event: Event) {
    event.stopPropagation();
    event.preventDefault();

    const currentMembers = this.projectForm.get('membres')?.value || [];
    const updatedMembers = currentMembers.filter(
      (id: string) => id !== memberId
    );
    this.projectForm.patchValue({ membres: updatedMembers });

    // Marquer le champ comme touché pour la validation
    this.projectForm.get('membres')?.markAsTouched();
  }

  // Obtenir le nom d'un utilisateur
  getUserName(userId: string): string {
    if (!userId || !this.users || this.users.length === 0) {
      return 'Utilisateur inconnu';
    }
    const user = this.users.find((u) => u._id === userId);
    return user ? `${user.prenom} ${user.nom}` : 'Utilisateur inconnu';
  }

  async loadProjects() {
    this.loading = true;
    try {
      this.projects = await this.projectService.getAll();
    } catch (error) {
      console.error('Erreur chargement projets', error);
      this.showToast('Erreur lors du chargement des projets', 'danger');
    } finally {
      this.loading = false;
    }
  }

  showForm(project: any = null) {
    if (project) {
      this.editingProjectId = project._id;

      // Préparer les données pour le formulaire
      const membresIds = project.membres?.map((m: any) => m._id) || [];
      const chefDeProjetId = project.chefDeProjet?._id || '';

      // S'assurer que le chef de projet n'est pas dans les membres
      const filteredMembres = membresIds.filter(
        (id: string) => id !== chefDeProjetId
      );

      this.projectForm.patchValue({
        titre: project.titre,
        description: project.description,
        chefDeProjet: chefDeProjetId,
        dateDebut: project.dateDebut
          ? new Date(project.dateDebut).toISOString().slice(0, 10)
          : '',
        dateFin: project.dateFin
          ? new Date(project.dateFin).toISOString().slice(0, 10)
          : '',
        membres: filteredMembres,
        statut: project.statut || 'en attente',
        priorite: project.priorite || 'moyenne',
        budget: project.budget || 0,
      });
    } else {
      this.editingProjectId = null;
      this.projectForm.reset({
        statut: 'en attente',
        priorite: 'moyenne',
        budget: 0,
        membres: [],
        chefDeProjet: '',
      });
    }
    this.formVisible = true;
  }

  async submitForm() {
    if (this.projectForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    // Préparer les données exactement comme le backend les attend
    const formData = {
      titre: this.projectForm.value.titre,
      description: this.projectForm.value.description,
      chefDeProjet: this.projectForm.value.chefDeProjet,
      dateDebut: this.projectForm.value.dateDebut,
      dateFin: this.projectForm.value.dateFin,
      membres: this.projectForm.value.membres || [],
      statut: this.projectForm.value.statut,
      priorite: this.projectForm.value.priorite,
      budget: this.projectForm.value.budget,
    };

    console.log('📤 Données envoyées au service:', formData);

    try {
      if (this.editingProjectId) {
        await this.projectService.update(this.editingProjectId, formData);
        this.showToast('Projet mis à jour avec succès', 'success');
      } else {
        await this.projectService.create(formData);
        this.showToast('Projet créé avec succès', 'success');
      }
      this.formVisible = false;
      await this.loadProjects();
    } catch (error: any) {
      console.error('❌ Erreur détaillée sauvegarde:', error);

      if (error.error) {
        console.error('📋 Erreur backend:', error.error);
        this.showToast(
          error.error.message || 'Erreur lors de la sauvegarde',
          'danger'
        );
      } else {
        this.showToast(
          error.message || 'Erreur lors de la sauvegarde du projet',
          'danger'
        );
      }
    }
  }

  // Marquer tous les champs comme touchés pour afficher les erreurs
  private markFormGroupTouched() {
    Object.keys(this.projectForm.controls).forEach((key) => {
      const control = this.projectForm.get(key);
      control?.markAsTouched();
    });
  }

  async confirmDelete(projectId: string) {
    const alert = await this.alertCtrl.create({
      header: 'Supprimer le projet',
      message:
        'Êtes-vous sûr de vouloir supprimer ce projet et toutes ses tâches ?',
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        {
          text: 'Supprimer',
          handler: async () => {
            try {
              await this.projectService.delete(projectId);
              this.showToast('Projet supprimé', 'success');
              this.loadProjects();
            } catch (error) {
              console.error(error);
              this.showToast('Erreur lors de la suppression', 'danger');
            }
          },
        },
      ],
    });
    await alert.present();
  }

  async showToast(message: string, color: string = 'primary') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      color,
      position: 'bottom',
    });
    toast.present();
  }

  getProjectsByStatus(statut: string): any[] {
    return this.projects.filter((project) => project.statut === statut);
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

  getPriorityIcon(priorite: string): string {
    const icons: { [key: string]: string } = {
      basse: 'arrow-down',
      moyenne: 'remove',
      haute: 'arrow-up',
    };
    return icons[priorite] || 'help';
  }

  isProjectOverdue(project: any): boolean {
    if (!project.dateFin) return false;
    return (
      new Date(project.dateFin) < new Date() && project.statut !== 'terminé'
    );
  }

  async assignMembers(project: any) {
    try {
      const modal = await this.modalCtrl.create({
        component: AssignMembersModalPage,
        componentProps: {
          project: project,
          users: this.users,
        },
        cssClass: 'assign-members-modal',
        breakpoints: [0, 0.5, 0.8, 1],
        initialBreakpoint: 0.8,
      });

      await modal.present();

      const { data } = await modal.onWillDismiss();
      if (data?.success) {
        this.showToast('Membres assignés avec succès!', 'success');
        this.loadProjects();
      }
    } catch (error) {
      console.error(
        "Erreur lors de l'ouverture du modal d'assignation:",
        error
      );
      this.showToast("Erreur lors de l'assignation des membres", 'danger');
    }
  }

  async viewProjectDetails(project: any) {
    try {
      const modal = await this.modalCtrl.create({
        component: ProjectDetailsModalPage,
        componentProps: {
          project: project,
          users: this.users,
        },
        cssClass: 'project-details-modal',
        breakpoints: [0, 0.5, 0.8, 1],
        initialBreakpoint: 0.8,
      });

      await modal.present();
    } catch (error) {
      console.error("Erreur lors de l'ouverture du modal de détails:", error);
      this.showToast("Erreur lors de l'affichage des détails", 'danger');
    }
  }

  cancelForm() {
    this.formVisible = false;
    this.editingProjectId = null;
    this.projectForm.reset({
      statut: 'en attente',
      priorite: 'moyenne',
      budget: 0,
      membres: [],
      chefDeProjet: '',
    });
  }

  getOverdueProjects(): any[] {
    return this.projects.filter((project) => this.isProjectOverdue(project));
  }

  getStats() {
    return {
      total: this.projects.length,
      enCours: this.getProjectsByStatus('en cours').length,
      termines: this.getProjectsByStatus('terminé').length,
      enRetard: this.getOverdueProjects().length,
    };
  }
}
