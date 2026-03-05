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
import { AreaTypeService } from 'app/shared/services/area-type.service';
import { TranslocoService } from '@ngneat/transloco';

// Request parameters comunes
const getCommonRequestParameters = (): QueryParameters => ({
  take: 25,
  skip: 0,
  alls: true,
  isList: true,
});

// Resolver común para la creación de un sitio (PSAV, etc.: orden community/experience por SP 101_)
export const initialDataSitesCommonAddResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
  const geoService = inject(GeoService);
  const organizationTypeService = inject(OrganizationTypeService);
  const educationLevelService = inject(EducationLevelService);
  const operatingPeriodService = inject(OperatingPeriodService);
  const operatingPolicyService = inject(OperatingPolicyService);
  const optionSelectionService = inject(OptionSelectionService);
  const kitchenTypeService = inject(KitchenTypeService);
  const areaTypeService = inject(AreaTypeService);
  const translocoService = inject(TranslocoService);

  const requestParameters = getCommonRequestParameters();
  const language = translocoService.getActiveLang() ?? 'es';

  return forkJoin([
    optionSelectionService.getOptionSelectionByOptionKey({
      optionKey:
        'yesNo,typeOfResidential,typeOfApplicant,isActive,community,walkers,distributionType,siteType,experience,reviewResult,relationshipType,homeType,participantType,siteLocation,publicAllianceContract',
      isList: true,
      sortByNameKeys: 'community,experience',
      language,
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
  ]).pipe(
    map(([options, kitchenTypes, cities, regions, organizationTypes, educationLevels, operatingPeriods, operatingPolicies, areaTypes]) => ({
      options: options.body,
      kitchenTypes: kitchenTypes.body,
      cities: cities.body,
      regions: regions.body,
      organizationTypes: organizationTypes.body,
      educationLevels: educationLevels.body,
      operatingPeriods: operatingPeriods.body,
      operatingPolicies: operatingPolicies.body,
      areaTypes: areaTypes.body,
    }))
  );
};

// Resolver común para la edición de un sitio (PSAV, etc.: orden community/experience por SP 101_)
export const initialDataSitesCommonEditResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
  const id = Number(route.paramMap.get('id'));
  const siteService = inject(SiteService);
  const geoService = inject(GeoService);
  const organizationTypeService = inject(OrganizationTypeService);
  const educationLevelService = inject(EducationLevelService);
  const operatingPeriodService = inject(OperatingPeriodService);
  const operatingPolicyService = inject(OperatingPolicyService);
  const optionSelectionService = inject(OptionSelectionService);
  const kitchenTypeService = inject(KitchenTypeService);
  const areaTypeService = inject(AreaTypeService);
  const translocoService = inject(TranslocoService);

  const requestParameters = getCommonRequestParameters();
  const language = translocoService.getActiveLang() ?? 'es';

  return forkJoin([
    siteService.getSiteById({ id }),
    optionSelectionService.getOptionSelectionByOptionKey({
      optionKey:
        'yesNo,typeOfResidential,typeOfApplicant,isActive,community,walkers,distributionType,siteType,experience,reviewResult,relationshipType,homeType,participantType,siteLocation,publicAllianceContract',
      isList: true,
      sortByNameKeys: 'community,experience',
      language,
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
  ]).pipe(
    map(([site, options, kitchenTypes, cities, regions, organizationTypes, educationLevels, operatingPeriods, operatingPolicies, areaTypes]) => ({
      site: site.body,
      options: options.body,
      kitchenTypes: kitchenTypes.body,
      cities: cities.body,
      regions: regions.body,
      organizationTypes: organizationTypes.body,
      educationLevels: educationLevels.body,
      operatingPeriods: operatingPeriods.body,
      operatingPolicies: operatingPolicies.body,
      areaTypes: areaTypes.body,
    }))
  );
};

