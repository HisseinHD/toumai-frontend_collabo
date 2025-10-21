import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  IonicModule,
  ToastController,
  LoadingController,
} from '@ionic/angular';
import { AuthService } from '../core/services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule,RouterLink],
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage {
  registerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      nom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      poste: ['', Validators.required],
      role: ['membre', Validators.required],
    });
  }

  async onSubmit() {
    if (this.registerForm.invalid) {
      this.showToast('Veuillez remplir tous les champs correctement.');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Création du compte...',
    });
    await loading.present();

    this.authService.register(this.registerForm.value).subscribe({
      next: async (res: any) => {
        await loading.dismiss();
        this.showToast('Compte créé avec succès !');
        this.router.navigate(['/login']);
      },
      error: async (err: any) => {
        await loading.dismiss();
        this.showToast(err.error?.message || 'Erreur lors de l’inscription');
      },
    });
  }

  async showToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color: 'primary',
      position: 'top',
    });
    toast.present();
  }
}
