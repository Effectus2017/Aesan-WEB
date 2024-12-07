export const PROGRAM_REQUESTS_COLUMNS_SCHEMA = [
    {
        key: 'title',
        label: 'program-requests.list.columns.title',
        sortable: true,
        type: 'text',
        searchable: true,
        visible: true
    },
    {
        key: 'createdBy',
        label: 'program-requests.list.columns.createdBy',
        sortable: true,
        type: 'text',
        searchable: true,
        visible: true
    },
    {
        key: 'createdAt',
        label: 'program-requests.list.columns.createdAt',
        sortable: true,
        type: 'date',
        searchable: false,
        visible: true,
        format: 'medium'
    },
    {
        key: 'actions',
        type: 'button',
        label: 'program-requests.list.columns.actions',
        buttons: [
          {
            key: 'edit',
            label: 'program-requests.list.buttons.edit'
          },
        ]
    }
];
