import { FilterSchema } from 'app/shared/components/generic-filter-panel/generic-filter-panel.interface';

export const USER_MESSAGES_CENTER_FILTERS_SCHEMA: FilterSchema[] = [
  {
    key: 'readFilter',
    type: 'select',
    label: 'messages.center.filters.readStatus',
    options: [
      { value: 'all', label: 'messages.center.filters.options.all' },
      { value: 'read', label: 'messages.center.filters.options.read' },
      { value: 'unread', label: 'messages.center.filters.options.unread' },
      { value: 'deleted', label: 'messages.center.filters.options.deleted' }
    ]
  }
];
