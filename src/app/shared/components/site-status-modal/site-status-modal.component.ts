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
  yesNoOptions: OptionSelection[]; // Opciones para Sí/No de la pregunta de raciones
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
  showInactivationFields: boolean = false; // Controla visibilidad de campos de inactivación
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
      providedRationsService: [null, Validators.required], // Nueva pregunta
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

    // Configurar validaciones condicionales iniciales
    this.setupConditionalValidations();

    // Suscribirse a cambios en isActive
    this.form.get('isActive')?.valueChanges
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(() => {
        // Si cambia a activo, limpiar la pregunta de raciones
        if (this.form.get('isActive')?.value === true) {
          this.form.get('providedRationsService')?.setValue(null);
          this.showInactivationFields = false;
        }
        this.setupConditionalValidations();
        this._changeDetectorRef.detectChanges();
      });

    // Suscribirse a cambios en providedRationsService
    this.form.get('providedRationsService')?.valueChanges
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((value) => {
        const isActive = this.form.get('isActive')?.value;
        
        if (value === false) {
          // Si responde "No", mostrar campos de inactivación
          this.showInactivationFields = true;
          this.setupConditionalValidations();
        } else if (value === true) {
          // Si responde "Sí", ocultar campos
          this.showInactivationFields = false;
          // Limpiar validadores y valores de campos de inactivación
          this.form.get('inactiveDate')?.clearValidators();
          this.form.get('inactiveJustification')?.clearValidators();
          this.form.get('inactiveDate')?.setValue(null);
          this.form.get('inactiveJustification')?.setValue('');
          this.form.get('inactiveDate')?.updateValueAndValidity({ emitEvent: false });
          this.form.get('inactiveJustification')?.updateValueAndValidity({ emitEvent: false });
          
          // Si el estatus es inactivo, mostrar el diálogo de confirmación
          if (isActive === false) {
            // Obtener la fecha de inactivación si existe
            const inactiveDateValue = this.data.inactiveDate || this.form.get('inactiveDate')?.value;
            let inactiveDateOnly: string | null = null;
            
            if (inactiveDateValue instanceof Date) {
              inactiveDateOnly = inactiveDateValue.toISOString().split('T')[0];
            } else if (typeof inactiveDateValue === 'string' && inactiveDateValue) {
              inactiveDateOnly = inactiveDateValue;
            } else if (inactiveDateValue) {
              inactiveDateOnly = inactiveDateValue.toString();
            }

            // Mostrar diálogo de confirmación con la notificación
            this._notificationService.showConfirmationDialogWithCallback(
              {
                title: 'sites.edit.status-modal.notification-title',
                message: 'sites.edit.status-modal.rations-service-notification',
                icon: {
                  show: true,
                  name: 'heroicons_outline:information-circle',
                  color: 'info',
                },
                actions: {
                  confirm: {
                    show: true,
                    label: 'dialog.success.confirm',
                    color: 'primary',
                  },
                  cancel: {
                    show: false, // Ocultar botón cancelar, solo mostrar aceptar
                  },
                },
              },
              (result) => {
                if (result === 'confirmed') {
                  // Cerrar el modal con acción especial para redirección
                  this.dialogRef.close({
                    action: 'redirect-to-changes-form',
                    siteId: this.data.siteId,
                    inactiveDate: inactiveDateOnly,
                    // TODO: Agregar más datos necesarios cuando se defina el formulario de cambios y cancelaciones
                  });
                }
              }
            );
          }
        }
        this._changeDetectorRef.detectChanges();
      });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  private setupConditionalValidations(): void {
    const isActive = this.form.get('isActive')?.value;
    const providedRationsService = this.form.get('providedRationsService')?.value;
    const inactiveDateControl = this.form.get('inactiveDate');
    const inactiveJustificationControl = this.form.get('inactiveJustification');

    // Solo validar campos de inactivación si:
    // 1. El estatus es inactivo (false)
    // 2. Y respondió "No" a la pregunta de raciones (false)
    if (isActive === false && providedRationsService === false) {
      inactiveDateControl?.setValidators([Validators.required]);
      inactiveJustificationControl?.setValidators([Validators.required]);
    } else {
      // Si está activo o respondió "Sí", limpiar validadores y valores
      inactiveDateControl?.clearValidators();
      inactiveJustificationControl?.clearValidators();
      if (isActive === true || providedRationsService === true) {
        inactiveDateControl?.setValue(null);
        inactiveJustificationControl?.setValue('');
      }
    }

    inactiveDateControl?.updateValueAndValidity({ emitEvent: false });
    inactiveJustificationControl?.updateValueAndValidity({ emitEvent: false });
  }

  get isFormValid(): boolean {
    // Validar que providedRationsService esté respondido cuando isActive es false
    const isActive = this.form.get('isActive')?.value;
    const providedRationsService = this.form.get('providedRationsService')?.value;

    if (isActive === false) {
      if (providedRationsService === null || providedRationsService === undefined) {
        return false;
      }
      // Si respondió "No", validar campos de inactivación
      if (providedRationsService === false) {
        return this.form.valid && !this.isLoading;
      }
      // Si respondió "Sí", el formulario es válido
      return !this.isLoading;
    }

    // Si está activo, validar normalmente
    return this.form.valid && !this.isLoading;
  }

  onSubmit(): void {
    if (!this.isFormValid || this.isLoading) {
      return;
    }

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

  onCancel(): void {
    if (!this.isLoading) {
      this.dialogRef.close(null);
    }
  }
}

