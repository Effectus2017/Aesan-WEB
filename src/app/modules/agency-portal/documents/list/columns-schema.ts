import { ColumnSchema } from 'app/shared/components/generic-table/generic-table.interface';

export const DOCUMENTS_COLUMNS_SCHEMA: ColumnSchema[] = [
  {
    key: 'fileIcon',
    type: 'file-type',
    label: '',
    fileTypeConfig: {
      iconMap: {
        // PDFs
        'application/pdf': { icon: 'picture_as_pdf', color: '#E53935', displayText: 'PDF' },
        // Imágenes
        'image/jpeg': { icon: 'image', color: '#43A047', displayText: 'Imagen' },
        'image/png': { icon: 'image', color: '#43A047', displayText: 'Imagen' },
        // Word
        'application/msword': { icon: 'description', color: '#2B579A', displayText: 'Word' },
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { icon: 'description', color: '#2B579A', displayText: 'Word' },
        // Excel
        'application/vnd.ms-excel': { icon: 'table_chart', color: '#217346', displayText: 'Excel' },
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { icon: 'table_chart', color: '#217346', displayText: 'Excel' },
        // Default
        default: { icon: 'insert_drive_file', color: '#757575', displayText: 'Archivo' },
      },
    },
  },
  {
    key: 'fileName',
    type: 'text',
    label: 'documents.list.table.columns.fileName',
  },
  {
    key: 'documentType',
    type: 'text',
    label: 'documents.list.table.columns.documentType',
  },
  {
    key: 'description',
    type: 'text',
    label: 'documents.list.table.columns.description',
  },
  {
    key: 'fileSize',
    type: 'file-size',
    label: 'documents.list.table.columns.fileSize',
    fileSizeConfig: {
      unit: 'MB',
      decimals: 2
    }
  },
  {
    key: 'contentType',
    type: 'content-type-text',
    label: 'documents.list.table.columns.contentType',
  },
  {
    key: 'uploadedByName',
    type: 'text',
    label: 'documents.list.table.columns.uploadedBy',
  },
  {
    key: 'uploadDate',
    type: 'date-time',
    label: 'documents.list.table.columns.uploadDate',
  },
  {
    key: 'expirationDate',
    type: 'date-time',
    label: 'documents.list.table.columns.expirationDate',
  },
  {
    key: 'isDeleted',
    type: 'boolean',
    label: 'documents.list.table.columns.isDeleted',
  },
  {
    key: 'actions',
    type: 'button',
    label: 'documents.list.table.columns.actions',
    buttons: [
      {
        key: 'edit',
        label: 'documents.list.table.buttons.edit',
      },
      {
        key: 'download',
        label: 'documents.list.table.buttons.download',
      },
      {
        key: 'delete',
        label: 'documents.list.table.buttons.delete',
      },
    ],
  },
];
