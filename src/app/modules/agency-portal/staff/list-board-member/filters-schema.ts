import { FilterSchema } from 'app/shared/components/generic-filter-panel/generic-filter-panel.interface';

export const BOARD_MEMBERS_FILTERS_SCHEMA: FilterSchema[] = [
  {
    key: 'name',
    type: 'text',
    label: 'staff.boardMembers.list.table.columns.fullName',
  },
];
