import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { forkJoin, map, tap } from 'rxjs';
import { NavigationService } from 'app/core/navigation/navigation.service';
import { AgencyService } from 'app/shared/services/agency.service';
import { QueryParameters } from 'app/shared/models/common/QueryParameters';
import { AuthService } from 'app/core/auth/auth.service';
import { AgencyStatusStorageService } from 'app/shared/services/agency-status-storage.service';

// Resolver para Admin y AESAN portal (layout inicial)
export const initialDataAdminAesanPortalResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
  // Navigation service
  // Servicio de navegación
  const navigationService = inject(NavigationService);
  // Agency service
  // Servicio de agencias
  const agencyService = inject(AgencyService);
  // Auth service
  // Servicio de autenticación
  const authService = inject(AuthService);
  // Agency status storage service
  // Servicio de almacenamiento de estado de agencia
  const agencyStatusStorageService = inject(AgencyStatusStorageService);

  const agencyId = authService.getAgencyId();

  if (agencyId) {
    const params: QueryParameters = {
      agencyId: agencyId,
    };
    return forkJoin([navigationService.get(), agencyService.getAgencyById(params)]).pipe(
      tap(([navigation, agencyResponse]) => {
        const agency = agencyResponse.body;
        const isDayCareHomeOption = agency?.inscription?.isDayCareHome;

        if (agency?.programs) {
          localStorage.setItem('agencyPrograms', JSON.stringify(agency.programs));
        }

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

        const isCompleted = !!agency?.inscription?.completedRegistrationDate;
        const deadline = agency?.inscription?.deadlineToCompleteRegistration;
        const isExpired = deadline ? _isDeadlineExpired(deadline) : false;

        agencyStatusStorageService.setAgencyRestrictedStatus({ isCompleted, isExpired });

      }),
      map(([navigation, agency]) => ({
        navigation,
        agency,
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

// Resolver para Agency portal (layout inicial)
export const initialDataAgencyPortalResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
  // Navigation service
  // Servicio de navegación
  const navigationService = inject(NavigationService);
  // Agency service
  // Servicio de agencias
  const agencyService = inject(AgencyService);
  // Auth service
  // Servicio de autenticación
  const authService = inject(AuthService);
  // Agency status storage service
  // Servicio de almacenamiento de estado de agencia
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
      tap(([navigation, agencyResponse]) => {

        const agency = agencyResponse.body;
        const isDayCareHomeOption = agency?.inscription?.isDayCareHome;

        if (agency?.programs) {
          localStorage.setItem('agencyPrograms', JSON.stringify(agency.programs));
        }

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
        const isCompleted = !! agency?.inscription?.completedRegistrationDate;
        const deadline = agency?.inscription?.deadlineToCompleteRegistration
        const isExpired = deadline ? _isDeadlineExpired(deadline) : false;

        agencyStatusStorageService.setAgencyRestrictedStatus({ isCompleted, isExpired });
      }),
      map(([navigation, agency]) => ({
        navigation,
        agency,
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

  if (isNaN(deadline.getTime())) {
    console.error('[Resolvers] Invalid deadline date:', deadlineDate);
    return false;
  }

  deadline.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);

  const timeDiff = deadline.getTime() - now.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

  return daysDiff <= 0;
}
