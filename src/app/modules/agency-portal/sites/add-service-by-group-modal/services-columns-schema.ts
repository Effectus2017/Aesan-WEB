import { ColumnSchema } from 'app/shared/components/generic-table/generic-table.interface';

export const SERVICES_COLUMNS_SCHEMA: ColumnSchema[] = [
  {
    key: 'groupName',
    label: 'sites.add.services.table.group-name',
    type: 'text',
    sortable: true,
  },
  {
    key: 'numberOfChildren',
    label: 'sites.add.services.table.number-of-children',
    type: 'text',
    sortable: true,
  },
  {
    key: 'breakfast',
    label: 'sites.add.services.table.breakfast',
    type: 'boolean',
    sortable: false,
  },
  {
    key: 'lunch',
    label: 'sites.add.services.table.lunch',
    type: 'boolean',
    sortable: false,
  },
  {
    key: 'snackAM',
    label: 'sites.add.services.table.snack-am',
    type: 'boolean',
    sortable: false,
  },
  {
    key: 'dinner',
    label: 'sites.add.services.table.dinner',
    type: 'boolean',
    sortable: false,
  },
  {
    key: 'snackPM',
    label: 'sites.add.services.table.snack-pm',
    type: 'boolean',
    sortable: false,
  },
  {
    key: 'snackNight',
    label: 'sites.add.services.table.snack-night',
    type: 'boolean',
    sortable: false,
  },
  {
    key: 'dinnerExtended',
    label: 'sites.add.services.table.dinner-extended',
    type: 'boolean',
    sortable: false,
  },
  {
    key: 'dinnerAtRisk',
    label: 'sites.add.services.table.dinner-at-risk',
    type: 'boolean',
    sortable: false,
  },
  {
    key: 'snackExtended',
    label: 'sites.add.services.table.snack-extended',
    type: 'boolean',
    sortable: false,
  },
  {
    key: 'snackAtRisk',
    label: 'sites.add.services.table.snack-at-risk',
    type: 'boolean',
    sortable: false,
  },
];
