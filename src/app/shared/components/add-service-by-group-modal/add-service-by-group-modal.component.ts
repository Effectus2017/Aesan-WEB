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
import {
  toTimeString,
  timeStringToDate,
  generateTimeOptions,
  filterStartTimeOptions,
  getEndTimeOptions,
  compareByTime,
  TimeOption,
  dateToMinutes,
  timeToMinutes,
} from 'app/shared/utils';
import { OptionSelection } from 'app/shared/models/OptionSelection';
import { ServiceTypeByProgram } from 'app/shared/models/ServiceTypeByProgram';
import { SiteChildGroupServiceSlotRequest } from 'app/shared/models/Request/SiteChildGroupServiceSlotRequest';
import { ServiceTypeIds, ServiceTypes } from 'app/shared/constants/service-type.constants';
import { provideNativeDateAdapter } from '@angular/material/core';
import { NumericOnlyDirective } from 'app/shared/directives/numeric-only.directive';
import { Subject, takeUntil } from 'rxjs';
import { TimeValidationUtil } from 'app/shared/utils/time-validation.util';

/** Entrada del mapeo ServiceTypeId -> nombres de controles (bool, from, to). */
export interface ServiceTypeFormKeyEntry {
  bool: string;
  from: string;
  to: string;
}

/** Mapeo ServiceTypeId -> nombres de controles del formulario (AESAN-257). */
const SERVICE_TYPE_ID_TO_FORM_KEY: Record<number, ServiceTypeFormKeyEntry> = {
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

  /** Slots de servicio por ServiceTypeId (nuevo formato). Si se pasa, el formulario se rellena desde aquí en lugar del formato ancho. */
  serviceSlots?: SiteChildGroupServiceSlotRequest[];

  // Horas de funcionamiento para limitar opciones de tiempo
  operatingStartTime?: Date | string | null;
  operatingEndTime?: Date | string | null;
}

/** Resultado al cerrar el modal con guardar: datos del grupo y lista de slots (serviceSlots). */
export interface ServiceByGroupDialogResult {
  id?: number;
  groupName: string;
  numberOfChildren: number;
  serviceSlots: SiteChildGroupServiceSlotRequest[];
}

/** Errores de validación de servicios fuertes y tiempo entre servicios (AESAN-257). */
export interface ServiceValidationErrors {
  missingStrongService?: { strongServiceNames: string };
  insufficientTimeBetween?: { nameA: string; nameB: string; minMinutes: number };
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

  /** Errores de validación de servicios fuertes y tiempo mínimo entre servicios. */
  serviceValidationErrors: ServiceValidationErrors | null = null;
  isLoading = false;

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

    // Si se pasan serviceSlots (nuevo formato), rellenar el formulario desde ellos.
    // La API devuelve fromTime/toTime; el modal acepta fromTime/toTime o from/to (compat).
    if (data?.serviceSlots && data.serviceSlots.length > 0) {
      for (const slot of data.serviceSlots) {
        const formKey = SERVICE_TYPE_ID_TO_FORM_KEY[slot.serviceTypeId];
        if (formKey) {
          const fromStr = slot.fromTime ?? (slot as { from?: string }).from;
          const toStr = slot.toTime ?? (slot as { to?: string }).to;
          this.serviceForm.get(formKey.bool)?.setValue(!!slot.isOffered, { emitEvent: false });
          this.serviceForm.get(formKey.from)?.setValue(fromStr ? timeStringToDate(fromStr) : null, { emitEvent: false });
          this.serviceForm.get(formKey.to)?.setValue(toStr ? timeStringToDate(toStr) : null, { emitEvent: false });
        }
      }
    }
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
            this.refreshServiceValidationErrors();
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
            this.refreshServiceValidationErrors();
            this._changeDetectorRef.markForCheck();
          });

        // Suscribirse a cambios en "Hora hasta" para validar y ajustar si es necesario
        toControl.valueChanges
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe(() => {
            TimeValidationUtil.validateAndAdjustTimeRange(fromControl, toControl);
            TimeValidationUtil.validateTimeRange(fromControl, toControl);
            this.refreshServiceValidationErrors();
            this._changeDetectorRef.markForCheck();
          });
      }
    });

    // Validación inicial por si se abre con datos ya inválidos (ej. mismos horarios en dos servicios)
    this.refreshServiceValidationErrors();
  }

  /**
   * Actualiza serviceValidationErrors con las validaciones de servicios fuertes y tiempo mínimo
   * entre servicios. Se llama al cambiar horas o al activar/desactivar servicios para que el
   * cartel se muestre en tiempo real (AESAN-257).
   */
  private refreshServiceValidationErrors(): void {
    const serviceTypes = this.data?.serviceTypes ?? [];
    if (serviceTypes.length === 0) {
      this.serviceValidationErrors = null;
      this._changeDetectorRef.markForCheck();
      return;
    }
    const strongError = this.validateStrongServices();
    const timeError = this.validateTimeBetweenServices();
    if (strongError != null || timeError != null) {
      this.serviceValidationErrors = {};
      if (strongError != null) {
        this.serviceValidationErrors.missingStrongService = { strongServiceNames: strongError };
      }
      if (timeError != null) {
        this.serviceValidationErrors.insufficientTimeBetween = timeError;
      }
    } else {
      this.serviceValidationErrors = null;
    }
    this._changeDetectorRef.markForCheck();
  }

  /** Indica si hay errores de validación de servicios (fuertes o tiempo mínimo) que bloquean guardar. */
  hasServiceValidationErrors(): boolean {
    if (!this.serviceValidationErrors) return false;
    return !!(
      this.serviceValidationErrors.missingStrongService ||
      this.serviceValidationErrors.insufficientTimeBetween
    );
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
   * Opciones de "Desde" para un servicio concreto. Solo se restringe por servicios que terminan
   * *antes* del candidato T: para cada opción T, se excluye si existe otro servicio A con
   * A.To < T y T < A.To + A.minMinutes. Así Desayuno no se limita por Almuerzo; Almuerzo sí por Desayuno (AESAN-257).
   */
  getStartTimeOptionsForItem(
    item: { st: { id: number }; formKey: { bool: string; from: string; to: string } }
  ): TimeOption[] {
    const options = this.getStartTimeOptions();
    const serviceTypes = this.data?.serviceTypes ?? [];
    if (serviceTypes.length === 0) return options;

    const items = this.getVisibleServiceTypesWithKeys();
    return options.filter((opt) => {
      const t = timeToMinutes(opt.value);
      for (const other of items) {
        if (other.st.id === item.st.id) continue;
        const boolVal = this.serviceForm.get(other.formKey.bool)?.value;
        const toVal = this.serviceForm.get(other.formKey.to)?.value;
        if (!boolVal || !toVal) continue;
        const otherTo =
          toVal instanceof Date ? dateToMinutes(toVal) : timeToMinutes(typeof toVal === 'string' ? toVal : String(toVal));
        const minMinutes = (other.st as ServiceTypeByProgram).minimumMinutesToNextService ?? 0;
        // "other" termina antes de t → exige t >= otherTo + minMinutes
        if (otherTo < t && t < otherTo + minMinutes) return false;
      }
      return true;
    });
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
      const maxEnrollment = Number(generalEnrollment);
      if (maxEnrollment != null && !Number.isNaN(maxEnrollment)) {
        // Calcular la suma de todos los grupos existentes (excluyendo el grupo actual si está en edición)
        const otherGroupsTotal = (existingGroups || [])
          .filter((group) => group.id != currentGroupId)
          .reduce((sum, group) => sum + Number(group.numberOfChildren ?? 0), 0);

        const totalWithCurrent = otherGroupsTotal + numberOfChildren;

        if (totalWithCurrent > maxEnrollment) {
          return {
            exceedsEnrollment: {
              value: numberOfChildren,
              otherGroupsTotal: otherGroupsTotal,
              total: totalWithCurrent,
              maxEnrollment: maxEnrollment
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
   * Construye la lista de servicios activos (marcados y con from/to) en orden de visualización
   * (displayOrder). El "servicio previo" es siempre el anterior en la lista: es ese el que fija
   * el mínimo de minutos que debe pasar antes del siguiente (AESAN-257).
   */
  private getActiveServiceSlots(): Array<{
    typeId: number;
    name: string;
    from: Date;
    to: Date;
    minimumMinutesToNextService: number | null;
  }> {
    const items = this.getVisibleServiceTypesWithKeys();
    const slots: Array<{
      typeId: number;
      name: string;
      from: Date;
      to: Date;
      minimumMinutesToNextService: number | null;
    }> = [];
    for (const { st, formKey } of items) {
      const boolVal = this.serviceForm.get(formKey.bool)?.value;
      const fromVal = this.serviceForm.get(formKey.from)?.value;
      const toVal = this.serviceForm.get(formKey.to)?.value;
      if (boolVal && fromVal instanceof Date && toVal instanceof Date) {
        const stProgram = st as ServiceTypeByProgram;
        slots.push({
          typeId: st.id,
          name: st.name,
          from: fromVal,
          to: toVal,
          minimumMinutesToNextService: stProgram.minimumMinutesToNextService ?? null,
        });
      }
    }
    return slots;
  }

  /**
   * Valida que haya al menos un servicio fuerte seleccionado (AESAN-257).
   * Solo aplica cuando data.serviceTypes existe y tiene tipos con isStrongService.
   */
  private validateStrongServices(): string | null {
    const serviceTypes = this.data?.serviceTypes ?? [];
    const strongTypes = serviceTypes.filter((st) => st.isStrongService);
    if (strongTypes.length === 0) return null;
    const strongIds = new Set(strongTypes.map((st) => st.id));
    const slots = this.getActiveServiceSlots();
    const hasStrong = slots.some((s) => strongIds.has(s.typeId));
    if (hasStrong) return null;
    const names = strongTypes.map((st) => st.name).join(', ');
    return names;
  }

  /**
   * Valida que entre cada par de servicios consecutivos (en orden de visualización) se respete
   * el mínimo de minutos del servicio previo: nameA es el anterior en la lista y fija minMinutes (AESAN-257).
   */
  private validateTimeBetweenServices(): { nameA: string; nameB: string; minMinutes: number } | null {
    const slots = this.getActiveServiceSlots();
    for (let i = 0; i < slots.length - 1; i++) {
      const minMinutes = slots[i].minimumMinutesToNextService ?? 0;
      if (minMinutes <= 0) continue;
      const toA = dateToMinutes(slots[i].to);
      const fromB = dateToMinutes(slots[i + 1].from);
      const gapMinutes = fromB - toA;
      if (gapMinutes < minMinutes) {
        return {
          nameA: slots[i].name,
          nameB: slots[i + 1].name,
          minMinutes,
        };
      }
    }
    return null;
  }

  /**
   * Guarda los cambios y cierra el diálogo
   */
  onSubmit(): void {
    if (this.isLoading) return;
    this.serviceValidationErrors = null;
    if (this.serviceForm.invalid) {
      this.serviceForm.markAllAsTouched();
      return;
    }

    const serviceTypes = this.data?.serviceTypes ?? [];
    if (serviceTypes.length > 0) {
      const strongError = this.validateStrongServices();
      const timeError = this.validateTimeBetweenServices();
      if (strongError != null || timeError != null) {
        this.serviceValidationErrors = {};
        if (strongError != null) {
          this.serviceValidationErrors.missingStrongService = { strongServiceNames: strongError };
        }
        if (timeError != null) {
          this.serviceValidationErrors.insufficientTimeBetween = timeError;
        }
        this.serviceForm.markAllAsTouched();
        this._changeDetectorRef.markForCheck();
        return;
      }
    }

    const formValue = this.serviceForm.value;

    // Construir serviceSlots desde el formulario (formato normalizado por ServiceTypeId)
    // Preservar operatingDates del slot inicial (mismo serviceTypeId) para no perder días al editar desde el sitio
    const serviceSlots: SiteChildGroupServiceSlotRequest[] = [];
    const items = this.getVisibleServiceTypesWithKeys();
    for (const { st, formKey } of items) {
      const boolVal = this.serviceForm.get(formKey.bool)?.value;
      const fromVal = this.serviceForm.get(formKey.from)?.value;
      const toVal = this.serviceForm.get(formKey.to)?.value;
      const isOffered = !!boolVal && fromVal instanceof Date && toVal instanceof Date;
      const initialSlot = this.data?.serviceSlots?.find(
        (s) => Number(s.serviceTypeId) === Number(st.id)
      );
      serviceSlots.push({
        serviceTypeId: st.id,
        isOffered,
        fromTime: isOffered && fromVal ? toTimeString(fromVal) : undefined,
        toTime: isOffered && toVal ? toTimeString(toVal) : undefined,
        operatingDates: initialSlot?.operatingDates ?? [],
      });
    }

    const result: ServiceByGroupDialogResult = {
      id: formValue.id,
      groupName: formValue.groupName,
      numberOfChildren: formValue.numberOfChildren,
      serviceSlots,
    };
    this.dialogRef.close(result);
  }
}
