import { ChangeDetectorRef, Component, inject, Inject, OnInit, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoModule } from '@ngneat/transloco';
import { AgencyStatus } from 'app/shared/models/AgencyStatus';
import { compareItems } from 'app/shared/utils';

export interface StatusConfigModalData {
  /** Lista de estatus disponibles. */
  statuses: AgencyStatus[];
  /** Estatus seleccionado actualmente (opcional). */
  currentStatus?: AgencyStatus | null;
}

@Component({
  selector: 'app-status-config-modal',
  standalone: true,
  templateUrl: './status-config-modal.component.html',
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
export class StatusConfigModalComponent implements OnInit {
  private _cdr = inject(ChangeDetectorRef);
  private _fb = inject(FormBuilder);

  form: FormGroup;
  listStatuses: AgencyStatus[] = [];
  compareItems = compareItems;

  constructor(
    public dialogRef: MatDialogRef<StatusConfigModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: StatusConfigModalData
  ) {
    // Crear el formulario reactivo
    this.form = this._fb.group({
      status: [this.data.currentStatus, Validators.required]
    });
  }

  ngOnInit(): void {
    this.listStatuses = this.data.statuses || [];
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
    const selectedStatus = this.form.get('status')?.value;
    this.dialogRef.close(selectedStatus);
  }
}
