import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { QueryParameters } from 'app/shared/models/QueryParameters';
import { StaffService } from 'app/shared/services/staff.service';
import { GeoService } from 'app/shared/services/geo.service';
import { OptionSelectionService } from 'app/shared/services/option-selection.service';
import { StaffTypeService } from 'app/shared/services/staff-type.service';

import { forkJoin } from 'rxjs';

// Resolver para la lista de staff
// Resolver for staff list
export const initialDataStaffListResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
  // Staff operations service
  // Servicio para operaciones de staff
  const staffService = inject(StaffService);

  const requestParameters: QueryParameters = {
    take: 25,
    skip: 0,
    alls: false,
    isList: false,
  };

  return forkJoin([staffService.getAllStaffFromDb(requestParameters)]);
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

  const requestParameters: QueryParameters = {
    take: 25,
    skip: 0,
    alls: true,
    isList: true,
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
      optionKey: 'staffPosition,isActive',
      names: null,
    }),
    // Staff types service
    // Servicio para tipos de staff
    staffTypeService.getAllStaffTypesFromDb(requestParameters),
  ]);
};

// Resolver para la edición de un staff
// Resolver for staff editing
export const initialDataStaffEditResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
  const id = Number(route.paramMap.get('id'));

  // Staff operations service
  // Servicio para operaciones de staff
  const staffService = inject(StaffService);

  const requestParameters: QueryParameters = {
    take: 25,
    skip: 0,
    alls: true,
    isList: true,
  };

  return forkJoin([
    // Datos del staff específico
    // Specific staff data
    staffService.getStaffById({ id: id }),
    // Lista completa para dropdowns
    // Complete list for dropdowns
    staffService.getAllStaffFromDb(requestParameters),
  ]);
};
