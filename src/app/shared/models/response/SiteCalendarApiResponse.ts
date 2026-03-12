import { OperatingDayApiResponse } from './OperatingDayApiResponse';

export interface SiteCalendarApiResponse {
  siteId: number;
  siteName: string;
  operatingDays: OperatingDayApiResponse[];
}

