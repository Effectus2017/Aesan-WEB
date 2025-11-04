/**
 * Constantes para tipos de servicio
 * IDs fijos e inmutables (1-10)
 */
export const ServiceTypeIds = {
  Breakfast: 1,
  Lunch: 2,
  SnackAM: 3,
  Dinner: 4,
  SnackPM: 5,
  SnackNight: 6,
  DinnerExtended: 7,
  DinnerAtRisk: 8,
  SnackExtended: 9,
  SnackAtRisk: 10
} as const;

/**
 * Tipos de servicio con información completa
 */
export interface ServiceTypeOption {
  id: number;
  name: string;
  nameEN: string;
  code: string;
  displayOrder: number;
}

/**
 * Lista de tipos de servicio disponibles
 */
export const ServiceTypes: ServiceTypeOption[] = [
  { id: 1, name: 'Desayuno', nameEN: 'Breakfast', code: 'BREAKFAST', displayOrder: 1 },
  { id: 2, name: 'Almuerzo', nameEN: 'Lunch', code: 'LUNCH', displayOrder: 2 },
  { id: 3, name: 'Merienda AM', nameEN: 'Morning Snack', code: 'SNACK_AM', displayOrder: 3 },
  { id: 4, name: 'Cena', nameEN: 'Dinner', code: 'DINNER', displayOrder: 4 },
  { id: 5, name: 'Merienda PM', nameEN: 'Afternoon Snack', code: 'SNACK_PM', displayOrder: 5 },
  { id: 6, name: 'Merienda Nocturna', nameEN: 'Night Snack', code: 'SNACK_NIGHT', displayOrder: 6 },
  { id: 7, name: 'Cena Extendida', nameEN: 'Dinner Extended', code: 'DINNER_EXTENDED', displayOrder: 7 },
  { id: 8, name: 'Cena en Riesgo', nameEN: 'Dinner At Risk', code: 'DINNER_AT_RISK', displayOrder: 8 },
  { id: 9, name: 'Merienda Extendida', nameEN: 'Snack Extended', code: 'SNACK_EXTENDED', displayOrder: 9 },
  { id: 10, name: 'Merienda en Riesgo', nameEN: 'Snack At Risk', code: 'SNACK_AT_RISK', displayOrder: 10 }
];

