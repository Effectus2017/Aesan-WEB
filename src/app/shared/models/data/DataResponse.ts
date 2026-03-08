import { HttpHeaders } from '@angular/common/http';

/**
 * Respuesta genérica que envuelve el body de una petición HTTP.
 * Permite definir el tipo del contenido (body) y opcionalmente status y headers.
 *
 * @example
 * getAgencyById(): Observable<DataResponse<AgencyResponse>>
 * // El consumidor sabe que response.body es AgencyResponse
 */
export interface DataResponse<T> {
  body: T;
  status?: number;
  ok?: boolean;
  headers?: HttpHeaders;
}
