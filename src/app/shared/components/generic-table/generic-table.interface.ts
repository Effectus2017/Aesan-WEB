import { PageEvent } from '@angular/material/paginator';

export interface GenericTableConfig<T = any> {
  dataSource: T[];
  columnsSchema: any[];
  displayedColumns: string[];
  handler?: any;
  showPaginator?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
  length?: number;
}

export interface OnGenericTableHandler {
  // Lista de datos
  tableConfig: GenericTableConfig;
  // Funciones
  onEdit?: (event: Event, id: number) => void;
  onDelete?: (event: Event, id: number) => void;
  onCheckChange?: (event: Event, element: any) => void;
  getPaginator?: (event?: PageEvent) => void;
  // Métodos para obtener datos
  getById?: (id: number) => void;
  getAll?: (index: number, form: any) => void;
}
