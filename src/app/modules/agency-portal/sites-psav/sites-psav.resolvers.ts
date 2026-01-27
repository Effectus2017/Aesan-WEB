import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { QueryParameters } from 'app/shared/models/QueryParameters';
import { SiteService } from 'app/shared/services/site.service';
import { forkJoin, map } from 'rxjs';
import { AuthService } from 'app/core/auth/auth.service';
import { PROGRAM_IDS } from 'app/shared/const';
import { DeliveryTypeService } from 'app/shared/services/delivery-type.service';
import { GroupTypeService } from 'app/shared/services/group-type.service';
import { OrganizationTypeService } from 'app/shared/services/organization-type.service';
import { ServiceTypeService } from 'app/shared/services/service-type.service';
import { SiteCalendarService } from '../calendar/site-calendar.service';

// Resolver para la lista de sitios PSAV
export const initialDataSitesPsavListResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
  const siteService = inject(SiteService);
  const authService = inject(AuthService);
  const agencyId = authService.getAgencyId();

  // Filtrar por agencyId y programId PSAV (sin isDayCareHomeId ya que PSAV no tiene homes/centers)
  const requestParameters: QueryParameters = {
    take: 25,
    skip: 0,
    alls: false,
    isList: false,
    agencyId: agencyId,
    programId: PROGRAM_IDS.PSAV,
  };

  return forkJoin([siteService.getAllSitesFromDb(requestParameters)]).pipe(
    map(([sites]) => ({
      sites: sites.body,
    }))
  );
};

// Resolver específico para PSAV
export const initialDataSitesPsavProgramResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
  const deliveryTypeService = inject(DeliveryTypeService);
  const groupTypeService = inject(GroupTypeService);
  const organizationTypeService = inject(OrganizationTypeService);
  const siteCalendarService = inject(SiteCalendarService);
  const serviceTypeService = inject(ServiceTypeService);

  return forkJoin([
    deliveryTypeService.getDeliveryTypesByProgram({ programId: PROGRAM_IDS.PSAV }),
    groupTypeService.getGroupTypesByProgram({ programId: PROGRAM_IDS.PSAV }),
    organizationTypeService.getOrganizationTypesByProgram({ programId: PROGRAM_IDS.PSAV }),
    siteCalendarService.getAllowedDaysByProgramId({ programId: PROGRAM_IDS.PSAV }),
    serviceTypeService.getServiceTypesByProgram({ programId: PROGRAM_IDS.PSAV }),
  ]).pipe(
    map(
      ([deliveryTypes, groupTypes, organizationTypes, allowedOperatingDays, serviceTypes]) => ({
        centerTypes: [], // PSAV no tiene centerTypes
        deliveryTypes: deliveryTypes.body,
        sponsorTypes: [], // PSAV no tiene sponsorTypes
        groupTypes: groupTypes.body,
        organizationTypes: organizationTypes.body,
        allowedOperatingDays: allowedOperatingDays.body,
        serviceTypes: serviceTypes?.body ?? serviceTypes ?? [],
      })
    )
  );
};
