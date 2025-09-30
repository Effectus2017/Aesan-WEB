import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoModule } from '@ngneat/transloco';
import { CalendarEvent } from 'angular-calendar';
import { GenericTableComponent } from '../../../../shared/components/generic-table/generic-table.component';
import { GenericTableConfig, OnGenericTableHandler } from '../../../../shared/components/generic-table/generic-table.interface';
import { SchoolCalendarAddModalComponent } from '../school-calendar-add-modal/school-calendar-add-modal.component';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

export interface DayEventsModalData {
  date: Date;
  events: CalendarEvent[];
  tableConfig: GenericTableConfig;
  handler: OnGenericTableHandler;
  schoolId: number;
  onEventAdded?: () => void; // Callback para actualizar la tabla
}

@Component({
  selector: 'app-day-events-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    TranslocoModule,
    GenericTableComponent,
    ReactiveFormsModule
  ],
  template: `
    <div class="flex flex-col -m-6 max-h-screen min-w-120">
      <!-- Header -->
      <div class="flex justify-between items-center pr-3 pl-6 h-16 flex-0 sm:pr-5 sm:pl-8 bg-primary text-on-primary">
        <div class="text-lg font-medium">
          Eventos del día: {{ data.date | date:'dd/MM/yyyy' }}
        </div>
        <button mat-icon-button [mat-dialog-close]="null" [tabIndex]="-1" [title]="'global.buttons.close' | transloco" [attr.aria-label]="'global.buttons.close' | transloco">
          <mat-icon class="text-current" [svgIcon]="'heroicons_outline:x-mark'" aria-hidden="true"></mat-icon>
        </button>
      </div>

      <!-- Content -->
      <div class="flex overflow-y-auto flex-col flex-auto p-6">
        <div class="flex flex-col gap-6">
          <!-- Información del día -->
          <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
              <strong>Fecha:</strong> {{ data.date | date:'dd/MM/yyyy' }}
            </p>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              <strong>Total de eventos:</strong> {{ data.events.length }}
            </p>
          </div>

          <!-- Tabla de eventos -->
          <div class="flex-1">
            <app-generic-table
              [config]="data.tableConfig"
              [handler]="data.handler"
              [darkMode]="false">
            </app-generic-table>
          </div>

          <!-- Actions -->
          <div class="flex flex-col justify-between mt-4 sm:flex-row sm:items-center">
            <div class="flex gap-2">
              <button mat-flat-button type="button" [color]="'warn'" [mat-dialog-close]="null">
                Cerrar
              </button>
            </div>
            <button
              mat-flat-button
              type="button"
              [color]="'primary'"
              (click)="addEvent()">
              <mat-icon [svgIcon]="'heroicons_outline:plus'" class="mr-2"></mat-icon>
              Agregar Evento
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DayEventsModalComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<DayEventsModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DayEventsModalData,
    private dialog: MatDialog,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    console.log('DayEventsModal opened with data:', this.data);
  }

  addEvent(): void {
    // Crear formulario para el modal de agregar
    const addForm = this.formBuilder.group({
      startTime: [''],
      endTime: [''],
      comment: [''],
      isWeekendOverride: [false],
      isExcluded: [false]
    });

    // Abrir modal hijo sin cerrar el padre
    const addDialogRef = this.dialog.open(SchoolCalendarAddModalComponent, {
      data: {
        date: this.data.date,
        schoolId: this.data.schoolId,
        form: addForm
      },
      disableClose: true,
      width: '600px'
    });

    addDialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Event added, refreshing table...');
        // Llamar callback para actualizar la tabla del modal padre
        if (this.data.onEventAdded) {
          this.data.onEventAdded();
        }
      }
    });
  }

  close(): void {
    this.dialogRef.close();
  }
}
