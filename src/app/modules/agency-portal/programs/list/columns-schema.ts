export const PROGRAMS_COLUMNS_SCHEMA = [
    {
        key: 'applicationNumber',
        label: 'programs.list.columns.title',
        sortable: true,
        type: 'text',
        searchable: true,
        visible: true
    },
    {
        key: 'createdBy',
        label: 'programs.list.columns.createdBy',
        sortable: true,
        type: 'text',
        searchable: true,
        visible: true
    },
    {
        key: 'createdAt',
        label: 'programs.list.columns.createdAt',
        sortable: true,
        type: 'date',
        searchable: false,
        visible: true,
        format: 'medium'
    },
    {
        key: 'actions',
        type: 'button',
        label: 'programs.list.columns.actions',
        buttons: [
          {
            key: 'edit',
            label: 'programs.list.buttons.edit'
          },
        ]
    }
];
