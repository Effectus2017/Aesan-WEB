import { SiteExcursionExcludedService } from './SiteExcursionExcludedService';

export interface SiteExcursion {
  id: number;
  siteId: number;
  siteName?: string;
  agencyName?: string;
  agencyCode?: string;
  childGroupId?: number;
  childGroupName?: string;
  activityDescription: string;
  excursionDate: string;
  isFullDay: boolean;
  isUnforeseen: boolean;
  comment?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  excludedServices?: SiteExcursionExcludedService[];
}

