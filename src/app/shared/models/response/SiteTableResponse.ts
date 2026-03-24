export interface SiteTableResponse {
  id: number;
  name: string;
  address: string;
  cityName: string;
  regionName: string;
  /** Nombre de la escuela vinculada al sitio (tabla School). */
  schoolName?: string | null;
  /** Id de la escuela vinculada al sitio (SchoolSite → School). */
  schoolId?: number | null;
  isActive: boolean;
  generalEnrollment?: number;
  siteCode?: string;
}
