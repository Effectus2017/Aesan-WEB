export interface ProgramPeriod {
  id: number;
  programId: number;
  year: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  programName?: string;
  programNameEN?: string;
}

export interface ProgramPeriodRequest {
  id?: number;
  programId: number;
  year: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface ProgramPeriodResponse {
  id: number;
  programId: number;
  year: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  programName?: string;
  programNameEN?: string;
}

