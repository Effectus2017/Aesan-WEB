import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { forkJoin, map, Observable, of } from 'rxjs';
import { AgencyService } from 'app/shared/services/agency.service';
import { ReportsService } from 'app/shared/services/reports.service';

/**
 * Resolver para cargar datos iniciales del árbol de jerarquía de escuelas
 * Obtiene años disponibles y auspiciadores
 */
export const SchoolHierarchyTreeResolver: ResolveFn<any> = (route) => {
  const agencyService = inject(AgencyService);
  const reportsService = inject(ReportsService);

  // Obtener año actual como predeterminado
  const currentYear = new Date().getFullYear();
  const selectedYear = route.queryParams['year'] ? parseInt(route.queryParams['year']) : currentYear;
  const selectedSponsorId = route.queryParams['sponsorId'] ? parseInt(route.queryParams['sponsorId']) : undefined;

  // Obtener auspiciadores y estructura jerárquica
  return forkJoin([
    agencyService.getAllAgenciesFromDb({ take: 10000000, skip: 0, alls: true, isList: true, isPropietary: false }),
    reportsService.getSchoolHierarchyTree(selectedYear, selectedSponsorId)
  ]).pipe(
    map(([agencies, hierarchy]) => ({
      agencies: agencies.body || [],
      hierarchy: hierarchy,
      selectedYear: selectedYear,
      selectedSponsorId: selectedSponsorId
    }))
  );
};

