import { ColumnSchema } from 'app/shared/components/generic-table/generic-table.interface';

export const AGENCY_STATUS_HISTORY_COLUMNS_SCHEMA: ColumnSchema[] = [
  {
    key: 'agencyName',
    type: 'text',
    label: 'agency-status-history.list.table.columns.auspiciador',
  },
  {
    key: 'statusName',
    type: 'text',
    label: 'agency-status-history.list.table.columns.status',
  },
  {
    key: 'changedAt',
    type: 'date-time',
    label: 'agency-status-history.list.table.columns.changedAt',
  },
  {
    key: 'changedByName',
    type: 'text',
    label: 'agency-status-history.list.table.columns.changedBy',
  },
  {
    key: 'justification',
    type: 'text',
    label: 'agency-status-history.list.table.columns.justification',
  },
];
