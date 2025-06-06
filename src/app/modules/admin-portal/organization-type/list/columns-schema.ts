import { ColumnSchema } from 'app/shared/components/generic-table/generic-table.interface';

export const ORGANIZATION_TYPE_COLUMNS_SCHEMA: ColumnSchema[] = [
  { key: 'id', type: 'text', label: 'ID' },
  { key: 'name', type: 'text', label: 'Nombre' },
  { key: 'nameEN', type: 'text', label: 'Nombre (EN)' },
  { key: 'isActive', type: 'boolean', label: 'Activo' },
  { key: 'displayOrder', type: 'text', label: 'Orden' },
  { key: 'actions', type: 'button', label: 'Acciones' },
];
