import { FilterSchema } from 'app/shared/components/generic-filter-panel/generic-filter-panel.interface';

export const EMAIL_LOGS_FILTERS_SCHEMA: FilterSchema[] = [
  {
    key: 'status',
    type: 'text',
    label: 'email-logs.list.filters.status.label',
  },
  {
    key: 'emailType',
    type: 'text',
    label: 'email-logs.list.filters.emailType.label',
  },
  {
    key: 'showOnlyFailed',
    type: 'boolean',
    label: 'email-logs.list.filters.showOnlyFailed',
  },
];
