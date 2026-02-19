import { inject } from '@angular/core';
import { NavigationService } from 'app/core/navigation/navigation.service';
import { forkJoin, map, switchMap, tap } from 'rxjs';
import { AgencyService } from './shared/services/agency.service';
import { QueryParameters } from './shared/models/QueryParameters';
import { AuthService } from './core/auth/auth.service';
import { AgencyStatusStorageService } from './shared/services/agency-status-storage.service';

export const initialDataResolver = () => {
  const navigationService = inject(NavigationService);
  const agencyService = inject(AgencyService);
  const authService = inject(AuthService);
  const agencyStatusStorageService = inject(AgencyStatusStorageService);

  const agencyId = authService.getAgencyId();

  // Solo cargar la agencia si hay un agencyId válido
  if (agencyId) {
    const params: QueryParameters = {
      agencyId: agencyId,
    };
    // Fork join multiple API endpoint calls to wait all of them to finish
    return forkJoin([navigationService.get(), agencyService.getAgencyById(params)]).pipe(
      tap(([navigation, agency]) => {
        // Almacenar los programas de la agencia en localStorage
        if (agency?.body?.programs) {
          localStorage.setItem('agencyPrograms', JSON.stringify(agency.body.programs));
        }
        // Almacenar isDayCareHome booleanValue en localStorage (true/false/null)
        const isDayCareHomeOption = agency?.body?.inscription?.isDayCareHome;
        if (isDayCareHomeOption) {
          const booleanValue = isDayCareHomeOption.booleanValue;
          // Guardar como string: "true", "false", o "null"
          if (booleanValue === null || booleanValue === undefined) {
            localStorage.setItem('agencyIsDayCareHome', 'null');
          } else {
            localStorage.setItem('agencyIsDayCareHome', String(booleanValue));
          }
        } else {
          localStorage.removeItem('agencyIsDayCareHome');
        }

        // Calcular y guardar estado de restricción de la agencia
        const isCompleted = !!agency?.body?.inscription?.completedRegistrationDate;
        const deadline = agency?.body?.inscription?.deadlineToCompleteRegistration 
          || agency?.body?.deadlineToCompleteRegistration;
        const isExpired = deadline ? _isDeadlineExpired(deadline) : false;
        agencyStatusStorageService.setAgencyRestrictedStatus({ isCompleted, isExpired });
      }),
      map(([navigation, agency]) => ({
        navigation: navigation, // NavigationService devuelve Navigation directamente
        agency: agency,     // AgencyService devuelve AgencyResponse
      }))
    );
  } else {
    // Fork join multiple API endpoint calls to wait all of them to finish
    return forkJoin([navigationService.get()]).pipe(
      map(([navigation]) => ({
        navigation: navigation, // NavigationService devuelve Navigation directamente
      }))
    );
  }
};

export const initialDataAgencyPortalResolver = () => {
  const navigationService = inject(NavigationService);
  const agencyService = inject(AgencyService);
  const authService = inject(AuthService);
  const agencyStatusStorageService = inject(AgencyStatusStorageService);

  const agencyId = authService.getAgencyId();
  const hasValidAgencyId = agencyId != null && agencyId !== undefined && Number(agencyId) > 0;

  if (hasValidAgencyId) {
    const params: QueryParameters = {
      agencyId: agencyId as number,
    };
    return forkJoin([
      navigationService.get(),
      agencyService.getAgencyById(params),
    ]).pipe(
      tap(([navigation, agency]) => {
        if (agency?.body?.programs) {
          localStorage.setItem('agencyPrograms', JSON.stringify(agency.body.programs));
        }
        const isDayCareHomeOption = agency?.body?.inscription?.isDayCareHome;
        if (isDayCareHomeOption) {
          const booleanValue = isDayCareHomeOption.booleanValue;
          if (booleanValue === null || booleanValue === undefined) {
            localStorage.setItem('agencyIsDayCareHome', 'null');
          } else {
            localStorage.setItem('agencyIsDayCareHome', String(booleanValue));
          }
        } else {
          localStorage.removeItem('agencyIsDayCareHome');
        }
        const isCompleted = !!agency?.body?.inscription?.completedRegistrationDate;
        const deadline = agency?.body?.inscription?.deadlineToCompleteRegistration
          || agency?.body?.deadlineToCompleteRegistration;
        const isExpired = deadline ? _isDeadlineExpired(deadline) : false;
        agencyStatusStorageService.setAgencyRestrictedStatus({ isCompleted, isExpired });
      }),
      map(([navigation, agency]) => ({
        navigation,
        agency: agency?.body ?? null,
      }))
    );
  }

  return forkJoin([navigationService.get()]).pipe(
    map(([navigation]) => ({
      navigation,
      agency: null,
    }))
  );
};

/**
 * Verifica si la fecha límite ha expirado
 * @param deadlineDate Fecha límite en formato string
 * @returns true si la fecha expiró, false en caso contrario
 */
function _isDeadlineExpired(deadlineDate: string): boolean {
  const deadline = new Date(deadlineDate);
  const now = new Date();

  // Validar que la fecha sea válida
  if (isNaN(deadline.getTime())) {
    console.error('[Resolvers] Invalid deadline date:', deadlineDate);
    return false;
  }

  // Reset time to start of day for accurate day calculation
  deadline.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);

  const timeDiff = deadline.getTime() - now.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

  // La fecha expiró si daysDiff <= 0
  return daysDiff <= 0;
}
