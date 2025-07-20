import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { QueryParameters } from 'app/shared/models/QueryParameters';
import { EmployeeService } from 'app/shared/services/employee.service';
import { forkJoin } from 'rxjs';

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
    isList: false,
  };

  return forkJoin([employeeService.getAllEmployeesFromDb(requestParameters)]);
};

// Resolver para la creación de un empleado
// Resolver for employee creation
export const initialDataEmployeesAddResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
  // Employee operations service
  // Servicio para operaciones de empleados
  const employeeService = inject(EmployeeService);

  const requestParameters: QueryParameters = {
    take: 25,
    skip: 0,
    alls: true,
    isList: true,
  };

  return forkJoin([
    // Verificar si existe un empleado principal
    // Check if main employee exists
    employeeService.hasMainEmployee(),
    // Lista de empleados para dropdowns
    // Employees list for dropdowns
    employeeService.getAllEmployeesFromDb(requestParameters),
  ]);
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
    isList: true,
  };

  return forkJoin([
    // Datos del empleado específico
    // Specific employee data
    employeeService.getEmployeeById({ id: id }),
    // Lista completa para dropdowns
    // Complete list for dropdowns
    employeeService.getAllEmployeesFromDb(requestParameters),
  ]);
};
