import { FilterSchema } from 'app/shared/components/generic-filter-panel/generic-filter-panel.interface';

export const USERS_AGENCY_FILTERS_SCHEMA: FilterSchema[] = [
  {
    key: 'name',
    type: 'text',
    label: 'users.list.filters.name',
  },
];
