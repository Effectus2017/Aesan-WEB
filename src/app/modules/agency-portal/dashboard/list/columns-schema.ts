import { ColumnSchema } from 'app/shared/components/generic-table/generic-table.interface';

export const AGENCY_DASHBOARD_COLUMNS_SCHEMA: ColumnSchema[] = [
    {
        key: 'formNumber',
        type: 'text',
        label: 'agency.dashboard.table.formNumber',
        visible: true,
        sortable: true,
        searchable: false
    },
    {
        key: 'formName',
        type: 'text',
        label: 'agency.dashboard.table.formName',
        visible: true,
        sortable: true,
        searchable: false
    },
    {
        key: 'status',
        type: 'text',
        label: 'agency.dashboard.table.status',
        visible: true,
        sortable: false,
        searchable: false
    },
    {
        key: 'submissionDate',
        type: 'date',
        label: 'agency.dashboard.table.submissionDate',
        visible: true,
        sortable: false,
        searchable: false
    },
    {
        key: 'approvalDate',
        type: 'date',
        label: 'agency.dashboard.table.approvalDate',
        visible: true,
        sortable: false,
        searchable: false
    },
    {
        key: 'actions',
        type: 'button',
        label: 'agency.dashboard.table.actions',
        visible: true,
        sortable: false,
        searchable: false,
        buttons: [
            {
                key: 'view',
                label: 'agency.dashboard.table.view',
                icon: 'heroicons_outline:eye',
                tooltip: 'agency.dashboard.table.view',
                color: 'primary'
            },
            {
                key: 'edit',
                label: 'agency.dashboard.table.edit',
                icon: 'heroicons_outline:pencil',
                tooltip: 'agency.dashboard.table.edit',
                color: 'primary'
            }
        ]
    }
];

// Schema de columnas para la tabla de escuelas en el dashboard
export const AGENCY_DASHBOARD_SCHOOLS_COLUMNS_SCHEMA: ColumnSchema[] = [
    {
        key: 'schoolCode',
        type: 'text',
        label: 'schools.list.table.columns.schoolCode',
        visible: true,
        sortable: true,
        searchable: false
    },
    {
        key: 'name',
        type: 'text',
        label: 'schools.list.table.columns.name',
        visible: true,
        sortable: true,
        searchable: false
    },
    {
        key: 'sitesCount',
        type: 'text',
        label: 'schools.list.table.columns.sites-count',
        visible: true,
        sortable: false,
        searchable: false
    },
    {
        key: 'createdAt',
        type: 'date',
        label: 'schools.list.table.columns.createdAt',
        visible: true,
        sortable: false,
        searchable: false
    }
];
