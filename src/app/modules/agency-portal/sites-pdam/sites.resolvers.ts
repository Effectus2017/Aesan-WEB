import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { QueryParameters } from 'app/shared/models/QueryParameters';
import { SiteService } from 'app/shared/services/site.service';
import { forkJoin, map } from 'rxjs';
import { AuthService } from 'app/core/auth/auth.service';
import { SiteCalendarService } from '../calendar/site-calendar.service';
import { CenterTypeService } from 'app/shared/services/center-type.service';
import { DeliveryTypeService } from 'app/shared/services/delivery-type.service';
import { SponsorTypeService } from 'app/shared/services/sponsor-type.service';
import { GroupTypeService } from 'app/shared/services/group-type.service';
import { OrganizationTypeService } from 'app/shared/services/organization-type.service';
import { PROGRAM_IDS } from 'app/shared/const';

// Resolver para el calendario del sitio
export const initialDataSiteCalendarResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
  const siteId = Number(route.paramMap.get('id'));
  const siteCalendarService = inject(SiteCalendarService);
  const siteService = inject(SiteService);

  // Obtener mes y año actual
  const currentDate = new Date();
  const month = currentDate.getMonth() + 1; // getMonth() retorna 0-11, necesitamos 1-12
  const year = currentDate.getFullYear();

  const queryParameters = {
    siteId: siteId,
    month: month,
    year: year
  };

  return forkJoin([siteCalendarService.getOperatingDays(queryParameters), siteService.getSiteById({ id: siteId })]).pipe(
    map(([operatingDays, site]) => ({
      operatingDays: operatingDays.body,
      site: site.body,
    }))
  );
};

// Resolver para la lista de sitios
export const initialDataSitesListResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
  const siteService = inject(SiteService);
  const authService = inject(AuthService);
  const agencyId = authService.getAgencyId();

  // Leer isDayCareHomeId de los query parameters
  const isDayCareHomeId = route.queryParams['isDayCareHomeId']
    ? parseInt(route.queryParams['isDayCareHomeId'], 10)
    : undefined;

  const requestParameters: QueryParameters = {
    take: 25,
    skip: 0,
    alls: false,
    isList: false,
    agencyId: agencyId,
    isDayCareHomeId: isDayCareHomeId,
  };

  return forkJoin([siteService.getAllSitesFromDb(requestParameters)]).pipe(
    map(([sites]) => ({
      sites: sites.body,
    }))
  );
};

// Resolver específico para PDAM
export const initialDataSitesPdamProgramResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
  const centerTypeService = inject(CenterTypeService);
  const deliveryTypeService = inject(DeliveryTypeService);
  const sponsorTypeService = inject(SponsorTypeService);
  const groupTypeService = inject(GroupTypeService);
  const organizationTypeService = inject(OrganizationTypeService);
  const siteCalendarService = inject(SiteCalendarService);

  return forkJoin([
    centerTypeService.getCenterTypesByProgram({ programId: PROGRAM_IDS.PDAM }),
    deliveryTypeService.getDeliveryTypesByProgram({ programId: PROGRAM_IDS.PDAM }),
    sponsorTypeService.getSponsorTypesByProgram({ programId: PROGRAM_IDS.PDAM }),
    groupTypeService.getGroupTypesByProgram({ programId: PROGRAM_IDS.PDAM }),
    organizationTypeService.getOrganizationTypesByProgram({ programId: PROGRAM_IDS.PDAM }),
    siteCalendarService.getAllowedDaysByProgramId({ programId: PROGRAM_IDS.PDAM }),
  ]).pipe(
    map(([centerTypes, deliveryTypes, sponsorTypes, groupTypes, organizationTypes, allowedOperatingDays]) => ({
      centerTypes: centerTypes.body,
      deliveryTypes: deliveryTypes.body,
      sponsorTypes: sponsorTypes.body,
      groupTypes: groupTypes.body,
      organizationTypes: organizationTypes.body,
      allowedOperatingDays: allowedOperatingDays.body,
    }))
  );
};
