import { ColumnSchema } from 'app/shared/components/generic-table/generic-table.interface';

export const EMAIL_LOGS_COLUMNS_SCHEMA: ColumnSchema[] = [
    {
      key: 'recipientEmail',
      type: 'text',
      label: 'email-logs.list.columns.recipientEmail',
    },
    {
      key: 'subject',
      type: 'text',
      label: 'email-logs.list.columns.subject',
    },
    {
      key: 'emailType',
      type: 'text',
      label: 'email-logs.list.columns.emailType',
    },
    {
      key: 'status',
      type: 'text',
      label: 'email-logs.list.columns.status',
    },
    {
      key: 'attemptedAt',
      type: 'date-time',
      label: 'email-logs.list.columns.attemptedAt',
    },
    {
      key: 'sentAt',
      type: 'date-time',
      label: 'email-logs.list.columns.sentAt',
    },
    {
      key: 'retryCount',
      type: 'text',
      label: 'email-logs.list.columns.retryCount',
    },
    {
      key: 'buttons',
      type: 'button',
      label: '',
      buttons: [
        {
          key: 'view',
          label: 'email-logs.list.buttons.view',
        },
        {
          key: 'resend',
          label: 'email-logs.list.buttons.resend',
        },
      ],
    },
  ];
