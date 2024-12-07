import { HttpParams } from '@angular/common/http';
import { Constants } from './const';
import { QueryParameters } from './models/QueryParameters';
import { throwError } from 'rxjs';

// Función genérica para comparar elementos por una propiedad específica
export function compareByProperty<T extends { [key: string]: any }>(item1: T, item2: T, property: keyof T): boolean {
  return item1[property] === item2[property];
}

// Obtiene las opciones de la petición HTTP
export function getHttpOptions(model: QueryParameters) {
  if (isNullOrUndefinedEmptyStringNullArray(model)) {
    return Object.assign({}, Constants.httpOptions);
  }
  return queryParameters(model);
}

// Verifica si el valor es null o undefined
export function isNullOrUndefined(value: any) {
  return value === undefined || value === null;
}

// Verifica si el valor es null, undefined, una cadena vacía o un array vacío
export function isNullOrUndefinedEmptyStringNullArray<T>(obj: T | null | undefined | string): obj is null | undefined | string {
  if (Array.isArray(obj)) {
    if (obj.length === 0) {
      return true;
    }

    if (obj[0] === null || obj[0] === undefined) {
      return true;
    }
  }

  return typeof obj === 'undefined' || obj === null || obj === '' || obj === 0;
}

// Obtiene los parámetros de la petición HTTP
export function queryParameters(model: QueryParameters) {
  const options = Object.assign({}, Constants.httpOptions);
  let _p = new HttpParams();
  for (const key in model) {
    if (model[key] !== null) {
      const _a = key.toString();

      if (_a === 'orderBy') {
        const _b = model[key];

        if (isNullOrUndefined(_b)) {
          continue;
        }

        let _c: HttpParams;

        for (let index = 0; index < _b.length; index++) {
          if (isNullOrUndefined(_b[index])) {
            continue;
          }

          const element = _b[index].toString();

          if (index === 0) {
            _c = _p.set(_a.replace(/"/g, "'"), element.replace(/"/g, "'"));
            continue;
          }

          _c = _c.append(_a.replace(/"/g, "'"), element.replace(/"/g, "'"));
        }

        _p = _c;
      } else {
        const _b = model[key].toString();
        _p = _p.set(_a.replace(/"/g, "'"), _b.replace(/"/g, "'"));
      }
    }
  }
  options.params = _p;

  return options;
}

export function handleError(error: any) {
  let errorMessage = '';
  if (error.error instanceof ErrorEvent) {
    // Get client-side error
    errorMessage = error.error.message;
  } else {
    // Get server-side error
    errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
  }
  //window.alert(errorMessage);
  return throwError(() => {
    return errorMessage;
  });
}
