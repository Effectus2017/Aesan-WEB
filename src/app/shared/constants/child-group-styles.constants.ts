/** Paleta de colores para bordes de grupos en calendario (por índice). */
export const CHILD_GROUP_BORDER_COLORS: string[] = [
  '#2196f3',
  '#4caf50',
  '#ff9800',
  '#9c27b0',
  '#00bcd4',
  '#e91e63',
  '#795548',
  '#607d8b',
  '#3f51b5',
  '#009688'
];

/** Obtiene el color de borde para un grupo según su índice (0-based). */
export function getGroupBorderColor(groupIndex: number): string {
  return CHILD_GROUP_BORDER_COLORS[groupIndex % CHILD_GROUP_BORDER_COLORS.length] ?? '#9e9e9e';
}
