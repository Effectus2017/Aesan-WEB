export interface SiteOperatingDayRequest {
  id?: number;
  siteId: number;
  operatingDate: string;
  startTime: string;
  endTime: string;
  isOperating: boolean;
  comment: string;
  isWeekend: boolean;
  isHoliday: boolean;
}

