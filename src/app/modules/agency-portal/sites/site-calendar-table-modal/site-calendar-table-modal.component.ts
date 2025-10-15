import { Component, Inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoModule } from '@ngneat/transloco';
import { CalendarEvent } from 'angular-calendar';
import { GenericTableComponent } from '../../../../shared/components/generic-table/generic-table.component';
import { GenericTableConfig, OnGenericTableHandler } from '../../../../shared/components/generic-table/generic-table.interface';
import { SiteCalendarAddModalComponent } from '../site-calendar-add-modal/site-calendar-add-modal.component';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

export interface SiteCalendarTableModalData {
  date: Date;
  events: CalendarEvent[];
  tableConfig: GenericTableConfig;
  handler: OnGenericTableHandler;
  siteId: number;
  onEventAdded?: () => void; // Callback para actualizar la tabla
  onEventUpdated?: () => void; // Callback para actualizar la tabla después de editar
  modalComponent?: SiteCalendarTableModalComponent; // Referencia al componente del modal
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
  templateUrl: './site-calendar-table-modal.component.html'
})
export class SiteCalendarTableModalComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<SiteCalendarTableModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SiteCalendarTableModalData,
    private dialog: MatDialog,
    private formBuilder: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    console.log('SchoolCalendarTableModal opened with data:', this.data);

    // Asignar referencia al componente en los datos
    this.data.modalComponent = this;
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
      id: 0,
      siteId: this.data.siteId,
      date: this.data.date.toISOString().split('T')[0],
      startTime: '08:00',
      endTime: '16:00',
      isWeekendOverride: false,
      isExcluded: false,
      comment: '',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Abrir modal hijo sin cerrar el padre
      const addDialogRef = this.dialog.open(SiteCalendarAddModalComponent, {
      data: {
        date: this.data.date,
        siteId: this.data.siteId,
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
        startTime: formData.startTime,
        endTime: formData.endTime,
        comment: formData.comment,
        isWeekendOverride: formData.isWeekendOverride,
        isExcluded: formData.isExcluded
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


  // Método para actualizar la tabla después de editar un evento
  updateTableAfterEdit(): void {
    console.log('Updating table after edit...');

    // Llamar callback para actualizar la tabla del modal padre
    if (this.data.onEventUpdated) {
      this.data.onEventUpdated();
    }

    // Forzar detección de cambios
    this.cdr.detectChanges();
  }

  // Método para actualizar la tabla con nuevos datos
  updateTableData(newEvents: CalendarEvent[]): void {
    console.log('Updating table data with new events:', newEvents);

    // Transformar CalendarEvent a formato de tabla
    const tableData = newEvents.map(event => ({
      id: event.meta?.id,
      title: event.title,
      startTime: event.meta?.startTime ? this.formatTimeValue(event.meta.startTime) : 'N/A',
      endTime: event.meta?.endTime ? this.formatTimeValue(event.meta.endTime) : 'N/A',
      type: this.getEventType(event.meta),
      comment: event.meta?.comment || '',
      meta: event.meta
    }));

    // Actualizar el dataSource existente
    this.data.tableConfig.dataSourceList = tableData;
    this.data.tableConfig.dataSource.data = tableData;

    // Forzar detección de cambios
    this.cdr.detectChanges();

    console.log('Table data updated:', tableData);
  }

  private formatTimeValue(timeValue: any): string {
    if (!timeValue) return '';

    // Si es un string, convertir de 24h a 12h si es necesario
    if (typeof timeValue === 'string') {
      // Si ya está en formato 12h (contiene AM/PM), devolverlo tal como está
      if (timeValue.includes('AM') || timeValue.includes('PM')) {
        return timeValue;
      }
      // Si está en formato 24h, convertir a 12h
      const time24Match = timeValue.match(/(\d{1,2}):(\d{2})/);
      if (time24Match) {
        const hours = parseInt(time24Match[1]);
        const minutes = time24Match[2];
        return this.convert24To12(hours, minutes);
      }
      return timeValue;
    }

    // Si es un objeto DateTime (Luxon), convertir a string
    if (timeValue && typeof timeValue === 'object' && timeValue.toFormat) {
      return timeValue.toFormat('hh:mm a'); // Formato 12h con AM/PM
    }

    // Si es un objeto Date, convertir a string
    if (timeValue instanceof Date) {
      return timeValue.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }); // Formato 12h con AM/PM
    }

    // Fallback: convertir a string
    return String(timeValue);
  }

  private convert24To12(hours24: number, minutes: string): string {
    let hours12 = hours24;
    let period = 'AM';

    if (hours24 === 0) {
      hours12 = 12;
    } else if (hours24 === 12) {
      period = 'PM';
    } else if (hours24 > 12) {
      hours12 = hours24 - 12;
      period = 'PM';
    }

    return `${hours12}:${minutes} ${period}`;
  }

  close(): void {
    this.dialogRef.close();
  }
}
