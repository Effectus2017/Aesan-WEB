import { ChangeDetectorRef, Component, inject, Inject, OnInit, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { AgencyStatusResponse } from 'app/shared/models/agency/AgencyStatusResponse';
import { compareItems } from 'app/shared/utils';
import { AgencyService } from 'app/shared/services/agency.service';
import { NotificationService } from 'app/shared/services/notification.service';

export interface StatusConfigModalData {
  /** Lista de estatus disponibles. */
  statuses: AgencyStatusResponse[];
  /** Estatus seleccionado actualmente (opcional). */
  currentStatus?: AgencyStatusResponse | null;
  /** ID de la agencia. */
  agencyId: number;
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
  private _agencyService = inject(AgencyService);
  private _notificationService = inject(NotificationService);
  private _translocoService = inject(TranslocoService);

  form: FormGroup;
  listStatuses: AgencyStatusResponse[] = [];
  compareItems = compareItems;
  isLoading = false;

  constructor(
    public dialogRef: MatDialogRef<StatusConfigModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: StatusConfigModalData
  ) {
    this.form = this._fb.group({
      status: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.listStatuses = this.data.statuses || [];

    if (this.data.currentStatus) {
      const currentStatus = this.listStatuses.find(s => s.id === this.data.currentStatus?.id);
      if (currentStatus) {
        this.form.patchValue({ status: currentStatus });
      }
    }

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

    if (!selectedStatus || selectedStatus.id === this.data.currentStatus?.id) {
      this.dialogRef.close(null);
      return;
    }

    this.isLoading = true;
    this._agencyService.updateAgencyStatus({ agencyId: this.data.agencyId, statusId: selectedStatus.id }).subscribe({
      next: () => {
        this.isLoading = false;
        this._notificationService.showSuccessDialog(
          this._translocoService.translate('sponsor-evaluation.edit.messages.statusUpdated')
        );
        this.dialogRef.close(selectedStatus);
        this._cdr.markForCheck();
      },
      error: (error) => {
        this.isLoading = false;
        this._notificationService.showErrorDialog(
          this._translocoService.translate('sponsor-evaluation.edit.messages.statusUpdateError')
        );
        console.error('Error al actualizar el estatus:', error);
        this._cdr.markForCheck();
      }
    });
  }
}
