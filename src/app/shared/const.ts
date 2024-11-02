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

}
