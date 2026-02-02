/**
 * Estilos (color e icono) por tipo de servicio.
 * Orden 1-10 según ServiceTypeIds. Usado en generic table, calendario y modal "Servicios del día".
 */
import { ServiceTypeIds } from './service-type.constants';

export interface ServiceTypeStyle {
  primary: string;
  secondary: string;
  icon: string;
  bg: string;
  border: string;
  text: string;
  textMedium: string;
}

const DEFAULT_SERVICE_COLOR = { primary: '#2196f3', secondary: '#bbdefb' };

const STYLES_BY_ID: Record<number, ServiceTypeStyle> = {
  [ServiceTypeIds.Breakfast]: {
    primary: '#2196f3',
    secondary: '#bbdefb',
    icon: '🥣',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-100 dark:border-blue-800',
    text: 'text-blue-800 dark:text-blue-300',
    textMedium: 'text-blue-600 dark:text-blue-400'
  },
  [ServiceTypeIds.Lunch]: {
    primary: '#ff9800',
    secondary: '#ffe0b2',
    icon: '🍛',
    bg: 'bg-orange-50 dark:bg-orange-900/20',
    border: 'border-orange-100 dark:border-orange-800',
    text: 'text-orange-800 dark:text-orange-300',
    textMedium: 'text-orange-600 dark:text-orange-400'
  },
  [ServiceTypeIds.SnackAM]: {
    primary: '#4caf50',
    secondary: '#c8e6c9',
    icon: '🍎',
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-100 dark:border-green-800',
    text: 'text-green-800 dark:text-green-300',
    textMedium: 'text-green-600 dark:text-green-400'
  },
  [ServiceTypeIds.Dinner]: {
    primary: '#9c27b0',
    secondary: '#e1bee7',
    icon: '🌙',
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    border: 'border-purple-100 dark:border-purple-800',
    text: 'text-purple-800 dark:text-purple-300',
    textMedium: 'text-purple-600 dark:text-purple-400'
  },
  [ServiceTypeIds.SnackPM]: {
    primary: '#4caf50',
    secondary: '#c8e6c9',
    icon: '🍪',
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-100 dark:border-green-800',
    text: 'text-green-800 dark:text-green-300',
    textMedium: 'text-green-600 dark:text-green-400'
  },
  [ServiceTypeIds.SnackNight]: {
    primary: '#3f51b5',
    secondary: '#c5cae9',
    icon: '🥛',
    bg: 'bg-indigo-50 dark:bg-indigo-900/20',
    border: 'border-indigo-100 dark:border-indigo-800',
    text: 'text-indigo-800 dark:text-indigo-300',
    textMedium: 'text-indigo-600 dark:text-indigo-400'
  },
  [ServiceTypeIds.DinnerExtended]: {
    primary: '#e91e63',
    secondary: '#f8bbd9',
    icon: '🕰️',
    bg: 'bg-pink-50 dark:bg-pink-900/20',
    border: 'border-pink-100 dark:border-pink-800',
    text: 'text-pink-800 dark:text-pink-300',
    textMedium: 'text-pink-600 dark:text-pink-400'
  },
  [ServiceTypeIds.DinnerAtRisk]: {
    primary: '#f44336',
    secondary: '#ffcdd2',
    icon: '🍝',
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-100 dark:border-red-800',
    text: 'text-red-800 dark:text-red-300',
    textMedium: 'text-red-600 dark:text-red-400'
  },
  [ServiceTypeIds.SnackExtended]: {
    primary: '#009688',
    secondary: '#b2dfdb',
    icon: '🍪',
    bg: 'bg-teal-50 dark:bg-teal-900/20',
    border: 'border-teal-100 dark:border-teal-800',
    text: 'text-teal-800 dark:text-teal-300',
    textMedium: 'text-teal-600 dark:text-teal-400'
  },
  [ServiceTypeIds.SnackAtRisk]: {
    primary: '#f44336',
    secondary: '#ffcdd2',
    icon: '🥪',
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-100 dark:border-red-800',
    text: 'text-red-800 dark:text-red-300',
    textMedium: 'text-red-600 dark:text-red-400'
  }
};

/** Obtiene el estilo para un serviceTypeId (1-10). Si no existe, devuelve estilo por defecto (azul). */
export function getServiceTypeStyle(serviceTypeId: number | undefined | null): ServiceTypeStyle {
  if (serviceTypeId != null && STYLES_BY_ID[serviceTypeId]) {
    return STYLES_BY_ID[serviceTypeId];
  }
  return {
    ...DEFAULT_SERVICE_COLOR,
    icon: '🍽️',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-100 dark:border-blue-800',
    text: 'text-blue-800 dark:text-blue-300',
    textMedium: 'text-blue-600 dark:text-blue-400'
  };
}

/** Devuelve { primary, secondary } para CalendarEvent.color cuando no hay serviceTypeId. */
export function getDefaultServiceEventColor(): { primary: string; secondary: string } {
  return DEFAULT_SERVICE_COLOR;
}

/** Devuelve { primary, secondary } para CalendarEvent.color según serviceTypeId. */
export function getServiceEventColorByTypeId(serviceTypeId: number | undefined | null): {
  primary: string;
  secondary: string;
} {
  const style = getServiceTypeStyle(serviceTypeId ?? undefined);
  return { primary: style.primary, secondary: style.secondary };
}

/** Array de estilos por índice 0-9 para fallback cuando no hay serviceTypeId (compatibilidad generic table). */
export const SERVICE_TYPE_STYLES_BY_INDEX: ServiceTypeStyle[] = [
  STYLES_BY_ID[ServiceTypeIds.Breakfast],
  STYLES_BY_ID[ServiceTypeIds.Lunch],
  STYLES_BY_ID[ServiceTypeIds.SnackAM],
  STYLES_BY_ID[ServiceTypeIds.SnackPM],
  STYLES_BY_ID[ServiceTypeIds.Dinner],
  STYLES_BY_ID[ServiceTypeIds.SnackNight],
  STYLES_BY_ID[ServiceTypeIds.DinnerExtended],
  STYLES_BY_ID[ServiceTypeIds.DinnerAtRisk],
  STYLES_BY_ID[ServiceTypeIds.SnackExtended],
  STYLES_BY_ID[ServiceTypeIds.SnackAtRisk]
];
