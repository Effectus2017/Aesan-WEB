import { ChangeDetectionStrategy, Component, Inject, inject, ViewEncapsulation } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoModule } from '@ngneat/transloco';

export interface StaffAccessCancellationModalData {
  staffId: number;
  userId?: string | null;
}

export interface StaffAccessCancellationModalResult {
  accessCancellationJustification: string;
  accessCancellationConfirmedAt: string;
}

@Component({
  selector: 'app-staff-access-cancellation-modal',
  templateUrl: './staff-access-cancellation-modal.component.html',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatIconModule,
    TranslocoModule,
  ],
})
export class StaffAccessCancellationModalComponent {
  // -----
  // @ Inyecciones privadas
  // -----
  private _formBuilder = inject(FormBuilder);

  // -----
  // @ Variables
  // -----
  form = this._formBuilder.group({
    accessCancellationJustification: ['', [Validators.required, Validators.maxLength(500)]],
    acknowledgeCancellation: [false, [Validators.requiredTrue]],
  });

  // -----
  // @ Constructor
  // -----
  constructor(
    public dialogRef: MatDialogRef<StaffAccessCancellationModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: StaffAccessCancellationModalData,
  ) {}

  // -----
  // @ Getters
  // -----
  /** Indica si el formulario está listo para enviarse. */
  get isFormValid(): boolean {
    return this.form.valid;
  }

  // -----
  // @ Funciones On (componentes genéricos)
  // -----
  /** Cierra el modal sin guardar cambios. */
  onCancel(): void {
    this.dialogRef.close(null);
  }

  /** Confirma la cancelación de acceso y retorna el payload requerido. */
  onSubmit(): void {
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: StaffAccessCancellationModalResult = {
      accessCancellationJustification:
        this.form.controls.accessCancellationJustification.value?.trim() ?? '',
      accessCancellationConfirmedAt: new Date().toISOString(),
    };

    this.dialogRef.close(payload);
  }
}
