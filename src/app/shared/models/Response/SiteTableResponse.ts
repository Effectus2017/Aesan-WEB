export interface SiteTableResponse {
  id: number;
  name: string;
  address: string;
  cityName: string;
  regionName: string;
  isActive: boolean;
  groupTypeName?: string;
  generalEnrollment?: number;
  siteNumber: number;
  agencyCode?: string;
  siteCode?: string;
  schoolName?: string;
  schoolId?: number;
}
