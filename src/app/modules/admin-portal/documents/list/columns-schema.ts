import { ColumnSchema } from 'app/shared/components/generic-table/generic-table.interface';

export const COLUMNS_SCHEMA: ColumnSchema[] = [
  {
    key: 'fileName',
    type: 'text',
    label: 'documents.list.table.columns.fileName'
  },
  {
    key: 'documentType',
    type: 'text',
    label: 'documents.list.table.columns.documentType'
  },
  {
    key: 'description',
    type: 'text',
    label: 'documents.list.table.columns.description'
  },
  {
    key: 'fileSize',
    type: 'text',
    label: 'documents.list.table.columns.fileSize'
  },
  {
    key: 'contentType',
    type: 'text',
    label: 'documents.list.table.columns.contentType'
  },
  {
    key: ['uploadedByUser.firstName', 'uploadedByUser.fatherLastName'],
    type: 'combined-text',
    keys: ['uploadedByUser.firstName', 'uploadedByUser.fatherLastName'],
    label: 'documents.list.table.columns.uploadedBy'
  },
  {
    key: 'uploadDate',
    type: 'date-time',
    label: 'documents.list.table.columns.uploadDate'
  },
  {
    key: 'actions',
    type: 'button',
    label: 'documents.list.table.columns.actions',
    buttons: [
      {
        key: 'download',
        label: 'documents.list.table.buttons.download'
      },
      {
        key: 'delete',
        label: 'documents.list.table.buttons.delete'
      }
    ]
  }
];
