import { ColumnSchema } from 'app/shared/components/generic-table/generic-table.interface';

// Esquema de columnas para la tabla de relaciones de parentesco
export const STAFF_RELATIONSHIPS_COLUMNS_SCHEMA: ColumnSchema[] = [
  {
    key: 'relatedStaffFullName',
    type: 'text',
    label: 'staff.edit.relationships.table.columns.relatedStaffFullName',
  },
  {
    key: 'relationshipType',
    type: 'text',
    label: 'staff.edit.relationships.table.columns.relationshipType',
  },
  {
    key: 'actions',
    type: 'button',
    label: 'staff.edit.relationships.table.columns.actions',
    buttons: [
      {
        key: 'edit',
        label: 'staff.edit.relationships.table.buttons.edit',
      },
      {
        key: 'delete',
        label: 'staff.edit.relationships.table.buttons.delete',
      },
    ],
  },
];
