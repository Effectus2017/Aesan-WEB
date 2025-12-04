import { HttpParams } from '@angular/common/http';
import { Constants } from './const';
import { QueryParameters } from './models/QueryParameters';
import { throwError } from 'rxjs';
import { UntypedFormGroup, FormGroup } from '@angular/forms';
import { AbstractControl, ValidationErrors } from '@angular/forms';

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
 * Compara dos elementos por su propiedad id
 * @param o1 Elemento 1
 * @param o2 Elemento 2
 * @returns true si los elementos son iguales, false en caso contrario
 */
export function compareById(o1: any, o2: any): boolean {
    if (!isNullOrUndefinedEmptyStringNullArray(o2)) {
      return o1.id === o2.id;
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
export function comparePostal(o1: any | null | undefined, o2: any | null | undefined): boolean {
  // Si ambos son null o undefined, son iguales
  if ((o1 === null || o1 === undefined) && (o2 === null || o2 === undefined)) {
    return true;
  }
  
  // Si uno es null/undefined y el otro no, son diferentes
  if (o1 === null || o1 === undefined || o2 === null || o2 === undefined) {
    return false;
  }
  
  // Ambos tienen valor, comparar por Id
  if (o1.Id !== undefined && o2.Id !== undefined) {
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
export function compareItems<T>(item1: T | null | undefined, item2: T | null | undefined): boolean {
  // Si ambos son null o undefined, son iguales
  if ((item1 === null || item1 === undefined) && (item2 === null || item2 === undefined)) {
    return true;
  }
  
  // Si uno es null/undefined y el otro no, son diferentes
  if (item1 === null || item1 === undefined || item2 === null || item2 === undefined) {
    return false;
  }
  
  // Ambos tienen valor, comparar por id
  return compareByProperty(item1, item2, 'id' as keyof T);
}

/**
 * Compara monitores por StaffId para resolver inconsistencias entre DTOUser y DTOStaff
 * @param monitor1 Monitor 1 (puede ser DTOUser o DTOStaff)
 * @param monitor2 Monitor 2 (puede ser DTOUser o DTOStaff)
 * @returns true si los monitores son iguales, false en caso contrario
 */
export function compareMonitors(monitor1: any | null | undefined, monitor2: any | null | undefined): boolean {
  // Si ambos son null o undefined, son iguales
  if ((monitor1 === null || monitor1 === undefined) && (monitor2 === null || monitor2 === undefined)) {
    return true;
  }
  
  // Si uno es null/undefined y el otro no, son diferentes
  if (monitor1 === null || monitor1 === undefined || monitor2 === null || monitor2 === undefined) {
    return false;
  }
  
  // Comparar por StaffId si ambos lo tienen
  if (monitor1.staffId && monitor2.staffId) {
    return monitor1.staffId === monitor2.staffId;
  }

  // Si el monitor guardado es DTOStaff, usar su Id
  if (monitor1.id && monitor2.staffId) {
    return monitor1.id === monitor2.staffId;
  }

  // Si el monitor del dropdown es DTOUser, usar su StaffId
  if (monitor1.staffId && monitor2.id) {
    return monitor1.staffId === monitor2.id;
  }

  // Fallback a comparación normal por id
  if (monitor1.id && monitor2.id) {
    return monitor1.id === monitor2.id;
  }
  
  // Si no hay id en ninguno, comparar directamente
  return false;
}

/**
 * Compara dos elementos por una propiedad específica
 * @param item1 Elemento 1
 * @param item2 Elemento 2
 * @param property Propiedad a comparar
 * @returns true si los elementos son iguales, false en caso contrario
 */
export function compareByProperty<T extends { [key: string]: any }>(item1: T | null | undefined, item2: T | null | undefined, property: keyof T): boolean {
  // Si ambos son null o undefined, son iguales
  if ((item1 === null || item1 === undefined) && (item2 === null || item2 === undefined)) {
    return true;
  }
  
  // Si uno es null/undefined y el otro no, son diferentes
  if (item1 === null || item1 === undefined || item2 === null || item2 === undefined) {
    return false;
  }
  
  // Ambos tienen valor, comparar por la propiedad
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
    // Verificar que la clave y el valor no sean undefined o null
    if (key && model[key] !== null && model[key] !== undefined) {
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
        // Verificar que el valor no sea undefined antes de llamar toString()
        if (model[key] !== undefined) {
          const _b = model[key].toString();
          _p = _p.set(_a.replace(/"/g, "'"), _b.replace(/"/g, "'"));
        }
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

/**
 * Custom validator to check minimum age
 * @param minAge Minimum age required
 * @returns Validator function that returns ValidationErrors or null
 */
export function minimumAgeValidator(minAge: number): (control: AbstractControl) => ValidationErrors | null {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const birthDate = new Date(control.value);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age >= minAge ? null : { minimumAge: { requiredAge: minAge, actualAge: age } };
  };
}

/**
 * Custom validator to check maximum number of digits
 * @param maxDigits Maximum number of digits allowed
 * @returns Validator function that returns ValidationErrors or null
 */
export function maxDigitsValidator(maxDigits: number): (control: AbstractControl) => ValidationErrors | null {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const value = control.value.toString();
    const digitCount = value.replace(/\D/g, '').length;

    return digitCount <= maxDigits ? null : { 
      maxDigits: { 
        requiredMaxDigits: maxDigits, 
        actualDigits: digitCount 
      } 
    };
  };
}

/**
 * Custom validator to check alphanumeric pattern
 * @returns Validator function that returns ValidationErrors or null
 */
export function alphanumericValidator(): (control: AbstractControl) => ValidationErrors | null {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const value = control.value.toString();
    const alphanumericPattern = /^[A-Za-z0-9]+$/;

    return alphanumericPattern.test(value) ? null : { 
      alphanumeric: { 
        message: 'Solo se permiten letras y números' 
      } 
    };
  };
}

/**
 * Copia texto al portapapeles usando la Clipboard API del navegador
 * @param text Texto a copiar
 * @returns Promise que resuelve a true si se copió exitosamente, false en caso contrario
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    // Verificar si el navegador soporta la Clipboard API
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback para navegadores que no soportan Clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        return successful;
      } catch (err) {
        document.body.removeChild(textArea);
        return false;
      }
    }
  } catch (err) {
    console.error('Error al copiar al portapapeles:', err);
    return false;
  }
}

/**
 * Logs detallado de campos inválidos en un formulario reactivo
 * Incluye FormGroups anidados y muestra errores específicos por campo
 * @param formGroup FormGroup a validar
 * @param formName Nombre del formulario para el log (opcional)
 */
export function logFormValidationErrors(formGroup: UntypedFormGroup | FormGroup, formName: string = 'Formulario'): void {
  if (!formGroup || !formGroup.invalid) {
    return;
  }

  // Log detallado de campos inválidos
  console.group(`🔴 ${formName} Inválido - Campos con Errores`);
  console.log('Estado general del formulario:', {
    invalid: formGroup.invalid,
    touched: formGroup.touched,
    dirty: formGroup.dirty
  });

  // Función recursiva para validar controles y FormGroups anidados
  const getFormValidationErrors = (controls: any, path: string = ''): void => {
    Object.keys(controls).forEach(key => {
      const control = controls[key];
      const currentPath = path ? `${path}.${key}` : key;

      if (control instanceof UntypedFormGroup || control instanceof FormGroup) {
        // Si es un FormGroup, validar recursivamente
        getFormValidationErrors(control.controls, currentPath);
      } else {
        // Si es un FormControl, verificar si tiene errores
        if (control && control.invalid) {
          console.log(`❌ Campo: ${currentPath}`);
          console.log('Estado:', {
            invalid: control.invalid,
            touched: control.touched,
            dirty: control.dirty,
            value: control.value,
            errors: control.errors
          });

          // Mostrar mensajes de error específicos
          if (control.errors) {
            const errorMessages: string[] = [];
            if (control.errors['required']) {
              errorMessages.push('⚠️ Campo requerido');
            }
            if (control.errors['email']) {
              errorMessages.push('⚠️ Email inválido');
            }
            if (control.errors['pattern']) {
              errorMessages.push('⚠️ Formato inválido');
            }
            if (control.errors['puertoRicoPhone']) {
              errorMessages.push('⚠️ Teléfono de Puerto Rico inválido');
            }
            if (control.errors['minimumAge']) {
              errorMessages.push(`⚠️ ${control.errors['minimumAge'].message || 'Edad mínima no cumplida'}`);
            }
            if (control.errors['maxDigits']) {
              errorMessages.push(`⚠️ Máximo ${control.errors['maxDigits'].requiredMaxDigits || 'N'} dígitos permitidos`);
            }
            if (control.errors['alphanumeric']) {
              errorMessages.push('⚠️ Solo se permiten letras y números');
            }
            // Agregar otros tipos de errores si existen
            Object.keys(control.errors).forEach(errorKey => {
              if (!['required', 'email', 'pattern', 'puertoRicoPhone', 'minimumAge', 'maxDigits', 'alphanumeric'].includes(errorKey)) {
                errorMessages.push(`⚠️ Error: ${errorKey}`);
              }
            });
            console.log('Errores:', errorMessages);
          }
        }
      }
    });
  };

  // Iniciar validación recursiva
  getFormValidationErrors(formGroup.controls);

  // Resumen de campos inválidos
  const invalidFields: string[] = [];
  const getAllInvalidFields = (controls: any, path: string = ''): void => {
    Object.keys(controls).forEach(key => {
      const control = controls[key];
      const currentPath = path ? `${path}.${key}` : key;

      if (control instanceof UntypedFormGroup || control instanceof FormGroup) {
        getAllInvalidFields(control.controls, currentPath);
      } else if (control && control.invalid) {
        invalidFields.push(currentPath);
      }
    });
  };

  getAllInvalidFields(formGroup.controls);
  console.log('📋 Resumen - Campos inválidos:', invalidFields);
  console.groupEnd();
}

/**
 * Tipo para opciones de hora
 */
export interface TimeOption {
  value: string; // Formato HH:mm (24 horas)
  display: string; // Formato h:mm AM/PM (12 horas)
}

/**
 * Convierte hora 24h a formato 12h para mostrar
 * @param hour Hora en formato 24h (0-23)
 * @param minute Minutos (0-59)
 * @returns String en formato "h:mm AM/PM"
 */
export function convert24To12(hour: number, minute: number): string {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  const minuteStr = minute.toString().padStart(2, '0');
  return `${displayHour}:${minuteStr} ${period}`;
}

/**
 * Convierte string de tiempo a minutos desde medianoche
 * @param time String en formato HH:mm
 * @returns Número de minutos desde medianoche
 */
export function timeToMinutes(time: string): number {
  if (!time) return 0;
  const parts = time.split(':');
  if (parts.length < 2) return 0;
  const hours = parseInt(parts[0]) || 0;
  const minutes = parseInt(parts[1]) || 0;
  return hours * 60 + minutes;
}

/**
 * Convierte un objeto Date a minutos desde medianoche
 * @param date Objeto Date
 * @returns Número de minutos desde medianoche, 0 si date es null
 */
export function dateToMinutes(date: Date | null): number {
  if (!date || !(date instanceof Date)) return 0;
  return date.getHours() * 60 + date.getMinutes();
}

/**
 * Convierte un objeto Date a string en formato HH:mm
 * @param date Objeto Date
 * @returns String en formato HH:mm o string vacío si date es null
 */
export function dateToTimeString(date: Date | null): string {
  if (!date || !(date instanceof Date)) return '';
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Convierte string HH:mm a objeto Date
 * @param timeString String en formato HH:mm
 * @returns Objeto Date o null si timeString es inválido
 */
export function timeStringToDate(timeString: string): Date | null {
  if (!timeString) return null;
  const parts = timeString.split(':');
  if (parts.length < 2) return null;
  const hours = parseInt(parts[0]) || 0;
  const minutes = parseInt(parts[1]) || 0;
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
}

/**
 * Genera todas las opciones de hora (cada 30 minutos) dentro de un rango opcional
 * @param dayStartTime Hora de inicio del día en formato HH:mm (opcional, por defecto '00:00')
 * @param dayEndTime Hora de fin del día en formato HH:mm (opcional, por defecto '23:59')
 * @returns Array de opciones de hora con formato { value: string, display: string }
 */
export function generateTimeOptions(dayStartTime: string = '00:00', dayEndTime: string = '23:59'): TimeOption[] {
  const options: TimeOption[] = [];
  const dayStartMinutes = timeToMinutes(dayStartTime);
  const dayEndMinutes = timeToMinutes(dayEndTime);

  // Generar todas las opciones de tiempo (cada 30 minutos)
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time24 = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      const time12 = convert24To12(hour, minute);
      const timeMinutes = hour * 60 + minute;
      
      // Solo incluir horarios dentro del rango del día de funcionamiento
      if (timeMinutes >= dayStartMinutes && timeMinutes <= dayEndMinutes) {
        options.push({
          value: time24,
          display: time12
        });
      }
    }
  }

  return options;
}

/**
 * Filtra opciones de hora para mostrar solo las que son mayores que la hora de inicio
 * @param allOptions Array completo de opciones de hora
 * @param startTime Hora de inicio en formato HH:mm o Date
 * @param dayEndTime Hora de fin del día en formato HH:mm (opcional, por defecto '23:59')
 * @returns Array filtrado de opciones de hora
 */
export function filterEndTimeOptions(
  allOptions: TimeOption[],
  startTime: string | Date | null,
  dayEndTime: string = '23:59'
): TimeOption[] {
  if (!startTime) {
    return allOptions;
  }

  let startTimeString: string;
  if (startTime instanceof Date) {
    startTimeString = dateToTimeString(startTime);
  } else {
    startTimeString = startTime;
  }

  if (!startTimeString) {
    return allOptions;
  }

  const startMinutes = timeToMinutes(startTimeString);
  const dayEndMinutes = timeToMinutes(dayEndTime);

  return allOptions.filter(option => {
    const optionMinutes = timeToMinutes(option.value);
    return optionMinutes > startMinutes && optionMinutes <= dayEndMinutes;
  });
}

/**
 * Compara dos objetos Date por su hora (ignora la fecha)
 * @param date1 Primer objeto Date
 * @param date2 Segundo objeto Date
 * @returns true si las horas son iguales, false en caso contrario
 */
export function compareByTime(date1: Date | null, date2: Date | null): boolean {
  if (!date1 || !date2) return date1 === date2;
  if (!(date1 instanceof Date) || !(date2 instanceof Date)) return false;
  return date1.getHours() === date2.getHours() && date1.getMinutes() === date2.getMinutes();
}

/**
 * Normaliza un string de tiempo removiendo segundos si existen
 * @param time String de tiempo en formato HH:mm o HH:mm:ss
 * @returns String normalizado en formato HH:mm
 */
export function normalizeTime(time: string): string {
  if (!time) return '00:00';
  // Si tiene formato HH:mm:ss, remover los segundos
  const parts = time.split(':');
  if (parts.length >= 2) {
    return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
  }
  return time;
}
