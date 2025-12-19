import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { QueryParameters } from 'app/shared/models/QueryParameters';
import { SiteService } from 'app/shared/services/site.service';
import { GeoService } from 'app/shared/services/geo.service';
import { OrganizationTypeService } from 'app/shared/services/organization-type.service';
import { EducationLevelService } from 'app/shared/services/education-level.service';
import { OperatingPeriodService } from 'app/shared/services/operating-period.service';
import { OperatingPolicyService } from 'app/shared/services/operating-policy.service';
import { forkJoin, map } from 'rxjs';
import { OptionSelectionService } from 'app/shared/services/option-selection.service';
import { KitchenTypeService } from 'app/shared/services/kitchen-type.service';
import { GroupTypeService } from 'app/shared/services/group-type.service';
import { DeliveryTypeService } from 'app/shared/services/delivery-type.service';
import { AreaTypeService } from 'app/shared/services/area-type.service';
import { AuthService } from 'app/core/auth/auth.service';
import { PROGRAM_IDS } from 'app/shared/const';

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

// Resolver para la creación de un sitio PSAV
export const initialDataSitesPsavAddResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
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
  // Delivery types service
  // Servicio para tipos de entrega
  const deliveryTypeService = inject(DeliveryTypeService);
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
    // Obtener los tipos específicos de PSAV (NO incluir centerTypes ni sponsorTypes)
    deliveryTypeService.getDeliveryTypesByProgram({ programId: PROGRAM_IDS.PSAV }),
    groupTypeService.getGroupTypesByProgram({ programId: PROGRAM_IDS.PSAV }),
    organizationTypeService.getOrganizationTypesByProgram({ programId: PROGRAM_IDS.PSAV }),
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
      filteredDeliveryTypes,
      filteredGroupTypes,
      filteredOrganizationTypes,
    ]) => ({
      options: options.body,
      kitchenTypes: kitchenTypes.body,
      groupTypes: filteredGroupTypes.body,
      sponsorTypes: [], // PSAV no tiene sponsorTypes
      cities: cities.body,
      regions: regions.body,
      organizationTypes: filteredOrganizationTypes.body,
      educationLevels: educationLevels.body,
      operatingPeriods: operatingPeriods.body,
      operatingPolicies: operatingPolicies.body,
      deliveryTypes: filteredDeliveryTypes.body,
      centerTypes: [], // PSAV no tiene centerTypes
      areaTypes: areaTypes.body,
    }))
  );
};

// Resolver para la edición de un sitio PSAV
export const initialDataSitesPsavEditResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
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
  // Delivery types service
  // Servicio para tipos de entrega
  const deliveryTypeService = inject(DeliveryTypeService);
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
    // Obtener los tipos específicos de PSAV (NO incluir centerTypes ni sponsorTypes)
    deliveryTypeService.getDeliveryTypesByProgram({ programId: PROGRAM_IDS.PSAV }),
    groupTypeService.getGroupTypesByProgram({ programId: PROGRAM_IDS.PSAV }),
    organizationTypeService.getOrganizationTypesByProgram({ programId: PROGRAM_IDS.PSAV }),
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
      filteredDeliveryTypes,
      filteredGroupTypes,
      filteredOrganizationTypes,
    ]) => ({
      site: site.body,
      options: options.body,
      kitchenTypes: kitchenTypes.body,
      groupTypes: filteredGroupTypes.body,
      sponsorTypes: [], // PSAV no tiene sponsorTypes
      cities: cities.body,
      regions: regions.body,
      organizationTypes: filteredOrganizationTypes.body,
      educationLevels: educationLevels.body,
      operatingPeriods: operatingPeriods.body,
      operatingPolicies: operatingPolicies.body,
      deliveryTypes: filteredDeliveryTypes.body,
      centerTypes: [], // PSAV no tiene centerTypes
      areaTypes: areaTypes.body,
    }))
  );
};

