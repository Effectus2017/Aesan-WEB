import { Component, Input, OnInit, OnDestroy, OnChanges, DoCheck, SimpleChanges, ChangeDetectionStrategy, ChangeDetectorRef, inject, ContentChild, TemplateRef } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { ButtonConfig, GenericTableConfig, OnGenericTableHandler } from './generic-table.interface';
import {
  SiteChildGroupServiceSlotResponse,
  ServiceSlotDisplay,
  ServiceSlotOperatingDate
} from 'app/shared/models/response/SiteChildGroupServiceSlotResponse';
import { getServiceTypeStyle, SERVICE_TYPE_STYLES_BY_INDEX } from 'app/shared/constants/service-type-styles.constants';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { AuthService } from 'app/core/auth/auth.service';
import { Subject, takeUntil, Observable, of } from 'rxjs';
import { DisableIfAgencyRestrictedDirective } from 'app/shared/directives/disable-if-agency-restricted/disable-if-agency-restricted.directive';
import { formatTimeForDisplay } from 'app/shared/pipes/service-days-display.pipe';
import { ExtraDayServicesDisplayPipe } from 'app/shared/pipes/extra-day-services-display.pipe';
import { ServiceDaysIndicatorComponent } from 'app/shared/components/service-days-indicator/service-days-indicator.component';

@Component({
    selector: 'app-generic-table',
    templateUrl: './generic-table.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CommonModule, MatTableModule, MatIconModule, MatButtonModule, MatCheckboxModule, MatTooltipModule, MatMenuModule, TranslocoModule, DisableIfAgencyRestrictedDirective, ExtraDayServicesDisplayPipe, ServiceDaysIndicatorComponent],
    styles: [
        '.services-grid > *:last-child:nth-child(odd) { grid-column: span 2; }'
    ]
})
export class GenericTableComponent implements OnInit, OnDestroy, OnChanges, DoCheck {
  @Input() config: GenericTableConfig;
  @Input() handler: OnGenericTableHandler;
  @Input() darkMode: boolean = false;
  @Input() viewMode: 'table' | 'cards' | 'auto' = 'table';

  @ContentChild(TemplateRef) cardTemplate: TemplateRef<any>;
  @Input() customCardTemplate: TemplateRef<any> | null = null;

  private _authService = inject(AuthService);
  public _translocoService = inject(TranslocoService);
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _unsubscribeAll = new Subject<void>();
  private _lastDataLength = 0;
  private _lastIsEmpty: boolean | undefined = undefined;

  public data$: Observable<any[]>;

  // Helper helper for custom templates that might be hardcoded/fallback
  public timeStringToDateWrapper(timeString: string): Date | null {
    if (!timeString) return null;
    const date = new Date();
    const parts = timeString.split(':');
    if (parts.length >= 2) {
      date.setHours(parseInt(parts[0], 10));
      date.setMinutes(parseInt(parts[1], 10));
    }
    return date;
  }

  ngOnInit(): void {
    if (this.config?.viewMode) {
      this.viewMode = this.config.viewMode;
    }
    this._initDataSource();
    this._subscribeToDataSource();
    this._updateLastDataLength();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Debug logging
    if (changes['config']) {
      console.log('GenericTableComponent: config changed', this.config);
    }

    // Si el config cambia, re-suscribirse al dataSource
    if (changes['config']) {
      if (this.config?.viewMode) {
        this.viewMode = this.config.viewMode;
        console.log('GenericTableComponent: viewMode updated from config', this.viewMode);
      }

      if (this.config?.dataSource) {
        this._unsubscribeAll.next();
        this._initDataSource();
        this._subscribeToDataSource();
        this._updateLastDataLength();
        this._changeDetectorRef.markForCheck();
      }
    }
  }

  ngDoCheck(): void {
    // Detectar cambios en el dataSource.data cuando se agregan datos directamente
    const currentLength = this.config?.dataSource?.data?.length || 0;
    if (currentLength !== this._lastDataLength) {
      this._lastDataLength = currentLength;
      this._changeDetectorRef.markForCheck();
    }
    // Forzar detección de cambios para el getter isEmpty
    if (this.config?.dataSource) {
      const isEmpty = !this.config.dataSource.data || this.config.dataSource.data.length === 0;
      if (isEmpty !== this._lastIsEmpty) {
        this._lastIsEmpty = isEmpty;
        this._changeDetectorRef.markForCheck();
      }
    }
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  private _subscribeToDataSource(): void {
    // Suscribirse a los cambios del dataSource para detectar cuando se agregan datos
    if (this.config?.dataSource) {
      this.config.dataSource.connect()
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe(() => {
          this._updateLastDataLength();
          this._changeDetectorRef.markForCheck();
        });
    }
  }

  private _updateLastDataLength(): void {
    this._lastDataLength = this.config?.dataSource?.data?.length || 0;
  }

  private _initDataSource(): void {
    if (this.config?.dataSource) {
      this.data$ = this.config.dataSource.connect();
    } else if (this.config?.dataSourceList) {
      this.data$ = of(this.config.dataSourceList);
    } else {
      this.data$ = of([]);
    }
  }

  /**
   * Verifica si un botón debe estar deshabilitado basado en permisos
   * @param button Configuración del botón
   * @returns true si el botón debe estar deshabilitado
   */
  isButtonDisabled(button: ButtonConfig): boolean {
    // Si está explícitamente deshabilitado, retornar true
    if (button.disabled) {
      return true;
    }

    // Si tiene permiso definido, verificar si el usuario lo tiene
    if (button.permission) {
      return !this._authService.hasPermission(button.permission);
    }

    // Si no tiene permiso definido, el botón está habilitado
    return false;
  }

  /**
   * Obtiene el tooltip para un botón
   * @param button Configuración del botón
   * @returns El mensaje del tooltip apropiado
   */
  getButtonTooltip(button: ButtonConfig): string | undefined {
    // Si está deshabilitado, mostrar tooltip de deshabilitado
    if (this.isButtonDisabled(button)) {
      // Si tiene tooltip personalizado para deshabilitado, usarlo
      if (button.disabledTooltip) {
        return this._translocoService.translate(button.disabledTooltip);
      }

      // Si está deshabilitado por permisos, mostrar mensaje genérico
      if (button.permission && !this._authService.hasPermission(button.permission)) {
        return this._translocoService.translate('global.tooltips.noPermission');
      }

      return undefined;
    }

    // Si está habilitado, mostrar tooltip normal si existe
    if (button.tooltip) {
      return this._translocoService.translate(button.tooltip);
    }

    return undefined;
  }

  /**
   * Columnas del schema que representan servicios (tipo boolean, excluyendo groupName y numberOfChildren).
   * Usado en vista cards para mostrar servicios activos de forma dinámica (PDAM, PACNA, PSAV).
   */
  getServiceColumns(): { key: string; label: string }[] {
    if (!this.config?.columnsSchema?.length) return [];
    const exclude = new Set(['groupName', 'numberOfChildren']);
    return this.config.columnsSchema
      .filter((col) => col.type === 'boolean' && typeof col.key === 'string' && !exclude.has(col.key as string))
      .map((col) => ({ key: col.key as string, label: col.label }));
  }

  /**
   * Indica si el elemento tiene al menos un servicio activo (alguna columna boolean de servicio en true).
   */
  hasAnyActiveService(element: any): boolean {
    const serviceCols = this.getServiceColumns();
    return serviceCols.some((col) => !!element?.[col.key]);
  }

  /**
   * Slots de servicio ofrecidos en el elemento (desde serviceSlots cuando no hay columnas boolean rellenadas).
   * Usado como fallback para mostrar servicios dentro de la card (PDAM, PACNA, PSAV).
   */
  getActiveServiceSlots(element: any): ServiceSlotDisplay[] {
    const slots = element?.serviceSlots ?? [];
    if (!Array.isArray(slots)) return [];
    return slots
      .filter((s: SiteChildGroupServiceSlotResponse) => !!s?.isOffered)
      .map((s: SiteChildGroupServiceSlotResponse) => ({
        from: s?.from ?? s?.fromTime,
        to: s?.to ?? s?.toTime,
        label: s?.serviceTypeName ?? (s as ServiceSlotDisplay).label,
        serviceTypeName: s?.serviceTypeName,
        serviceTypeId: s?.serviceTypeId,
      }));
  }

  /**
   * True si hay que mostrar servicios desde serviceSlots (fallback) porque no hay booleanos rellenados.
   */
  shouldShowServiceSlotsFallback(element: any): boolean {
    return !this.hasAnyActiveService(element) && this.getActiveServiceSlots(element).length > 0;
  }

  /**
   * Devuelve las fechas de operación del slot para un servicio (por serviceTypeId).
   * Usar con pipe serviceDaysDisplay para formato "Jueves(6)".
   */
  getOperatingDatesForService(element: any, serviceTypeId: number): ServiceSlotOperatingDate[] {
    const slots = element?.serviceSlots ?? [];
    if (!Array.isArray(slots)) return [];
    const slot = slots.find((s: SiteChildGroupServiceSlotResponse) => s.serviceTypeId === serviceTypeId);
    return slot?.operatingDates ?? [];
  }

  /**
   * True si alguna tarjeta tiene operatingDates con isHoliday o isWeekend (para mostrar leyenda).
   */
  hasAnyExtrasInCards(): boolean {
    const data = this.config?.dataSource?.data ?? this.config?.dataSourceList ?? [];
    if (!Array.isArray(data)) return false;
    for (const element of data) {
      const slots = element?.serviceSlots ?? [];
      for (const slot of slots) {
        const dates = slot?.operatingDates ?? [];
        const hasExtra = dates.some(
          (d: { isHoliday?: boolean; isWeekend?: boolean; IsHoliday?: boolean; IsWeekend?: boolean }) =>
            d.isHoliday ?? d.IsHoliday ?? d.isWeekend ?? d.IsWeekend
        );
        if (hasExtra) return true;
      }
    }
    return false;
  }

  /**
   * Días extras (feriados/fines de semana) agrupados por fecha, con todos los servicios de ese día.
   * Para la sección "Días extras" en cada tarjeta de grupo.
   */
  getExtraDaysByDate(element: any): Array<{
    dateKey: string;
    dayName: string;
    dayOfMonth: number;
    date?: string;
    isHoliday: boolean;
    isWeekend: boolean;
    services: Array<{ serviceTypeName: string; from: string; to: string }>;
  }> {
    const slots = element?.serviceSlots ?? [];
    if (!Array.isArray(slots)) return [];
    const map = new Map<
      string,
      {
        dateKey: string;
        dayName: string;
        dayOfMonth: number;
        date?: string;
        isHoliday: boolean;
        isWeekend: boolean;
        services: Array<{ serviceTypeName: string; from: string; to: string }>;
      }
    >();
    for (const slot of slots as SiteChildGroupServiceSlotResponse[]) {
      if (!slot?.isOffered) continue;
      const dates = slot?.operatingDates ?? [];
      const serviceName = slot?.serviceTypeName ?? slot?.serviceTypeNameEN ?? 'Servicio';
      for (const d of dates) {
        const isH = (d as { isHoliday?: boolean; IsHoliday?: boolean }).isHoliday ?? (d as { isHoliday?: boolean; IsHoliday?: boolean }).IsHoliday;
        const isW = (d as { isWeekend?: boolean; IsWeekend?: boolean }).isWeekend ?? (d as { isWeekend?: boolean; IsWeekend?: boolean }).IsWeekend;
        if (!isH && !isW) continue;
        const from = (d as { from?: string; From?: string }).from ?? (d as { from?: string; From?: string }).From;
        const to = (d as { to?: string; To?: string }).to ?? (d as { to?: string; To?: string }).To;
        if (!from || !to) continue;
        const dayName = (d as { dayName?: string; DayName?: string }).dayName ?? (d as { dayName?: string; DayName?: string }).DayName ?? '';
        const dayOfMonth = (d as { dayOfMonth?: number; DayOfMonth?: number }).dayOfMonth ?? (d as { dayOfMonth?: number; DayOfMonth?: number }).DayOfMonth ?? 0;
        const dateVal = (d as { date?: string; Date?: string }).date ?? (d as { date?: string; Date?: string }).Date;
        const dateKey = dateVal ?? `${dayName}-${dayOfMonth}`;
        if (!map.has(dateKey)) {
          map.set(dateKey, {
            dateKey,
            dayName,
            dayOfMonth,
            date: dateVal,
            isHoliday: !!isH,
            isWeekend: !!isW,
            services: [],
          });
        }
        const entry = map.get(dateKey)!;
        if (!entry.services.some((s) => s.serviceTypeName === serviceName && s.from === from && s.to === to)) {
          entry.services.push({ serviceTypeName: serviceName, from, to });
        }
      }
    }
    return Array.from(map.values()).sort((a, b) => {
      if (a.date && b.date) return a.date.localeCompare(b.date);
      return a.dayOfMonth - b.dayOfMonth || a.dayName.localeCompare(b.dayName);
    });
  }

  /** True si el elemento tiene días extras (feriados/fines de semana) con horarios. */
  hasExtraDays(element: any): boolean {
    return this.getExtraDaysByDate(element).length > 0;
  }

  /** Formatea un servicio para la sección días extras: "Desayuno 9:00-9:30 AM". */
  formatExtraDayService(service: { serviceTypeName: string; from: string; to: string }): string {
    return `${service.serviceTypeName} ${formatTimeForDisplay(service.from)}-${formatTimeForDisplay(service.to)}`;
  }

  /**
   * True si el servicio tiene operatingDates con from/to que varían por día.
   * En ese caso se muestra el formato "Martes(6): 4:00-4:30 PM; Miércoles(14): 5:30-6:00 PM".
   * Soporta from/to en camelCase o PascalCase (API).
   */
  hasPerDayTimesThatDiffer(element: any, serviceTypeId: number): boolean {
    const dates = this.getOperatingDatesForService(element, serviceTypeId);
    const from = (d: { from?: string; to?: string; From?: string; To?: string }) => d.from ?? (d as { From?: string }).From;
    const to = (d: { from?: string; to?: string; From?: string; To?: string }) => d.to ?? (d as { To?: string }).To;
    const withTimes = dates.filter((d) => from(d) && to(d));
    if (withTimes.length < 2) return false;
    const uniquePairs = new Set(withTimes.map((d) => `${from(d)}-${to(d)}`));
    return uniquePairs.size > 1;
  }

  /**
   * Estilo (icono + clases) para un slot en fallback. Usa el mapa compartido por serviceTypeId si existe; si no, por índice.
   */
  getFallbackSlotStyle(index: number, slot?: { serviceTypeId?: number | null }): { icon: string; bg: string; border: string; text: string; textMedium: string } {
    if (slot?.serviceTypeId != null) {
      const style = getServiceTypeStyle(slot.serviceTypeId);
      return { icon: style.icon, bg: style.bg, border: style.border, text: style.text, textMedium: style.textMedium };
    }
    return SERVICE_TYPE_STYLES_BY_INDEX[index % SERVICE_TYPE_STYLES_BY_INDEX.length];
  }

  // Functions
  trackByFn(index: number, item: any): any {
    return item.id || index;
  }

  /**
   * Convierte un tamaño en bytes a MB con el número especificado de decimales
   * @param bytes Tamaño en bytes
   * @param decimals Número de decimales a mostrar
   * @param unit Unidad a mostrar (por defecto MB)
   * @returns Tamaño en MB como string con la unidad
   */
  formatFileSize(bytes: number, decimals: number = 2, unit: string = 'MB'): string {
    if (!bytes) return `0 ${unit}`;
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(decimals)} ${unit}`;
  }

  /**
   * Método para manejar el clic en el botón de adición.
   * Llama a la función onAddButtonClick del handler proporcionado.
   * @param event El evento de clic.
   */
  onAddButtonClick(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (this.config.onAddButtonClick) {
      this.config.onAddButtonClick(event);
    } else if (this.handler?.onAddButtonClick) {
      this.handler.onAddButtonClick(event);
    }
  }

  /**
   * Maneja las acciones generales de la tarjeta (edit/delete)
   */
  onActionClick(event: MouseEvent, action: string, item: any): void {
    event.stopPropagation();
    if (action === 'edit' && this.handler?.onTableEdit) {
      this.handler.onTableEdit(event, item.id);
    } else if (action === 'delete' && this.handler?.onTableDelete) {
      this.handler.onTableDelete(event, item.id);
    }
  }

  onButtonClick(event: Event, button: ButtonConfig, element: any): void {
    event.preventDefault();
    event.stopPropagation();

    if (button.action) {
      button.action(event, element);
      return;
    }

    switch (button.key) {
      case 'add':
        if (this.handler?.onTableAdd) {
          this.handler.onTableAdd(event, element);
        }
        break;
      case 'edit':
        if (this.handler?.onTableEdit) {
          this.handler.onTableEdit(event, element.id);
        }
        break;
      case 'delete':
        if (this.handler?.onTableDelete) {
          this.handler.onTableDelete(event, element.id);
        }
        break;
      case 'calendar':
        if (this.handler?.onTableCalendar) {
          this.handler.onTableCalendar(event, element.id);
        }
        break;
      case 'satellites':
        if (this.handler?.onTableSatellites) {
          this.handler.onTableSatellites(event, element.id);
        }
        break;
      case 'sites':
        if (this.handler?.onTableSites) {
          this.handler.onTableSites(event, element.id);
        }
        break;
      case 'viewStaff':
        if (this.handler?.onTableViewStaff) {
          this.handler.onTableViewStaff(event, element.id);
        }
        break;
      case 'view':
        if (this.handler?.onTableViewRelationships) {
          this.handler.onTableViewRelationships(event, element.id);
        }
        break;
      case 'edit-modal':
        if (this.handler?.onTableEditModal) {
          this.handler.onTableEditModal(event, element.id);
        }
        break;
      default:
        if (this.handler?.onTableAction) {
          this.handler.onTableAction(event, button.key, element.id);
        }
        break;
    }
  }

  /**
   * Método para manejar la edición de un elemento de la tabla.
   * Llama a la función onTableEdit del handler proporcionado.
   * @param event El evento de edición.
   * @param id El ID del elemento a editar.
   */
  onEdit(event: Event, id: number | string): void {
    // Actualizar tableConfig del handler antes de llamar a onTableEdit
    if (this.handler && this.config) {
      this.handler.tableConfig = this.config;
    }
    if (this.handler && this.handler.onTableEdit) {
      this.handler.onTableEdit(event, id);
    }
  }

  onEditElement(event: Event, element: any): void {
    this.handler.onTableEditElement(event, element);
  }

  /**
   * Método para manejar la eliminación de un elemento de la tabla.
   * Llama a la función onTableDelete del handler proporcionado.
   * @param event El evento de eliminación.
   * @param id El ID del elemento a eliminar.
   */
  onDelete(event: Event, id: number): void {
    this.handler.onTableDelete(event, id);
  }

  /**
   * Método para manejar la descarga de un elemento de la tabla.
   * Llama a la función onTableDownload del handler proporcionado.
   * @param event El evento de descarga.
   * @param id El ID del elemento a descargar.
   */
  onDownload(event: Event, id: number): void {
    this.handler.onTableDownload(event, id);
  }

  /**
   * Método para manejar el calendario de un elemento de la tabla.
   * Llama a la función onTableCalendar del handler proporcionado.
   * @param event El evento de calendario.
   * @param id El ID del elemento para el calendario.
   */
  onCalendar(event: Event, id: number): void {
    this.handler.onTableCalendar(event, id);
  }

  /**
   * Método para manejar el cambio de estado de un checkbox en la tabla.
   * Llama a la función onTableCheckChange del handler proporcionado.
   * @param event El evento de cambio del checkbox.
   * @param element El elemento de la fila que contiene el checkbox.
   * @param key La clave o claves del valor a cambiar en el elemento.
   */
  onCheckboxChange(event: MatCheckboxChange, element: any, key: string | string[]): void {
    if (this.handler && this.handler.onTableCheckChange) {
      this.handler.onTableCheckChange(event, element);
    }
  }

  /**
   * Obtiene el valor booleano de un campo, manejando correctamente null, undefined, false, 0, 1, y true
   * @param element El elemento que contiene el valor
   * @param path La ruta al valor
   * @returns true si el valor es verdadero, false en caso contrario (incluyendo null/undefined)
   */
  getBooleanValue(element: any, path: string | string[]): boolean {
    const value = this.getNestedValue(element, path);
    if (value === null || value === undefined) {
      return false;
    }
    // Manejar valores numéricos (0/1) y booleanos
    return value === true || value === 1 || value === '1' || value === 'true';
  }

  /**
   * Esta función se encarga de manejar el cambio de estado de un checkbox en la tabla.
   *
   * @param event El evento de cambio del checkbox.
   * @param element El elemento de la fila que contiene el checkbox.
   * @param key La clave del valor a cambiar en el elemento.
   */
  getNestedValue(element: any, path: string | string[]): any {
    // Handle null/undefined path
    if (!path) {
      return undefined;
    }

    if (Array.isArray(path)) {
      // Si es un array de paths, determinar cuál mostrar según el idioma
      const currentLang = this._translocoService.getActiveLang();
      const isEnglish = currentLang === 'en';

      // Si hay dos elementos en el array, asumimos que el primero es ES y el segundo EN
      if (path.length === 2) {
        const esPath = path[0];
        const enPath = path[1];

        // Obtener valores directamente del objeto
        const esValue = this.getNestedValue(element, esPath);
        const enValue = this.getNestedValue(element, enPath);

        // Verificar si los valores fueron obtenidos (no undefined significa que el campo existe)
        // Si getNestedValue devuelve undefined, el campo no existe en el objeto
        const esExists = esValue !== undefined;
        const enExists = enValue !== undefined;

        // Si estamos en inglés, priorizar inglés
        if (isEnglish) {
          // Si descriptionEN existe y tiene un valor no vacío, usarlo
          if (enExists && enValue !== null && enValue !== '') {
            return enValue;
          }
          // Si descriptionEN no existe o está vacío/null, usar español como fallback
          return esValue || '';
        } else {
          // Si estamos en español, priorizar español
          // Si description existe y tiene un valor no vacío, usarlo
          if (esExists && esValue !== null && esValue !== '') {
            return esValue;
          }
          // Si description no existe o está vacío/null, usar inglés como fallback
          return enValue || '';
        }
      }

      // Si hay más de dos elementos, concatenar todos
      return path.map(p => this.getNestedValue(element, p)).join(' ');
    }

    // Ensure path is a string before calling split
    if (typeof path !== 'string') {
      return undefined;
    }

    return path.split('.').reduce((obj, key) =>
      (obj && obj[key] !== undefined) ? obj[key] : undefined, element);
  }

  /**
   * Esta función se encarga de obtener el valor de una propiedad anidada en un objeto.
   * Si el path es un arreglo, se concatenan los valores de las propiedades anidadas
   * separados por un espacio.
   *
   * @param element El objeto que contiene las propiedades anidadas.
   * @param path El camino a la propiedad anidada. Puede ser una cadena o un arreglo de cadenas.
   * @returns El valor de la propiedad anidada o undefined si no se encuentra.
   */
  getColumnDef(col: any): string {
    if (!col || !col.key) {
      return '';
    }
    // Si es un array, usar el primer elemento como identificador de columna
    if (Array.isArray(col.key)) {
      return col.key[0];
    }
    return col.key;
  }


  /**
   * Maneja el error cuando una imagen no se puede cargar
   * @param event El evento de error
   * @param defaultImage La imagen por defecto a mostrar
   */
  handleMissingImage(event: Event, defaultImage: string): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = defaultImage || 'assets/images/avatars/profile.png';
  }

  /**
   * Obtiene el icono correspondiente al tipo de archivo
   * @param element El elemento que contiene el tipo de archivo
   * @param col La configuración de la columna
   * @returns El nombre del icono de Material a mostrar
   */
  getFileTypeIcon(element: any, col: any): string {
    if (col.key === 'fileIcon') {
      const contentType = element.contentType?.toLowerCase();
      if (!contentType || !col.fileTypeConfig?.iconMap) {
        return 'insert_drive_file';
      }
      // Primero intentamos con el tipo MIME completo
      let iconConfig = col.fileTypeConfig.iconMap[contentType];
      if (!iconConfig) {
        // Si no encontramos, intentamos con la extensión
        const extension = contentType.split('/')[1];
        iconConfig = col.fileTypeConfig.iconMap[extension] || col.fileTypeConfig.iconMap['default'];
      }
      return iconConfig?.icon || 'insert_drive_file';
    }
    return 'insert_drive_file';
  }

  getFileTypeIconColor(element: any, col: any): string {
    if (col.key === 'fileIcon') {
      const contentType = element.contentType?.toLowerCase();
      if (!contentType || !col.fileTypeConfig?.iconMap) {
        return '#757575';
      }
      // Primero intentamos con el tipo MIME completo
      let iconConfig = col.fileTypeConfig.iconMap[contentType];
      if (!iconConfig) {
        // Si no encontramos, intentamos con la extensión
        const extension = contentType.split('/')[1];
        iconConfig = col.fileTypeConfig.iconMap[extension] || col.fileTypeConfig.iconMap['default'];
      }
      return iconConfig?.color || '#757575';
    }
    return '#757575';
  }

  /**
   * Maneja el evento de satélites de un elemento
   * @param event El evento de satélites
   * @param id El ID del elemento
   */
  onSatellites(event: Event, id: number): void {
    if (this.handler && this.handler.onTableSatellites) {
      this.handler.onTableSatellites(event, id);
    }
  }

  onSites(event: Event, id: number): void {
    if (this.handler && this.handler.onTableSites) {
      this.handler.onTableSites(event, id);
    }
  }

  onViewStaff(event: Event, id: number): void {
    if (this.handler && this.handler.onTableViewStaff) {
      this.handler.onTableViewStaff(event, id);
    }
  }

  /**
   * Verifica si la tabla está vacía
   * @returns true si la tabla no tiene datos
   */
  get isEmpty(): boolean {
    if (!this.config?.dataSource) {
      return true;
    }
    const data = this.config.dataSource.data;
    return !data || data.length === 0;
  }

  /**
   * Clase de grid para la vista cards según la cantidad de items:
   * 1 item → 1 col; 2 items → 2 cols; 3+ items → máx 3 cols.
   * Así 2 cards ocupan todo el ancho (50% cada una).
   */
  get cardsGridClass(): string {
    const count =
      this.config?.dataSource?.data?.length ??
      this.config?.dataSourceList?.length ??
      0;
    const base = 'grid gap-6 pt-2';
    if (count <= 1) return `${base} grid-cols-1`;
    if (count === 2) return `${base} grid-cols-1 md:grid-cols-2`;
    return `${base} grid-cols-1 md:grid-cols-2 lg:grid-cols-3`;
  }

  /**
   * Verifica si el botón de menú debe estar deshabilitado por permisos
   * @param permission Permiso requerido para el botón
   * @returns true si el botón debe estar deshabilitado
   */
  isAddMenuDisabledByPermission(permission?: string): boolean {
    if (!permission) return false;
    return !this._authService.hasPermission(permission);
  }

  /**
   * Obtiene el tooltip para el botón de menú de agregar
   * @param tooltipKey Clave de traducción del tooltip
   * @param disabledTooltipKey Clave de traducción del tooltip deshabilitado
   * @param permission Permiso requerido para el botón
   * @returns El mensaje del tooltip apropiado
   */
  getAddMenuTooltip(tooltipKey?: string, disabledTooltipKey?: string, permission?: string): string | undefined {
    const isDisabled = this.isAddMenuDisabledByPermission(permission);

    // Si está deshabilitado y tiene tooltip para deshabilitado, usarlo
    if (isDisabled && disabledTooltipKey) {
      return this._translocoService.translate(disabledTooltipKey);
    }

    // Si está deshabilitado por permisos y no tiene tooltip específico, usar genérico
    if (isDisabled && permission && !this._authService.hasPermission(permission)) {
      return this._translocoService.translate('global.tooltips.noPermission');
    }

    // Si está habilitado y tiene tooltip normal, usarlo
    if (!isDisabled && tooltipKey) {
      return this._translocoService.translate(tooltipKey);
    }

    return undefined;
  }

  /**
   * Maneja el evento de acción del menú de agregar
   * @param menuItemId ID del item del menú seleccionado
   */
  onAddMenuAction(menuItemId: string): void {
    if (this.handler?.onAddMenuAction) {
      this.handler.onAddMenuAction(menuItemId);
    }
  }
}
