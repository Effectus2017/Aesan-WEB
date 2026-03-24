import { ChangeDetectorRef, Component, inject, Inject, OnInit, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoModule } from '@ngneat/transloco';
import { OptionSelection } from 'app/shared/models/common/OptionSelection';

export interface AppointmentConfigModalData {
  /** Opciones de Sí/No para "Visita coordinada". */
  yesNoOptions: OptionSelection[];
  /** Valor actual de appointmentCoordinated (boolean). */
  currentAppointmentCoordinated?: boolean | null;
  /** Fecha actual de la visita (opcional). */
  currentAppointmentDate?: Date | null;
  /** Comentarios actuales (opcional). */
  currentComments?: string | null;
}

export interface AppointmentConfigModalResult {
  appointmentCoordinated: boolean;
  appointmentDate: Date | null;
  comments: string | null;
}

@Component({
  selector: 'app-appointment-config-modal',
  standalone: true,
  templateUrl: './appointment-config-modal.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatInputModule,
    MatIconModule,
    TranslocoModule,
  ],
})
export class AppointmentConfigModalComponent implements OnInit {
  private _cdr = inject(ChangeDetectorRef);
  private _fb = inject(FormBuilder);

  form: FormGroup;
  yesNoOptions: OptionSelection[] = [];

  constructor(
    public dialogRef: MatDialogRef<AppointmentConfigModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AppointmentConfigModalData
  ) {
    // Buscar la opción que coincida con el valor booleano actual
    const currentOption = this.data.yesNoOptions?.find(
      (opt) => opt.booleanValue === this.data.currentAppointmentCoordinated
    );

    // Crear el formulario reactivo
    this.form = this._fb.group({
      appointmentCoordinated: [currentOption || null, Validators.required],
      appointmentDate: [this.data.currentAppointmentDate || null],
      comments: [this.data.currentComments || ''],
    });
  }

  ngOnInit(): void {
    this.yesNoOptions = this.data.yesNoOptions || [];

    // Observar cambios en appointmentCoordinated para validar appointmentDate
    this.form.get('appointmentCoordinated')?.valueChanges.subscribe((option: OptionSelection) => {
      const appointmentDateControl = this.form.get('appointmentDate');
      if (option?.booleanValue === true) {
        appointmentDateControl?.setValidators([Validators.required]);
      } else {
        appointmentDateControl?.clearValidators();
      }
      appointmentDateControl?.updateValueAndValidity();
      this._cdr.markForCheck();
    });

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

    const appointmentCoordinatedOption = this.form.get('appointmentCoordinated')?.value as OptionSelection;
    const result: AppointmentConfigModalResult = {
      appointmentCoordinated: appointmentCoordinatedOption?.booleanValue ?? false,
      appointmentDate: this.form.get('appointmentDate')?.value || null,
      comments: this.form.get('comments')?.value || null,
    };

    this.dialogRef.close(result);
  }
}
