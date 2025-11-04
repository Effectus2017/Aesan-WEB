/**
 * Modelo de request para crear o actualizar servicios de alimentación por día de funcionamiento
 */
export interface SiteOperatingDayServiceRequest {
  operatingDayId?: number;
  serviceTypeId: number;
  childGroupId?: number;
  startTime: string;
  endTime: string;
  isEnabled?: boolean;
  comment?: string;
}

