/**
 * Modelo para servicios de alimentación relacionados con días de funcionamiento
 */
export interface SiteOperatingDayService {
  id: number;
  operatingDayId: number;
  serviceTypeId: number;
  serviceTypeName?: string;
  serviceTypeNameEN?: string;
  childGroupId?: number;
  childGroupName?: string;
  startTime: string;
  endTime: string;
  isEnabled: boolean;
  comment?: string;
  createdAt: Date;
  updatedAt?: Date;
  // Información del día de funcionamiento (opcional)
  operatingDate?: string;
  dayStartTime?: string;
  dayEndTime?: string;
}

