export const PREOPERATIONAL_VISIT_COLUMNS_SCHEMA = [
    {
        key: 'name',
        label: 'preoperational-visit.list.columns.agency',
        sortable: true,
        type: 'text',
        searchable: true,
        visible: true
    },
    {
        key: 'uieNumber',
        label: 'preoperational-visit.list.columns.uie',
        sortable: true,
        type: 'text',
        searchable: true,
        visible: true
    },
    {
        key: 'status.name',
        label: 'preoperational-visit.list.columns.status',
        sortable: true,
        type: 'text',
        searchable: true,
        visible: true
    },
    {
        key: 'rejectionJustification',
        label: 'preoperational-visit.list.columns.comments',
        sortable: true,
        type: 'text',
        searchable: true,
        visible: true
    },
    {
        key: 'actions',
        type: 'button',
        label: 'preoperational-visit.list.columns.actions',
        buttons: [
          {
            key: 'edit',
            label: 'preoperational-visit.list.buttons.edit'
          },
        ]
    }
];
