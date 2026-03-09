import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { QueryParameters } from 'app/shared/models/common/QueryParameters';
import { SiteService } from 'app/shared/services/site.service';
import { forkJoin, map, switchMap } from 'rxjs';
import { OptionSelectionService } from 'app/shared/services/option-selection.service';
import { AuthService } from 'app/core/auth/auth.service';
import { CenterTypeService } from 'app/shared/services/center-type.service';
import { DeliveryTypeService } from 'app/shared/services/delivery-type.service';
import { SponsorTypeService } from 'app/shared/services/sponsor-type.service';
import { GroupTypeService } from 'app/shared/services/group-type.service';
import { OrganizationTypeService } from 'app/shared/services/organization-type.service';
import { SiteCalendarService } from '../calendar/site-calendar.service';
import { ServiceTypeService } from 'app/shared/services/service-type.service';
import { PROGRAM_IDS } from 'app/shared/const';
import { GeoService } from 'app/shared/services/geo.service';
import { EducationLevelService } from 'app/shared/services/education-level.service';
import { OperatingPeriodService } from 'app/shared/services/operating-period.service';
import { KitchenTypeService } from 'app/shared/services/kitchen-type.service';
import { AreaTypeService } from 'app/shared/services/area-type.service';
import { TranslocoService } from '@ngneat/transloco';

// Resolver para la lista de sitios PACNA
// Resolver for PACNA sites list
export const initialDataSitesPacnaListResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
  // Site service
  // Servicio de sitios
  const siteService = inject(SiteService);
  // Auth service
  // Servicio de autenticación
  const authService = inject(AuthService);
  // Option selection service
  // Servicio de opciones de selección
  const optionSelectionService = inject(OptionSelectionService);
  const agencyId = authService.getAgencyId();

  // Cargar opciones de isDayCareHome para obtener el ID de Hogares
  const optionsParams: QueryParameters = { optionKey: 'isDayCareHome', isList: true };

  return optionSelectionService.getOptionSelectionByOptionKey(optionsParams).pipe(
    switchMap((optionsResponse) => {
      // Obtener el ID de la opción "Hogar" (booleanValue === true). Con isList: true el body es la lista directamente.
      const options = optionsResponse?.body ?? [];
      const homeOption = options.find((option: any) => option?.booleanValue === true);
      const homeOptionId = homeOption?.id;

      // Hacer la búsqueda con el isDayCareHomeId de Hogares
      const requestParameters: QueryParameters = {
        take: 25,
        skip: 0,
        alls: false,
        isList: false,
        agencyId: agencyId,
        //isDayCareHomeId: homeOptionId,
      };

      return siteService.getAllSitesFromDb(requestParameters);
    }),
    map((sitesResponse) => ({
      sites: sitesResponse.body,
    }))
  );
};

// Resolver específico para PACNA (add/edit)
// Resolver for PACNA program (add/edit)
export const initialDataSitesPacnaProgramResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
  // Center type service
  // Servicio de tipos de centro
  const centerTypeService = inject(CenterTypeService);
  // Delivery type service
  // Servicio de tipos de entrega
  const deliveryTypeService = inject(DeliveryTypeService);
  // Sponsor type service
  // Servicio de tipos de patrocinador
  const sponsorTypeService = inject(SponsorTypeService);
  // Group type service
  // Servicio de tipos de grupo
  const groupTypeService = inject(GroupTypeService);
  // Organization type service
  // Servicio de tipos de organización
  const organizationTypeService = inject(OrganizationTypeService);
  // Site calendar service
  // Servicio de calendario de sitios
  const siteCalendarService = inject(SiteCalendarService);
  // Service type service
  // Servicio de tipos de servicio
  const serviceTypeService = inject(ServiceTypeService);

  return forkJoin([
    centerTypeService.getCenterTypesByProgram({ programId: PROGRAM_IDS.PACNA }),
    deliveryTypeService.getDeliveryTypesByProgram({ programId: PROGRAM_IDS.PACNA }),
    sponsorTypeService.getSponsorTypesByProgram({ programId: PROGRAM_IDS.PACNA }),
    groupTypeService.getGroupTypesByProgram({ programId: PROGRAM_IDS.PACNA }),
    organizationTypeService.getOrganizationTypesByProgram({ programId: PROGRAM_IDS.PACNA }),
    siteCalendarService.getAllowedDaysByProgramId({ programId: PROGRAM_IDS.PACNA }),
    serviceTypeService.getServiceTypesByProgram({ programId: PROGRAM_IDS.PACNA }),
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
};

// Resolver específico para PACNA Edit
// Resolver for PACNA program edit
export const initialDataSitesPacnaProgramEditResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
  // Center type service
  // Servicio de tipos de centro
  const centerTypeService = inject(CenterTypeService);
  // Delivery type service
  // Servicio de tipos de entrega
  const deliveryTypeService = inject(DeliveryTypeService);
  // Sponsor type service
  // Servicio de tipos de patrocinador
  const sponsorTypeService = inject(SponsorTypeService);
  // Group type service
  // Servicio de tipos de grupo
  const groupTypeService = inject(GroupTypeService);
  // Organization type service
  // Servicio de tipos de organización
  const organizationTypeService = inject(OrganizationTypeService);
  // Site calendar service
  // Servicio de calendario de sitios
  const siteCalendarService = inject(SiteCalendarService);
  // Service type service
  // Servicio de tipos de servicio
  const serviceTypeService = inject(ServiceTypeService);

  return forkJoin([
    centerTypeService.getCenterTypesByProgram({ programId: PROGRAM_IDS.PACNA }),
    deliveryTypeService.getDeliveryTypesByProgram({ programId: PROGRAM_IDS.PACNA }),
    sponsorTypeService.getSponsorTypesByProgram({ programId: PROGRAM_IDS.PACNA }),
    groupTypeService.getGroupTypesByProgram({ programId: PROGRAM_IDS.PACNA }),
    organizationTypeService.getOrganizationTypesByProgram({ programId: PROGRAM_IDS.PACNA }),
    siteCalendarService.getAllowedDaysByProgramId({ programId: PROGRAM_IDS.PACNA }),
    serviceTypeService.getServiceTypesByProgram({ programId: PROGRAM_IDS.PACNA }),
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
};

// Request parameters comunes para PACNA centros
const getCommonRequestParameters = (): QueryParameters => ({
  take: 25,
  skip: 0,
  alls: true,
  isList: true,
});

// Resolver común para la creación de un sitio PACNA Centro (sin operatingPolicies)
export const initialDataSitesPacnaCenterAddResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
  const geoService = inject(GeoService);
  const organizationTypeService = inject(OrganizationTypeService);
  const educationLevelService = inject(EducationLevelService);
  const operatingPeriodService = inject(OperatingPeriodService);
  const optionSelectionService = inject(OptionSelectionService);
  const kitchenTypeService = inject(KitchenTypeService);
  const areaTypeService = inject(AreaTypeService);
  const translocoService = inject(TranslocoService);

  const requestParameters = getCommonRequestParameters();
  const language = translocoService.getActiveLang() ?? 'es';

  return forkJoin([
    // Selection options service (orden por nombre para community, experience según idioma)
    optionSelectionService.getOptionSelectionByOptionKey({
      optionKey:
        'yesNo,typeOfResidential,typeOfApplicant,isActive,community,walkers,distributionType,siteType,experience,reviewResult,relationshipType,homeType,participantType,siteLocation,publicAllianceContract',
      isList: true,
      sortByNameKeys: 'community,experience',
      language,
    }),
    // Types of kitchen (por programa: PACNA sin CGA)
    kitchenTypeService.getKitchenTypesByProgram({ programId: PROGRAM_IDS.PACNA }),
    // Geographic service
    // Servicio para operaciones geográficas
    geoService.getCitiesFromDb(requestParameters),
    // Regions service
    // Servicio para regiones
    geoService.getRegionsFromDb(requestParameters),
    // Organization types school service
    // Servicio para Tipos de organización de Escuelas -- Escuela (1), Satélite (2), Institución Residencial (3), Otros (4)
    organizationTypeService.getAllOrganizationTypesFromDb(requestParameters),
    // Education levels service
    // Servicio para niveles de educación
    educationLevelService.getAllEducationLevelsFromDb(requestParameters),
    // Operating periods service
    // Servicio para períodos de operación
    operatingPeriodService.getAllOperatingPeriodsFromDb(requestParameters),
    // Types of area
    // Tipos de área
    areaTypeService.getAllAreaTypesFromDb(requestParameters),
  ]).pipe(
    map(([options, kitchenTypes, cities, regions, organizationTypes, educationLevels, operatingPeriods, areaTypes]) => ({
      options: options.body,
      kitchenTypes: kitchenTypes.body,
      cities: cities.body,
      regions: regions.body,
      organizationTypes: organizationTypes.body,
      educationLevels: educationLevels.body,
      operatingPeriods: operatingPeriods.body,
      areaTypes: areaTypes.body,
    }))
  );
};

// Resolver común para la edición de un sitio PACNA Centro (sin operatingPolicies)
export const initialDataSitesPacnaCenterEditResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
  const id = Number(route.paramMap.get('id'));
  const siteService = inject(SiteService);
  const geoService = inject(GeoService);
  const organizationTypeService = inject(OrganizationTypeService);
  const educationLevelService = inject(EducationLevelService);
  const operatingPeriodService = inject(OperatingPeriodService);
  const optionSelectionService = inject(OptionSelectionService);
  const kitchenTypeService = inject(KitchenTypeService);
  const areaTypeService = inject(AreaTypeService);
  const translocoService = inject(TranslocoService);

  const requestParameters = getCommonRequestParameters();
  const language = translocoService.getActiveLang() ?? 'es';

  return forkJoin([
    siteService.getSiteById({ id }),
    // Opciones de selección (orden por nombre para community, experience según idioma)
    optionSelectionService.getOptionSelectionByOptionKey({
      optionKey:
        'yesNo,typeOfResidential,typeOfApplicant,isActive,community,walkers,distributionType,siteType,experience,reviewResult,relationshipType,homeType,participantType,siteLocation,publicAllianceContract',
      isList: true,
      sortByNameKeys: 'community,experience',
      language,
    }),
    // Types of kitchen (por programa: PACNA sin CGA)
    kitchenTypeService.getKitchenTypesByProgram({ programId: PROGRAM_IDS.PACNA }),
    // Geographic service
    // Servicio para operaciones geográficas
    geoService.getCitiesFromDb(requestParameters),
    // Regions service
    // Servicio para regiones
    geoService.getRegionsFromDb(requestParameters),
    // Organization types school service
    // Servicio para Tipos de organización de Escuelas -- Escuela (1), Satélite (2), Institución Residencial (3), Otros (4)
    organizationTypeService.getAllOrganizationTypesFromDb(requestParameters),
    // Education levels service
    // Servicio para niveles de educación
    educationLevelService.getAllEducationLevelsFromDb(requestParameters),
    // Operating periods service
    // Servicio para períodos de operación
    operatingPeriodService.getAllOperatingPeriodsFromDb(requestParameters),
    // Types of area
    // Tipos de área
    areaTypeService.getAllAreaTypesFromDb(requestParameters),
  ]).pipe(
    map(([site, options, kitchenTypes, cities, regions, organizationTypes, educationLevels, operatingPeriods, areaTypes]) => ({
      site: site.body,
      options: options.body,
      kitchenTypes: kitchenTypes.body,
      cities: cities.body,
      regions: regions.body,
      organizationTypes: organizationTypes.body,
      educationLevels: educationLevels.body,
      operatingPeriods: operatingPeriods.body,
      areaTypes: areaTypes.body,
    }))
  );
};
