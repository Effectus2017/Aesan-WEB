import { SiteSatelliteResponse } from './SiteSatelliteResponse';

export interface SiteSatellitesModalData {
  siteId: number;
  siteName: string;
  data: SiteSatelliteResponse[];
  totalCount: number;
}
