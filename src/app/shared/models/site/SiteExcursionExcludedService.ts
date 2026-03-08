export interface SiteExcursionExcludedService {
  id: number;
  siteExcursionId: number;
  serviceTypeId: number;
  serviceTypeName?: string;
  serviceTypeNameEN?: string;
  displayOrder: number;
  createdAt: string;
}
