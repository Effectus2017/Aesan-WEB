import { FormGroup, Validators } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import { OrganizationType } from '../models/catalog/OrganizationType';

/**
 * Utilidades para manejo de visibilidad de campos
 * Field visibility utilities
 */
export class FieldVisibilityUtil {
  /**
   * Actualiza la visibilidad del campo Tipo de Centro basado en el tipo de organización seleccionado
   * Updates the Center Type field visibility based on the selected organization type
   * @param formGroup FormGroup que contiene los campos / FormGroup containing the fields
   * @param organizationType Tipo de organización seleccionado / Selected organization type
   * @param centerTypeField Nombre del campo centerType / Center type field name
   * @param changeDetectorRef ChangeDetectorRef para detectar cambios / ChangeDetectorRef to detect changes
   * @param submitDisabledSetter Función opcional para actualizar el estado del botón de envío / Optional function to update submit button state
   * @returns Objeto con el valor de visibilidad del campo / Object with field visibility value
   */
  static updateCenterTypeFieldVisibility(
    formGroup: FormGroup,
    organizationType: OrganizationType | null,
    centerTypeField: string = 'centerType',
    changeDetectorRef?: ChangeDetectorRef,
    submitDisabledSetter?: (disabled: boolean) => void
  ): { showCenterTypeField: boolean } {
    const centerTypeControl = formGroup.get(centerTypeField);

    if (organizationType) {
      const showCenterTypeField = organizationType.requiresCenterType;

      // Si no requiere tipo de centro, limpiar el valor y remover validación requerida
      if (!organizationType.requiresCenterType) {
        centerTypeControl?.setValue(null);
        centerTypeControl?.clearValidators();
        centerTypeControl?.updateValueAndValidity();
      } else {
        // Si requiere tipo de centro, agregar validación requerida
        centerTypeControl?.setValidators([Validators.required]);
        centerTypeControl?.updateValueAndValidity();
      }

      // Actualizar el estado del botón después de cambiar las validaciones
      if (submitDisabledSetter) {
        submitDisabledSetter(formGroup.invalid);
      }

      if (changeDetectorRef) {
        changeDetectorRef.detectChanges();
      }

      return { showCenterTypeField };
    } else {
      const showCenterTypeField = false;
      centerTypeControl?.clearValidators();
      centerTypeControl?.updateValueAndValidity();

      if (submitDisabledSetter) {
        submitDisabledSetter(formGroup.invalid);
      }

      if (changeDetectorRef) {
        changeDetectorRef.detectChanges();
      }

      return { showCenterTypeField };
    }
  }
}

