import { PageEvent } from "@angular/material/paginator";
import { MatTableDataSource } from "@angular/material/table";

export interface OnGenericTableHandler {
  // Lista de datos
  list: MatTableDataSource<any>;
  // Esquema de columnas
  columnsSchema: any;
  // Columnas a mostrar
  displayedColumns: string[];
  // Opciones de paginación
  pageSizeOptions: number[];
  pageSize: number;
  length: number;
  pageEvent: PageEvent;
  // Funciones
  onEdit(event: Event, id: number): void;
  onDelete(event: Event, id: number): void;
  onCheckChange(event: Event, element: any): void;
  getPaginator(event?: PageEvent): void;
}
