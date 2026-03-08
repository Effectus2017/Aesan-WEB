import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslocoModule } from '@ngneat/transloco';
import { forkJoin } from 'rxjs';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SiteCalendarServiceAddModalData } from './site-calendar-service-add-modal-data.interface';
import { ServiceTypes, ServiceTypeOption } from 'app/shared/constants/service-type.constants';
import { TranslocoService } from '@ngneat/transloco';
import { PROGRAM_IDS } from 'app/shared/const';
import {
  generateTimeOptions,
  filterEndTimeOptions,
  normalizeTime,
  timeToMinutes,
  TimeOption
} from 'app/shared/utils';
import { ServiceTypeService } from 'app/shared/services/service-type.service';
import { ServiceTypeByProgram } from 'app/shared/models/program/ServiceTypeByProgram';

@Component({
  selector: 'app-site-calendar-service-add-modal',
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
    ReactiveFormsModule,
    TranslocoModule
  ],
  templateUrl: './site-calendar-service-add-modal.component.html',
  styles: [`
    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    .animate-slide-in {
      animation: fadeIn 1.0s ease-out;
    }
  `]
})
export class SiteCalendarServiceAddModalComponent implements OnInit, OnDestroy {
  timeOptions: TimeOption[] = [];
  startTimeOptions: TimeOption[] = [];
  endTimeOptions: TimeOption[] = [];
  serviceTypes: ServiceTypeOption[] = [];
  filteredServiceTypes: ServiceTypeOption[] = [];
  /** Tipos por programa (minimumMinutesToNextService) para filtrar horas y validar. */
  serviceTypesByProgram: ServiceTypeByProgram[] = [];
  currentLanguage: string = 'es';
  dayStartTime: string = '';
  dayEndTime: string = '';
  displayDate: Date;
  /** Error de tiempo mínimo entre servicios (no cerrar si está set). */
  timeValidationError: { nameA: string; nameB: string; minMinutes: number } | null = null;
  /** Error de solapamiento con otro servicio (horario ya en uso). */
  overlapValidationError: { nameA: string; nameB: string } | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    public dialogRef: MatDialogRef<SiteCalendarServiceAddModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SiteCalendarServiceAddModalData,
    private translocoService: TranslocoService,
    private serviceTypeService: ServiceTypeService
  ) {
    this.currentLanguage = this.translocoService.getActiveLang() || 'es';
    this.serviceTypes = ServiceTypes;
    this.initializeTimeConstraints();
    this.displayDate = this.parseDateSafe(this.data.operatingDay.date);
    this.filterServiceTypes();
  }

  ngOnInit(): void {
    this.generateTimeOptions();
    this.subscribeToChildGroupChanges();
    this.loadServiceTypesByProgram();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private subscribeToChildGroupChanges(): void {
    this.data.form
      .get('childGroupId')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.filterServiceTypes();
        this.updateStartTimeOptions();
        this.updateEndTimeOptions();
        this.overlapValidationError = null;
        this.timeValidationError = null;
      });
  }

  private loadServiceTypesByProgram(): void {
    let programIds = this.data.programs ?? [];
    if (!programIds.length) {
      try {
        const programsJson = localStorage.getItem('agencyPrograms');
        if (programsJson) {
          const parsed = JSON.parse(programsJson);
          programIds = (parsed as { id: number }[]).map((p) => p.id);
        }
      } catch {
        programIds = [];
      }
    }
    if (!programIds.length) {
      this.updateStartTimeOptions();
      return;
    }
    const requests = programIds.map((programId) =>
      this.serviceTypeService.getServiceTypesByProgram({ programId })
    );
    forkJoin(requests).subscribe({
      next: (responses) => {
        const all: ServiceTypeByProgram[] = [];
        const seenIds = new Set<number>();
        for (const res of responses) {
          const list = (res?.body ?? res ?? []) as ServiceTypeByProgram[];
          for (const st of list) {
            if (!seenIds.has(st.id)) {
              seenIds.add(st.id);
              all.push(st);
            }
          }
        }
        this.serviceTypesByProgram = all;
        this.updateStartTimeOptions();
      },
      error: () => {
        this.updateStartTimeOptions();
      }
    });
  }

  private parseDateSafe(dateString: string | Date): Date {
    if (!dateString) {
      return new Date();
    }

    // Si ya es un objeto Date, devolverlo
    if (dateString instanceof Date) {
      return new Date(dateString);
    }

    // Si es un string, parsearlo manualmente
    if (typeof dateString === 'string') {
      // Intentar parsear formato ISO "YYYY-MM-DD" o "YYYY-MM-DDTHH:mm:ss"
      const dateMatch = dateString.match(/(\d{4})-(\d{2})-(\d{2})/);
      if (dateMatch) {
        const year = parseInt(dateMatch[1], 10);
        const month = parseInt(dateMatch[2], 10) - 1; // Los meses en Date son 0-indexed
        const day = parseInt(dateMatch[3], 10);

        // Crear fecha en hora local (medianoche local) para preservar el día
        return new Date(year, month, day, 0, 0, 0, 0);
      }
    }

    // Fallback: usar constructor de Date normal
    return new Date(dateString);
  }

  private filterServiceTypes(): void {
    const programs = this.data.programs || [];
    const isDayCareHome = this.data.isDayCareHome || false;

    // Obtener programas desde localStorage si no están en data
    let agencyPrograms: number[] = programs;
    if (!programs || programs.length === 0) {
      const programsJson = localStorage.getItem('agencyPrograms');
      if (programsJson) {
        const parsedPrograms = JSON.parse(programsJson);
        agencyPrograms = parsedPrograms.map((p: any) => p.id);
      }
    }

    const hasPSAV = agencyPrograms.includes(PROGRAM_IDS.PSAV);
    const hasPACNA = agencyPrograms.includes(PROGRAM_IDS.PACNA);
    const hasPDAM = agencyPrograms.includes(PROGRAM_IDS.PDAM);

    // Servicios básicos disponibles para todos los programas
    const basicServices: number[] = [
      1, // Breakfast
      2, // Lunch
      3, // SnackAM
      5  // SnackPM
    ];

    // Servicios específicos de PSAV
    const psavServices: number[] = [
      4,  // Dinner
      6,  // SnackNight
      7,  // DinnerExtended
      8,  // DinnerAtRisk
      9,  // SnackExtended
      10  // SnackAtRisk
    ];

    // Filtrar servicios según programa y day care
    let filtered = this.serviceTypes.filter(service => {
      if (basicServices.includes(service.id)) return true;
      if (psavServices.includes(service.id)) return hasPSAV;
      return false;
    });

    // Excluir tipos ya existentes para el grupo seleccionado
    const childGroupId = this.data.form.get('childGroupId')?.value;
    const existingSlots = this.data.existingServiceSlots ?? [];
    const existingForGroup = existingSlots.filter((s) => s.childGroupId === childGroupId);
    const existingTypeIds = new Set(existingForGroup.map((s) => s.serviceTypeId));
    this.filteredServiceTypes = filtered.filter((s) => !existingTypeIds.has(s.id));
    this.filteredServiceTypes.sort((a, b) => a.displayOrder - b.displayOrder);
  }

  private initializeTimeConstraints(): void {
    // Obtener los horarios del día de funcionamiento
    // Prioridad: 1) operatingStartTime/operatingEndTime del sitio (si están disponibles), 2) operatingDay.startTime/endTime, 3) valores por defecto
    if (this.data.operatingStartTime && this.data.operatingEndTime) {
      // Usar las horas de funcionamiento del sitio como límites principales
      this.dayStartTime = this.data.operatingStartTime;
      this.dayEndTime = this.data.operatingEndTime;
    } else {
      // Fallback a las horas del día específico
      this.dayStartTime = this.data.operatingDay.startTime || '00:00';
      this.dayEndTime = this.data.operatingDay.endTime || '23:59';
    }

    // Normalizar formato (remover segundos si existen)
    this.dayStartTime = normalizeTime(this.dayStartTime);
    this.dayEndTime = normalizeTime(this.dayEndTime);
  }

  private generateTimeOptions(): void {
    this.timeOptions = generateTimeOptions(this.dayStartTime, this.dayEndTime);
    this.updateStartTimeOptions();
    this.updateEndTimeOptions();
    this.data.form
      .get('startTime')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateEndTimeOptions();
        this.overlapValidationError = null;
        this.timeValidationError = null;
      });
    this.data.form
      .get('endTime')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.overlapValidationError = null;
        this.timeValidationError = null;
      });
  }

  /** Opciones de hora de inicio filtradas: excluir solapamientos y respetar tiempo mínimo tras servicios existentes del grupo. */
  private getFilteredStartTimeOptions(): TimeOption[] {
    const options = this.timeOptions;
    const childGroupId = this.data.form.get('childGroupId')?.value;
    const existingSlots = this.data.existingServiceSlots ?? [];
    const existingForGroup = existingSlots.filter(
      (s) => s.childGroupId === childGroupId && s.startTime != null && s.endTime != null
    );
    if (existingForGroup.length === 0) {
      return this.serviceTypesByProgram.length === 0 ? options : options;
    }
    return options.filter((opt) => {
      const t = timeToMinutes(opt.value);
      for (const existing of existingForGroup) {
        const existingFrom = timeToMinutes(existing.startTime!);
        const existingTo = timeToMinutes(existing.endTime!);
        // No permitir inicio dentro de un slot ya usado (solapamiento)
        if (existingFrom <= t && t < existingTo) return false;
        // Tiempo mínimo entre servicios (inicio no dentro del margen tras el fin del existente)
        const stProgram = this.serviceTypesByProgram.find((st) => st.id === existing.serviceTypeId);
        const minMinutes = (stProgram?.minimumMinutesToNextService ?? 0) || 0;
        if (minMinutes > 0 && existingTo < t && t < existingTo + minMinutes) return false;
      }
      return true;
    });
  }

  private updateStartTimeOptions(): void {
    this.startTimeOptions = this.getFilteredStartTimeOptions();
  }

  private updateEndTimeOptions(): void {
    const selectedStartTime = this.data.form.get('startTime')?.value;

    // Usar operatingStartTime y operatingEndTime del sitio si están disponibles
    const operatingStartTime = this.data.operatingStartTime || null;
    const operatingEndTime = this.data.operatingEndTime || null;
    let endOpts = filterEndTimeOptions(this.timeOptions, selectedStartTime, this.dayEndTime, operatingStartTime, operatingEndTime);

    // Excluir horas de fin que solapen con servicios existentes del mismo grupo
    const childGroupId = this.data.form.get('childGroupId')?.value;
    const existingSlots = this.data.existingServiceSlots ?? [];
    const existingForGroup = existingSlots.filter(
      (s) => s.childGroupId === childGroupId && s.startTime != null && s.endTime != null
    );
    if (selectedStartTime && existingForGroup.length > 0) {
      const startM = timeToMinutes(selectedStartTime);
      // Para cada slot existente que termina después de nuestro inicio: no podemos terminar después de su inicio (solapamiento)
      let maxEndMinutes: number | null = null;
      for (const existing of existingForGroup) {
        const es = timeToMinutes(existing.startTime!);
        const ee = timeToMinutes(existing.endTime!);
        if (ee > startM && (maxEndMinutes == null || es < maxEndMinutes)) {
          maxEndMinutes = maxEndMinutes == null ? es : Math.min(maxEndMinutes, es);
        }
      }
      if (maxEndMinutes != null) {
        endOpts = endOpts.filter((opt) => timeToMinutes(opt.value) <= maxEndMinutes!);
      }
    }
    this.endTimeOptions = endOpts;

    // Si no hay hora de inicio seleccionada, no hacer nada más
    if (!selectedStartTime) {
      return;
    }

    const currentEndTime = this.data.form.get('endTime')?.value;

    // Si no hay hora de fin seleccionada, asignar automáticamente la primera opción válida
    if (!currentEndTime) {
      if (this.endTimeOptions.length > 0) {
        this.data.form.get('endTime')?.setValue(this.endTimeOptions[0].value, { emitEvent: false });
      }
      return;
    }

    // Si hay hora de fin pero es inválida (menor o igual a startTime o solapamiento), ajustarla
    const endMinutes = timeToMinutes(currentEndTime);
    const startMinutes = timeToMinutes(selectedStartTime);
    const currentNotInList = !this.endTimeOptions.some((o) => o.value === currentEndTime);

    if (endMinutes <= startMinutes || currentNotInList) {
      if (this.endTimeOptions.length > 0) {
        this.data.form.get('endTime')?.setValue(this.endTimeOptions[0].value, { emitEvent: false });
      } else {
        this.data.form.get('endTime')?.setValue('', { emitEvent: false });
      }
    }
  }

  isEndTimeInvalid(): boolean {
    const startTime = this.data.form.get('startTime')?.value;
    const endTime = this.data.form.get('endTime')?.value;

    if (!startTime || !endTime) {
      return false;
    }

    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);

    return endMinutes <= startMinutes;
  }

  /** Grupos del sitio para el selector (childGroupId obligatorio) */
  get childGroups(): { id: number; groupName: string; groupNameEN?: string }[] {
    return this.data.childGroups ?? [];
  }

  isFormValid(): boolean {
    const childGroupId = this.data.form.get('childGroupId')?.value;
    const startTime = this.data.form.get('startTime')?.value;
    const endTime = this.data.form.get('endTime')?.value;

    if (childGroupId === null || childGroupId === undefined || childGroupId === '') {
      return false;
    }
    if (!startTime || startTime === '' || startTime === null || startTime === undefined) {
      return false;
    }
    if (!endTime || endTime === '' || endTime === null || endTime === undefined) {
      return false;
    }
    if (!this.data.form.valid) {
      return false;
    }
    if (this.isEndTimeInvalid()) {
      return false;
    }
    if (this.timeValidationError || this.overlapValidationError) {
      return false;
    }
    return true;
  }

  getServiceTypeName(serviceTypeId: number): string {
    const serviceType = this.filteredServiceTypes.find(st => st.id === serviceTypeId) ||
                       this.serviceTypes.find(st => st.id === serviceTypeId);
    if (!serviceType) return '';
    return this.currentLanguage === 'es' ? serviceType.name : serviceType.nameEN;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  /** Valida solapamiento y tiempo mínimo entre el nuevo servicio y los existentes del grupo. */
  private validateTimeBetweenServices():
    | { kind: 'overlap'; nameA: string; nameB: string }
    | { kind: 'gap'; nameA: string; nameB: string; minMinutes: number }
    | null {
    const childGroupId = this.data.form.get('childGroupId')?.value;
    const serviceTypeId = this.data.form.get('serviceTypeId')?.value;
    const startTime = this.data.form.get('startTime')?.value;
    const endTime = this.data.form.get('endTime')?.value;
    if (
      childGroupId == null ||
      serviceTypeId == null ||
      !startTime ||
      !endTime ||
      this.serviceTypesByProgram.length === 0
    ) {
      return null;
    }
    const existingSlots = this.data.existingServiceSlots ?? [];
    const existingForGroup = existingSlots
      .filter((s) => s.childGroupId === childGroupId && s.startTime != null && s.endTime != null)
      .map((s) => ({
        serviceTypeId: s.serviceTypeId,
        startTime: s.startTime!,
        endTime: s.endTime!,
        name: this.getServiceTypeName(s.serviceTypeId)
      }));
    const newSlot = {
      serviceTypeId,
      startTime,
      endTime,
      name: this.getServiceTypeName(serviceTypeId)
    };
    const allSlots = [...existingForGroup, newSlot].sort(
      (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
    );
    for (let i = 0; i < allSlots.length - 1; i++) {
      const toA = timeToMinutes(allSlots[i].endTime);
      const fromB = timeToMinutes(allSlots[i + 1].startTime);
      const gapMinutes = fromB - toA;
      if (gapMinutes < 0) {
        return {
          kind: 'overlap',
          nameA: allSlots[i].name,
          nameB: allSlots[i + 1].name
        };
      }
      const stProgram = this.serviceTypesByProgram.find((st) => st.id === allSlots[i].serviceTypeId);
      const minMinutes = (stProgram?.minimumMinutesToNextService ?? 0) || 0;
      if (minMinutes > 0 && gapMinutes < minMinutes) {
        return {
          kind: 'gap',
          nameA: allSlots[i].name,
          nameB: allSlots[i + 1].name,
          minMinutes
        };
      }
    }
    return null;
  }

  onSave(): void {
    this.timeValidationError = null;
    this.overlapValidationError = null;
    if (!this.data.form.valid || this.isEndTimeInvalid()) {
      return;
    }
    const timeError = this.validateTimeBetweenServices();
    if (timeError) {
      if (timeError.kind === 'overlap') {
        this.overlapValidationError = { nameA: timeError.nameA, nameB: timeError.nameB };
      } else {
        this.timeValidationError = {
          nameA: timeError.nameA,
          nameB: timeError.nameB,
          minMinutes: timeError.minMinutes
        };
      }
      return;
    }
    this.dialogRef.close(this.data.form.value);
  }
}

