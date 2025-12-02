import { Component, Inject, ViewEncapsulation, ChangeDetectionStrategy, OnInit, OnDestroy, ChangeDetectorRef, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { OptionSelection } from 'app/shared/models/OptionSelection';
import { Subject, takeUntil } from 'rxjs';
import { StaffService } from 'app/shared/services/staff.service';
import { NotificationService } from 'app/shared/services/notification.service';
import { QueryParameters } from 'app/shared/models/QueryParameters';

export interface StaffStatusModalData {
  staffId?: number; // ID del staff (solo en modo edición)
  isActive: boolean;
  isActiveOptions: OptionSelection[];
}

@Component({
  selector: 'app-staff-status-modal',
  templateUrl: './staff-status-modal.component.html',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    TranslocoModule
  ]
})
export class StaffStatusModalComponent implements OnInit, OnDestroy {
  form: FormGroup;
  isLoading: boolean = false;
  currentLang: string = 'es';
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  private _staffService = inject(StaffService);
  private _notificationService = inject(NotificationService);
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _translocoService = inject(TranslocoService);

  constructor(
    public dialogRef: MatDialogRef<StaffStatusModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: StaffStatusModalData,
    private fb: FormBuilder
  ) {
    // Crear el formulario reactivo
    this.form = this.fb.group({
      isActive: [this.data.isActive, Validators.required]
    });
  }

  ngOnInit(): void {
    // Obtener el idioma actual
    this.currentLang = this._translocoService.getActiveLang();

    // Suscribirse a cambios de idioma
    this._translocoService.langChanges$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((lang) => {
        this.currentLang = lang;
      });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  get isFormValid(): boolean {
    return this.form.valid && !this.isLoading;
  }

  onSubmit(): void {
    if (!this.isFormValid || this.isLoading) {
      return;
    }

    // Si no hay staffId, solo cerrar el modal con los datos (modo add)
    if (!this.data.staffId) {
      this.dialogRef.close({
        action: 'submit',
        isActive: this.form.get('isActive')?.value
      });
      return;
    }

    // Si hay staffId, llamar a la API (modo edit)
    this.isLoading = true;
    this._changeDetectorRef.detectChanges();

    const queryParameters: QueryParameters = {
      staffId: this.data.staffId,
      isActive: this.form.get('isActive')?.value
    };

    this._staffService.updateStaffActiveStatus(queryParameters)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this._changeDetectorRef.detectChanges();

          // Mostrar notificación de éxito
          this._notificationService.showSuccess('staff.edit.status-updated-successfully');

          // Cerrar el modal con los datos actualizados
          this.dialogRef.close({
            action: 'submit',
            isActive: this.form.get('isActive')?.value
          });
        },
        error: (error) => {
          this.isLoading = false;
          this._changeDetectorRef.detectChanges();

          // Mostrar notificación de error
          this._notificationService.showError('staff.edit.status-update-error');
          console.error('Error al actualizar el estatus del staff:', error);
        }
      });
  }

  onCancel(): void {
    if (!this.isLoading) {
      this.dialogRef.close(null);
    }
  }
}

