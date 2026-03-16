import { FilterSchema } from 'app/shared/components/generic-filter-panel/generic-filter-panel.interface';

export const LOGS_FILTERS_SCHEMA: FilterSchema[] = [
  {
    key: 'logCategory',
    type: 'text',
    label: 'logs.list.filters.category',
  },
  {
    key: 'log',
    type: 'date',
    label: 'logs.list.filters.dateRange',
  },
];
