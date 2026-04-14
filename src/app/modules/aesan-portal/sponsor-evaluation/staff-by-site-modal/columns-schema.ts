import { ColumnSchema } from 'app/shared/components/generic-table/generic-table.interface';

export const STAFF_BY_SITE_COLUMNS_SCHEMA: ColumnSchema[] = [
  {
    key: ['firstName', 'middleName', 'fatherLastName', 'motherLastName'],
    type: 'combined-text',
    label: 'sponsor-evaluation.edit.staffBySite.table.columns.fullName',
  },
  {
    key: 'positionName',
    type: 'text',
    label: 'sponsor-evaluation.agencyBoardMembersModal.columnTitle',
  },
  {
    key: 'birthDate',
    type: 'date',
    label: 'sponsor-evaluation.agencyBoardMembersModal.columnBirthDate',
  },
  {
    key: 'contractStartDate',
    type: 'date',
    label: 'sponsor-evaluation.edit.staffBySite.table.columns.contractStartDate',
  },
  {
    key: 'contractEndDate',
    type: 'date',
    label: 'sponsor-evaluation.edit.staffBySite.table.columns.contractEndDate',
  },
  {
    key: 'actions',
    type: 'button',
    label: 'sponsor-evaluation.edit.staffBySite.table.columns.actions',
    buttons: [
      {
        key: 'viewStaffDetail',
        label: 'sponsor-evaluation.edit.staffBySite.table.buttons.viewDetail',
        icon: 'heroicons_outline:eye',
        tooltip: 'sponsor-evaluation.edit.staffBySite.table.buttons.viewDetailTooltip',
        permission: 'staff.view',
        disableAgencyRestriction: true,
      },
    ],
  },
];
