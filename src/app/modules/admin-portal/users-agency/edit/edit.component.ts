import { Component } from '@angular/core';
import { UsersEditComponent } from '../../users/edit/edit.component';

/**
 * Componente de edición de usuario de auspiciador.
 * Envuelve UsersEditComponent indicando que el retorno debe ser a la lista de usuarios-agency.
 */
@Component({
  selector: 'app-users-agency-edit',
  standalone: true,
  imports: [UsersEditComponent],
  template: `<app-users-edit [returnToListPath]="'users-agency'"></app-users-edit>`,
})
export class UsersAgencyEditComponent {}
