import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { QueryParameters } from 'app/shared/models/QueryParameters';
import { SiteService } from 'app/shared/services/site.service';
import { GeoService } from 'app/shared/services/geo.service';
import { OrganizationTypeService } from 'app/shared/services/organization-type.service';
import { EducationLevelService } from 'app/shared/services/education-level.service';
import { OperatingPeriodService } from 'app/shared/services/operating-period.service';
import { OperatingPolicyService } from 'app/shared/services/operating-policy.service';
import { forkJoin, map, switchMap } from 'rxjs';
import { OptionSelectionService } from 'app/shared/services/option-selection.service';
import { KitchenTypeService } from 'app/shared/services/kitchen-type.service';
import { GroupTypeService } from 'app/shared/services/group-type.service';
import { SponsorTypeService } from 'app/shared/services/sponsor-type.service';
import { DeliveryTypeService } from 'app/shared/services/delivery-type.service';
import { CenterTypeService } from 'app/shared/services/center-type.service';
import { AreaTypeService } from 'app/shared/services/area-type.service';
import { AuthService } from 'app/core/auth/auth.service';
import { PROGRAM_IDS } from 'app/shared/const';


// Resolver para la lista de sitios PACNA
export const initialDataSitesPacnaListResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
  const siteService = inject(SiteService);
  const authService = inject(AuthService);
  const optionSelectionService = inject(OptionSelectionService);
  const agencyId = authService.getAgencyId();

  // Cargar opciones de isDayCareHome para obtener el ID de Hogares
  const optionsParams: QueryParameters = { optionKey: 'isDayCareHome' } as QueryParameters;

  return optionSelectionService.getOptionSelectionByOptionKey(optionsParams).pipe(
    switchMap((optionsResponse) => {
      // Obtener el ID de la opción "Hogar" (booleanValue === true)
      const options = optionsResponse?.body?.data || optionsResponse?.body || [];
      const homeOption = options.find((option: any) => option?.booleanValue === true);
      const homeOptionId = homeOption?.id;

      // Hacer la búsqueda con el isDayCareHomeId de Hogares
      const requestParameters: QueryParameters = {
        take: 25,
        skip: 0,
        alls: false,
        isList: false,
        agencyId: agencyId,
        isDayCareHomeId: homeOptionId,
      };

      return siteService.getAllSitesFromDb(requestParameters);
    }),
    map((sitesResponse) => ({
      sites: sitesResponse.body,
    }))
  );
};

// Resolver para la creación de un sitio PACNA
export const initialDataSitesPacnaAddResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
  // Site operations service
  // Servicio para operaciones de sitios
  const siteService = inject(SiteService);
  // Geographic operations service
  // Servicio para operaciones geográficas
  const geoService = inject(GeoService);
  // Organization types school service
  // Servicio para Tipos de organización de Escuelas -- Escuela (1), Satélite (2), Institución Residencial (3), Otros (4)
  const organizationTypeService = inject(OrganizationTypeService);
  // Education levels service
  // Servicio para niveles de educación
  const educationLevelService = inject(EducationLevelService);
  // Operating periods service
  // Servicio para períodos de operación
  const operatingPeriodService = inject(OperatingPeriodService);
  // Operating policies service
  // Servicio para políticas de operación
  const operatingPolicyService = inject(OperatingPolicyService);
  // Selection options service
  // Servicio para opciones de selección
  const optionSelectionService = inject(OptionSelectionService);
  // Kitchen types service
  // Servicio para tipos de cocina
  const kitchenTypeService = inject(KitchenTypeService);
  // Group types service
  // Servicio para tipos de grupo
  const groupTypeService = inject(GroupTypeService);
  // Sponsor types service
  // Servicio para tipos de auspiciador
  const sponsorTypeService = inject(SponsorTypeService);
  // Delivery types service
  // Servicio para tipos de entrega
  const deliveryTypeService = inject(DeliveryTypeService);
  // Center types service
  // Servicio para tipos de centro
  const centerTypeService = inject(CenterTypeService);
  // Area types service
  // Servicio para tipos de área
  const areaTypeService = inject(AreaTypeService);
  // Auth service
  // Servicio de autenticación
  const authService = inject(AuthService);

  // Request parameters
  // Parámetros de la solicitud
  const requestParameters: QueryParameters = {
    take: 25,
    skip: 0,
    alls: true,
    isList: true,
  };

  return forkJoin([
    // Selection options service
    // Servicio para opciones de selección
    optionSelectionService.getOptionSelectionByOptionKey({
      optionKey:
        'yesNo,typeOfResidential,typeOfApplicant,isActive,community,walkers,services,distributionType,siteType,experience,reviewResult,relationshipType,homeType,participantType,siteLocation,publicAllianceContract',
    }),
    // Types of kitchen
    // Tipos de cocina
    kitchenTypeService.getAllKitchenTypesFromDb(requestParameters),
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
    // Operating policies service
    // Servicio para políticas de operación
    operatingPolicyService.getAllOperatingPoliciesFromDb(requestParameters),
    // Types of area
    // Tipos de área
    areaTypeService.getAllAreaTypesFromDb(requestParameters),
    // Obtener los tipos específicos de PACNA
    centerTypeService.getCenterTypesByProgram({ programId: PROGRAM_IDS.PACNA }),
    deliveryTypeService.getDeliveryTypesByProgram({ programId: PROGRAM_IDS.PACNA }),
    sponsorTypeService.getSponsorTypesByProgram({ programId: PROGRAM_IDS.PACNA }),
    groupTypeService.getGroupTypesByProgram({ programId: PROGRAM_IDS.PACNA }),
    organizationTypeService.getOrganizationTypesByProgram({ programId: PROGRAM_IDS.PACNA }),
  ]).pipe(
    map(([
      options,
      kitchenTypes,
      cities,
      regions,
      organizationTypes,
      educationLevels,
      operatingPeriods,
      operatingPolicies,
      areaTypes,
      filteredCenterTypes,
      filteredDeliveryTypes,
      filteredSponsorTypes,
      filteredGroupTypes,
      filteredOrganizationTypes,
    ]) => ({
      options: options.body,
      kitchenTypes: kitchenTypes.body,
      groupTypes: filteredGroupTypes.body,
      sponsorTypes: filteredSponsorTypes.body,
      cities: cities.body,
      regions: regions.body,
      organizationTypes: filteredOrganizationTypes.body,
      educationLevels: educationLevels.body,
      operatingPeriods: operatingPeriods.body,
      operatingPolicies: operatingPolicies.body,
      deliveryTypes: filteredDeliveryTypes.body,
      centerTypes: filteredCenterTypes.body,
      areaTypes: areaTypes.body,
    }))
  );
};

// Resolver para la edición de un sitio PACNA
export const initialDataSitesPacnaEditResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
  const id = Number(route.paramMap.get('id'));

  // School operations service
  // Servicio para operaciones de escuelas
  const siteService = inject(SiteService);
  // Geographic operations service
  // Servicio para operaciones geográficas
  const geoService = inject(GeoService);
  // Organization types school service
  // Servicio para Tipos de organización de Escuelas -- Escuela (1), Satélite (2), Institución Residencial (3), Otros (4)
  const organizationTypeService = inject(OrganizationTypeService);
  // Education levels service
  // Servicio para niveles de educación
  const educationLevelService = inject(EducationLevelService);
  // Operating periods service
  // Servicio para períodos de operación
  const operatingPeriodService = inject(OperatingPeriodService);
  // Operating policies service
  // Servicio para políticas de operación
  const operatingPolicyService = inject(OperatingPolicyService);
  // Selection options service
  // Servicio para opciones de selección
  const optionSelectionService = inject(OptionSelectionService);
  // Kitchen types service
  // Servicio para tipos de cocina
  const kitchenTypeService = inject(KitchenTypeService);
  // Group types service
  // Servicio para tipos de grupo
  const groupTypeService = inject(GroupTypeService);
  // Sponsor types service
  // Servicio para tipos de auspiciador
  const sponsorTypeService = inject(SponsorTypeService);
  // Delivery types service
  // Servicio para tipos de entrega
  const deliveryTypeService = inject(DeliveryTypeService);
  // Center types service
  // Servicio para tipos de centro
  const centerTypeService = inject(CenterTypeService);
  // Area types service
  // Servicio para tipos de área
  const areaTypeService = inject(AreaTypeService);
  // Auth service
  // Servicio de autenticación
  const authService = inject(AuthService);

  // Request parameters
  // Parámetros de la solicitud
  const requestParameters: QueryParameters = {
    take: 25,
    skip: 0,
    alls: true,
    isList: true,
  };

  return forkJoin([
    // School service
    // Servicio para operaciones de escuelas
    siteService.getSiteById({ id: id }),
    // Selection options service
    // Servicio para opciones de selección
    optionSelectionService.getOptionSelectionByOptionKey({
      optionKey:
        'yesNo,typeOfResidential,typeOfApplicant,isActive,community,walkers,services,distributionType,siteType,experience,reviewResult,relationshipType,homeType,participantType,siteLocation,publicAllianceContract',
    }),
    // Types of kitchen
    // Tipos de cocina
    kitchenTypeService.getAllKitchenTypesFromDb(requestParameters),
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
    // Operating policies service
    // Servicio para políticas de operación
    operatingPolicyService.getAllOperatingPoliciesFromDb(requestParameters),
    // Types of area
    // Tipos de área
    areaTypeService.getAllAreaTypesFromDb(requestParameters),
    // Obtener los tipos específicos de PACNA
    centerTypeService.getCenterTypesByProgram({ programId: PROGRAM_IDS.PACNA }),
    deliveryTypeService.getDeliveryTypesByProgram({ programId: PROGRAM_IDS.PACNA }),
    sponsorTypeService.getSponsorTypesByProgram({ programId: PROGRAM_IDS.PACNA }),
    groupTypeService.getGroupTypesByProgram({ programId: PROGRAM_IDS.PACNA }),
    organizationTypeService.getOrganizationTypesByProgram({ programId: PROGRAM_IDS.PACNA }),
  ]).pipe(
    map(([
      site,
      options,
      kitchenTypes,
      cities,
      regions,
      organizationTypes,
      educationLevels,
      operatingPeriods,
      operatingPolicies,
      areaTypes,
      filteredCenterTypes,
      filteredDeliveryTypes,
      filteredSponsorTypes,
      filteredGroupTypes,
      filteredOrganizationTypes,
    ]) => ({
      site: site.body,
      options: options.body,
      kitchenTypes: kitchenTypes.body,
      groupTypes: filteredGroupTypes.body,
      sponsorTypes: filteredSponsorTypes.body,
      cities: cities.body,
      regions: regions.body,
      organizationTypes: filteredOrganizationTypes.body,
      educationLevels: educationLevels.body,
      operatingPeriods: operatingPeriods.body,
      operatingPolicies: operatingPolicies.body,
      deliveryTypes: filteredDeliveryTypes.body,
      centerTypes: filteredCenterTypes.body,
      areaTypes: areaTypes.body,
    }))
  );
};
