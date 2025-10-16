import { Site } from '../Site';
import { SchoolResponse } from './SchoolResponse';

/**
 * Modelo de respuesta para SchoolSite con datos relacionados
 */
export interface SchoolSiteResponse {
  id: number;
  schoolId: number;
  siteId: number;
  assignmentDate: Date;
  comment?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;

  // Objetos relacionados
  school?: SchoolResponse;
  site?: Site;

  // Propiedades de conveniencia
  schoolName?: string;
  siteName?: string;
}
