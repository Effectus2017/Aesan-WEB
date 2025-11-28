import { Component, Inject, ViewEncapsulation, ChangeDetectionStrategy, OnInit, OnDestroy, ChangeDetectorRef, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslocoModule } from '@ngneat/transloco';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { provideNativeDateAdapter } from '@angular/material/core';
import { OptionSelection } from 'app/shared/models/OptionSelection';
import { Subject, takeUntil } from 'rxjs';
import { SiteService } from 'app/shared/services/site.service';
import { NotificationService } from 'app/shared/services/notification.service';
import { QueryParameters } from 'app/shared/models/QueryParameters';
import { TranslocoService } from '@ngneat/transloco';

export interface SiteStatusModalData {
  siteId?: number; // ID del sitio (solo en modo edición)
  isActive: boolean;
  inactiveDate: Date | null;
  inactiveJustification: string | null;
  isActiveOptions: OptionSelection[];
}

@Component({
  selector: 'app-site-status-modal',
  templateUrl: './site-status-modal.component.html',
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
    TranslocoModule
  ]
})
export class SiteStatusModalComponent implements OnInit, OnDestroy {
  form: FormGroup;
  isLoading: boolean = false;
  currentLang: string = 'es';
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  private _siteService = inject(SiteService);
  private _notificationService = inject(NotificationService);
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _translocoService = inject(TranslocoService);

  constructor(
    public dialogRef: MatDialogRef<SiteStatusModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SiteStatusModalData,
    private fb: FormBuilder
  ) {
    // Crear el formulario reactivo
    this.form = this.fb.group({
      isActive: [this.data.isActive, Validators.required],
      inactiveDate: [this.data.inactiveDate || null],
      inactiveJustification: [this.data.inactiveJustification || '']
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

    // Configurar validaciones condicionales
    this.setupConditionalValidations();

    // Suscribirse a cambios en isActive
    this.form.get('isActive')?.valueChanges
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(() => {
        this.setupConditionalValidations();
      });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  private setupConditionalValidations(): void {
    const isActive = this.form.get('isActive')?.value;
    const inactiveDateControl = this.form.get('inactiveDate');
    const inactiveJustificationControl = this.form.get('inactiveJustification');

    if (isActive === false) {
      // Si está inactivo, requerir fecha y justificación
      inactiveDateControl?.setValidators([Validators.required]);
      inactiveJustificationControl?.setValidators([Validators.required]);
    } else {
      // Si está activo, limpiar validadores y valores
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
    if (this.form.valid && !this.isLoading) {
      // Si no hay siteId, solo cerrar el modal con los datos (modo add)
      if (!this.data.siteId) {
        this.dialogRef.close({
          action: 'submit',
          isActive: this.form.get('isActive')?.value,
          inactiveDate: this.form.get('inactiveDate')?.value,
          inactiveJustification: this.form.get('inactiveJustification')?.value
        });
        return;
      }

      // Si hay siteId, llamar a la API (modo edit)
      this.isLoading = true;
      this._changeDetectorRef.detectChanges();

      // Convertir la fecha a formato YYYY-MM-DD (solo fecha, sin hora) - patrón usado en el proyecto
      const inactiveDateValue = this.form.get('inactiveDate')?.value;
      const inactiveDateOnly = inactiveDateValue instanceof Date
        ? inactiveDateValue.toISOString().split('T')[0]
        : inactiveDateValue;

      const queryParameters: QueryParameters = {
        siteId: this.data.siteId,
        isActive: this.form.get('isActive')?.value,
        inactiveJustification: this.form.get('isActive')?.value === false
          ? this.form.get('inactiveJustification')?.value
          : null,
        inactiveDate: this.form.get('isActive')?.value === false
          ? inactiveDateOnly
          : null
      };

      this._siteService.updateSiteActiveStatus(queryParameters)
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe({
          next: (response) => {
            this.isLoading = false;
            this._changeDetectorRef.detectChanges();

            // Mostrar notificación de éxito
            this._notificationService.showSuccess('sites.edit.status-updated-successfully');

            // Cerrar el modal con los datos actualizados
            this.dialogRef.close({
              action: 'submit',
              isActive: this.form.get('isActive')?.value,
              inactiveDate: this.form.get('inactiveDate')?.value,
              inactiveJustification: this.form.get('inactiveJustification')?.value
            });
          },
          error: (error) => {
            this.isLoading = false;
            this._changeDetectorRef.detectChanges();

            // Mostrar notificación de error
            this._notificationService.showError('sites.edit.status-update-error');
            console.error('Error al actualizar el estatus del sitio:', error);
          }
        });
    }
  }

  onCancel(): void {
    if (!this.isLoading) {
      this.dialogRef.close(null);
    }
  }
}

