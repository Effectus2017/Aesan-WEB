export interface OperatingDayApiResponse {
  id: number;
  siteId: number;
  operatingDate: string;
  startTime: string;
  endTime: string;
  comment: string;
  isWeekendOverride: boolean;
  isExcluded: boolean;
  createdAt: string;
  updatedAt: string;
}

