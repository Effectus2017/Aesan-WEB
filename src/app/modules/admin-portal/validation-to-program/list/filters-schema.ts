import { FilterSchema } from 'app/shared/components/generic-filter-panel/generic-filter-panel.interface';

export const VALIDATION_TO_PROGRAM_FILTERS_SCHEMA: FilterSchema[] = [
  {
    key: 'name',
    type: 'text',
    label: 'validation-to-program.list.table.columns.agencyName',
  },
  {
    key: 'uieNumber',
    type: 'text',
    label: 'validation-to-program.list.table.columns.uieNumber',
  },
  {
    key: 'einNumber',
    type: 'text',
    label: 'validation-to-program.list.table.columns.einNumber',
  },
  {
    key: 'sdrNumber',
    type: 'text',
    label: 'validation-to-program.list.table.columns.ssPatronal',
  },
];
