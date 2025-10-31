/**
 * Modelo de respuesta para la relación entre un sitio (Site) y un empleado del staff
 * Alineado con Api.Models.Response.SiteStaffResponse
 */
export interface SiteStaffResponse {
  id: number;

  // Relaciones principales
  siteId: number;
  staffId: number;

  // Información de la asignación
  assignmentDate: Date;
  isPrimary: boolean;
  startDate?: Date;
  endDate?: Date;
  comments?: string;

  // Estado y auditoría
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;

  // Información relacionada para consultas (GetStaffBySite)
  firstName?: string;
  middleName?: string;
  fatherLastName?: string;
  motherLastName?: string;
  email?: string;

  // Información relacionada para consultas (GetSitesByStaff)
  siteName?: string;
  siteAddress?: string;
  siteCityId?: number;
  siteRegionId?: number;
  siteZipCode?: string;
  latitude?: number;
  longitude?: number;
  agencyName?: string;
  agencyIsActive?: boolean;
}

