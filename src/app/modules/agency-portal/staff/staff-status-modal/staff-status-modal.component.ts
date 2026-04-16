import {
  Component,
  Inject,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ChangeDetectorRef,
  inject,
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { provideNativeDateAdapter } from '@angular/material/core';
import { OptionSelection } from 'app/shared/models/common/OptionSelection';
import { Subject, takeUntil } from 'rxjs';
import { StaffService } from 'app/shared/services/staff.service';
import { NotificationService } from 'app/shared/services/notification.service';
import { UpdateStaffActiveStatusRequest } from 'app/shared/models/request/update-staff-active-status-request';
import {
  StaffAccessCancellationModalComponent,
  StaffAccessCancellationModalResult,
} from '../staff-access-cancellation-modal/staff-access-cancellation-modal.component';

export interface StaffStatusModalData {
  staffId?: number;
  isActive: boolean;
  inactiveDate?: string | Date | null;
  inactiveJustification?: string | null;
  userId?: string | null;
  currentUserId?: string | null;
  isActiveOptions: OptionSelection[];
}

@Component({
  selector: 'app-staff-status-modal',
  templateUrl: './staff-status-modal.component.html',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideNativeDateAdapter()],
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatDatepickerModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    TranslocoModule,
  ],
})
export class StaffStatusModalComponent implements OnInit, OnDestroy, AfterViewInit {
  form: FormGroup;
  isLoading: boolean = false;
  currentLang: string = 'es';
  /** Máximo permitido para fecha de inactivación (hoy); el datepicker no permite fechas futuras. */
  maxInactiveDate = new Date();
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  private _staffService = inject(StaffService);
  private _notificationService = inject(NotificationService);
  private _matDialog = inject(MatDialog);
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _translocoService = inject(TranslocoService);

  constructor(
    public dialogRef: MatDialogRef<StaffStatusModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: StaffStatusModalData,
    private fb: FormBuilder,
  ) {
    this.form = this.fb.group({
      isActive: [this.data.isActive, Validators.required],
      inactiveDate: [this._parseInitialInactiveDate(this.data.inactiveDate)],
      inactiveJustification: [this.data.inactiveJustification ?? ''],
    });
  }

  ngOnInit(): void {
    this.currentLang = this._translocoService.getActiveLang();

    this._translocoService.langChanges$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((lang) => {
        this.currentLang = lang;
        this._changeDetectorRef.markForCheck();
      });

    this._setupConditionalValidations();

    this.form
      .get('isActive')
      ?.valueChanges.pipe(takeUntil(this._unsubscribeAll))
      .subscribe(() => {
        this._setupConditionalValidations();
        this._changeDetectorRef.detectChanges();
      });
  }

  ngAfterViewInit(): void {
    this._changeDetectorRef.markForCheck();
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  /** Convierte valor inicial de API a Date para el datepicker; no permite fecha posterior a hoy. */
  private _parseInitialInactiveDate(value: string | Date | null | undefined): Date | null {
    if (value == null || value === '') {
      return null;
    }
    const d = value instanceof Date ? new Date(value.getTime()) : new Date(value);
    if (Number.isNaN(d.getTime())) {
      return null;
    }
    return this._clampInactiveDateToToday(d);
  }

  /** Ajusta la fecha al inicio del día local y la limita a no ser posterior a hoy. */
  private _clampInactiveDateToToday(d: Date): Date {
    const day = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const today = new Date();
    const max = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return day.getTime() > max.getTime() ? max : day;
  }

  /** Ajusta validadores de fecha y justificación cuando el estatus es inactivo. */
  private _setupConditionalValidations(): void {
    const isActive = this.form.get('isActive')?.value;
    const inactiveDateControl = this.form.get('inactiveDate');
    const inactiveJustificationControl = this.form.get('inactiveJustification');

    if (isActive === false) {
      inactiveDateControl?.setValidators([Validators.required]);
      inactiveJustificationControl?.setValidators([Validators.required]);
    } else {
      inactiveDateControl?.clearValidators();
      inactiveJustificationControl?.clearValidators();
      inactiveDateControl?.setValue(null);
      inactiveJustificationControl?.setValue('');
    }

    inactiveDateControl?.updateValueAndValidity({ emitEvent: false });
    inactiveJustificationControl?.updateValueAndValidity({ emitEvent: false });
  }

  get isFormValid(): boolean {
    return this.form.valid && !this.isLoading;
  }

  onSubmit(): void {
    if (!this.isFormValid || this.isLoading) {
      return;
    }

    const isActiveVal = this.form.get('isActive')?.value;

    if (!this.data.staffId) {
      this.dialogRef.close({
        action: 'submit',
        isActive: isActiveVal,
        inactiveDate: this.form.get('inactiveDate')?.value,
        inactiveJustification: this.form.get('inactiveJustification')?.value,
      });
      return;
    }

    if (
      this.data.userId &&
      this.data.currentUserId &&
      this.data.userId.toLowerCase() === this.data.currentUserId.toLowerCase()
    ) {
      this._notificationService.showErrorDialog(
        this._translocoService.translate('staff.edit.self-status-change-blocked'),
      );
      return;
    }

    this.isLoading = true;
    this._changeDetectorRef.detectChanges();

    const inactiveDateValue = this.form.get('inactiveDate')?.value;
    const inactiveDateOnly =
      inactiveDateValue instanceof Date
        ? inactiveDateValue.toISOString().split('T')[0]
        : inactiveDateValue;

    const hasPortalAccount = !!this.data.userId;
    if (isActiveVal === false && hasPortalAccount) {
      this._notificationService.showConfirmationDialogWithCallback(
        {
          title: 'staff.edit.access-cancellation.confirm-dialog.title',
          message: 'staff.edit.access-cancellation.confirm-dialog.message',
          icon: {
            show: true,
            name: 'heroicons_outline:exclamation-triangle',
            color: 'warning',
          },
          actions: {
            confirm: {
              show: true,
              label: 'staff.edit.access-cancellation.confirm-dialog.confirm',
              color: 'warn',
            },
            cancel: {
              show: true,
              label: 'staff.edit.access-cancellation.confirm-dialog.cancel',
            },
          },
        },
        (confirmResult) => {
          if (confirmResult !== 'confirmed') {
            this.isLoading = false;
            this._changeDetectorRef.detectChanges();
            return;
          }

          const cancellationDialogRef = this._matDialog.open(StaffAccessCancellationModalComponent, {
            data: {
              staffId: this.data.staffId,
              userId: this.data.userId ?? null,
            },
            disableClose: false,
            width: '600px',
            maxWidth: '90vw',
            panelClass: ['mat-dialog-container', 'dialog-responsive'],
          });

          cancellationDialogRef
            .afterClosed()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((cancellationResult: StaffAccessCancellationModalResult | null) => {
              if (!cancellationResult) {
                this.isLoading = false;
                this._changeDetectorRef.detectChanges();
                return;
              }

              const request = this._buildStatusUpdateRequest(isActiveVal, inactiveDateOnly, cancellationResult);
              this._submitStatusChangeRequest(request, isActiveVal);
            });
        },
      );
      return;
    }

    const request = this._buildStatusUpdateRequest(isActiveVal, inactiveDateOnly, null);
    this._submitStatusChangeRequest(request, isActiveVal);
  }

  onCancel(): void {
    if (!this.isLoading) {
      this.dialogRef.close(null);
    }
  }

  /** Construye el payload para actualizar estado del staff. */
  private _buildStatusUpdateRequest(
    isActiveVal: boolean,
    inactiveDateOnly: string | null,
    cancellationResult: StaffAccessCancellationModalResult | null,
  ): UpdateStaffActiveStatusRequest {
    return {
      staffId: this.data.staffId!,
      isActive: isActiveVal,
      inactiveJustification:
        isActiveVal === false ? (this.form.get('inactiveJustification')?.value ?? '').trim() : undefined,
      inactiveDate: isActiveVal === false ? inactiveDateOnly : undefined,
      accessCancellationJustification:
        isActiveVal === false ? cancellationResult?.accessCancellationJustification ?? undefined : undefined,
      accessCancellationConfirmedAt:
        isActiveVal === false ? cancellationResult?.accessCancellationConfirmedAt ?? undefined : undefined,
    };
  }

  /** Ejecuta la llamada API para actualizar el estado del personal. */
  private _submitStatusChangeRequest(request: UpdateStaffActiveStatusRequest, isActiveVal: boolean): void {
    this._staffService
      .updateStaffActiveStatus(request)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: () => {
          this.isLoading = false;
          this._changeDetectorRef.detectChanges();

          this.dialogRef.close({
            action: 'submit',
            isActive: isActiveVal,
            inactiveDate: this.form.get('inactiveDate')?.value,
            inactiveJustification: this.form.get('inactiveJustification')?.value,
            pendingSuccessConfirmation: true,
          });
        },
        error: (error) => {
          this.isLoading = false;
          this._changeDetectorRef.detectChanges();

          this._notificationService.showErrorDialog(
            this._translocoService.translate('staff.edit.status-update-error'),
          );
          console.error('Error al actualizar el estatus del staff:', error);
        },
      });
  }
}
