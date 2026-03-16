import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { forkJoin, map, Observable } from 'rxjs';
import { PROGRAM_IDS } from 'app/shared/const';
import { DeliveryTypeService } from 'app/shared/services/delivery-type.service';
import { GroupTypeService } from 'app/shared/services/group-type.service';
import { OrganizationTypeService } from 'app/shared/services/organization-type.service';
import { ServiceTypeService } from 'app/shared/services/service-type.service';
import { KitchenTypeService } from 'app/shared/services/kitchen-type.service';
import { SiteCalendarService } from '../calendar/site-calendar.service';

/** Carga datos de programa PSAV para add (sin kitchen types; se cargan por group type en el componente). */
function resolvePsavProgramDataAdd(): Observable<any> {
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
        serviceTypes: serviceTypes.body,
      })
    )
  );
}

/** Carga datos de programa PSAV para edit, incluyendo kitchen types para que compareById funcione en el formulario. */
function resolvePsavProgramDataEdit(): Observable<any> {
  const deliveryTypeService = inject(DeliveryTypeService);
  const groupTypeService = inject(GroupTypeService);
  const organizationTypeService = inject(OrganizationTypeService);
  const siteCalendarService = inject(SiteCalendarService);
  const serviceTypeService = inject(ServiceTypeService);
  const kitchenTypeService = inject(KitchenTypeService);

  return forkJoin([
    deliveryTypeService.getDeliveryTypesByProgram({ programId: PROGRAM_IDS.PSAV }),
    groupTypeService.getGroupTypesByProgram({ programId: PROGRAM_IDS.PSAV }),
    organizationTypeService.getOrganizationTypesByProgram({ programId: PROGRAM_IDS.PSAV }),
    siteCalendarService.getAllowedDaysByProgramId({ programId: PROGRAM_IDS.PSAV }),
    serviceTypeService.getServiceTypesByProgram({ programId: PROGRAM_IDS.PSAV }),
    kitchenTypeService.getKitchenTypesByProgram({ programId: PROGRAM_IDS.PSAV }),
  ]).pipe(
    map(
      ([deliveryTypes, groupTypes, organizationTypes, allowedOperatingDays, serviceTypes, kitchenTypes]) => ({
        centerTypes: [], // PSAV no tiene centerTypes
        deliveryTypes: deliveryTypes.body,
        sponsorTypes: [], // PSAV no tiene sponsorTypes
        groupTypes: groupTypes.body,
        organizationTypes: organizationTypes.body,
        allowedOperatingDays: allowedOperatingDays.body,
        serviceTypes: serviceTypes.body,
        kitchenTypes: kitchenTypes.body,
      })
    )
  );
}

/** Resolver de datos de programa PSAV para alta de sitio. */
export const initialDataSitesPsavProgramAddResolver: ResolveFn<any> = () => resolvePsavProgramDataAdd();

/** Resolver de datos de programa PSAV para edición de sitio (con kitchen types para el combo). */
export const initialDataSitesPsavProgramEditResolver: ResolveFn<any> = () => resolvePsavProgramDataEdit();
