import { SiteServiceRequest } from '../models/request/SiteServiceRequest';

/**
 * Valida y limpia un SiteServiceRequest antes de enviarlo al backend.
 * Solo incluye servicios que estén completamente configurados (activo + horarios).
 * Si un servicio está activo pero no tiene horarios válidos, se marca como false (no null).
 * El stored procedure espera s.Breakfast = 1, por lo que null no funcionaría correctamente.
 *
 * @param service - El objeto SiteServiceRequest a validar
 * @returns Un nuevo SiteServiceRequest con solo servicios válidos
 */
export function validateAndCleanSiteService(service: SiteServiceRequest): SiteServiceRequest {
  const cleaned: SiteServiceRequest = {
    // Preservar id y siteId si están presentes (importante para actualizaciones)
    id: service.id,
    siteId: service.siteId,
    childGroupId: service.childGroupId ?? null,
  };

  // Helper para validar un servicio individual
  const isValidService = (
    isActive: boolean | null | undefined,
    from: string | null | undefined,
    to: string | null | undefined,
    serviceName: string
  ): boolean => {
    // Si no está activo, no es válido
    if (!isActive) {
      console.debug(`[SiteServiceValidator] ${serviceName}: No está activo, marcando como false`);
      return false;
    }
    // Si está activo pero no tiene horarios válidos, no es válido
    if (!from || !to || from.trim() === '' || to.trim() === '') {
      console.warn(`[SiteServiceValidator] ${serviceName}: Está activo pero no tiene horarios válidos (From: ${from}, To: ${to}), marcando como false`);
      return false;
    }
    console.debug(`[SiteServiceValidator] ${serviceName}: Válido (From: ${from}, To: ${to})`);
    return true;
  };

  // Breakfast
  if (isValidService(service.breakfast, service.breakfastFrom, service.breakfastTo, 'Breakfast')) {
    cleaned.breakfast = true;
    cleaned.breakfastFrom = service.breakfastFrom!;
    cleaned.breakfastTo = service.breakfastTo!;
  } else {
    // IMPORTANTE: Usar false en lugar de null para que el stored procedure pueda comparar s.Breakfast = 1
    cleaned.breakfast = false;
    cleaned.breakfastFrom = null;
    cleaned.breakfastTo = null;
  }

  // Lunch
  if (isValidService(service.lunch, service.lunchFrom, service.lunchTo, 'Lunch')) {
    cleaned.lunch = true;
    cleaned.lunchFrom = service.lunchFrom!;
    cleaned.lunchTo = service.lunchTo!;
  } else {
    cleaned.lunch = false;
    cleaned.lunchFrom = null;
    cleaned.lunchTo = null;
  }

  // SnackAM
  if (isValidService(service.snackAM, service.snackAMFrom, service.snackAMTo, 'SnackAM')) {
    cleaned.snackAM = true;
    cleaned.snackAMFrom = service.snackAMFrom!;
    cleaned.snackAMTo = service.snackAMTo!;
  } else {
    cleaned.snackAM = false;
    cleaned.snackAMFrom = null;
    cleaned.snackAMTo = null;
  }

  // Dinner
  if (isValidService(service.dinner, service.dinnerFrom, service.dinnerTo, 'Dinner')) {
    cleaned.dinner = true;
    cleaned.dinnerFrom = service.dinnerFrom!;
    cleaned.dinnerTo = service.dinnerTo!;
  } else {
    cleaned.dinner = false;
    cleaned.dinnerFrom = null;
    cleaned.dinnerTo = null;
  }

  // SnackPM
  if (isValidService(service.snackPM, service.snackPMFrom, service.snackPMTo, 'SnackPM')) {
    cleaned.snackPM = true;
    cleaned.snackPMFrom = service.snackPMFrom!;
    cleaned.snackPMTo = service.snackPMTo!;
  } else {
    cleaned.snackPM = false;
    cleaned.snackPMFrom = null;
    cleaned.snackPMTo = null;
  }

  // SnackNight
  if (isValidService(service.snackNight, service.snackNightFrom, service.snackNightTo, 'SnackNight')) {
    cleaned.snackNight = true;
    cleaned.snackNightFrom = service.snackNightFrom!;
    cleaned.snackNightTo = service.snackNightTo!;
  } else {
    cleaned.snackNight = false;
    cleaned.snackNightFrom = null;
    cleaned.snackNightTo = null;
  }

  // DinnerExtended (PACNA)
  if (isValidService(service.dinnerExtended, service.dinnerExtendedFrom, service.dinnerExtendedTo, 'DinnerExtended')) {
    cleaned.dinnerExtended = true;
    cleaned.dinnerExtendedFrom = service.dinnerExtendedFrom!;
    cleaned.dinnerExtendedTo = service.dinnerExtendedTo!;
  } else {
    cleaned.dinnerExtended = false;
    cleaned.dinnerExtendedFrom = null;
    cleaned.dinnerExtendedTo = null;
  }

  // DinnerAtRisk (PACNA)
  if (isValidService(service.dinnerAtRisk, service.dinnerAtRiskFrom, service.dinnerAtRiskTo, 'DinnerAtRisk')) {
    cleaned.dinnerAtRisk = true;
    cleaned.dinnerAtRiskFrom = service.dinnerAtRiskFrom!;
    cleaned.dinnerAtRiskTo = service.dinnerAtRiskTo!;
  } else {
    cleaned.dinnerAtRisk = false;
    cleaned.dinnerAtRiskFrom = null;
    cleaned.dinnerAtRiskTo = null;
  }

  // SnackExtended (PACNA)
  if (isValidService(service.snackExtended, service.snackExtendedFrom, service.snackExtendedTo, 'SnackExtended')) {
    cleaned.snackExtended = true;
    cleaned.snackExtendedFrom = service.snackExtendedFrom!;
    cleaned.snackExtendedTo = service.snackExtendedTo!;
  } else {
    cleaned.snackExtended = false;
    cleaned.snackExtendedFrom = null;
    cleaned.snackExtendedTo = null;
  }

  // SnackAtRisk (PACNA)
  if (isValidService(service.snackAtRisk, service.snackAtRiskFrom, service.snackAtRiskTo, 'SnackAtRisk')) {
    cleaned.snackAtRisk = true;
    cleaned.snackAtRiskFrom = service.snackAtRiskFrom!;
    cleaned.snackAtRiskTo = service.snackAtRiskTo!;
  } else {
    cleaned.snackAtRisk = false;
    cleaned.snackAtRiskFrom = null;
    cleaned.snackAtRiskTo = null;
  }

  // Log del resultado final
  const validServices = Object.entries(cleaned)
    .filter(([key, value]) => key.includes('breakfast') || key.includes('lunch') || key.includes('dinner') || key.includes('snack'))
    .filter(([key, value]) => key.endsWith('breakfast') || key.endsWith('lunch') || key.endsWith('dinner') || key.endsWith('snackAM') || key.endsWith('snackPM') || key.endsWith('snackNight') || key.endsWith('dinnerExtended') || key.endsWith('dinnerAtRisk') || key.endsWith('snackExtended') || key.endsWith('snackAtRisk'))
    .filter(([key, value]) => value === true);

  console.log(`[SiteServiceValidator] Servicios válidos encontrados: ${validServices.length}`, validServices.map(([key]) => key));

  return cleaned;
}

