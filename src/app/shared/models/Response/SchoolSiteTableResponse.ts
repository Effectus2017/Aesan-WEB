/**
 * Modelo de respuesta para SchoolSite en tablas/listas
 * Contiene únicamente los datos necesarios para mostrar en tablas sin objetos anidados
 */
export interface SchoolSiteTableResponse {
  id: number;
  schoolId: number;
  siteId: number;
  assignmentDate: Date;
  comment?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;

  // Campos del Site (planos, no anidados)
  siteName: string;
  siteCode?: string;
  siteNumber?: number;
  address: string;
  siteIsActive: boolean;
}
