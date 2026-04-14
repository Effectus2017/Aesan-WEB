import { ColumnSchema } from 'app/shared/components/generic-table/generic-table.interface';

/** Columnas de solo lectura para miembros de junta (evaluación auspiciadores). */
export const AGENCY_BOARD_MEMBERS_READONLY_COLUMNS_SCHEMA: ColumnSchema[] = [
  {
    key: ['firstName', 'middleName', 'fatherLastName', 'motherLastName'],
    type: 'combined-text',
    label: 'sponsor-evaluation.agencyBoardMembersModal.columnFullName',
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
    key: 'email',
    type: 'text',
    label: 'sponsor-evaluation.agencyBoardMembersModal.columnEmail',
  },
  {
    key: 'isActive',
    type: 'boolean',
    label: 'sponsor-evaluation.agencyBoardMembersModal.columnStatus',
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
