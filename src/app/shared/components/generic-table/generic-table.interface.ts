import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatCheckboxChange } from '@angular/material/checkbox';

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
  addButtonShow?: boolean;
  addButtonIcon?: string;
  addButtonLabel?: string;
  addButtonTooltip?: string;
  addButtonTooltipPosition?: 'above' | 'below' | 'left'  | 'right';
  tableId?: string;
  onAddButtonClick?: (event?: Event) => void;
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
  onTableCheckChange?: (event: MatCheckboxChange, element: any) => void;
  onAddButtonClick?: (event?: Event, tableId?: string) => void;
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
