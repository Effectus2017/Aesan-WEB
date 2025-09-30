import { Component, Inject, OnInit, ChangeDetectorRef } from '@angular/core';
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

export interface SchoolCalendarTableModalData {
  date: Date;
  events: CalendarEvent[];
  tableConfig: GenericTableConfig;
  handler: OnGenericTableHandler;
  schoolId: number;
  onEventAdded?: () => void; // Callback para actualizar la tabla
}

@Component({
  selector: 'app-school-calendar-table-modal',
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
  templateUrl: './school-calendar-table-modal.component.html'
})
export class SchoolCalendarTableModalComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<SchoolCalendarTableModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SchoolCalendarTableModalData,
    private dialog: MatDialog,
    private formBuilder: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    console.log('SchoolCalendarTableModal opened with data:', this.data);
  }

  addEvent(): void {
    // Crear formulario para el modal de agregar
    const addForm = this.formBuilder.group({
      startTime: ['08:00'],
      endTime: ['16:00'],
      comment: [''],
      isWeekendOverride: [false],
      isExcluded: [false]
    });

    // Crear un día vacío para el modal
    const newDay = {
      Id: 0,
      SchoolId: this.data.schoolId,
      OperatingDate: this.data.date,
      StartTime: '08:00',
      EndTime: '16:00',
      IsWeekendOverride: false,
      IsExcluded: false,
      Comment: '',
      CreatedAt: new Date(),
      UpdatedAt: new Date()
    };

    // Abrir modal hijo sin cerrar el padre
    const addDialogRef = this.dialog.open(SchoolCalendarAddModalComponent, {
      data: {
        date: this.data.date,
        schoolId: this.data.schoolId,
        form: addForm,
        operatingDay: newDay
      },
      disableClose: true,
      width: '600px'
    });

    addDialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Event added, processing result:', result);
        // Procesar el resultado y agregar el evento usando el handler
        this.processAddEventResult(newDay, result);
      }
    });
  }

  private processAddEventResult(operatingDay: any, formData: any): void {
    console.log('Processing add event result:', { operatingDay, formData });

    // Agregar directamente a la tabla sin depender de la colección
    this.addEventToTable(operatingDay, formData);

    // Usar el handler del componente padre para agregar el evento a la colección
    if (this.data.handler && typeof (this.data.handler as any).addOperatingDay === 'function') {
      (this.data.handler as any).addOperatingDay(operatingDay, formData);
    }

    // Llamar callback para actualizar la tabla del modal padre
    if (this.data.onEventAdded) {
      this.data.onEventAdded();
    }
  }

  private addEventToTable(operatingDay: any, formData: any): void {
    // Crear el nuevo evento para la tabla
    const newEvent = {
      id: Date.now(),
      title: this.getEventTitle(formData),
      startTime: formData.startTime,
      endTime: formData.endTime,
      type: this.getEventType(formData),
      comment: formData.comment,
      meta: {
        ...operatingDay,
        StartTime: formData.startTime,
        EndTime: formData.endTime,
        Comment: formData.comment,
        IsWeekendOverride: formData.isWeekendOverride,
        IsExcluded: formData.isExcluded
      }
    };

    // Agregar directamente a la tabla
    this.data.tableConfig.dataSourceList.push(newEvent);
    this.data.tableConfig.dataSource.data = this.data.tableConfig.dataSourceList;

    // Forzar detección de cambios
    this.cdr.detectChanges();
  }

  private getEventTitle(formData: any): string {
    if (formData.isExcluded) return 'Día cerrado';
    if (formData.isWeekendOverride) return 'Fin de semana';
    return 'Día normal';
  }

  private getEventType(formData: any): string {
    if (formData.isExcluded) return 'Día cerrado';
    if (formData.isWeekendOverride) return 'Fin de semana';
    return 'Día normal';
  }


  close(): void {
    this.dialogRef.close();
  }
}
