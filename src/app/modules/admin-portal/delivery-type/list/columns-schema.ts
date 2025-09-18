import { ColumnSchema } from 'app/shared/components/generic-table/generic-table.interface';

export const DELIVERY_TYPE_COLUMNS_SCHEMA: ColumnSchema[] = [
  { key: 'id', type: 'text', label: 'delivery-type.list.table.columns.id' },
  { key: 'name', type: 'text', label: 'delivery-type.list.table.columns.name' },
  { key: 'nameEN', type: 'text', label: 'delivery-type.list.table.columns.nameEN' },
  { key: 'isActive', type: 'text', label: 'delivery-type.list.table.columns.isActive' },
  { key: 'selectionNotification', type: 'text', label: 'delivery-type.list.table.columns.selectionNotification' },
  { key: 'displayOrderUI', type: 'text', label: 'delivery-type.list.table.columns.displayOrder' },
  { key: 'actions', type: 'button', label: 'delivery-type.list.table.columns.actions', buttons: [ { key: 'edit', label: 'delivery-type.list.table.buttons.edit' } ] },
];
