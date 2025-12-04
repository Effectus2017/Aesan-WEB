import { SiteOperatingDayService } from '../SiteOperatingDayService';

export interface OperatingDayApiResponse {
  id: number;
  siteId: number;
  operatingDate: string;
  startTime: string;
  endTime: string;
  comment: string;
  isWeekendOverride: boolean;
  isExcluded: boolean;
  isHoliday: boolean;
  createdAt: string;
  updatedAt: string;
  services?: SiteOperatingDayService[];
}

