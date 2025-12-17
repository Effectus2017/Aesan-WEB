import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { QueryParameters } from 'app/shared/models/QueryParameters';
import { SiteService } from 'app/shared/services/site.service';
import { GeoService } from 'app/shared/services/geo.service';
import { OrganizationTypeService } from 'app/shared/services/organization-type.service';
import { EducationLevelService } from 'app/shared/services/education-level.service';
import { OperatingPeriodService } from 'app/shared/services/operating-period.service';
import { OperatingPolicyService } from 'app/shared/services/operating-policy.service';
import { forkJoin, map, switchMap, of } from 'rxjs';
import { OptionSelectionService } from 'app/shared/services/option-selection.service';
import { KitchenTypeService } from 'app/shared/services/kitchen-type.service';
import { GroupTypeService } from 'app/shared/services/group-type.service';
import { SponsorTypeService } from 'app/shared/services/sponsor-type.service';
import { DeliveryTypeService } from 'app/shared/services/delivery-type.service';
import { CenterTypeService } from 'app/shared/services/center-type.service';
import { AreaTypeService } from 'app/shared/services/area-type.service';
import { AuthService } from 'app/core/auth/auth.service';
import { PROGRAM_IDS } from 'app/shared/const';
import { SiteCalendarService } from '../sites/site-calendar.service';

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

// Resolver para la lista de sitios PACNA
export const initialDataSitesPacnaListResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
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
  // Facilities service
  // Servicio para instalaciones
  //const facilityService = inject(FacilityService);
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

  // Obtener programas de la agencia desde localStorage (almacenados por app.resolver)
  const programsJson = localStorage.getItem('agencyPrograms');
  const programs = programsJson ? JSON.parse(programsJson) : [];

  // Determinar si la agencia tiene PDAM, PSAV o PACNA
  const isPDAM = programs.some((p: any) => p.id === PROGRAM_IDS.PDAM);
  const isPSAV = programs.some((p: any) => p.id === PROGRAM_IDS.PSAV);
  const isPACNA = programs.some((p: any) => p.id === PROGRAM_IDS.PACNA);

  return forkJoin([
    // Verificar si existe una escuela principal
    // Servicio para verificar si existe una escuela principal
    //siteService.hasMainSite(),
    // Selection options service
    // Servicio para opciones de selección
    optionSelectionService.getOptionSelectionByOptionKey({
      optionKey:
        'yesNo,typeOfResidential,typeOfApplicant,isActive,community,walkers,services,distributionType,siteType,experience,reviewResult,relationshipType,homeType,participantType,siteLocation,publicAllianceContract',
    }),
    // Types of kitchen
    // Tipos de cocina
    kitchenTypeService.getAllKitchenTypesFromDb(requestParameters),
    // Types of sponsor
    // Tipos de auspiciador
    sponsorTypeService.getAllSponsorTypesFromDb(requestParameters),
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
    // Facilities service
    // Servicio para instalaciones
    // facilityService.getAllFacilitiesFromDb(requestParameters),
    // Operating policies service
    // Servicio para políticas de operación
    operatingPolicyService.getAllOperatingPoliciesFromDb(requestParameters),
    // Types of area
    // Tipos de área
    areaTypeService.getAllAreaTypesFromDb(requestParameters),
  ]).pipe(
    switchMap(
      ([
        options,
        kitchenTypes,
        sponsorTypes,
        cities,
        regions,
        organizationTypes,
        educationLevels,
        operatingPeriods,
        operatingPolicies,
        areaTypes,
      ]) => {
        // Si tiene PDAM, PSAV o PACNA, obtener los tipos de centro, entrega, auspiciador y grupo específicos
        if (isPDAM || isPSAV || isPACNA) {
          // Si tiene PDAM, usar el primer programa PDAM encontrado
          const pdamProgram = programs.find((p: any) => p.id === PROGRAM_IDS.PDAM);
          if (pdamProgram) {
            return forkJoin([
              centerTypeService.getCenterTypesByProgram({ programId: pdamProgram.id }),
              deliveryTypeService.getDeliveryTypesByProgram({ programId: pdamProgram.id }),
              sponsorTypeService.getSponsorTypesByProgram({ programId: pdamProgram.id }),
              groupTypeService.getGroupTypesByProgram({ programId: pdamProgram.id }),
              organizationTypeService.getOrganizationTypesByProgram({ programId: pdamProgram.id }),
            ]).pipe(
              map(([filteredCenterTypes, filteredDeliveryTypes, filteredSponsorTypes, filteredGroupTypes, filteredOrganizationTypes]) => ({
                options: options.body,
                kitchenTypes: kitchenTypes.body,
                siteLocations: options.body.data.filter((option: any) => option.optionKey === 'siteLocation'),
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
                programs: programs,
              }))
            );
          } else {
            // Si tiene PSAV, usar el primer programa PSAV encontrado
            const psavProgram = programs.find((p: any) => p.id === PROGRAM_IDS.PSAV);
            if (psavProgram) {
              return forkJoin([
                groupTypeService.getGroupTypesByProgram({ programId: psavProgram.id }),
                deliveryTypeService.getDeliveryTypesByProgram({ programId: psavProgram.id }),
                organizationTypeService.getOrganizationTypesByProgram({ programId: psavProgram.id }),
              ]).pipe(
                map(([filteredGroupTypes, filteredDeliveryTypes, filteredOrganizationTypes]) => ({
                  options: options.body,
                  kitchenTypes: kitchenTypes.body,
                  siteLocations: options.body.data.filter((option: any) => option.optionKey === 'siteLocation'),
                  groupTypes: filteredGroupTypes.body,
                  sponsorTypes: [],
                  cities: cities.body,
                  regions: regions.body,
                  organizationTypes: filteredOrganizationTypes.body,
                  educationLevels: educationLevels.body,
                  operatingPeriods: operatingPeriods.body,
                  operatingPolicies: operatingPolicies.body,
                  deliveryTypes: filteredDeliveryTypes.body,
                  centerTypes: [],
                  areaTypes: areaTypes.body,
                  programs: programs,
                }))
              );
            } else {
              // Si tiene PACNA, usar el primer programa PACNA encontrado
              const pacnaProgram = programs.find((p: any) => p.id === PROGRAM_IDS.PACNA);
              if (pacnaProgram) {
                return forkJoin([
                  centerTypeService.getCenterTypesByProgram({ programId: pacnaProgram.id }),
                  deliveryTypeService.getDeliveryTypesByProgram({ programId: pacnaProgram.id }),
                  sponsorTypeService.getSponsorTypesByProgram({ programId: pacnaProgram.id }),
                  groupTypeService.getGroupTypesByProgram({ programId: pacnaProgram.id }),
                  organizationTypeService.getOrganizationTypesByProgram({ programId: pacnaProgram.id }),
                ]).pipe(
                  map(([filteredCenterTypes, filteredDeliveryTypes, filteredSponsorTypes, filteredGroupTypes, filteredOrganizationTypes]) => ({
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
                    programs: programs,
                  }))
                );
              }
            }
          }
        }

        // Si no tiene PDAM, PSAV ni PACNA, obtener todos los tipos sin filtrar
        return forkJoin([
          groupTypeService.getAllGroupTypesFromDb(requestParameters),
          deliveryTypeService.getAllDeliveryTypesFromDb(requestParameters),
        ]).pipe(
          map(([allGroupTypes, allDeliveryTypes]) => ({
            options: options.body,
            kitchenTypes: kitchenTypes.body,
            siteLocations: options.body.data.filter((option: any) => option.optionKey === 'siteLocation'),
            groupTypes: allGroupTypes.body,
            sponsorTypes: [],
            cities: cities.body,
            regions: regions.body,
            organizationTypes: organizationTypes.body,
            educationLevels: educationLevels.body,
            operatingPeriods: operatingPeriods.body,
            operatingPolicies: operatingPolicies.body,
            deliveryTypes: allDeliveryTypes.body,
            centerTypes: [],
            areaTypes: areaTypes.body,
            programs: programs,
          }))
        );
      }
    )
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
  // Facilities service
  // Servicio para instalaciones
  //const facilityService = inject(FacilityService);
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

  // Obtener programas de la agencia desde localStorage (almacenados por app.resolver)
  const programsJson = localStorage.getItem('agencyPrograms');
  const programs = programsJson ? JSON.parse(programsJson) : [];

  // Determinar si la agencia tiene PDAM, PSAV o PACNA
  const isPDAM = programs.some((p: any) => p.id === PROGRAM_IDS.PDAM);
  const isPSAV = programs.some((p: any) => p.id === PROGRAM_IDS.PSAV);
  const isPACNA = programs.some((p: any) => p.id === PROGRAM_IDS.PACNA);

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
    // Types of sponsor
    // Tipos de auspiciador
    sponsorTypeService.getAllSponsorTypesFromDb(requestParameters),
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
    // Facilities service
    // Servicio para instalaciones
    // facilityService.getAllFacilitiesFromDb(requestParameters),
    // Operating policies service
    // Servicio para políticas de operación
    operatingPolicyService.getAllOperatingPoliciesFromDb(requestParameters),
    // Types of area
    // Tipos de área
    areaTypeService.getAllAreaTypesFromDb(requestParameters),
  ]).pipe(
    switchMap(
      ([
        site,
        options,
        kitchenTypes,
        sponsorTypes,
        cities,
        regions,
        organizationTypes,
        educationLevels,
        operatingPeriods,
        operatingPolicies,
        areaTypes,
      ]) => {
        // Si tiene PDAM, PSAV o PACNA, obtener los tipos de centro, entrega, auspiciador y grupo específicos
        if (isPDAM || isPSAV || isPACNA) {
          // Si tiene PDAM, usar el primer programa PDAM encontrado
          const pdamProgram = programs.find((p: any) => p.id === PROGRAM_IDS.PDAM);
          if (pdamProgram) {
            return forkJoin([
              centerTypeService.getCenterTypesByProgram({ programId: pdamProgram.id }),
              deliveryTypeService.getDeliveryTypesByProgram({ programId: pdamProgram.id }),
              sponsorTypeService.getSponsorTypesByProgram({ programId: pdamProgram.id }),
              groupTypeService.getGroupTypesByProgram({ programId: pdamProgram.id }),
              organizationTypeService.getOrganizationTypesByProgram({ programId: pdamProgram.id }),
            ]).pipe(
              map(([filteredCenterTypes, filteredDeliveryTypes, filteredSponsorTypes, filteredGroupTypes, filteredOrganizationTypes]) => ({
                site: site.body,
                options: options.body,
                kitchenTypes: kitchenTypes.body,
                siteLocations: options.body.data.filter((option: any) => option.optionKey === 'siteLocation'),
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
                programs: programs,
              }))
            );
          } else {
            // Si tiene PSAV, usar el primer programa PSAV encontrado
            const psavProgram = programs.find((p: any) => p.id === PROGRAM_IDS.PSAV);
            if (psavProgram) {
              return forkJoin([
                groupTypeService.getGroupTypesByProgram({ programId: psavProgram.id }),
                deliveryTypeService.getDeliveryTypesByProgram({ programId: psavProgram.id }),
                organizationTypeService.getOrganizationTypesByProgram({ programId: psavProgram.id }),
              ]).pipe(
                map(([filteredGroupTypes, filteredDeliveryTypes, filteredOrganizationTypes]) => ({
                  site: site.body,
                  options: options.body,
                  kitchenTypes: kitchenTypes.body,
                  siteLocations: options.body.data.filter((option: any) => option.optionKey === 'siteLocation'),
                  groupTypes: filteredGroupTypes.body,
                  sponsorTypes: [],
                  cities: cities.body,
                  regions: regions.body,
                  organizationTypes: filteredOrganizationTypes.body,
                  educationLevels: educationLevels.body,
                  operatingPeriods: operatingPeriods.body,
                  operatingPolicies: operatingPolicies.body,
                  deliveryTypes: filteredDeliveryTypes.body,
                  centerTypes: [],
                  areaTypes: areaTypes.body,
                  programs: programs,
                }))
              );
            } else {
              // Si tiene PACNA, usar el primer programa PACNA encontrado
              const pacnaProgram = programs.find((p: any) => p.id === PROGRAM_IDS.PACNA);
              if (pacnaProgram) {
                return forkJoin([
                  centerTypeService.getCenterTypesByProgram({ programId: pacnaProgram.id }),
                  deliveryTypeService.getDeliveryTypesByProgram({ programId: pacnaProgram.id }),
                  sponsorTypeService.getSponsorTypesByProgram({ programId: pacnaProgram.id }),
                  groupTypeService.getGroupTypesByProgram({ programId: pacnaProgram.id }),
                  organizationTypeService.getOrganizationTypesByProgram({ programId: pacnaProgram.id }),
                ]).pipe(
                  map(([filteredCenterTypes, filteredDeliveryTypes, filteredSponsorTypes, filteredGroupTypes, filteredOrganizationTypes]) => ({
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
                    programs: programs,
                  }))
                );
              }
            }
          }
        }

        // Si no tiene PDAM, PSAV ni PACNA, obtener todos los tipos sin filtrar
        return forkJoin([
          groupTypeService.getAllGroupTypesFromDb(requestParameters),
          deliveryTypeService.getAllDeliveryTypesFromDb(requestParameters),
        ]).pipe(
          map(([allGroupTypes, allDeliveryTypes]) => ({
            site: site.body,
            options: options.body,
            kitchenTypes: kitchenTypes.body,
            siteLocations: options.body.data.filter((option: any) => option.optionKey === 'siteLocation'),
            groupTypes: allGroupTypes.body,
            sponsorTypes: [],
            cities: cities.body,
            regions: regions.body,
            organizationTypes: organizationTypes.body,
            educationLevels: educationLevels.body,
            operatingPeriods: operatingPeriods.body,
            operatingPolicies: operatingPolicies.body,
            deliveryTypes: allDeliveryTypes.body,
            centerTypes: [],
            areaTypes: areaTypes.body,
            programs: programs,
          }))
        );
      }
    )
  );
};
