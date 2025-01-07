import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

export interface GenericTableConfig<T = any> {
  dataSource: MatTableDataSource<T>;
  dataSourceList: T[];
  columnsSchema: any[];
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
  onTableEdit?: (event: Event, id: number) => void;
  onTableDelete?: (event: Event, id: number) => void;
  onTableCheckChange?: (event: Event, element: any) => void;
  getPaginator?: (event?: PageEvent) => void;
  // Métodos para obtener datos
  getById?: (id: number) => void;
  getAll?: (index: number, form: any) => void;
}
