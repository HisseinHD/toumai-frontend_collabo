import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';

import {
  playOutline,
  flagOutline,
  personAddOutline,
  createOutline,
  trashOutline,
  eyeOutline,
  peopleOutline,
  add,
  close,
  checkmark,
  folderOpenOutline,
  trendingDownOutline,
  removeOutline,
  trendingUpOutline,
  helpOutline,
  play,
  flag,
  personAdd,
  create,
  trash,
  eye,
  people,
  folder,
  arrowDown,
  arrowUp,
} from 'ionicons/icons';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true, // ✅ AJOUTER CETTE LIGNE
  imports: [
    CommonModule,
    RouterModule, // ✅ AJOUTER POUR LE ROUTING
    IonApp,
    IonRouterOutlet,
  ],
})
export class AppComponent {
  constructor() {
    // Ajouter toutes les icônes utilisées dans l'application
    addIcons({
      // Icônes outline
      playOutline,
      flagOutline,
      personAddOutline,
      createOutline,
      trashOutline,
      eyeOutline,
      peopleOutline,
      folderOpenOutline,
      trendingDownOutline,
      trendingUpOutline,
      helpOutline,

      // Icônes de base (fallback)
      play,
      flag,
      personAdd,
      create,
      trash,
      eye,
      people,
      folder,
      arrowDown,
      arrowUp,

      // Icônes utilitaires
      add,
      close,
      checkmark,
      removeOutline,
    });
  }
}
