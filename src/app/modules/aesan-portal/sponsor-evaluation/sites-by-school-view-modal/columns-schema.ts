import { ColumnSchema } from 'app/shared/components/generic-table/generic-table.interface';

/** Igual que `SITES_COLUMNS_SCHEMA` del modal de Agencia, sin botón editar (solo calendario → ruta AESAN). */
export const SPONSOR_EVALUATION_SITES_BY_SCHOOL_VIEW_COLUMNS_SCHEMA: ColumnSchema[] = [
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
        key: 'viewSite',
        label: 'sites.list.table.buttons.viewSite',
        icon: 'heroicons_outline:rectangle-stack',
        tooltip: 'sites.list.table.buttons.viewSiteTooltip',
        permission: 'site.view',
        disableAgencyRestriction: true,
      },
      {
        key: 'viewServices',
        label: 'sponsor-evaluation.edit.sites.modal.services.button',
        icon: 'heroicons_outline:queue-list',
        tooltip: 'sponsor-evaluation.edit.sites.modal.services.buttonTooltip',
        permission: 'site.view',
        disableAgencyRestriction: true,
      },
      {
        key: 'calendar',
        label: 'sites.list.table.buttons.calendar',
        icon: 'heroicons_outline:calendar',
        tooltip: 'sponsor-evaluation.edit.sites.modal.servicesCalendar.calendarButtonTooltip',
        disableAgencyRestriction: true,
      },
      {
        key: 'visitCalendar',
        label: 'sponsor-evaluation.edit.sites.table.buttons.visitCalendar',
        icon: 'heroicons_outline:calendar-days',
        tooltip: 'sponsor-evaluation.edit.sites.table.buttons.visitCalendarTooltip',
        permission: 'site.view',
        disableAgencyRestriction: true,
      },
      {
        key: 'viewBoardMembers',
        label: 'sponsor-evaluation.edit.sitesBySchoolModal.buttons.boardMembers',
        icon: 'heroicons_outline:user-group',
        tooltip: 'sponsor-evaluation.edit.sitesBySchoolModal.tooltips.boardMembersRow',
        permission: 'site.view',
        disableAgencyRestriction: true,
      },
    ],
  },
];
