import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { DayOfWeekResponse } from 'app/shared/models/DayOfWeekResponse';

export interface ImageConfig {
  defaultImage?: string;
  width?: string;
  height?: string;
  class?: string;
  alt?: string;
}

export interface FileTypeConfig {
  iconMap: { [key: string]: FileTypeIcon };
}

export interface FileTypeIcon {
  icon: string;
  color: string;
  displayText: string;
}

export interface ButtonConfig {
  key: string;
  label?: string;
  color?: 'primary' | 'accent' | 'warn';
  icon?: string;
  tooltip?: string;              // Tooltip cuando el botón está habilitado
  permission?: string;           // Permiso requerido para habilitar el botón
  disabled?: boolean;            // Estado de deshabilitado manual
  disabledTooltip?: string;      // Tooltip cuando está deshabilitado
  action?: (event: Event, element: any) => void; // Acción personalizada del botón
  disableAgencyRestriction?: boolean; // Si es true, no se aplica la directiva appDisableIfAgencyRestricted
}

export interface FileSizeConfig {
  /**
   * Número de decimales a mostrar en el tamaño del archivo
   * @default 2
   */
  decimals?: number;
  /**
   * Unidad en la que se mostrará el tamaño del archivo
   * @default 'MB'
   */
  unit?: string;
}

export interface ColumnSchema {
  key: string | string[];
  type:
    | 'text'
    | 'check'
    | 'image'
    | 'date'
    | 'date-time'
    | 'file-type'
    | 'file-size'
    | 'content-type-text'
    | 'combined-text'
    | 'boolean'
    | 'button';
  label: string;
  buttons?: ButtonConfig[];
  imageConfig?: ImageConfig;
  fileTypeConfig?: FileTypeConfig;
  fileSizeConfig?: FileSizeConfig;
  keys?: string[];
  visible?: boolean;
  sortable?: boolean;
  searchable?: boolean;
  format?: string;
}

export interface GenericTableConfig<T = any> {
  dataSource: MatTableDataSource<T>;
  dataSourceList?: T[];
  columnsSchema: ColumnSchema[];
  displayedColumns: string[];
  handler?: any;
  showPaginator?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
  length?: number;
  /**
   * @deprecated Usar addMenuShow en su lugar. Se mantiene para retrocompatibilidad.
   */
  addButtonShow?: boolean;
  /**
   * @deprecated Usar addMenuItems en su lugar. Se mantiene para retrocompatibilidad.
   */
  addButtonIcon?: string;
  /**
   * @deprecated Usar addMenuItems en su lugar. Se mantiene para retrocompatibilidad.
   */
  addButtonLabel?: string;
  /**
   * @deprecated Usar addMenuTooltip en su lugar. Se mantiene para retrocompatibilidad.
   */
  addButtonTooltip?: string;
  /**
   * @deprecated Se mantiene para retrocompatibilidad.
   */
  addButtonTooltipPosition?: 'above' | 'below' | 'left'  | 'right';
  tableId?: string;
  /**
   * @deprecated Usar onAddMenuAction en su lugar. Se mantiene para retrocompatibilidad.
   */
  onAddButtonClick?: (event?: Event) => void;
  /**
   * Si es true, la tabla está en pantalla completa y no se mostrará el borde del contenedor.
   * Si es false o undefined, se mostrará el borde por defecto.
   * @default false
   */
  fullScreen?: boolean;
  /**
   * Controla si se muestra el menú de tres puntos para agregar elementos.
   * Si es true, se mostrará el botón de menú en lugar del botón add tradicional.
   */
  addMenuShow?: boolean;
  /**
   * Array de items del menú de agregar.
   */
  addMenuItems?: AddMenuItem[];
  /**
   * Tooltip del botón de menú cuando está habilitado.
   */
  addMenuTooltip?: string;
  /**
   * Tooltip del botón de menú cuando está deshabilitado.
   */
  addMenuDisabledTooltip?: string;
  /**
   * Permiso requerido para mostrar el menú de agregar.
   */
  /**
   * Permiso requerido para mostrar el menú de agregar.
   */
  addMenuPermission?: string;
  /**
   * Modo de visualización inicial de la tabla.
   * 'table': Muestra la tabla tradicional.
   * 'cards': Muestra una vista de tarjetas (grid).
   * 'auto': Muestra tabla en desktop y tarjetas en móvil.
   * @default 'table'
   */
  viewMode?: 'table' | 'cards' | 'auto';
  /**
   * Días de la semana de operación del sitio (para mostrar en tarjetas Servicios Activos).
   * Formato: iniciales "L M X J V" debajo del horario de cada servicio.
   */
  operatingDaysOfWeek?: DayOfWeekResponse[];
}

export interface OnGenericTableHandler {
  // Lista de datos
  tableConfig: GenericTableConfig;
  // Funciones
  onTableAdd?: (event: Event, element: any) => void;
  onTableEdit?: (event: Event, id: any) => void;
  onTableEditElement?: (event: Event, element: any) => void;
  onTableDelete?: (event: Event, id: any) => void;
  onTableDownload?: (event: Event, id: any) => void;
  onTableCalendar?: (event: Event, id: any) => void;
  onTableSatellites?: (event: Event, id: any) => void;
  onTableSites?: (event: Event, id: any) => void;
  onTableViewStaff?: (event: Event, id: any) => void;
  onTableViewRelationships?: (event: Event, id: any) => void;
  onTableEditModal?: (event: Event, id: any) => void;
  onTableAction?: (event: Event, action: string, id: any) => void;
  onTableCheckChange?: (event: MatCheckboxChange, element: any) => void;
  /**
   * @deprecated Usar onAddMenuAction en su lugar. Se mantiene para retrocompatibilidad.
   */
  onAddButtonClick?: (event?: Event, tableId?: string) => void;
  /**
   * Manejador para el evento de acción del menú de agregar.
   * @param menuItemId ID del item del menú seleccionado
   */
  onAddMenuAction?: (menuItemId: string) => void;
  getPaginator?: (event?: PageEvent) => void;
  // Métodos para obtener datos
  getById?: (id: number) => void;
  getAll?: (index: number, form: any) => void;
}

export interface GenericTableButtonConfig {
    key: string;
    label: string;
    icon?: string;
    color?: 'primary' | 'accent' | 'warn';
    svgIcon?: string;
    tooltip?: string;
    action?: (event: Event, element: any) => void;
  }

export interface AddMenuItem {
  id: string;
  label: string;
  icon?: string;
  disabled?: boolean;
}
