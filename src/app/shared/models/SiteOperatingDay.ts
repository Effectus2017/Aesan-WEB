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
  createdAt: Date;
  updatedAt: Date;
}

