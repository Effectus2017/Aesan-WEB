import { FilterSchema } from 'app/shared/components/generic-filter-panel/generic-filter-panel.interface';

export const AGENCY_STATUS_HISTORY_FILTERS_SCHEMA: FilterSchema[] = [
  {
    key: 'agencyId',
    type: 'text',
    label: 'agency-status-history.list.filters.agency',
  },
  {
    key: 'createdAt',
    type: 'date-time',
    label: 'agency-status-history.list.table.columns.changedAt',
  },
];
