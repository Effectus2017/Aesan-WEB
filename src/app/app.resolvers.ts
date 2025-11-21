import { inject } from '@angular/core';
import { NavigationService } from 'app/core/navigation/navigation.service';
import { forkJoin, map, switchMap, tap } from 'rxjs';
import { AgencyService } from './shared/services/agency.service';
import { QueryParameters } from './shared/models/QueryParameters';
import { AuthService } from './core/auth/auth.service';
import { OptionSelectionService } from './shared/services/option-selection.service';

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
        // Almacenar isDayCareHomeId de la agencia en localStorage
        const isDayCareHomeId = agency?.body?.inscription?.isDayCareHomeId 
          ?? agency?.body?.inscription?.isDayCareHome?.id 
          ?? null;
        if (isDayCareHomeId !== null && isDayCareHomeId !== undefined) {
          localStorage.setItem('agencyIsDayCareHomeId', String(isDayCareHomeId));
        } else {
          // Si no hay valor, remover la clave para indicar que no aplica
          localStorage.removeItem('agencyIsDayCareHomeId');
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
  const optionSelectionService = inject(OptionSelectionService);

  const agencyId = authService.getAgencyId();

  const params: QueryParameters = {
    agencyId: agencyId,
  };

  // Fork join multiple API endpoint calls to wait all of them to finish
  return forkJoin([
    navigationService.get(), 
    agencyService.getAgencyById(params),
    optionSelectionService.getOptionSelectionByOptionKey({ optionKey: 'isDayCareHome' } as QueryParameters)
  ]).pipe(
    tap(([navigation, agency]) => {
      // Almacenar los programas de la agencia en localStorage
      if (agency?.body?.programs) {
        localStorage.setItem('agencyPrograms', JSON.stringify(agency.body.programs));
      }
      // Almacenar isDayCareHomeId de la agencia en localStorage
      const isDayCareHomeId = agency?.body?.inscription?.isDayCareHomeId 
        ?? agency?.body?.inscription?.isDayCareHome?.id 
        ?? null;
      if (isDayCareHomeId !== null && isDayCareHomeId !== undefined) {
        localStorage.setItem('agencyIsDayCareHomeId', String(isDayCareHomeId));
      } else {
        // Si no hay valor, remover la clave para indicar que no aplica
        localStorage.removeItem('agencyIsDayCareHomeId');
      }
    }),
    map(([navigation, agency, isDayCareHomeOptions]) => {
      const agencyData = agency.body;
      // La respuesta puede tener body.data o body directamente
      const optionsData = isDayCareHomeOptions?.body?.data || isDayCareHomeOptions?.body || [];
      
      // Asegurar que optionsData sea un array
      const optionsArray = Array.isArray(optionsData) ? optionsData : [];
      
      // Ajustar el menú de sitios si IsDayCareHomeId = "Ambos"
      const adjustedNavigation = navigationService.adjustSitesMenuForAgency(
        navigation, 
        agencyData, 
        optionsArray
      );
      
      return {
        navigation: adjustedNavigation,
        agency: agencyData,
      };
    })
  );
};
