import { Site } from '../site/Site';

export interface SitesModalData {
  schoolId: number;
  schoolName: string;
  data: Site[];
  totalCount: number;
}
