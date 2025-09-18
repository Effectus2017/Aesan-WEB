import { Component, Inject, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoModule } from '@ngneat/transloco';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

export interface PermissionRequestFormDialogData {
  deliveryTypeName: string;
  deliveryTypeNameEN: string;
  reason?: string;
}

@Component({
  selector: 'app-permission-request-form-dialog',
  templateUrl: './permission-request-form-dialog.component.html',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    ReactiveFormsModule,
    TranslocoModule
  ]
})
export class PermissionRequestFormDialogComponent {
  form: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<PermissionRequestFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PermissionRequestFormDialogData,
    private fb: FormBuilder
  ) {
    // Crear el formulario reactivo
    this.form = this.fb.group({
      reason: [this.data.reason || '', [Validators.required, Validators.minLength(10)]]
    });
  }

  get isFormValid(): boolean {
    return this.form.get('reason')?.valid || false;
  }

  onSubmit(): void {
    if (this.form.valid) {
      // Cerrar el diálogo con el resultado
      this.dialogRef.close({
        action: 'submit',
        reason: this.form.get('reason')?.value
      });
    }
  }
}
