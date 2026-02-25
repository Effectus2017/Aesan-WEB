import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatNativeDateModule } from '@angular/material/core';
import { TranslocoModule } from '@ngneat/transloco';
import { compareById } from 'app/shared/utils';
import { AddSecondaryRoleModalData, AddSecondaryRoleModalResult, DTORole } from '../users.types';

@Component({
  selector: 'app-add-secondary-role-modal',
  templateUrl: './add-secondary-role-modal.component.html',
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatIconModule,
    MatNativeDateModule,
    TranslocoModule,
  ],
})
export class AddSecondaryRoleModalComponent {
  // -----------------------------------------------------------------------------------------------------
  // @ Variables
  // -----------------------------------------------------------------------------------------------------
  form: FormGroup;
  rolesFiltered: DTORole[] = [];

  // -----------------------------------------------------------------------------------------------------
  // @ Constructor
  // -----------------------------------------------------------------------------------------------------
  constructor(
    public dialogRef: MatDialogRef<AddSecondaryRoleModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AddSecondaryRoleModalData,
  ) {
    const edit = data?.editRow;
    this.form = new FormGroup(
      {
        role: new FormControl(edit?.role ?? null, Validators.required),
        validFrom: new FormControl(edit?.validFrom ?? null),
        validTo: new FormControl(edit?.validTo ?? null),
      },
      { validators: this.dateRangeValidator.bind(this) },
    );
    this._updateRolesFiltered();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Getters
  // -----------------------------------------------------------------------------------------------------
  get isEditMode(): boolean {
    return !!this.data?.editRow;
  }

  get modalTitleKey(): string {
    return this.isEditMode ? 'users.edit.secondaryRoles.modal.editTitle' : 'users.edit.secondaryRoles.modal.addTitle';
  }

  get submitKey(): string {
    return this.isEditMode ? 'users.edit.secondaryRoles.modal.save' : 'users.edit.secondaryRoles.modal.add';
  }

  /** Función para mat-select compareWith (comparar roles por id). */
  roleCompareFn = compareById;

  // -----------------------------------------------------------------------------------------------------
  // @ Funciones On (componentes genéricos)
  // -----------------------------------------------------------------------------------------------------
  /** Valida el formulario y cierra el diálogo con el rol y fechas seleccionados. */
  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValues = this.form.value;
    const role = formValues.role as DTORole;
    if (!role) return;

    const validFrom: string | null = formValues.validFrom
      ? (typeof formValues.validFrom === 'string' ? formValues.validFrom : (formValues.validFrom as Date).toISOString().slice(0, 10))
      : null;
    const validTo: string | null = formValues.validTo
      ? (typeof formValues.validTo === 'string' ? formValues.validTo : (formValues.validTo as Date).toISOString().slice(0, 10))
      : null;

    this.dialogRef.close({ role, validFrom, validTo });
  }

  /** Cierra el modal sin resultado. */
  onCancel(): void {
    this.dialogRef.close();
  }

  /** Validador del grupo: validFrom debe ser anterior a validTo. */
  dateRangeValidator(g: AbstractControl): { dateRange: true } | null {
    const from = g.get('validFrom')?.value;
    const to = g.get('validTo')?.value;
    if (from && to && new Date(to) <= new Date(from)) {
      return { dateRange: true };
    }
    return null;
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Funciones privadas
  // -----------------------------------------------------------------------------------------------------
  /** Asigna la lista de roles disponibles (ya filtrada por el backend). */
  private _updateRolesFiltered(): void {
    // Los roles ya vienen filtrados del backend (sin rol primario ni roles secundarios ya asignados)
    this.rolesFiltered = this.data?.listRoles ?? [];
  }
}
