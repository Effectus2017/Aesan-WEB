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
