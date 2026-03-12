export interface SiteServiceRequest {
  id?: number;
  siteId?: number;
  childGroupId?: number;
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

  // Servicios adicionales para PACNA
  dinnerExtended?: boolean;
  dinnerExtendedFrom?: string;
  dinnerExtendedTo?: string;

  dinnerAtRisk?: boolean;
  dinnerAtRiskFrom?: string;
  dinnerAtRiskTo?: string;

  snackExtended?: boolean;
  snackExtendedFrom?: string;
  snackExtendedTo?: string;

  snackAtRisk?: boolean;
  snackAtRiskFrom?: string;
  snackAtRiskTo?: string;
}
