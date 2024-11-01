import { FormGroup } from '@angular/forms';

export interface GenericHeaderConfig {
  // Propiedades obligatorias
  title: string;
  formGroup?: FormGroup;

  // Search Field config
  searchFieldShow?: boolean;
  searchInputPlaceholder?: string;

  // Buttons config
  goToAddButtonShow?: boolean;

  // Cancel Button config
  cancelButtonShow?: boolean;
  cancelButtonText?: string;

  // Submit Button config
  submitButtonShow?: boolean;
  submitButtonText?: string;
  submitLoadingText?: string;

  // Save Button config
  saveButtonShow?: boolean;
  saveButtonText?: string;

  // Reject Button config
  rejectButtonShow?: boolean;
  rejectButtonText?: string;

  // Clear Button config
  clearVisible?: boolean;

  // Loading config
  isLoading?: boolean;

}

export interface OnGenericHeaderHandlers {
  headerConfig: GenericHeaderConfig;
  /**
   * Manejador para el evento de limpieza del formulario
   * @param event Evento del DOM que triggered la limpieza
   */
  onClear?: (event: Event) => void;

  /**
   * Manejador para el evento de envío del formulario
   */
  onSubmit?: () => void | Promise<void>;

  /**
   * Manejador para el evento de cancelación
   * @param event Evento del DOM que triggered la cancelación
   */
  onCancel?: (event: Event) => void;

  /**
   * Manejador para el evento de búsqueda
   * @param searchTerm Término de búsqueda actual
   */
  onSearch?: (searchTerm: string) => void;

  /**
   * Manejador para el evento de navegación al agregar
   */
  onAdd?: () => void;

  /**
   * Manejador para el evento de guardar
   */
  onSave?: () => void;

  /**
   * Manejador para el evento de rechazar
   */
  onReject?: () => void;
}
