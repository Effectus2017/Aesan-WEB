import { ColumnSchema } from 'app/shared/components/generic-table/generic-table.interface';

export const STAFF_BY_SITE_COLUMNS_SCHEMA: ColumnSchema[] = [
    {
      key: ['firstName', 'middleName', 'fatherLastName', 'motherLastName'],
      type: 'combined-text',
      label: 'sponsor-evaluation.edit.staffBySite.table.columns.fullName',
    },
    {
      key: 'email',
      type: 'text',
      label: 'sponsor-evaluation.edit.staffBySite.table.columns.email',
    },
    {
      key: 'assignmentDate',
      type: 'date',
      label: 'sponsor-evaluation.edit.staffBySite.table.columns.assignmentDate',
    },
    {
      key: 'isPrimary',
      type: 'boolean',
      label: 'sponsor-evaluation.edit.staffBySite.table.columns.isPrimary',
    },
    {
      key: 'isActive',
      type: 'boolean',
      label: 'sponsor-evaluation.edit.staffBySite.table.columns.isActive',
    },
  ];
