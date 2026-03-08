export interface EmailLog {
  id: number;
  recipientEmail: string;
  subject: string;
  emailType: string;
  status: 'Pending' | 'Sent' | 'Failed';
  errorMessage?: string;
  sentAt?: string;
  attemptedAt: string;
  userId?: string;
  agencyId?: number;
  emailTemplateKey?: string;
  retryCount: number;
  originalEmailLogId?: number;
  createdAt: string;
  createdBy?: string;
}

export interface ResendEmailRequest {
  emailLogId: number;
  forceResend: boolean;
}
