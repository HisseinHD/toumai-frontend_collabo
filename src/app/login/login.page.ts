import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonIcon,
  IonText,
  
  AlertController,
  LoadingController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { eye, eyeOff, business, camera, person } from 'ionicons/icons';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonIcon,
    IonText,
   
    HttpClientModule,
    RouterLink,
  ],
})
export class LoginPage implements OnInit {
  loginForm: FormGroup;
  showPassword = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

    addIcons({ person, business, camera, eye, eyeOff });
  }

  ngOnInit() {
    const isAuth = this.authService.isAuthenticated();
    if (isAuth) {
      this.router.navigate(['/dashboard']);
    }
  }

  async login() {
    if (this.loginForm.valid) {
      const loading = await this.loadingController.create({
        message: 'Connexion...',
      });
      await loading.present();

      this.authService
        .login(this.loginForm.value.email, this.loginForm.value.password)
        .subscribe({
          next: (response) => {
            loading.dismiss();

            if (response.success) {
              // ✅ Correction : forcer le typage du rôle attendu
              const user = {
                ...response.data,
                role: response.data.role as 'admin' | 'membre',
              };

              this.authService.setUser(user, response.data.token);
              this.router.navigate(['/dashboard']);
            }
          },
          error: async (error) => {
            loading.dismiss();
            const alert = await this.alertController.create({
              header: 'Erreur de connexion',
              message:
                error.error?.message || 'Email ou mot de passe incorrect',
              buttons: ['OK'],
            });
            await alert.present();
          },
        });
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }
}
