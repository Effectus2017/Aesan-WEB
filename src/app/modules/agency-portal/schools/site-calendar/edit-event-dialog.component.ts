import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslocoModule } from '@ngneat/transloco';
import { CalendarEvent } from 'angular-calendar';
import { SiteOperatingDay } from '../site-calendar.service';

export interface EditEventDialogData {
  form: FormGroup;
  event: CalendarEvent;
  operatingDay: SiteOperatingDay;
  schoolId: number;
}

@Component({
  selector: 'app-edit-event-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatIconModule,
    MatTimepickerModule,
    ReactiveFormsModule,
    TranslocoModule
  ],
  template: `
    <div class="flex flex-col -m-6 max-h-screen min-w-100">
      <!-- Header -->
      <div class="flex justify-between items-center pr-3 pl-6 h-16 flex-0 sm:pr-5 sm:pl-8 bg-primary text-on-primary">
        <div class="text-lg font-medium">Editar Día de Funcionamiento</div>
        <button mat-icon-button [mat-dialog-close]="null" [tabIndex]="-1" [title]="'global.buttons.close' | transloco">
          <mat-icon class="text-current" [svgIcon]="'heroicons_outline:x-mark'"></mat-icon>
        </button>
      </div>

      <!-- Form -->
      <form class="flex overflow-y-auto flex-col flex-auto p-6" [formGroup]="data.form" (ngSubmit)="onSave()">
        <div class="flex flex-col gap-6">
          <!-- Información del día -->
          <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
              <strong>Fecha:</strong> {{ getFormattedDate() }}
            </p>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              <strong>Escuela:</strong> ID {{ data.schoolId }}
            </p>
          </div>

          <!-- Horarios -->
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <mat-form-field>
              <mat-label>Hora de Inicio</mat-label>
              <input
                matInput
                placeholder="Seleccionar hora de inicio"
                formControlName="startTime"
                [matTimepicker]="pickerStartTime"
                required>
              <mat-timepicker-toggle matIconSuffix [for]="pickerStartTime" />
              <mat-timepicker #pickerStartTime />
              <mat-error *ngIf="data.form.get('startTime')?.hasError('required')">
                La hora de inicio es requerida
              </mat-error>
            </mat-form-field>

            <mat-form-field>
              <mat-label>Hora de Fin</mat-label>
              <input
                matInput
                placeholder="Seleccionar hora de fin"
                formControlName="endTime"
                [matTimepicker]="pickerEndTime"
                required>
              <mat-timepicker-toggle matIconSuffix [for]="pickerEndTime" />
              <mat-timepicker #pickerEndTime />
              <mat-error *ngIf="data.form.get('endTime')?.hasError('required')">
                La hora de fin es requerida
              </mat-error>
            </mat-form-field>
          </div>

          <!-- Comentario -->
          <mat-form-field>
            <mat-label>Comentario</mat-label>
            <textarea matInput formControlName="comment" rows="3" placeholder="Descripción del día de funcionamiento..."></textarea>
          </mat-form-field>

          <!-- Opciones -->
          <div class="flex flex-col gap-3">
            <mat-checkbox formControlName="isWeekendOverride">
              Sobrescribir fin de semana
            </mat-checkbox>

            <mat-checkbox formControlName="isExcluded">
              Excluir día (no operativo)
            </mat-checkbox>
          </div>

          <!-- Actions -->
          <div class="flex flex-col justify-between mt-4 sm:flex-row sm:items-center">
            <button mat-flat-button type="button" [color]="'warn'" [mat-dialog-close]="null">
              Cancelar
            </button>
            <button mat-flat-button type="submit" [color]="'primary'" [disabled]="!data.form.valid">
              Guardar
            </button>
          </div>
        </div>
      </form>
    </div>
  `,
  styles: []
})
export class EditEventDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<EditEventDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EditEventDialogData
  ) {}

  getFormattedDate(): string {
    const date = new Date(this.data.operatingDay.OperatingDate);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.data.form.valid) {
      this.dialogRef.close(this.data.form.value);
    }
  }
}
