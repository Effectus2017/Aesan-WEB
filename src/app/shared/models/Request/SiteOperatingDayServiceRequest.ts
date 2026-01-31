/**
 * Modelo de request para crear o actualizar servicios de alimentación por día de funcionamiento.
 * childGroupId es obligatorio: los servicios siempre están asociados a un grupo.
 */
export interface SiteOperatingDayServiceRequest {
  operatingDayId?: number;
  serviceTypeId: number;
  /** ID del grupo de niños (requerido). */
  childGroupId: number;
  startTime: string;
  endTime: string;
  isEnabled?: boolean;
  comment?: string;
}

