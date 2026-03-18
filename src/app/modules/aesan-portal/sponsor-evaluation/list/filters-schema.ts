import { FilterSchema } from 'app/shared/components/generic-filter-panel/generic-filter-panel.interface';

export const SPONSOR_EVALUATION_FILTERS_SCHEMA: FilterSchema[] = [
  {
    key: 'name',
    type: 'text',
    label: 'sponsor-evaluation.list.filters.name',
  },
  {
    key: 'uieNumber',
    type: 'text',
    label: 'sponsor-evaluation.list.filters.uieNumber',
  },
  {
    key: 'einNumber',
    type: 'text',
    label: 'sponsor-evaluation.list.filters.einNumber',
  },
  {
    key: 'sdrNumber',
    type: 'text',
    label: 'sponsor-evaluation.list.filters.ssPatronal',
  },
];