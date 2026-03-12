import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { forkJoin, map, Observable, of } from 'rxjs';
import { AgencyService } from 'app/shared/services/agency.service';
import { ReportsService } from 'app/shared/services/reports.service';

/**
 * Resolver para cargar datos iniciales del árbol de jerarquía de escuelas
 * Solo carga auspiciadores, NO carga la jerarquía hasta que se seleccione un auspiciador
 */
export const SchoolHierarchyTreeResolver: ResolveFn<any> = (route) => {
  const agencyService = inject(AgencyService);

  // Obtener año actual como predeterminado
  const currentYear = new Date().getFullYear();
  const selectedYear = route.queryParams['year'] ? parseInt(route.queryParams['year']) : currentYear;
  const selectedSponsorId = route.queryParams['sponsorId'] ? parseInt(route.queryParams['sponsorId']) : undefined;

  // Solo cargar auspiciadores
  // NO cargar la jerarquía si no hay un selectedSponsorId
  return agencyService.getAllAgenciesFromDb({ take: 10000000, skip: 0, alls: true, forDropdown: true, isPropietary: false })
    .pipe(
      map((agencies) => ({
        agencies: Array.isArray(agencies) ? agencies : (agencies as { data: unknown[] })?.data ?? [],
        hierarchy: null, // No cargar jerarquía inicialmente
        selectedYear: selectedYear,
        selectedSponsorId: selectedSponsorId
      }))
    );
};

