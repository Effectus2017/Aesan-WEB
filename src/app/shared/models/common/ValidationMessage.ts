/** Mensaje de validación con tipo (error, warning o null) y texto. */
export interface ValidationMessage {
  type: 'error' | 'warning' | null;
  message: string | null;
}
