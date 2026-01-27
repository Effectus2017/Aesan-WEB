import { Component, Inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { TranslocoModule } from '@ngneat/transloco';
import { NgIf, NgFor } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { toTimeString, timeStringToDate, generateTimeOptions, filterStartTimeOptions, getEndTimeOptions, compareByTime, TimeOption } from 'app/shared/utils';
import { OptionSelection } from 'app/shared/models/OptionSelection';
import { ServiceTypeByProgram } from 'app/shared/models/ServiceTypeByProgram';
import { ServiceTypeIds, ServiceTypes } from 'app/shared/constants/service-type.constants';
import { provideNativeDateAdapter } from '@angular/material/core';
import { NumericOnlyDirective } from 'app/shared/directives/numeric-only.directive';
import { Subject, takeUntil } from 'rxjs';
import { TimeValidationUtil } from 'app/shared/utils/time-validation.util';

/** Mapeo ServiceTypeId -> nombres de controles del formulario (AESAN-257). */
const SERVICE_TYPE_ID_TO_FORM_KEY: Record<number, { bool: string; from: string; to: string }> = {
  1: { bool: 'breakfast', from: 'breakfastFrom', to: 'breakfastTo' },
  2: { bool: 'lunch', from: 'lunchFrom', to: 'lunchTo' },
  3: { bool: 'snackAM', from: 'snackAMFrom', to: 'snackAMTo' },
  4: { bool: 'dinner', from: 'dinnerFrom', to: 'dinnerTo' },
  5: { bool: 'snackPM', from: 'snackPMFrom', to: 'snackPMTo' },
  6: { bool: 'snackNight', from: 'snackNightFrom', to: 'snackNightTo' },
  7: { bool: 'dinnerExtended', from: 'dinnerExtendedFrom', to: 'dinnerExtendedTo' },
  8: { bool: 'dinnerAtRisk', from: 'dinnerAtRiskFrom', to: 'dinnerAtRiskTo' },
  9: { bool: 'snackExtended', from: 'snackExtendedFrom', to: 'snackExtendedTo' },
  10: { bool: 'snackAtRisk', from: 'snackAtRiskFrom', to: 'snackAtRiskTo' },
};

export interface ServiceByGroupDialogData {
  id?: number;
  groupName?: string;
  numberOfChildren?: number;
  yesNoOptions?: OptionSelection[];
  generalEnrollment?: number;
  diningRoomCapacity?: number;
  existingGroups?: Array<{ id?: number; numberOfChildren?: number }>;

  // Servicios básicos
  breakfast?: boolean;
  breakfastFrom?: string;
  breakfastTo?: string;
  lunch?: boolean;
  lunchFrom?: string;
  lunchTo?: string;
  snackAM?: boolean;
  snackAMFrom?: string;
  snackAMTo?: string;
  dinner?: boolean;
  dinnerFrom?: string;
  dinnerTo?: string;
  snackPM?: boolean;
  snackPMFrom?: string;
  snackPMTo?: string;
  snackNight?: boolean;
  snackNightFrom?: string;
  snackNightTo?: string;

  // Servicios PACNA
  dinnerExtended?: boolean;
  dinnerExtendedFrom?: string;
  dinnerExtendedTo?: string;
  dinnerAtRisk?: boolean;
  dinnerAtRiskFrom?: string;
  dinnerAtRiskTo?: string;
  snackExtended?: boolean;
  snackExtendedFrom?: string;
  snackExtendedTo?: string;
  snackAtRisk?: boolean;
  snackAtRiskFrom?: string;
  snackAtRiskTo?: string;

  isEdit?: boolean;
  
  // Flags para identificar el programa (fallback cuando no hay serviceTypes)
  isPDAM?: boolean;
  isPACNA?: boolean;
  isPSAV?: boolean;

  /** Tipos de servicio por programa desde el backend (AESAN-257). Si existe, el modal muestra solo estos. */
  serviceTypes?: ServiceTypeByProgram[];

  // Horas de funcionamiento para limitar opciones de tiempo
  operatingStartTime?: Date | string | null;
  operatingEndTime?: Date | string | null;
}

@Component({
  selector: 'app-add-service-by-group-modal',
  templateUrl: './add-service-by-group-modal.component.html',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCheckboxModule,
    TranslocoModule,
    NgIf,
    NgFor,
    MatIconModule,
    NumericOnlyDirective,
  ],
})
export class AddServiceByGroupModalComponent implements OnInit, OnDestroy {
  serviceForm: FormGroup;
  currentLang: string = 'es';
  yesNoOptions: OptionSelection[] = [];
  timeOptions: TimeOption[] = [];
  private _unsubscribeAll: Subject<void> = new Subject<void>();
  
  // Wrappers para compatibilidad con mat-select
  compareByTimeWrapper = compareByTime;

  constructor(
    private _formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<AddServiceByGroupModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ServiceByGroupDialogData,
    private _changeDetectorRef: ChangeDetectorRef
  ) {
    // Inicializar opciones Sí/No desde el data
    this.yesNoOptions = data?.yesNoOptions || [];

    // Crear validador personalizado para numberOfChildren
    const numberOfChildrenValidator = this.createNumberOfChildrenValidator(
      data?.generalEnrollment,
      data?.diningRoomCapacity,
      data?.existingGroups,
      data?.id
    );

    this.serviceForm = this._formBuilder.group({
      id: [data?.id || 0],
      groupName: [data?.groupName || '', Validators.required],
      numberOfChildren: [data?.numberOfChildren || 0, [Validators.required, Validators.min(1), numberOfChildrenValidator]],

      // Servicios básicos
      breakfast: [data?.breakfast || false],
      breakfastFrom: [data?.breakfastFrom ? timeStringToDate(data.breakfastFrom) : null],
      breakfastTo: [data?.breakfastTo ? timeStringToDate(data.breakfastTo) : null],
      lunch: [data?.lunch || false],
      lunchFrom: [data?.lunchFrom ? timeStringToDate(data.lunchFrom) : null],
      lunchTo: [data?.lunchTo ? timeStringToDate(data.lunchTo) : null],
      snackAM: [data?.snackAM || false],
      snackAMFrom: [data?.snackAMFrom ? timeStringToDate(data.snackAMFrom) : null],
      snackAMTo: [data?.snackAMTo ? timeStringToDate(data.snackAMTo) : null],
      dinner: [data?.dinner || false],
      dinnerFrom: [data?.dinnerFrom ? timeStringToDate(data.dinnerFrom) : null],
      dinnerTo: [data?.dinnerTo ? timeStringToDate(data.dinnerTo) : null],
      snackPM: [data?.snackPM || false],
      snackPMFrom: [data?.snackPMFrom ? timeStringToDate(data.snackPMFrom) : null],
      snackPMTo: [data?.snackPMTo ? timeStringToDate(data.snackPMTo) : null],
      snackNight: [data?.snackNight || false],
      snackNightFrom: [data?.snackNightFrom ? timeStringToDate(data.snackNightFrom) : null],
      snackNightTo: [data?.snackNightTo ? timeStringToDate(data.snackNightTo) : null],

      // Servicios PACNA
      dinnerExtended: [data?.dinnerExtended || false],
      dinnerExtendedFrom: [data?.dinnerExtendedFrom ? timeStringToDate(data.dinnerExtendedFrom) : null],
      dinnerExtendedTo: [data?.dinnerExtendedTo ? timeStringToDate(data.dinnerExtendedTo) : null],
      dinnerAtRisk: [data?.dinnerAtRisk || false],
      dinnerAtRiskFrom: [data?.dinnerAtRiskFrom ? timeStringToDate(data.dinnerAtRiskFrom) : null],
      dinnerAtRiskTo: [data?.dinnerAtRiskTo ? timeStringToDate(data.dinnerAtRiskTo) : null],
      snackExtended: [data?.snackExtended || false],
      snackExtendedFrom: [data?.snackExtendedFrom ? timeStringToDate(data.snackExtendedFrom) : null],
      snackExtendedTo: [data?.snackExtendedTo ? timeStringToDate(data.snackExtendedTo) : null],
      snackAtRisk: [data?.snackAtRisk || false],
      snackAtRiskFrom: [data?.snackAtRiskFrom ? timeStringToDate(data.snackAtRiskFrom) : null],
      snackAtRiskTo: [data?.snackAtRiskTo ? timeStringToDate(data.snackAtRiskTo) : null],
    });
  }

  ngOnInit(): void {
    // Inicializar opciones de tiempo
    this.timeOptions = generateTimeOptions();
    
    // Actualizar validador cuando cambia numberOfChildren para revalidar
    const numberOfChildrenControl = this.serviceForm.get('numberOfChildren');
    if (numberOfChildrenControl) {
      numberOfChildrenControl.valueChanges
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe(() => {
          // Marcar como touched para mostrar errores inmediatamente
          numberOfChildrenControl.markAsTouched();
          // Usar emitEvent: false para evitar bucle infinito
          numberOfChildrenControl.updateValueAndValidity({ emitEvent: false });
          // Forzar detección de cambios para actualizar los mensajes de error
          this._changeDetectorRef.markForCheck();
        });
    }

    // Lista de configuraciones de servicios para validación dinámica
    const serviceConfigs = [
      { boolean: 'breakfast', from: 'breakfastFrom', to: 'breakfastTo' },
      { boolean: 'lunch', from: 'lunchFrom', to: 'lunchTo' },
      { boolean: 'snackAM', from: 'snackAMFrom', to: 'snackAMTo' },
      { boolean: 'snackPM', from: 'snackPMFrom', to: 'snackPMTo' },
      { boolean: 'dinner', from: 'dinnerFrom', to: 'dinnerTo' },
      { boolean: 'snackNight', from: 'snackNightFrom', to: 'snackNightTo' },
      { boolean: 'dinnerExtended', from: 'dinnerExtendedFrom', to: 'dinnerExtendedTo' },
      { boolean: 'dinnerAtRisk', from: 'dinnerAtRiskFrom', to: 'dinnerAtRiskTo' },
      { boolean: 'snackExtended', from: 'snackExtendedFrom', to: 'snackExtendedTo' },
      { boolean: 'snackAtRisk', from: 'snackAtRiskFrom', to: 'snackAtRiskTo' },
    ];

    serviceConfigs.forEach(({ boolean, from, to }) => {
      const booleanControl = this.serviceForm.get(boolean);
      const fromControl = this.serviceForm.get(from);
      const toControl = this.serviceForm.get(to);

      if (booleanControl && fromControl && toControl) {
        // Función para actualizar validadores
        const updateValidators = (isChecked: boolean) => {
          if (isChecked) {
            fromControl.setValidators([Validators.required]);
            toControl.setValidators([Validators.required]);
          } else {
            fromControl.clearValidators();
            toControl.clearValidators();
            fromControl.setValue(null, { emitEvent: false });
            toControl.setValue(null, { emitEvent: false });
          }
          fromControl.updateValueAndValidity({ emitEvent: false });
          toControl.updateValueAndValidity({ emitEvent: false });
        };

        // Suscribirse a cambios en el checkbox
        booleanControl.valueChanges
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe((isChecked) => {
            updateValidators(isChecked);
          });

        // Inicializar estado actual
        updateValidators(booleanControl.value);
      }
    });

    // Configurar suscripciones para ajustar automáticamente la hora "hasta" cuando cambia la hora "desde"
    const timePairs = [
      { from: 'breakfastFrom', to: 'breakfastTo' },
      { from: 'lunchFrom', to: 'lunchTo' },
      { from: 'snackAMFrom', to: 'snackAMTo' },
      { from: 'dinnerFrom', to: 'dinnerTo' },
      { from: 'snackPMFrom', to: 'snackPMTo' },
      { from: 'snackNightFrom', to: 'snackNightTo' },
      { from: 'dinnerExtendedFrom', to: 'dinnerExtendedTo' },
      { from: 'dinnerAtRiskFrom', to: 'dinnerAtRiskTo' },
      { from: 'snackExtendedFrom', to: 'snackExtendedTo' },
      { from: 'snackAtRiskFrom', to: 'snackAtRiskTo' },
    ];

    timePairs.forEach(({ from, to }) => {
      const fromControl = this.serviceForm.get(from);
      const toControl = this.serviceForm.get(to);

      if (fromControl && toControl) {
        // Suscribirse a cambios en "Hora desde" para validar y ajustar "Hora hasta"
        fromControl.valueChanges
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe(() => {
            TimeValidationUtil.validateAndAdjustTimeRange(fromControl, toControl);
            TimeValidationUtil.validateTimeRange(fromControl, toControl);
            // Forzar detección de cambios para actualizar las opciones en el template
            this._changeDetectorRef.detectChanges();
          });

        // Suscribirse a cambios en "Hora hasta" para validar y ajustar si es necesario
        toControl.valueChanges
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe(() => {
            TimeValidationUtil.validateAndAdjustTimeRange(fromControl, toControl);
            TimeValidationUtil.validateTimeRange(fromControl, toControl);
          });
      }
    });
  }

  ngOnDestroy(): void {
    // Cancelar todas las suscripciones
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  /**
   * Determina si se debe mostrar el servicio de Cena (fallback cuando no hay serviceTypes).
   * Se muestra para PACNA y PSAV, no para PDAM.
   */
  shouldShowDinner(): boolean {
    return this.data?.isPACNA === true || this.data?.isPSAV === true;
  }

  /**
   * Determina si se debe mostrar el servicio de Merienda Nocturna (fallback cuando no hay serviceTypes).
   * Se muestra solo para PACNA.
   */
  shouldShowSnackNight(): boolean {
    return this.data?.isPACNA === true;
  }

  /**
   * Determina si se deben mostrar los servicios adicionales de PACNA (fallback cuando no hay serviceTypes).
   */
  shouldShowPACNAServices(): boolean {
    return this.data?.isPACNA === true;
  }

  /** TrackBy para el ngFor de servicios por item.st.id. */
  trackByServiceId(_index: number, item: { st: { id: number } }): number {
    return item.st.id;
  }

  /**
   * Lista de servicios a mostrar con sus claves de formulario.
   * Si data.serviceTypes existe y tiene elementos, se usa (orden por displayOrder).
   * Si no, se usa fallback con ServiceTypes + reglas isPDAM/isPACNA/isPSAV (AESAN-257).
   */
  getVisibleServiceTypesWithKeys(): Array<{ st: { id: number; name: string; nameEN: string; displayOrder: number }; formKey: { bool: string; from: string; to: string } }> {
    const formKey = (id: number) => SERVICE_TYPE_ID_TO_FORM_KEY[id];
    if (this.data?.serviceTypes && this.data.serviceTypes.length > 0) {
      return [...this.data.serviceTypes]
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .filter((st) => formKey(st.id))
        .map((st) => ({ st, formKey: formKey(st.id)! }));
    }
    const pacnaServiceIds: number[] = [
      ServiceTypeIds.DinnerExtended,
      ServiceTypeIds.DinnerAtRisk,
      ServiceTypeIds.SnackExtended,
      ServiceTypeIds.SnackAtRisk,
    ];
    const fallback = ServiceTypes.filter((st) => {
      if (st.id === ServiceTypeIds.Dinner) return this.shouldShowDinner();
      if (st.id === ServiceTypeIds.SnackNight) return this.shouldShowSnackNight();
      if (pacnaServiceIds.includes(st.id)) return this.shouldShowPACNAServices();
      return true;
    });
    return fallback
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map((st) => ({ st, formKey: formKey(st.id)! }));
  }

  /**
   * Wrapper para convertir string de tiempo a Date
   */
  timeStringToDateWrapper(timeString: string): Date | null {
    return timeStringToDate(timeString);
  }

  /**
   * Obtiene las opciones filtradas para un campo "desde" basado en las horas de funcionamiento
   */
  getStartTimeOptions(): TimeOption[] {
    const operatingStartTime = this.data?.operatingStartTime;
    const operatingEndTime = this.data?.operatingEndTime;

    return filterStartTimeOptions(this.timeOptions, operatingStartTime, operatingEndTime);
  }

  /**
   * Obtiene las opciones filtradas para un campo "hasta" basado en la hora "desde"
   */
  getEndTimeOptions(fromField: string): TimeOption[] {
    const fromControl = this.serviceForm.get(fromField);
    if (!fromControl) return this.timeOptions;

    const fromTime = fromControl.value;
    const operatingStartTime = this.data?.operatingStartTime;
    const operatingEndTime = this.data?.operatingEndTime;

    return getEndTimeOptions(this.timeOptions, fromTime, '23:59', operatingStartTime, operatingEndTime);
  }

  /**
   * Crea un validador personalizado para la cantidad de niños
   * Valida que:
   * 1. La cantidad no exceda la capacidad del salón comedor
   * 2. La suma de todos los grupos no exceda la matrícula general
   */
  private createNumberOfChildrenValidator(
    generalEnrollment?: number,
    diningRoomCapacity?: number,
    existingGroups?: Array<{ id?: number; numberOfChildren?: number }>,
    currentGroupId?: number
  ): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value || control.value === 0) {
        return null; // El validador 'required' ya maneja esto
      }

      const numberOfChildren = Number(control.value);

      // Validar contra la capacidad del salón comedor
      if (diningRoomCapacity && numberOfChildren > diningRoomCapacity) {
        return {
          exceedsCapacity: {
            value: numberOfChildren,
            maxCapacity: diningRoomCapacity
          }
        };
      }

      // Validar contra la matrícula general
      if (generalEnrollment) {
        // Calcular la suma de todos los grupos existentes (excluyendo el grupo actual si está en edición)
        const otherGroupsTotal = (existingGroups || [])
          .filter(group => group.id !== currentGroupId)
          .reduce((sum, group) => sum + (group.numberOfChildren || 0), 0);

        const totalWithCurrent = otherGroupsTotal + numberOfChildren;

        if (totalWithCurrent > generalEnrollment) {
          return {
            exceedsEnrollment: {
              value: numberOfChildren,
              otherGroupsTotal: otherGroupsTotal,
              total: totalWithCurrent,
              maxEnrollment: generalEnrollment
            }
          };
        }
      }

      return null;
    };
  }


  /**
   * Cierra el diálogo sin guardar cambios
   */
  onCancel(): void {
    this.dialogRef.close();
  }

  /**
   * Guarda los cambios y cierra el diálogo
   */
  onSubmit(): void {
    if (this.serviceForm.invalid) {
      this.serviceForm.markAllAsTouched();
      return;
    }

    const formValue = this.serviceForm.value;

    // Convertir horarios a string usando toTimeString
    const processedData = {
      ...formValue,
      breakfastFrom: formValue.breakfastFrom ? toTimeString(formValue.breakfastFrom) : null,
      breakfastTo: formValue.breakfastTo ? toTimeString(formValue.breakfastTo) : null,
      lunchFrom: formValue.lunchFrom ? toTimeString(formValue.lunchFrom) : null,
      lunchTo: formValue.lunchTo ? toTimeString(formValue.lunchTo) : null,
      snackAMFrom: formValue.snackAMFrom ? toTimeString(formValue.snackAMFrom) : null,
      snackAMTo: formValue.snackAMTo ? toTimeString(formValue.snackAMTo) : null,
      dinnerFrom: formValue.dinnerFrom ? toTimeString(formValue.dinnerFrom) : null,
      dinnerTo: formValue.dinnerTo ? toTimeString(formValue.dinnerTo) : null,
      snackPMFrom: formValue.snackPMFrom ? toTimeString(formValue.snackPMFrom) : null,
      snackPMTo: formValue.snackPMTo ? toTimeString(formValue.snackPMTo) : null,
      snackNightFrom: formValue.snackNightFrom ? toTimeString(formValue.snackNightFrom) : null,
      snackNightTo: formValue.snackNightTo ? toTimeString(formValue.snackNightTo) : null,
      dinnerExtendedFrom: formValue.dinnerExtendedFrom ? toTimeString(formValue.dinnerExtendedFrom) : null,
      dinnerExtendedTo: formValue.dinnerExtendedTo ? toTimeString(formValue.dinnerExtendedTo) : null,
      dinnerAtRiskFrom: formValue.dinnerAtRiskFrom ? toTimeString(formValue.dinnerAtRiskFrom) : null,
      dinnerAtRiskTo: formValue.dinnerAtRiskTo ? toTimeString(formValue.dinnerAtRiskTo) : null,
      snackExtendedFrom: formValue.snackExtendedFrom ? toTimeString(formValue.snackExtendedFrom) : null,
      snackExtendedTo: formValue.snackExtendedTo ? toTimeString(formValue.snackExtendedTo) : null,
      snackAtRiskFrom: formValue.snackAtRiskFrom ? toTimeString(formValue.snackAtRiskFrom) : null,
      snackAtRiskTo: formValue.snackAtRiskTo ? toTimeString(formValue.snackAtRiskTo) : null,
    };

    this.dialogRef.close(processedData);
  }
}
