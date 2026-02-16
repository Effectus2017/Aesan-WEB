import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { TranslocoModule } from '@ngneat/transloco';

export interface ApproveRoleExtensionDialogData {
  requestedValidTo?: string;
}

export interface ApproveRoleExtensionDialogResult {
  confirmed: boolean;
  newValidTo?: string | Date;
}

@Component({
  selector: 'app-approve-role-extension-dialog',
  templateUrl: './approve-role-extension-dialog.component.html',
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    TranslocoModule,
  ],
})
export class ApproveRoleExtensionDialogComponent {
  form: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<ApproveRoleExtensionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ApproveRoleExtensionDialogData,
  ) {
    const initialDate = data?.requestedValidTo
      ? (() => {
          const d = new Date(data.requestedValidTo);
          return isNaN(d.getTime()) ? null : d;
        })()
      : null;
    this.form = new FormGroup({
      newValidTo: new FormControl<Date | null>(initialDate),
    });
  }

  onConfirm(): void {
    const value = this.form.get('newValidTo')?.value;
    this.dialogRef.close({
      confirmed: true,
      newValidTo: value ?? undefined,
    } as ApproveRoleExtensionDialogResult);
  }

  onCancel(): void {
    this.dialogRef.close({ confirmed: false } as ApproveRoleExtensionDialogResult);
  }
}
