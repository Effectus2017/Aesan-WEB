export interface OnGenericEditComponentHandler {
  /**
   * Método para establecer el formulario
   * @param param
   */
  onSetForm?: (param: any) => void;
  /**
   * Método para actualizar un elemento
   * @param param
   */
  onUpdate?: (param: any) => void;
}

export interface OnGenericAddComponentHandler {
  /**
   * Método para agregar un nuevo elemento
   * @param param
   */
  onAdd?: (param: any) => void;
}
