import { FormGroup } from '@angular/forms';

export interface GenericHeaderConfig {
  // Propiedades obligatorias
  title: string;
  agency?: string;
  formGroup?: FormGroup;

  // Search Field config
  searchFieldShow?: boolean;
  searchInputPlaceholder?: string;
  searchButtonTooltip?: string;
  searchButtonDisabledTooltip?: string;
  searchButtonPermission?: string;

  // Buttons config
  goToAddButtonShow?: boolean;
  goToAddButtonTooltip?: string;
  goToAddButtonDisabledTooltip?: string;
  goToAddButtonPermission?: string;

  // Cancel Button config
  cancelButtonShow?: boolean;
  cancelButtonText?: string;
  cancelButtonTooltip?: string;
  cancelButtonDisabledTooltip?: string;
  cancelButtonPermission?: string;

  // Submit Button config
  submitButtonShow?: boolean;
  submitButtonText?: string;
  submitLoadingText?: string;
  submitDisabled?: boolean;
  submitButtonTooltip?: string;
  submitButtonDisabledTooltip?: string;
  submitButtonPermission?: string;

  // Save Button config
  saveButtonShow?: boolean;
  saveButtonText?: string;
  saveButtonTooltip?: string;
  saveButtonDisabledTooltip?: string;
  saveButtonPermission?: string;

  // Reject Button config
  rejectButtonShow?: boolean;
  rejectButtonText?: string;
  rejectButtonTooltip?: string;
  rejectButtonDisabledTooltip?: string;
  rejectButtonPermission?: string;

  // Custom Button config
  customButtonShow?: boolean;
  customButtonText?: string;
  customButtonColor?: string;
  customButtonClass?: string;
  customButtonDisabled?: boolean;
  customButtonIcon?: string;
  customButtonIconEnabled?: boolean;
  customButtonTooltip?: string;
  customButtonDisabledTooltip?: string;
  customButtonPermission?: string;

  // Clear Button config
  clearVisible?: boolean;
  clearButtonTooltip?: string;
  clearButtonDisabledTooltip?: string;
  clearButtonPermission?: string;

  // Upload Button config
  uploadButtonShow?: boolean;
  uploadButtonText?: string;
  uploadButtonColor?: string;
  uploadButtonClass?: string;
  uploadButtonDisabled?: boolean;
  uploadButtonTooltip?: string;
  uploadButtonDisabledTooltip?: string;
  uploadButtonPermission?: string;

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
  onSearch?: () => void;

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

  /**
   * Manejador para el evento custom
   */
  onCustom?: () => void;

  /**
   * Manejador para el evento de limpiar
   */
  onClean?: (event: Event) => void;

  /**
   * Manejador para el evento de subir
   */
  onHeaderUploadFile?: (event: Event) => void;
}
