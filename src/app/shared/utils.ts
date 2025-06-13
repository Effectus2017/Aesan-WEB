import { HttpParams } from '@angular/common/http';
import { Constants } from './const';
import { QueryParameters } from './models/QueryParameters';
import { throwError } from 'rxjs';
import { UntypedFormGroup } from '@angular/forms';
import { inject } from '@angular/core';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { TranslocoService } from '@ngneat/transloco';

/**
 * Compara dos elementos
 * @param o1 Elemento 1
 * @param o2 Elemento 2
 * @returns true si los elementos son iguales, false en caso contrario
 */
export function compare(o1: any, o2: any): boolean {
  if (!isNullOrUndefinedEmptyStringNullArray(o2)) {
    return o1 === o2;
  }
  return false;
}

/**
 * Compara dos elementos por una propiedad específica
 * @param o1 Elemento 1
 * @param o2 Elemento 2
 * @returns true si los elementos son iguales, false en caso contrario
 */
export function compareString(o1: any, o2: any): boolean {
  if (!isNullOrUndefinedEmptyStringNullArray(o2)) {
    return o1.name.split(' ').join('') === o2;
  }
  return false;
}

/**
 * Compara dos elementos por una propiedad específica
 * @param o1 Elemento 1
 * @param o2 Elemento 2
 * @returns true si los elementos son iguales, false en caso contrario
 */
export function comparePostal(o1: any, o2: any): boolean {
    if (!isNullOrUndefinedEmptyStringNullArray(o2)) {
      return o1.Id === o2.Id;
    }
    return false;
  }

  /**
   * Compara dos elementos por una propiedad específica
   * @param item1 Elemento 1
   * @param item2 Elemento 2
   * @param property Propiedad a comparar
   * @returns true si los elementos son iguales, false en caso contrario
   */
  export function compareItems<T>(item1: T, item2: T): boolean {
    return compareByProperty(item1, item2, 'id' as keyof T);
  }

/**
 * Compara dos elementos por una propiedad específica
 * @param item1 Elemento 1
 * @param item2 Elemento 2
 * @param property Propiedad a comparar
 * @returns true si los elementos son iguales, false en caso contrario
 */
export function compareByProperty<T extends { [key: string]: any }>(item1: T, item2: T, property: keyof T): boolean {
    return item1[property] === item2[property];
  }

/**
 * Verifica si un valor es un array
 * @param value Valor a verificar
 * @returns true si el valor es un array, false en caso contrario
 */
export function isArray(value: any): boolean {
  return Array.isArray(value);
}

/**
 * Normaliza una URL de imagen para asegurar que las barras invertidas se manejen correctamente
 * @param imageUrl URL de la imagen a normalizar
 * @returns URL normalizada
 */
export function normalizeImageUrl(imageUrl: string | null | undefined): string | null | undefined {
  if (!imageUrl) {
    return imageUrl;
  }
  // Reemplaza dobles barras invertidas por barras normales
  // y luego reemplaza barras invertidas simples por barras normales
  return imageUrl.replace(/\\\\/g, '/').replace(/\\/g, '/');
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

export function disableAllControlsExcept(form: UntypedFormGroup, exceptions: string | string[]): void {
  const exceptionsArray = typeof exceptions === 'string' ? [exceptions] : exceptions;
  Object.keys(form.controls).forEach((controlName) => {
    if (!exceptionsArray.includes(controlName)) {
      const control = form.get(controlName);
      if (control) {
        control.disable({ emitEvent: false });
      }
    }
  });
}

export function enableAllControls(form: UntypedFormGroup): void {
  Object.keys(form.controls).forEach((controlName) => {
    const control = form.get(controlName);
    if (control) {
      control.enable({ emitEvent: false });
    }
  });
}

export function handleFormControls(
  form: UntypedFormGroup,
  action: 'enable' | 'disable',
  config: {
    controls?: string[];
    mode?: 'include' | 'exclude';
    emitEvent?: boolean;
  } = {}
): void {
  const { controls = [], mode = 'include', emitEvent = false } = config;

  Object.keys(form.controls).forEach((controlName) => {
    const control = form.get(controlName);
    if (!control) return;

    const shouldModify = mode === 'include' ? controls.includes(controlName) : !controls.includes(controlName);

    if (shouldModify) {
      action === 'enable' ? control.enable({ emitEvent }) : control.disable({ emitEvent });
    }
  });
}

/**
 * Converts a boolean value to the corresponding option id for a Yes/No dropdown.
 * @param value Boolean value to convert (true/false)
 * @param options Array of options with 'id' and 'name' fields (should include 'Si' and 'No')
 * @returns The id for 'Si' if true, the id for 'No' if false, or '' if undefined
 * @example
 *   // options = [{id: 1, name: 'Si'}, {id: 2, name: 'No'}]
 *   mapBooleanToYesNoOptionId(true, options) // returns 1
 *   mapBooleanToYesNoOptionId(false, options) // returns 2
 */
export function mapBooleanToYesNoOptionId(value: boolean | undefined, options: { id: number; name: string }[]): number | '' {
  const yesOption = options.find((opt) => opt.name === 'Si');
  const noOption = options.find((opt) => opt.name === 'No');
  if (!yesOption || !noOption) {
    throw new Error('Options array must include both "Si" and "No" options');
  }
  if (value === true) return yesOption.id;
  if (value === false) return noOption.id;
  return '';
}

/**
 * Converts an option id from a Yes/No dropdown to a boolean value.
 * @param id Option id to convert
 * @param options Array of options with 'id' and 'name' fields (should include 'Si' and 'No')
 * @returns true if id is for 'Si', false if for 'No', undefined otherwise
 * @example
 *   // options = [{id: 1, name: 'Si'}, {id: 2, name: 'No'}]
 *   mapYesNoOptionIdToBoolean(1, options) // returns true
 *   mapYesNoOptionIdToBoolean(2, options) // returns false
 */
export function mapYesNoOptionIdToBoolean(id: number, options: { id: number; name: string }[]): boolean | undefined {
  const yesOption = options.find((opt) => opt.name === 'Si');
  const noOption = options.find((opt) => opt.name === 'No');
  if (!yesOption || !noOption) {
    throw new Error('Options array must include both "Si" and "No" options');
  }
  if (id === yesOption.id) return true;
  if (id === noOption.id) return false;
  return undefined;
}



/**
 * Convierte una fecha a un string de formato HH:mm:ss
 * @param date Fecha a convertir
 * @returns String de formato HH:mm:ss o null si la fecha es null
 */
export function toTimeString(date: Date | string | null): string | null {
  if (!date) return null;
  if (typeof date === 'string') return date.length === 8 ? date : null; // ya es HH:mm:ss
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

/**
 * Convierte un string de formato HH:mm:ss a un objeto Date
 * @param timeString String de formato HH:mm:ss
 * @returns Objeto Date o null si el string es null
 */
export function toTimeDate(timeString: string | null): Date | null {
  if (!timeString) return null;
  const [hours, minutes, seconds] = timeString.split(':').map(Number);
  return new Date(2000, 1, 1, hours, minutes, seconds);
}
