import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { QueryParameters } from 'app/shared/models/common/QueryParameters';
import { SiteService } from 'app/shared/services/site.service';
import { SchoolService } from 'app/shared/services/school.service';
import { forkJoin, map, of, catchError } from 'rxjs';
import { AuthService } from 'app/core/auth/auth.service';
import { SiteCalendarService } from '../calendar/site-calendar.service';
import { CenterTypeService } from 'app/shared/services/center-type.service';
import { DeliveryTypeService } from 'app/shared/services/delivery-type.service';
import { SponsorTypeService } from 'app/shared/services/sponsor-type.service';
import { GroupTypeService } from 'app/shared/services/group-type.service';
import { OrganizationTypeService } from 'app/shared/services/organization-type.service';
import { ServiceTypeService } from 'app/shared/services/service-type.service';
import { KitchenTypeService } from 'app/shared/services/kitchen-type.service';
import { PROGRAM_IDS } from 'app/shared/const';
import { Observable } from 'rxjs';

// Resolver para el calendario del sitio
// Resolver for site calendar
export const initialDataSiteCalendarResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
  const siteId = Number(route.paramMap.get('id'));
  // Site calendar service
  // Servicio de calendario de sitios
  const siteCalendarService = inject(SiteCalendarService);
  // Site service
  // Servicio de sitios
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
// Resolver for sites list
export const initialDataSitesListResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
  // Site service
  // Servicio de sitios
  const siteService = inject(SiteService);
  // Auth service
  // Servicio de autenticación
  const authService = inject(AuthService);
  const agencyId = authService.getAgencyId();

  const requestParameters: QueryParameters = {
    take: 25,
    skip: 0,
    alls: false,
    forDropdown: false,
    agencyId: agencyId,
  };

  return forkJoin([siteService.getAllSitesFromDb(requestParameters)]).pipe(
    map(([sites]) => ({
      sites: sites.body,
    }))
  );
};

// Resolver: escuela por schoolId (query param) para Agregar Sitio
// Resolver: school by schoolId (query param) for Add Site
export const initialDataSitesAddSchoolResolver: ResolveFn<{ schoolId: number | null; schoolName: string | null }> = (route: ActivatedRouteSnapshot) => {
  // School service
  // Servicio de escuelas
  const schoolService = inject(SchoolService);

  const schoolIdParam = route.queryParams['schoolId'];
  if (!schoolIdParam) {
    return of({ schoolId: null, schoolName: null });
  }

  const schoolId = +schoolIdParam;

  return schoolService.getSchoolById({ id: schoolId }).pipe(
    map((response) => ({
      schoolId,
      schoolName: response.body?.name ?? null,
    })),
    catchError(() => of({ schoolId, schoolName: null }))
  );
};

/** Carga datos de programa PDAM (sin kitchen types; se cargan por group type en el componente). */
function resolvePdamProgramData(): Observable<any> {
  const centerTypeService = inject(CenterTypeService);
  const deliveryTypeService = inject(DeliveryTypeService);
  const sponsorTypeService = inject(SponsorTypeService);
  const groupTypeService = inject(GroupTypeService);
  const organizationTypeService = inject(OrganizationTypeService);
  const siteCalendarService = inject(SiteCalendarService);
  const serviceTypeService = inject(ServiceTypeService);

  return forkJoin([
    centerTypeService.getCenterTypesByProgram({ programId: PROGRAM_IDS.PDAM }),
    deliveryTypeService.getDeliveryTypesByProgram({ programId: PROGRAM_IDS.PDAM }),
    sponsorTypeService.getSponsorTypesByProgram({ programId: PROGRAM_IDS.PDAM }),
    groupTypeService.getGroupTypesByProgram({ programId: PROGRAM_IDS.PDAM }),
    organizationTypeService.getOrganizationTypesByProgram({ programId: PROGRAM_IDS.PDAM }),
    siteCalendarService.getAllowedDaysByProgramId({ programId: PROGRAM_IDS.PDAM }),
    serviceTypeService.getServiceTypesByProgram({ programId: PROGRAM_IDS.PDAM }),
  ]).pipe(
    map(
      ([
        centerTypes,
        deliveryTypes,
        sponsorTypes,
        groupTypes,
        organizationTypes,
        allowedOperatingDays,
        serviceTypes,
      ]) => ({
        centerTypes: centerTypes.body,
        deliveryTypes: deliveryTypes.body,
        sponsorTypes: sponsorTypes.body,
        groupTypes: groupTypes.body,
        organizationTypes: organizationTypes.body,
        allowedOperatingDays: allowedOperatingDays.body,
        serviceTypes: serviceTypes.body,
      })
    )
  );
}

/** Resolver de datos de programa PDAM para alta de sitio (sin kitchen types; se cargan por group type). */
export const initialDataSitesPdamProgramAddResolver: ResolveFn<any> = () => resolvePdamProgramData();

/** Carga datos de programa PDAM para edición, incluyendo kitchen types para que compareById funcione en el formulario. */
function resolvePdamProgramDataEdit(): Observable<any> {
  const centerTypeService = inject(CenterTypeService);
  const deliveryTypeService = inject(DeliveryTypeService);
  const sponsorTypeService = inject(SponsorTypeService);
  const groupTypeService = inject(GroupTypeService);
  const organizationTypeService = inject(OrganizationTypeService);
  const siteCalendarService = inject(SiteCalendarService);
  const serviceTypeService = inject(ServiceTypeService);
  const kitchenTypeService = inject(KitchenTypeService);

  return forkJoin([
    centerTypeService.getCenterTypesByProgram({ programId: PROGRAM_IDS.PDAM }),
    deliveryTypeService.getDeliveryTypesByProgram({ programId: PROGRAM_IDS.PDAM }),
    sponsorTypeService.getSponsorTypesByProgram({ programId: PROGRAM_IDS.PDAM }),
    groupTypeService.getGroupTypesByProgram({ programId: PROGRAM_IDS.PDAM }),
    organizationTypeService.getOrganizationTypesByProgram({ programId: PROGRAM_IDS.PDAM }),
    siteCalendarService.getAllowedDaysByProgramId({ programId: PROGRAM_IDS.PDAM }),
    serviceTypeService.getServiceTypesByProgram({ programId: PROGRAM_IDS.PDAM }),
    kitchenTypeService.getKitchenTypesByProgram({ programId: PROGRAM_IDS.PDAM }),
  ]).pipe(
    map(
      ([
        centerTypes,
        deliveryTypes,
        sponsorTypes,
        groupTypes,
        organizationTypes,
        allowedOperatingDays,
        serviceTypes,
        kitchenTypes,
      ]) => ({
        centerTypes: centerTypes.body,
        deliveryTypes: deliveryTypes.body,
        sponsorTypes: sponsorTypes.body,
        groupTypes: groupTypes.body,
        organizationTypes: organizationTypes.body,
        allowedOperatingDays: allowedOperatingDays.body,
        serviceTypes: serviceTypes.body,
        kitchenTypes: kitchenTypes.body,
      })
    )
  );
}

/** Resolver de datos de programa PDAM para edición de sitio (con kitchen types para el combo). */
export const initialDataSitesPdamProgramEditResolver: ResolveFn<any> = () => resolvePdamProgramDataEdit();
