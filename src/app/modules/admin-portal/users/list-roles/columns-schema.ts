import { ColumnSchema } from 'app/shared/components/generic-table/generic-table.interface';

export const ROLES_COLUMNS_SCHEMA: ColumnSchema[] = [
    {
      key: 'name',
      type: 'text',
      label: 'Nombre',
    },
    {
      key: 'button',
      type: 'button',
      label: '',
      buttons: [],
    },
  ];
