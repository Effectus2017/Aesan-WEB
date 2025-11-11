import { Component, Inject, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { CalendarEvent } from 'angular-calendar';
import { GenericTableComponent } from '../../../../shared/components/generic-table/generic-table.component';
import { SiteCalendarAddModalComponent } from '../site-calendar-add-modal/site-calendar-add-modal.component';
import { SiteCalendarServiceAddModalComponent } from '../site-calendar-service-add-modal/site-calendar-service-add-modal.component';
import { SiteCalendarServiceAddModalData } from '../site-calendar-service-add-modal/site-calendar-service-add-modal-data.interface';
import { SiteOperatingDayServiceService } from 'app/shared/services/site-operating-day-service.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SiteCalendarTableModalData } from './site-calendar-table-modal-data.interface';
import { NotificationService } from 'app/shared/services/notification.service';

@Component({
  selector: 'app-school-calendar-table-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, TranslocoModule, GenericTableComponent, ReactiveFormsModule],
  templateUrl: './site-calendar-table-modal.component.html',
})
export class SiteCalendarTableModalComponent implements OnInit {
  private dialog: MatDialog = inject(MatDialog);
  private formBuilder: FormBuilder = inject(FormBuilder);
  private cdr: ChangeDetectorRef = inject(ChangeDetectorRef);
  private siteOperatingDayServiceService: SiteOperatingDayServiceService = inject(SiteOperatingDayServiceService);
  private translocoService: TranslocoService = inject(TranslocoService);
  private notificationService: NotificationService = inject(NotificationService);

  totalEvents: number = 0;

  constructor(public dialogRef: MatDialogRef<SiteCalendarTableModalComponent>, @Inject(MAT_DIALOG_DATA) public data: SiteCalendarTableModalData) {}

  ngOnInit(): void {
    console.log('SchoolCalendarTableModal opened with data:', this.data);

    // Asignar referencia al componente en los datos
    this.data.modalComponent = this;

    // Inicializar la tabla con los eventos del día (días y servicios)
    if (this.data.events && this.data.events.length > 0) {
      this.updateTableData(this.data.events);
    } else {
      // Si no hay eventos, inicializar la tabla vacía pero asegurar que los servicios se muestren si existen
      this.updateTableData([]);
    }
  }

  addEvent(): void {
    // Crear formulario para el modal de agregar
    const addForm = this.formBuilder.group({
      startTime: ['08:00'],
      endTime: ['19:00'],
      comment: [''],
      isWeekendOverride: [false],
      isExcluded: [false],
    });

    // Crear un día vacío para el modal
    const newDay = {
      id: 0,
      siteId: this.data.siteId,
      date: this.data.date.toISOString().split('T')[0],
      startTime: '08:00',
      endTime: '19:00',
      isWeekendOverride: false,
      isExcluded: false,
      comment: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Abrir modal hijo sin cerrar el padre
    const addDialogRef = this.dialog.open(SiteCalendarAddModalComponent, {
      data: {
        date: this.data.date,
        siteId: this.data.siteId,
        form: addForm,
        operatingDay: newDay,
      },
      disableClose: true,
      width: '600px',
    });

    addDialogRef.afterClosed().subscribe((result) => {
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
      title: this.getEventTitle(formData, this.data.date), // Usar fecha del día
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
        isExcluded: formData.isExcluded,
      },
      isService: false // Identificar que es un día de funcionamiento
    };

    // Agregar directamente a la tabla al inicio (los días van primero)
    this.data.tableConfig.dataSourceList.unshift(newEvent);
    this.data.tableConfig.dataSource.data = this.data.tableConfig.dataSourceList;

    // Forzar detección de cambios
    this.cdr.detectChanges();
  }

  private getEventTitle(formData: any, date: Date): string {
    // Usar la traducción para el título del día de funcionamiento
    return this.translocoService.translate('sites.calendar.day-events.operating-day-title');
  }

  private getEventType(formData: any): string {
    if (formData.isExcluded) {
      return this.translocoService.translate('sites.calendar.day-events.day-types.closed');
    }
    if (formData.isWeekendOverride) {
      return this.translocoService.translate('sites.calendar.day-events.day-types.weekend');
    }
    return this.translocoService.translate('sites.calendar.day-events.day-types.normal');
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

    // Separar días de funcionamiento de servicios
    const operatingDayEvents = newEvents.filter(event => !event.meta?.isService);
    const serviceEvents = newEvents.filter(event => event.meta?.isService === true);

    // Para días de funcionamiento, asegurarse de que solo haya uno por fecha
    // Si hay múltiples eventos del mismo día, usar solo el primero (por ID)
    const uniqueOperatingDayEvents = operatingDayEvents.filter((event, index, self) => {
      const eventId = event.meta?.id;
      return index === self.findIndex(e => e.meta?.id === eventId);
    });

    // Transformar CalendarEvent a formato de tabla (días de funcionamiento)
    // Solo incluir días de funcionamiento, no servicios
    const dayTableData = uniqueOperatingDayEvents.map((event) => ({
      id: event.meta?.id,
      title: this.getEventTitle(event.meta, this.data.date), // Usar fecha formateada
      startTime: event.meta?.startTime ? this.formatTimeValue(event.meta.startTime) : 'N/A',
      endTime: event.meta?.endTime ? this.formatTimeValue(event.meta.endTime) : 'N/A',
      type: this.getEventType(event.meta),
      comment: event.meta?.comment || '',
      meta: event.meta,
      isService: false // Identificar que es un día de funcionamiento
    }));

    // Transformar servicios de eventos del calendario
    const servicesTableDataFromEvents = serviceEvents.map(event => {
      const service = event.meta as any;
      return {
        id: service.id,
        title: this.getServiceTitle(service),
        startTime: service.startTime ? this.formatTimeValue(service.startTime) : 'N/A',
        endTime: service.endTime ? this.formatTimeValue(service.endTime) : 'N/A',
        type: this.getServiceTypeLabel(service),
        comment: service.comment || '',
        meta: service,
        isService: true, // Identificar que es un servicio
        isEnabled: service.isEnabled
      };
    });

    // Agregar servicios del día a la tabla (después del día)
    const servicesTableData: any[] = [...servicesTableDataFromEvents];

    // Obtener servicios desde el handler si está disponible (para servicios que no están en eventos del calendario)
    if (this.data.handler && typeof (this.data.handler as any).getOperatingDayForDate === 'function') {
      const operatingDay = (this.data.handler as any).getOperatingDayForDate(this.data.date);
      if (operatingDay?.services && operatingDay.services.length > 0) {
        const existingServiceIds = new Set(servicesTableData.map(s => s.id));
        operatingDay.services.forEach((service: any) => {
          if (!existingServiceIds.has(service.id)) {
            servicesTableData.push({
              id: service.id,
              title: this.getServiceTitle(service),
              startTime: service.startTime ? this.formatTimeValue(service.startTime) : 'N/A',
              endTime: service.endTime ? this.formatTimeValue(service.endTime) : 'N/A',
              type: this.getServiceTypeLabel(service),
              comment: service.comment || '',
              meta: service,
              isService: true, // Identificar que es un servicio
              isEnabled: service.isEnabled
            });
          }
        });
      }
    }

    // Combinar días de funcionamiento primero, luego servicios
    const tableData = [...dayTableData, ...servicesTableData];

    // Actualizar el contador de eventos totales
    this.totalEvents = tableData.length;

    // Actualizar el dataSource existente
    this.data.tableConfig.dataSourceList = tableData;
    this.data.tableConfig.dataSource.data = tableData;

    // Forzar detección de cambios
    this.cdr.detectChanges();

    console.log('Table data updated:', tableData);
  }

  private getServiceTitle(service: any): string {
    // Usar el nombre del servicio según el idioma actual
    const currentLang = this.translocoService.getActiveLang() || 'es';
    const serviceName = currentLang === 'es' ? service.serviceTypeName : service.serviceTypeNameEN;
    return serviceName || this.translocoService.translate('sites.calendar.day-events.service-fallback');
  }

  private getServiceTypeLabel(service: any): string {
    // Usar el nombre del servicio según el idioma actual
    const currentLang = this.translocoService.getActiveLang() || 'es';
    const serviceName = currentLang === 'es' ? service.serviceTypeName : service.serviceTypeNameEN;
    return serviceName || this.translocoService.translate('sites.calendar.day-events.service-fallback');
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
        hour12: true,
      }); // Formato 12h con AM/PM
    }

    // Fallback: convertir a string
    return String(timeValue);
  }

  private getAgencyPrograms(): number[] {
    try {
      const programsJson = localStorage.getItem('agencyPrograms');
      if (programsJson) {
        const parsedPrograms = JSON.parse(programsJson);
        return parsedPrograms.map((p: any) => p.id);
      }
    } catch (error) {
      console.error('Error al obtener programas de la agencia:', error);
    }
    return [];
  }

  private getIsDayCareHome(): boolean {
    try {
      const agencyJson = localStorage.getItem('agency');
      if (agencyJson) {
        const agency = JSON.parse(agencyJson);
        const isDayCareHomeOption = agency?.inscription?.isDayCareHome;
        // Convertir OptionSelection a boolean:
        // - Si booleanValue === true (Sí) → true
        // - Si booleanValue === null/undefined pero existe OptionSelection (Ambos) → true
        // - Si booleanValue === false (No) o no existe → false
        return isDayCareHomeOption
          ? (isDayCareHomeOption.booleanValue === true || isDayCareHomeOption.booleanValue == null)
          : false;
      }
    } catch (error) {
      console.error('Error al obtener información de day care home:', error);
    }
    return false;
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

  addService(): void {
    // Obtener el operatingDay desde el handler del componente padre
    if (this.data.handler && typeof (this.data.handler as any).getOperatingDayForDate === 'function') {
      const operatingDay = (this.data.handler as any).getOperatingDayForDate(this.data.date);

      if (operatingDay) {
        // Crear formulario para agregar servicio
        const serviceForm = this.formBuilder.group({
          serviceTypeId: ['', Validators.required],
          startTime: ['', Validators.required],
          endTime: ['', Validators.required],
          comment: [''],
          isEnabled: [true]
        });

        const dialogRef = this.dialog.open(SiteCalendarServiceAddModalComponent, {
          width: '600px',
          maxWidth: '90vw',
          data: {
            form: serviceForm,
            operatingDay: operatingDay,
            siteId: this.data.siteId,
            // Obtener programas desde localStorage
            programs: this.getAgencyPrograms(),
            // Obtener isDayCareHome desde localStorage o desde la agencia
            isDayCareHome: this.getIsDayCareHome()
          } as SiteCalendarServiceAddModalData
        });

        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            // Convertir formato de tiempo de HH:mm a HH:mm:ss para que ASP.NET Core pueda parsearlo como TimeSpan
            const formatTimeForApi = (time: string): string => {
              if (!time) return '00:00:00';

              // Si ya tiene formato HH:mm:ss, devolverlo tal cual
              const parts = time.split(':');
              if (parts.length === 3) {
                // Asegurar formato correcto con padding
                const hours = parts[0].padStart(2, '0');
                const minutes = parts[1].padStart(2, '0');
                const seconds = parts[2].padStart(2, '0');
                return `${hours}:${minutes}:${seconds}`;
              }

              // Si tiene formato HH:mm, agregar :00
              if (parts.length === 2) {
                const hours = parts[0].padStart(2, '0');
                const minutes = parts[1].padStart(2, '0');
                return `${hours}:${minutes}:00`;
              }

              // Fallback: devolver formato estándar
              return '00:00:00';
            };

            // Crear el servicio
            const request = {
              operatingDayId: operatingDay.id,
              serviceTypeId: result.serviceTypeId,
              startTime: formatTimeForApi(result.startTime),
              endTime: formatTimeForApi(result.endTime),
              comment: result.comment || '',
              isEnabled: result.isEnabled !== undefined ? result.isEnabled : true
            };

            console.log('Request being sent:', request);

            this.siteOperatingDayServiceService.createService(request).subscribe({
              next: () => {
                // Usar loadOperatingDaysAndUpdateModal si está disponible (actualiza el modal automáticamente)
                if (this.data.handler && typeof (this.data.handler as any).loadOperatingDaysAndUpdateModal === 'function') {
                  (this.data.handler as any).loadOperatingDaysAndUpdateModal();
                }
                // Si no está disponible, usar loadOperatingDays y luego actualizar manualmente
                else if (this.data.handler && typeof (this.data.handler as any).loadOperatingDays === 'function') {
                  (this.data.handler as any).loadOperatingDays();
                  // Actualizar tabla local después de un pequeño delay para asegurar que los datos se hayan cargado
                  setTimeout(() => {
                    this.refreshTableData();
                  }, 300);
                }
                // Si no hay handler, actualizar directamente
                else {
                  this.refreshTableData();
                }

                // Llamar callback para actualizar la tabla del modal padre
                if (this.data.onEventUpdated) {
                  this.data.onEventUpdated();
                }

                this.notificationService.showSuccess('Servicio agregado correctamente');
              },
              error: (error) => {
                console.error('Error al crear servicio:', error);

                // Extraer mensaje de error del response
                let errorMessage = 'Error al crear el servicio';

                if (error?.error) {
                  // Si el error viene como string directo (BadRequest con mensaje)
                  if (typeof error.error === 'string') {
                    errorMessage = error.error;
                  }
                  // Si el error viene como objeto con mensaje
                  else if (error.error.message) {
                    errorMessage = error.error.message;
                  }
                  // Si el error viene como objeto con múltiples mensajes (ModelState)
                  else if (error.error.errors) {
                    const errorMessages = Object.values(error.error.errors).flat();
                    errorMessage = Array.isArray(errorMessages) ? errorMessages.join(', ') : String(errorMessages);
                  }
                  // Si el error viene directamente en el body
                  else if (error.error.body) {
                    errorMessage = error.error.body;
                  }
                }

                // Si el error es un string directamente (algunos casos de HTTP)
                if (typeof error === 'string') {
                  errorMessage = error;
                }

                this.notificationService.showError(errorMessage);
              }
            });
          }
        });
      } else {
        console.warn('No se encontró el día de funcionamiento para esta fecha');
      }
    } else {
      console.warn('No se puede abrir modal de servicios: handler no disponible');
    }
  }

  close(): void {
    this.dialogRef.close();
  }

  /**
   * Verifica si ya existe un día de funcionamiento para la fecha actual
   */
  hasOperatingDay(): boolean {
    if (this.data.handler && typeof (this.data.handler as any).getOperatingDayForDate === 'function') {
      const operatingDay = (this.data.handler as any).getOperatingDayForDate(this.data.date);
      return operatingDay != null && operatingDay.id != null && operatingDay.id > 0;
    }
    // También verificar si hay eventos en los datos que no sean servicios
    if (this.data.events && this.data.events.length > 0) {
      return this.data.events.some(event => event.meta && event.meta.id && !event.meta.isService);
    }
    return false;
  }

  /**
   * Refresca los datos de la tabla obteniendo los servicios actualizados del handler
   */
  refreshTableData(): void {
    // Obtener los eventos actuales (días de funcionamiento)
    const currentEvents = this.data.events || [];

    // Actualizar la tabla con los eventos actuales y los servicios actualizados del handler
    this.updateTableData(currentEvents);
  }
}
