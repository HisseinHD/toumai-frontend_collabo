import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  ModalController,
  ToastController,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonDatetime,
  IonButtons,
  IonBackButton,
  IonSpinner,
  IonIcon,
  IonList,
  IonNote
} from '@ionic/angular/standalone';

import { TaskService } from '../services/task';
import { ProjectService } from '../services/project';
import { UsersService } from '../services/users';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-create-task',
  templateUrl: './create-task.page.html',
  styleUrls: ['./create-task.page.scss'],
  standalone: true,
  imports: [
   
    RouterLink,
    CommonModule,
    ReactiveFormsModule,
    // Import explicite de tous les composants Ionic utilisés
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
 
   
   
    IonItem,
    IonLabel,
    IonInput,
    IonTextarea,
    IonSelect,
    IonSelectOption,
    IonButton,
    IonDatetime,
    IonButtons,
    IonSpinner,
    IonIcon,
    IonList,
    IonNote
  ],
})
export class CreateTaskPage implements OnInit {
  // ... votre code existant

  @Input() projectId?: string;
  taskForm!: FormGroup;
  loading = false;

  projects: any[] = [];
  users: any[] = [];
  prioriteOptions = ['basse', 'moyenne', 'haute', 'urgente'];
  statutOptions = ['à faire', 'en cours', 'en revue', 'terminée', 'bloquée'];
  minDate: string;

  loadingProjects = true;
  loadingUsers = true;

  constructor(
    private fb: FormBuilder,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private taskService: TaskService,
    private projectService: ProjectService,
    private userService: UsersService
  ) {
    this.minDate = new Date().toISOString();
  }

  ngOnInit() {
    this.initForm();
    this.loadProjects();
    this.loadUsers();
  }

  initForm() {
    this.taskForm = this.fb.group({
      titre: ['', [Validators.required, Validators.maxLength(100)]],
      description: [''],
      priorite: ['moyenne', Validators.required],
      echeance: ['', Validators.required],
      projetId: [this.projectId ?? '', Validators.required],
      assigneA: ['', Validators.required],
      statut: ['à faire', Validators.required],
      progression: [0],
      tags: [[]],
      tempsEstime: [null],
    });

    if (this.projectId) {
      this.taskForm.get('projetId')?.setValue(this.projectId);
      this.taskForm
        .get('projetId')
        ?.disable({ onlySelf: true, emitEvent: false });
    }
  }

  async loadProjects() {
    this.loadingProjects = true;
    try {
      const response = await this.projectService.getAll();

      // Gestion sécurisée de la réponse - vérifier le type d'abord
      if (
        response &&
        !Array.isArray(response) &&
        typeof response === 'object'
      ) {
        // C'est un objet, chercher les propriétés possibles
        this.projects =
          (response as any).data ||
          (response as any).projects ||
          (response as any).items ||
          [];
      } else if (Array.isArray(response)) {
        // C'est directement un tableau
        this.projects = response;
      } else {
        // Autre type ou null/undefined
        this.projects = [];
      }

      console.log('✅ Projets chargés :', this.projects);
    } catch (error) {
      console.error('❌ Erreur chargement projets :', error);
      this.projects = [];
      this.showToast('Erreur lors du chargement des projets', 'danger');
    } finally {
      this.loadingProjects = false;
    }
  }

  async loadUsers() {
    this.loadingUsers = true;
    try {
      const response = await this.userService.getUsers();

      // Gestion sécurisée de la réponse - vérifier le type d'abord
      if (
        response &&
        !Array.isArray(response) &&
        typeof response === 'object'
      ) {
        // C'est un objet, chercher les propriétés possibles
        this.users =
          (response as any).data ||
          (response as any).users ||
          (response as any).items ||
          [];
      } else if (Array.isArray(response)) {
        // C'est directement un tableau
        this.users = response;
      } else {
        // Autre type ou null/undefined
        this.users = [];
      }

      console.log('✅ Utilisateurs chargés :', this.users);
    } catch (error) {
      console.error('❌ Erreur chargement utilisateurs :', error);
      this.users = [];
      this.showToast('Erreur lors du chargement des utilisateurs', 'danger');
    } finally {
      this.loadingUsers = false;
    }
  }

  async submit() {
    if (this.taskForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.loading = true;
    try {
      const formValue = this.taskForm.value;

      // Formater la date pour le backend
      const taskData = {
        ...formValue,
        echeance: this.formatDateForBackend(formValue.echeance),
      };

      console.log('📤 Création tâche avec données:', taskData);

      await this.taskService.createTask(taskData);
      await this.showToast('Tâche créée avec succès 🎉', 'success');
      this.close(true);
    } catch (error: any) {
      console.error('❌ Erreur création tâche:', error);

      // Gestion d'erreurs spécifiques
      let errorMessage = 'Erreur lors de la création de la tâche';

      if (error.status === 403) {
        errorMessage = "Vous n'avez pas les permissions pour créer une tâche";
      } else if (error.status === 404) {
        errorMessage = 'Projet non trouvé';
      } else if (error.status === 401) {
        errorMessage = 'Non authentifié - Veuillez vous reconnecter';
      } else if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      this.showToast(errorMessage, 'danger');
    } finally {
      this.loading = false;
    }
  }

  private markFormGroupTouched() {
    Object.keys(this.taskForm.controls).forEach((key) => {
      const control = this.taskForm.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }

  private formatDateForBackend(dateString: string): string {
    if (!dateString) return '';

    try {
      // Si c'est déjà au format ISO, retourner tel quel
      if (dateString.includes('T')) {
        return dateString;
      }

      // Sinon, formater en ISO
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.warn('⚠️ Date invalide:', dateString);
        return dateString; // Retourner la chaîne originale si conversion échoue
      }

      return date.toISOString();
    } catch (error) {
      console.error('❌ Erreur formatage date:', error);
      return dateString; // Retourner la chaîne originale en cas d'erreur
    }
  }

  close(success = false) {
    this.modalCtrl.dismiss(success);
  }

  async showToast(message: string, color: 'success' | 'danger' = 'success') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      position: 'bottom',
      color,
    });
    return toast.present();
  }

  // Gestion des erreurs de validation en temps réel
  getFieldError(fieldName: string): string {
    const field = this.taskForm.get(fieldName);
    if (!field || !field.touched || !field.errors) return '';

    const errors = field.errors;

    if (errors['required']) return 'Ce champ est requis';
    if (errors['maxlength'])
      return `Maximum ${errors['maxlength'].requiredLength} caractères`;

    return '';
  }

  // Méthode utilitaire pour obtenir l'affichage du nom du projet
  getProjectDisplayName(project: any): string {
    return project.titre || project.nom || project.name || 'Projet sans nom';
  }

  // Méthode utilitaire pour obtenir l'affichage du nom d'utilisateur
  getUserDisplayName(user: any): string {
    if (user.nom && user.prenom) {
      return `${user.nom} ${user.prenom}${
        user.poste ? ` (${user.poste})` : ''
      }`;
    }
    return user.name || user.email || user.username || 'Utilisateur sans nom';
  }
}
