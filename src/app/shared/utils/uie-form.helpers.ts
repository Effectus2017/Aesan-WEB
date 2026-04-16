import { AbstractControl } from '@angular/forms';

/** Claves i18n para mensajes de error del campo IUE (una prioridad a la vez). */
export interface UieErrorTranslationKeys {
  required: string;
  alphanumeric: string;
  length: string;
  exists: string;
}

/**
 * Devuelve la clave Transloco del único error visible del IUE: requerido → alfanumérico → longitud → ya existe.
 */
export function getUieFormErrorTranslationKey(control: AbstractControl | null, keys: UieErrorTranslationKeys): string | null {
  if (!control?.errors) {
    return null;
  }
  if (control.hasError('required') && (control.touched || control.dirty)) {
    return keys.required;
  }
  if (control.hasError('alphanumeric')) {
    return keys.alphanumeric;
  }
  if (control.hasError('minlength') || control.hasError('maxlength')) {
    return keys.length;
  }
  if (control.hasError('uieExists')) {
    return keys.exists;
  }
  return null;
}

/**
 * Convierte el valor del input IUE a mayúsculas y restaura la posición del cursor.
 */
export function applyUieInputUppercase(event: Event, control: AbstractControl, markForCheck: () => void): void {
  const input = event.target as HTMLInputElement;
  const raw = input.value ?? '';
  const upper = raw.toUpperCase();
  if (raw === upper) {
    return;
  }
  const start = input.selectionStart ?? upper.length;
  const end = input.selectionEnd ?? upper.length;
  control.setValue(upper, { emitEvent: true });
  markForCheck();
  requestAnimationFrame(() => {
    const len = upper.length;
    const s = Math.min(start, len);
    const e = Math.min(end, len);
    input.setSelectionRange(s, e);
  });
}
