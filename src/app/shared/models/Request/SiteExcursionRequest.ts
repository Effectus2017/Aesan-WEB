export interface SiteExcursionRequest {
  id?: number;
  siteId: number;
  childGroupId?: number;
  activityDescription: string;
  excursionDate: string;
  isFullDay: boolean;
  isUnforeseen: boolean;
  comment?: string;
  isActive?: boolean;
  excludedServiceTypeIds?: number[];
}

