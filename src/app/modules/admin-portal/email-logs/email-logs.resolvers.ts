import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { OptionSelectionService } from 'app/shared/services/option-selection.service';
import { forkJoin, map } from 'rxjs';

// Resolver para la lista de email logs
// Resolver for email logs list
export const initialDataEmailLogsListResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
  // Options selection service
  // Servicio para opciones de selección
  const optionSelectionService = inject(OptionSelectionService);

  return forkJoin([
    // Options selection service
    // Servicio para opciones de selección
    optionSelectionService.getOptionSelectionByOptionKey({ optionKey: 'emailLogStatus,emailLogType' })
  ]).pipe(
    map(([options]) => ({
      options: options.body,
    }))
  );
};
