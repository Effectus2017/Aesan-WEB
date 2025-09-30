import { ColumnSchema } from 'app/shared/components/generic-table/generic-table.interface';

export const DAY_EVENTS_COLUMNS_SCHEMA: ColumnSchema[] = [
  {
    key: 'title',
    type: 'text',
    label: 'schools.calendar.day-events.table.columns.title'
  },
  {
    key: 'startTime',
    type: 'text',
    label: 'schools.calendar.day-events.table.columns.startTime'
  },
  {
    key: 'endTime',
    type: 'text',
    label: 'schools.calendar.day-events.table.columns.endTime'
  },
  {
    key: 'type',
    type: 'text',
    label: 'schools.calendar.day-events.table.columns.type'
  },
  {
    key: 'comment',
    type: 'text',
    label: 'schools.calendar.day-events.table.columns.comment'
  },
  {
    key: 'actions',
    type: 'button',
    label: 'schools.calendar.day-events.table.columns.actions',
    buttons: [
      {
        key: 'edit',
        label: 'schools.calendar.day-events.table.buttons.edit',
        icon: 'heroicons_outline:pencil'
      },
      {
        key: 'delete',
        label: 'schools.calendar.day-events.table.buttons.delete',
        icon: 'heroicons_outline:trash'
      }
    ]
  }
];
