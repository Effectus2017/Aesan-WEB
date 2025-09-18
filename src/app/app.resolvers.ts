import { inject } from '@angular/core';
import { NavigationService } from 'app/core/navigation/navigation.service';
import { forkJoin, map, tap } from 'rxjs';
import { AgencyService } from './shared/services/agency.service';
import { QueryParameters } from './shared/models/QueryParameters';
import { AuthService } from './core/auth/auth.service';

export const initialDataResolver = () => {
  const navigationService = inject(NavigationService);
  const agencyService = inject(AgencyService);
  const authService = inject(AuthService);

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
      }),
      map(([navigation, agency]) => ({
        navigation: navigation, // NavigationService devuelve Navigation directamente
        agency: agency.body,     // AgencyService devuelve HttpResponse
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

  const agencyId = authService.getAgencyId();

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
    }),
    map(([navigation, agency]) => ({
      navigation: navigation, // NavigationService devuelve Navigation directamente
      agency: agency.body,     // AgencyService devuelve HttpResponse
    }))
  );
};
