import { Site } from '../Site';

export interface SitesModalData {
  schoolId: number;
  schoolName: string;
  data: Site[];
  totalCount: number;
}
