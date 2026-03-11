import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { QueryParameters } from 'app/shared/models/common/QueryParameters';
import { EmployeeService } from 'app/shared/services/employee.service';
import { GeoService } from 'app/shared/services/geo.service';
import { OptionSelectionService } from 'app/shared/services/option-selection.service';

import { forkJoin, map } from 'rxjs';

// Resolver para la lista de empleados
// Resolver for employees list
export const initialDataEmployeesListResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
  // Employee operations service
  // Servicio para operaciones de empleados
  const employeeService = inject(EmployeeService);

  const requestParameters: QueryParameters = {
    take: 25,
    skip: 0,
    alls: false,
    forDropdown: false,
  };

  return forkJoin([employeeService.getAllEmployeesFromDb(requestParameters)]).pipe(
    map(([employees]) => ({
      employees: employees.body,
    }))
  );
};

// Resolver para la creación de un empleado
// Resolver for employee creation
export const initialDataEmployeesAddResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
  // Employee operations service
  // Servicio para operaciones de empleados
  const employeeService = inject(EmployeeService);
  // Geographic service
  // Servicio para operaciones geográficas
  const geoService = inject(GeoService);
  // Options selection service
  // Servicio para opciones de selección
  const optionSelectionService = inject(OptionSelectionService);

  const requestParameters: QueryParameters = {
    take: 25,
    skip: 0,
    alls: true,
    forDropdown: true,
  };

  return forkJoin([
    // Geographic service
    // Servicio para operaciones geográficas
    geoService.getCitiesFromDb(requestParameters),
    // Regions service
    // Servicio para regiones
    geoService.getRegionsFromDb(requestParameters),
    // Employee titles service
    // Servicio para cargos de empleados
    // options selection service
    // Servicio para opciones de selección
    optionSelectionService.getOptionSelectionByOptionKey({
      optionKey: 'employeePosition,isActive',
      names: null,
    }),
  ]).pipe(
    map(([cities, regions, options]) => ({
      cities: cities.body,
      regions: regions.body,
      options: options.body,
    }))
  );
};

// Resolver para la edición de un empleado
// Resolver for employee editing
export const initialDataEmployeesEditResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
  const id = Number(route.paramMap.get('id'));

  // Employee operations service
  // Servicio para operaciones de empleados
  const employeeService = inject(EmployeeService);

  const requestParameters: QueryParameters = {
    take: 25,
    skip: 0,
    alls: true,
    forDropdown: true,
  };

  return forkJoin([
    // Datos del empleado específico
    // Specific employee data
    employeeService.getEmployeeById({ id: id }),
    // Lista completa para dropdowns
    // Complete list for dropdowns
    employeeService.getAllEmployeesFromDb(requestParameters),
  ]).pipe(
    map(([employee, employees]) => ({
      employee: employee.body,
      employees: employees.body,
    }))
  );
};
