import { Component, Inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
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
import { toTimeString, timeStringToDate } from 'app/shared/utils';
import { OptionSelection } from 'app/shared/models/OptionSelection';
import { provideNativeDateAdapter } from '@angular/material/core';
import { NumericOnlyDirective } from 'app/shared/directives/numeric-only.directive';
import { Subject, takeUntil } from 'rxjs';
import { TimeValidationUtil } from 'app/shared/utils/time-validation.util';

export interface ServiceByGroupDialogData {
  id?: number;
  groupName?: string;
  numberOfChildren?: number;
  yesNoOptions?: OptionSelection[];

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
    MatTimepickerModule,
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
  private _unsubscribeAll: Subject<void> = new Subject<void>();

  constructor(
    private _formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<AddServiceByGroupModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ServiceByGroupDialogData,
    private _changeDetectorRef: ChangeDetectorRef
  ) {
    // Inicializar opciones Sí/No desde el data
    this.yesNoOptions = data?.yesNoOptions || [];

    this.serviceForm = this._formBuilder.group({
      id: [data?.id || 0],
      groupName: [data?.groupName || '', Validators.required],
      numberOfChildren: [data?.numberOfChildren || 0, [Validators.required, Validators.min(1)]],

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
   * Cierra el diálogo sin guardar cambios
   */
  onCancel(): void {
    this.dialogRef.close();
  }

  /**
   * Guarda los cambios y cierra el diálogo
   */
  onSubmit(): void {
    if (this.serviceForm.valid) {
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
}
