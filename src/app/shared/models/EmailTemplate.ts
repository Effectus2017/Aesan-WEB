export interface EmailTemplate {
  id: number;
  templateKey: string;
  subjectES: string;
  subjectEN: string;
  bodyES: string;
  bodyEN: string;
  description?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

