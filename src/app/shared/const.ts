import { HttpHeaders, HttpParams } from '@angular/common/http';

// Aquí se guardan todas las constantes a ser utilizadas
export class Constants {
  // Se utiliza para mostrar fechas en español
  public static readonly SPANISH_FORMAT_DATE = 'dd/MM/yyyy';

  public static readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
    observe: 'response' as 'body',
    params: null,
    body: null,
  };

  public static readonly httpExport: any = {
    headers: new HttpHeaders({
      'Content-Type': 'text/plain',
    }),
    responseType: 'text',
    observe: 'response' as 'body',
  };

  public static readonly httpText: any = {
    headers: new HttpHeaders({
      'Content-Type': 'text',
    }),
    responseType: 'text',
    observe: 'response' as 'body',
  };

  public static headersLogin: any = {
    headers: new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    }),
    responseType: 'text',
    observe: 'response' as 'body',
  };

  public static headersUpload = {
    headers: new HttpHeaders({}),
    observe: 'response' as 'body',
  };

  public static headersExport: {
    headers?: HttpHeaders;
    observe?: 'body';
    params?: HttpParams;
    reportProgress?: boolean;
    responseType: 'arraybuffer';
    withCredentials?: boolean;
  } = {
    responseType: 'arraybuffer',
    observe: 'response' as 'body',
  };

  public static readonly InventorySearchMode = {
    Complete: 'COMPLETE',
    Simple: 'SIMPLE',
  };

  public static readonly InventorySearchStatus = {
    InProgress: 'IN_PROGRESS',
    Suspended: 'SUSPENDED',
    Completed: 'COMPLETED',
  };

  public static readonly InventoryMode = ['COMPLETE', 'SIMPLE'];

  public static readonly InventoryStatus = [
    { value: 'IN_PROGRESS', name: 'En proceso' },
    { value: 'SUSPENDED', name: 'Suspendido' },
    { value: 'COMPLETED', name: 'Finalizado' },
  ];

  public static readonly OrderStatus = [
    { id: 0, value: 'OPEN', name: 'Abiertas' },
    { id: 1, value: 'CLOSED', name: 'Cerradas' },
  ];

  public static readonly OrderStatusCreated = [
    { id: 0, value: 'OPEN', name: 'Abierta' },
    { id: 1, value: 'CLOSED', name: 'Cerrada' },
  ];

  public static readonly InventoryStatusCreated = [
    { id: 0, value: 'IN_PROGRESS', name: 'En progreso' },
    { id: 1, value: 'SUSPENDED', name: 'Suspendido' },
    { id: 2, value: 'COMPLETED', name: 'Finalizado' },
  ];

  public static readonly InventoryOrderBy = [
    { id: 0, name: 'Fecha', orderBy: false },
    { id: 1, name: 'Numero', orderBy: false },
    { id: 2, name: 'Descripción', orderBy: false },
    { id: 3, name: 'Estado', orderBy: false },
  ];

  public static readonly InventoryAscendentOrder = [
    { value: true, name: 'Verdadero' },
    { value: false, name: 'Falso' },
  ];

  public static readonly ViewChildOptions = { static: true };
}
