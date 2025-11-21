import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { QueryParameters } from 'app/shared/models/QueryParameters';
import { StaffService } from 'app/shared/services/staff.service';
import { GeoService } from 'app/shared/services/geo.service';
import { OptionSelectionService } from 'app/shared/services/option-selection.service';
import { StaffTypeService } from 'app/shared/services/staff-type.service';
import { StaffClassificationService } from 'app/shared/services/staff-classification.service';
import { forkJoin, switchMap, of, map } from 'rxjs';
import { StaffRelationshipService } from 'app/shared/services/staff-relationship.service';
import { AuthService } from 'app/core/auth/auth.service';
import { SiteService } from 'app/shared/services/site.service';

// Resolver para la lista de staff
// Resolver for staff list
export const initialDataStaffBoardMembersListResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
  // Staff operations service
  // Servicio para operaciones de staff
  const staffService = inject(StaffService);
  const authService = inject(AuthService);

  const agencyId = authService.getAgencyId();

  const requestParameters: QueryParameters = {
    take: 25,
    skip: 0,
    alls: false,
    isList: false,
    staffTypeId: 2,
    agencyId: agencyId,
  };

  return forkJoin([staffService.getAllStaffFromDb(requestParameters)]).pipe(
    map(([staff]) => ({
      staff: staff.body,
    }))
  );
};

// Resolver para la lista de staff de empleados
export const initialDataStaffEmployeesListResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
  const staffService = inject(StaffService);
  const authService = inject(AuthService);

  const agencyId = authService.getAgencyId();

  const requestParameters: QueryParameters = {
    take: 25,
    skip: 0,
    alls: false,
    isList: false,
    staffTypeId: 1,
    agencyId: agencyId,
  };

  return forkJoin([staffService.getAllStaffFromDb(requestParameters)]).pipe(
    map(([staff]) => ({
      staff: staff.body,
    }))
  );
};

// Resolver para la creación de un staff
// Resolver for staff creation
export const initialDataStaffAddResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
  // Staff operations service
  // Servicio para operaciones de staff
  const staffService = inject(StaffService);
  // Geographic service
  // Servicio para operaciones geográficas
  const geoService = inject(GeoService);
  // Options selection service
  // Servicio para opciones de selección
  const optionSelectionService = inject(OptionSelectionService);
  // Staff type service
  // Servicio para tipos de staff
  const staffTypeService = inject(StaffTypeService);
  // Staff classification service
  // Servicio para clasificaciones de staff
  const staffClassificationService = inject(StaffClassificationService);
  // Site service
  // Servicio para operaciones de escuelas
  const siteService = inject(SiteService);
  // Auth service para obtener agency ID
  const authService = inject(AuthService);

  const requestParameters: QueryParameters = {
    take: 25,
    skip: 0,
    alls: true,
    isList: true,
  };

  const agencyId = authService.getAgencyId();

  // Obtener isDayCareHomeId desde localStorage (guardado al inicio del portal)
  const isDayCareHomeIdStr = localStorage.getItem('agencyIsDayCareHomeId');
  const isDayCareHomeId = isDayCareHomeIdStr ? parseInt(isDayCareHomeIdStr, 10) : null;

  // Request parameters for sites
  // Parámetros de la solicitud para sitios
  const sitesRequestParameters: QueryParameters = {
    take: 100,
    skip : 0,
    alls: false,
    agencyId: agencyId,
    isList: true, // Para lista de sitios
    isDayCareHomeId: isDayCareHomeId,
  };

  return forkJoin([
    // Geographic service
    // Servicio para operaciones geográficas
    geoService.getCitiesFromDb(requestParameters),
    // Regions service
    // Servicio para regiones
    geoService.getRegionsFromDb(requestParameters),
    // Staff positions service
    // Servicio para cargos de staff
    // options selection service
    // Servicio para opciones de selección
    optionSelectionService.getOptionSelectionByOptionKey({
      optionKey: 'administrativePosition,operationalPosition,boardMemberTitle,isActive',
      names: null,
    }),
    // Staff types service
    // Servicio para tipos de staff
    staffTypeService.getAllStaffTypesFromDb(requestParameters),
    // Staff classification service
    // Servicio para clasificaciones de staff
    staffClassificationService.getAllStaffClassificationsFromDb(requestParameters),
    // Sites service
    // Servicio para operaciones de escuelas
    siteService.getAllSitesFromDb(sitesRequestParameters),
  ]).pipe(
    map(([cities, regions, options, staffTypes, staffClassifications, sites]) => ({
      cities: cities.body,
      regions: regions.body,
      options: options.body,
      staffTypes: staffTypes.body,
      staffClassifications: staffClassifications.body,
      sites: sites.body,
    }))
  );
};

// Resolver para la edición de un staff
// Resolver for staff editing
export const initialDataStaffEditResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
  // Staff id
  // ID del staff
  const staffId = Number(route.paramMap.get('id'));

  // Staff operations service
  // Servicio para operaciones de staff
  const staffService = inject(StaffService);
  // Geographic service
  // Servicio para operaciones geográficas
  const geoService = inject(GeoService);
  // Options selection service
  // Servicio para opciones de selección
  const optionSelectionService = inject(OptionSelectionService);
  // Staff type service
  // Servicio para tipos de staff
  const staffTypeService = inject(StaffTypeService);
  // Staff classification service
  // Servicio para clasificaciones de staff
  const staffClassificationService = inject(StaffClassificationService);
  // Staff relationships service
  // Servicio para relaciones de staff
  const staffRelationshipService = inject(StaffRelationshipService);
  // Site service
  // Servicio para operaciones de escuelas
  const siteService = inject(SiteService);
  // Auth service para obtener agency ID
  const authService = inject(AuthService);

  const requestParametersId: QueryParameters = {
    id: staffId,
    isList: false,
    isActive: false,
  };

  const requestParameters: QueryParameters = {
    take: 25,
    skip: 0,
    alls: true,
    isList: true
  };

  const agencyId = authService.getAgencyId();

  // Obtener isDayCareHomeId desde localStorage (guardado al inicio del portal)
  const isDayCareHomeIdStr = localStorage.getItem('agencyIsDayCareHomeId');
  const isDayCareHomeId = isDayCareHomeIdStr ? parseInt(isDayCareHomeIdStr, 10) : null;

  // Request parameters for sites
  // Parámetros de la solicitud para sitios
  const sitesRequestParameters: QueryParameters = {
    take: 100,
    skip : 0,
    alls: false,
    agencyId: agencyId,
    isList: true, // Para lista de sitios
    isDayCareHomeId: isDayCareHomeId,
  };

  // Primero obtener los datos del staff para determinar si es empleado
  return staffService.getStaffById(requestParametersId).pipe(
    switchMap((staffData: any) => {
      // Determinar si es empleado basándose en el tipo de staff
      const isEmployee = staffData?.body?.staffTypeId === 1 ||
                        staffData?.body?.staffType?.name === 'Empleado' ||
                        staffData?.body?.staffType?.nameEn === 'Employee';

      // Si es empleado, no cargar las relaciones
      if (isEmployee) {
        return forkJoin([
          // Datos del staff específico
          of(staffData),
          // Geographic service
          geoService.getCitiesFromDb(requestParameters),
          // Regions service
          geoService.getRegionsFromDb(requestParameters),
          // Staff positions service
          optionSelectionService.getOptionSelectionByOptionKey({
            optionKey: 'administrativePosition,operationalPosition,boardMemberTitle,isActive',
            names: null,
          }),
          // Staff types service
          staffTypeService.getAllStaffTypesFromDb(requestParameters),
          // Staff classification service
          staffClassificationService.getAllStaffClassificationsFromDb(requestParameters),
          // Sites service
          // Servicio para operaciones de sitios
          siteService.getAllSitesFromDb(sitesRequestParameters),
          // NO cargar relaciones para empleados
          of(null),
        ]).pipe(
          map(([staff, cities, regions, options, staffTypes, staffClassifications, sites, relationships]) => ({
            staff: staff.body,
            cities: cities.body,
            regions: regions.body,
            options: options.body,
            staffTypes: staffTypes.body,
            staffClassifications: staffClassifications.body,
            sites: sites.body,
            relationships: relationships, // null para empleados
          }))
        );
      } else {
        // Si NO es empleado, cargar todo incluyendo relaciones
        return forkJoin([
          // Datos del staff específico
          of(staffData),
          // Geographic service
          geoService.getCitiesFromDb(requestParameters),
          // Regions service
          geoService.getRegionsFromDb(requestParameters),
          // Staff positions service
          optionSelectionService.getOptionSelectionByOptionKey({
            optionKey: 'administrativePosition,operationalPosition,boardMemberTitle,isActive',
            names: null,
          }),
          // Staff types service
          staffTypeService.getAllStaffTypesFromDb(requestParameters),
          // Staff classification service
          staffClassificationService.getAllStaffClassificationsFromDb(requestParameters),
          // Sites service
          // Servicio para operaciones de sitios
          siteService.getAllSitesFromDb(sitesRequestParameters),
          // Staff relationships service (solo para no empleados)
          staffRelationshipService.getRelationshipsByStaffId(requestParametersId),
        ]).pipe(
          map(([staff, cities, regions, options, staffTypes, staffClassifications, sites, relationships]) => ({
            staff: staff.body,
            cities: cities.body,
            regions: regions.body,
            options: options.body,
            staffTypes: staffTypes.body,
            staffClassifications: staffClassifications.body,
            sites: sites.body,
            relationships: relationships.body,
          }))
        );
      }
    })
  );
};
