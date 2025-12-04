import { SiteOperatingDayService } from './SiteOperatingDayService';

export interface SiteOperatingDay {
  id: number;
  siteId: number;
  date: string;
  startTime: string;
  endTime: string;
  isOperating: boolean;
  comment: string;
  isWeekendOverride: boolean;
  isExcluded: boolean;
  isHoliday: boolean;
  createdAt: Date;
  updatedAt: Date;
  services?: SiteOperatingDayService[];
}

