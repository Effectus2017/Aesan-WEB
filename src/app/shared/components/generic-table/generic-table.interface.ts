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

export interface ColumnSchema {
  key: string | string[];
  type: 'text' | 'date' | 'date-time' | 'check' | 'button' | 'boolean' | 'combined-text' | 'image' | 'file-type' | 'content-type-text';
  label: string;
  buttons?: { key: string; label?: string }[];
  imageConfig?: ImageConfig;
  fileTypeConfig?: FileTypeConfig;
  keys?: string[];
  visible?: boolean;
  sortable?: boolean;
  searchable?: boolean;
  format?: string;
}

export interface GenericTableConfig<T = any> {
  dataSource: MatTableDataSource<T>;
  dataSourceList: T[];
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
}

export interface OnGenericTableHandler {
  // Lista de datos
  tableConfig: GenericTableConfig;
  // Funciones
  onTableAdd?: () => void;
  onTableEdit?: (event: Event, id: any) => void;
  onTableDelete?: (event: Event, id: any) => void;
  onTableDownload?: (event: Event, id: any) => void;
  onTableCheckChange?: (event: MatCheckboxChange, element: any) => void;
  getPaginator?: (event?: PageEvent) => void;
  // Métodos para obtener datos
  getById?: (id: number) => void;
  getAll?: (index: number, form: any) => void;
}
