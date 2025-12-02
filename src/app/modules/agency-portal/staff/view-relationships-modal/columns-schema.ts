import { ColumnSchema } from 'app/shared/components/generic-table/generic-table.interface';

// Esquema de columnas para la tabla de relaciones de parentesco (solo lectura)
export const VIEW_RELATIONSHIPS_COLUMNS_SCHEMA: ColumnSchema[] = [
  {
    key: ['relatedStaff.fullName'],
    type: 'combined-text',
    label: 'staff.edit.relationships.table.columns.relatedStaffFullName',
  },
  {
    key: 'relationshipType',
    type: 'text',
    label: 'staff.edit.relationships.table.columns.relationshipType',
  },
  {
    key: 'comment',
    type: 'text',
    label: 'staff.edit.relationships.table.columns.comment',
  },
  {
    key: 'isActive',
    type: 'boolean',
    label: 'staff.edit.relationships.table.columns.isActive',
  },
];

