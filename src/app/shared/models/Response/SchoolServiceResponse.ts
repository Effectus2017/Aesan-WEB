import { OptionSelection } from '../OptionSelection';

export interface SchoolServiceResponse {
  id: number;
  schoolId: number;
  childGroup?: OptionSelection;
  breakfast?: boolean;
  breakfastFrom?: string;
  breakfastTo?: string;
  lunch?: boolean;
  lunchFrom?: string;
  lunchTo?: string;
  snackAM?: boolean;
  snackAMFrom?: string;
  snackAMTo?: string;
  dinner?: boolean;
  dinnerFrom?: string;
  dinnerTo?: string;
  snackPM?: boolean;
  snackPMFrom?: string;
  snackPMTo?: string;
  snackNight?: boolean;
  snackNightFrom?: string;
  snackNightTo?: string;
  createdAt: string;
  updatedAt?: string;
}
