import { CommonModule } from '@angular/common';
import { Component, inject, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { compareById } from 'app/shared/utils';
import { DTORole } from '../users.types';

export interface ChangeRoleModalData {
  listRoles: DTORole[];
  currentRole: DTORole | null;
}

export interface ChangeRoleModalResult {
  role: DTORole;
}

@Component({
  selector: 'app-change-role-modal',
  templateUrl: './change-role-modal.component.html',
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatSelectModule,
    TranslocoModule,
  ],
})
export class ChangeRoleModalComponent {
  // -----
  // @ Inyecciones privadas
  // -----
  private _dialogRef = inject(MatDialogRef<ChangeRoleModalComponent>);
  private _translocoService = inject(TranslocoService);
  private _data = inject<ChangeRoleModalData>(MAT_DIALOG_DATA);

  // -----
  // @ Variables
  // -----
  roleCompareFn = compareById;
  form: FormGroup = new FormGroup({
    role: new FormControl(this._data?.currentRole ?? null, Validators.required),
  });

  // -----
  // @ Getters
  // -----
  /** Expone los datos de entrada del modal para usarlos en la plantilla. */
  get data(): ChangeRoleModalData {
    return this._data;
  }

  /** Devuelve el idioma activo para mostrar el nombre del rol correspondiente. */
  get currentLang(): string {
    return this._translocoService.getActiveLang() ?? 'es';
  }

  // -----
  // @ Otras funciones públicas
  // -----
  /** Valida y confirma el rol seleccionado devolviendo el resultado al componente padre. */
  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const role = this.form.get('role')?.value as DTORole | null;
    if (!role) return;

    this._dialogRef.close({ role });
  }

  /** Cierra el modal sin aplicar cambios. */
  onCancel(): void {
    this._dialogRef.close();
  }
}
