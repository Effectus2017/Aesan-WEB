import { HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';
import { QueryParameters } from 'app/shared/models/common/QueryParameters';
import { AgencyStatusService } from 'app/shared/services/agency-status.service';
import { AgencyService } from 'app/shared/services/agency.service';
import { GeoService } from 'app/shared/services/geo.service';
import { ProgramService } from 'app/shared/services/program.service';
import { UsersService } from 'app/shared/services/users.service';
import { OptionSelectionService } from 'app/shared/services/option-selection.service';
import { SiteService } from 'app/shared/services/site.service';
import { SchoolService } from 'app/shared/services/school.service';
import { VisitCalendarService } from 'app/shared/services/visit-calendar.service';
import { VisitTypeDropdownItem } from 'app/shared/models/agency/SiteVisit';
import { SiteResponse } from 'app/shared/models/response/SiteResponse';
import { VisitCalendarPageData } from '../calendar/visit-calendar-page-data.interface';
import { forkJoin, map, of } from 'rxjs';

export const initialAesanSponsorEvaluationResolver = () => {
  const _agencyService: AgencyService = inject(AgencyService);
  const _authService: AuthService = inject(AuthService);
  const userId = _authService.getUserId();

  const requestParameters: QueryParameters = {
    take: 25,
    skip: 0,
    name: null,
    regionId: null,
    cityId: null,
    programId: null,
    statusId: null,
    isPropietary: false,
    userId: userId,
    alls: false,
  };

  return forkJoin([_agencyService.getAllAgenciesFromDb(requestParameters)]).pipe(
    map(([agencies]) => ({
      agencies: agencies.body,
    }))
  );
};

/** Resolver para las vistas de evaluación (view-pdam, view-psav, view-pacna). Carga agencia, catálogos, opciones y sitios. */
export const editAesanSponsorEvaluationResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
  const agencyService = inject(AgencyService);
  const agencyStatusService = inject(AgencyStatusService);
  const geoService = inject(GeoService);
  const authService = inject(AuthService);
  const programService = inject(ProgramService);
  const usersService = inject(UsersService);
  const optionSelectionService = inject(OptionSelectionService);
  const siteService = inject(SiteService);
  const schoolService = inject(SchoolService);

  const id = Number(route.paramMap.get('id'));
  const userId = authService.getUserId();
  const requestParameters: QueryParameters = {
    agencyId: id,
    userId: userId,
  };

  return forkJoin([
    agencyService.getAgencyByIdAndUserId(requestParameters),
    agencyStatusService.getAllAgencyStatusFromDb({ take: 25, skip: 0, alls: true, forDropdown: true }),
    geoService.getCitiesFromDb({ take: 25, skip: 0, alls: true, forDropdown: true }),
    geoService.getRegionsFromDb({ take: 25, skip: 0, alls: true, forDropdown: true }),
    programService.getAllProgramsFromDb({ take: 25, skip: 0, names: 'PDAM,PSAV,PACNA', alls: false, forDropdown: true }),
    usersService.getAllUsersFromDbWithSP({ take: 25, skip: 0, alls: false, forDropdown: true, excludeAdministrators: true }),
    optionSelectionService.getOptionSelectionByOptionKey({
      optionKey:
        'yesNo,exceptionStatus,taxExemptionType,typeOfEntity,typeOfApplicant,publicAllianceContract,isDayCareHome,headStartProgram,boardExecutiveAuthority,administrativePosition',
      forDropdown: true,
    }),
    siteService.getAllSitesFromDb({ agencyId: id, take: 25, skip: 0, alls: false, forDropdown: false }),
    schoolService.getSchoolsByAgencyId({ agencyId: id, take: 25, skip: 0, alls: false, forDropdown: false }),
    schoolService.getCentersByAgencyId({ agencyId: id, take: 25, skip: 0, alls: false, forDropdown: false }),
  ]).pipe(
    map(([agencyResponse, agencyStatuses, cities, regions, programs, users, allOptions, sites, schools, centers]) => ({
      agency: agencyResponse.body,
      agencyStatuses: agencyStatuses.body,
      cities: cities.body,
      regions: regions.body,
      programs: programs.body,
      users: users.body,
      options: allOptions.body,
      sites: sites.body,
      schools: schools.body,
      centers: centers.body,
    }))
  );
};

/** Calendario de visitas AESAN: mismo patrón que `initialDataSiteCalendarResolver` (forkJoin + `.body`). */
export const visitCalendarPageResolver: ResolveFn<VisitCalendarPageData> = (route) => {
  const siteService = inject(SiteService);
  const visitCalendarService = inject(VisitCalendarService);

  const siteId = Number(route.paramMap.get('siteId'));
  if (!Number.isFinite(siteId) || siteId <= 0) {
    return of({ siteId: 0, site: null, visitTypes: [] });
  }

  return forkJoin({
    siteRes: siteService.getSiteById({ id: siteId }),
    visitTypesRes: visitCalendarService.getAllVisitTypesFromDb({ alls: false, forDropdown: true }),
  }).pipe(
    map(({ siteRes, visitTypesRes }) => {
      const site = (siteRes?.body ?? null) as SiteResponse | null;
      const visitTypes: VisitTypeDropdownItem[] =
        visitTypesRes instanceof HttpResponse ? (visitTypesRes.body ?? []) : (visitTypesRes as VisitTypeDropdownItem[]) ?? [];
      const invalidSite = !site?.id || site.id !== siteId || !site.agencyId;
      return {
        siteId,
        site: invalidSite ? null : site,
        visitTypes,
      };
    })
  );
};
