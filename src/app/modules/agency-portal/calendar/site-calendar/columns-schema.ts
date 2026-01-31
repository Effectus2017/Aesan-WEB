import { ColumnSchema } from 'app/shared/components/generic-table/generic-table.interface';

export const DAY_EVENTS_COLUMNS_SCHEMA: ColumnSchema[] = [
  {
    key: 'title',
    type: 'text',
    label: 'sites.calendar.day-events.table.columns.title'
  },
  {
    key: 'groupName',
    type: 'text',
    label: 'sites.calendar.day-events.table.columns.groupName'
  },
  {
    key: 'startTime',
    type: 'text',
    label: 'sites.calendar.day-events.table.columns.startTime'
  },
  {
    key: 'endTime',
    type: 'text',
    label: 'sites.calendar.day-events.table.columns.endTime'
  },
  {
    key: 'type',
    type: 'text',
    label: 'sites.calendar.day-events.table.columns.type'
  },
  {
    key: 'comment',
    type: 'text',
    label: 'sites.calendar.day-events.table.columns.comment'
  },
  {
    key: 'actions',
    type: 'button',
    label: 'sites.calendar.day-events.table.columns.actions',
    buttons: [
      {
        key: 'edit-modal',
        label: 'sites.calendar.day-events.table.buttons.edit',
        icon: 'mat_solid:edit'
      },
      {
        key: 'toggle',
        label: 'sites.calendar.day-events.table.buttons.toggle',
        icon: 'heroicons_outline:check-circle'
      }
    ]
  }
];
