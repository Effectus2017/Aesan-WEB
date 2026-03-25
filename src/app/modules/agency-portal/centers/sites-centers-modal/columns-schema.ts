import { ColumnSchema } from 'app/shared/components/generic-table/generic-table.interface';

// Column schema for sites list in the modal
export const SITES_COLUMNS_SCHEMA: ColumnSchema[] = [
  {
    key: 'siteCode',
    type: 'text',
    label: 'sites.list.table.columns.siteCode',
  },
  {
    key: 'siteName',
    type: 'text',
    label: 'sites.list.table.columns.name',
  },
  {
    key: 'groupTypeName',
    type: 'text',
    label: 'sites.list.table.columns.groupTypeName',
  },
  {
    key: 'operatingDaysRange',
    type: 'date-range',
    keys: ['operatingFromDate', 'operatingToDate'],
    format: 'dd/MM/yyyy',
    label: 'sites.list.table.columns.operatingDays',
  },
  {
    key: 'approvalDate',
    type: 'date',
    label: 'sites.list.table.columns.approvalDate',
  },
  {
    key: 'actions',
    type: 'button',
    label: 'sites.list.table.columns.actions',
    buttons: [
      {
        key: 'edit',
        label: 'sites.list.table.buttons.edit',
      },
      {
        key: 'calendar',
        label: 'sites.list.table.buttons.calendar',
        icon: 'heroicons_outline:calendar',
      },
    ],
  },
];

