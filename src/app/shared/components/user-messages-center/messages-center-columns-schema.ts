import { ColumnSchema } from 'app/shared/components/generic-table/generic-table.interface';

export const USER_MESSAGES_CENTER_COLUMNS_SCHEMA: ColumnSchema[] = [
  {
    key: 'title',
    type: 'text',
    label: 'messages.center.table.columns.title'
  },
  {
    key: 'description',
    type: 'text',
    label: 'messages.center.table.columns.description'
  },
  {
    key: 'time',
    type: 'date-time',
    label: 'messages.center.table.columns.time'
  },
  {
    key: 'statusLabel',
    type: 'text',
    label: 'messages.center.table.columns.status'
  },
  {
    key: 'button',
    type: 'button',
    label: 'messages.center.table.columns.actions',
    buttons: [
      {
        key: 'element',
        label: 'messages.detail.viewDetails',
        tooltip: 'messages.detail.viewDetails',
        disableAgencyRestriction: true
      },
      {
        key: 'viewServices',
        label: 'messages.markAsRead',
        icon: 'heroicons_solid:check-circle',
        tooltip: 'messages.markAsRead',
        disableAgencyRestriction: true
      },
      {
        key: 'delete',
        label: 'messages.remove',
        tooltip: 'messages.remove',
        disableAgencyRestriction: true
      }
    ]
  }
];
