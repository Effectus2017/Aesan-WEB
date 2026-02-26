import { ChangeDetectorRef, Component, inject, Inject, OnInit, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoModule } from '@ngneat/transloco';
import { compareMonitors } from 'app/shared/utils';

/** Usuario asignable (monitor) con nombre y email. */
export interface AssignableUser {
  id?: number;
  firstName?: string;
  fatherLastName?: string;
  motherLastName?: string;
  email?: string;
}

export interface AssignedToConfigModalData {
  /** Lista de usuarios disponibles. */
  users: AssignableUser[];
  /** Usuario seleccionado actualmente (opcional). */
  currentUser?: AssignableUser | null;
}

@Component({
  selector: 'app-assigned-to-config-modal',
  standalone: true,
  templateUrl: './assigned-to-config-modal.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
    TranslocoModule,
  ],
})
export class AssignedToConfigModalComponent implements OnInit {
  private _cdr = inject(ChangeDetectorRef);
  private _fb = inject(FormBuilder);

  form: FormGroup;
  listUsers: AssignableUser[] = [];
  compareMonitors = compareMonitors;

  constructor(
    public dialogRef: MatDialogRef<AssignedToConfigModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AssignedToConfigModalData
  ) {
    // Crear el formulario reactivo
    this.form = this._fb.group({
      assignedTo: [this.data.currentUser, Validators.required]
    });
  }

  ngOnInit(): void {
    this.listUsers = this.data.users || [];
    this._cdr.markForCheck();
  }

  /** Cierra el modal sin guardar. */
  onCancel(): void {
    this.dialogRef.close(null);
  }

  /** Guarda la selección y cierra el modal. */
  onSave(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const selectedUser = this.form.get('assignedTo')?.value;
    this.dialogRef.close(selectedUser);
  }
}
