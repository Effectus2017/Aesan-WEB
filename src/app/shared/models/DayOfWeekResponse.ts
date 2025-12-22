/**
 * Modelo de respuesta para los días de la semana con sus nombres
 */
export interface DayOfWeekResponse {
  /**
   * ID del día de la semana (1=Lunes, 2=Martes, ..., 7=Domingo)
   */
  id: number;

  /**
   * Nombre del día en español
   */
  name: string;

  /**
   * Nombre del día en inglés
   */
  nameEN: string;
}

