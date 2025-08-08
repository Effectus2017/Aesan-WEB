import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { QueryParameters } from 'app/shared/models/QueryParameters';
import { SchoolService } from 'app/shared/services/school.service';
import { GeoService } from 'app/shared/services/geo.service';
import { OrganizationTypeService } from 'app/shared/services/organization-type.service';
import { EducationLevelService } from 'app/shared/services/education-level.service';
import { OperatingPeriodService } from 'app/shared/services/operating-period.service';
import { OperatingPolicyService } from 'app/shared/services/operating-policy.service';
import { forkJoin } from 'rxjs';
import { OptionSelectionService } from 'app/shared/services/option-selection.service';
import { KitchenTypeService } from 'app/shared/services/kitchen-type.service';
import { GroupTypeService } from 'app/shared/services/group-type.service';
import { SponsorTypeService } from 'app/shared/services/sponsor-type.service';
import { DeliveryTypeService } from 'app/shared/services/delivery-type.service';
import { CenterTypeService } from 'app/shared/services/center-type.service';
import { AreaTypeService } from 'app/shared/services/area-type.service';
import { AuthService } from 'app/core/auth/auth.service';

// Resolver para la lista de escuelas
export const initialDataSchoolsListResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
  const schoolService = inject(SchoolService);
  const authService = inject(AuthService);
  const agencyId = authService.getAgencyId();

  const requestParameters: QueryParameters = {
    take: 25,
    skip: 0,
    alls: false,
    isList: false,
    agencyId: agencyId,
  };

  return forkJoin([schoolService.getAllSchoolsFromDb(requestParameters)]);
};

// Resolver para la creación de una escuela
export const initialDataSchoolsAddResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
  // School operations service
  // Servicio para operaciones de escuelas
  const schoolService = inject(SchoolService);
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

  // Request parameters
  // Parámetros de la solicitud
  const requestParameters: QueryParameters = {
    take: 25,
    skip: 0,
    alls: true,
    isList: true,
  };

  return forkJoin([
    // Verificar si existe una escuela principal
    // Servicio para verificar si existe una escuela principal
    schoolService.hasMainSchool(),
    // Selection options service
    // Servicio para opciones de selección
    optionSelectionService.getOptionSelectionByOptionKey({
      optionKey: 'yesNo,typeOfResidential,typeOfApplicant,isActive,community,walkers,services,distributionType,siteType,experience',
    }),
    // Types of kitchen
    // Tipos de cocina
    kitchenTypeService.getAllKitchenTypesFromDb(requestParameters),
    // Types of group
    // Tipos de grupo
    groupTypeService.getAllGroupTypesFromDb(requestParameters),
    // Types of sponsor
    // Tipos de auspiciador
    sponsorTypeService.getAllSponsorTypesFromDb(requestParameters),
    // School service
    // Servicio para operaciones de escuelas
    schoolService.getAllSchoolsFromDb(requestParameters),
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
    // Types of delivery
    // Tipos de entrega
    deliveryTypeService.getAllDeliveryTypesFromDb(requestParameters),
    // Types of center
    // Tipos de centro
    centerTypeService.getAllCenterTypesFromDb(requestParameters),
    // Types of area
    // Tipos de área
    areaTypeService.getAllAreaTypesFromDb(requestParameters),
  ]);
};

// Resolver para la edición de una escuela
export const initialDataSchoolsEditResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
  const id = Number(route.paramMap.get('id'));

  // School operations service
  // Servicio para operaciones de escuelas
  const schoolService = inject(SchoolService);
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
    schoolService.getSchoolById({ id: id }),
    // Obtenemos todas las escuelas para el select de la escuela principal
    schoolService.getAllSchoolsFromDb(requestParameters),
    // Selection options service
    // Servicio para opciones de selección
    optionSelectionService.getOptionSelectionByOptionKey({
      optionKey: 'yesNo,typeOfResidential,typeOfApplicant,isActive,community,walkers,services,distributionType,siteType,experience',
    }),
    // Types of kitchen
    // Tipos de cocina
    kitchenTypeService.getAllKitchenTypesFromDb(requestParameters),
    // Types of group
    // Tipos de grupo
    groupTypeService.getAllGroupTypesFromDb(requestParameters),
    // Types of sponsor
    // Tipos de auspiciador
    sponsorTypeService.getAllSponsorTypesFromDb(requestParameters),
    // School service
    // Servicio para operaciones de escuelas
    schoolService.getAllSchoolsFromDb(requestParameters),
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
    // Types of delivery
    // Tipos de entrega
    deliveryTypeService.getAllDeliveryTypesFromDb(requestParameters),
    // Types of center
    // Tipos de centro
    centerTypeService.getAllCenterTypesFromDb(requestParameters),
    // Types of area
    // Tipos de área
    areaTypeService.getAllAreaTypesFromDb(requestParameters),
  ]);
};
