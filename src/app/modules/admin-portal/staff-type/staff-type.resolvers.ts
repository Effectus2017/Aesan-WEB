import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { QueryParameters } from 'app/shared/models/QueryParameters';
import { StaffTypeService } from 'app/shared/services/staff-type.service';
import { forkJoin, map } from 'rxjs';

// Resolver para la lista de tipos de staff
// Resolver for staff types list
export const initialDataStaffTypeListResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
  const staffTypeService = inject(StaffTypeService);

  const requestParameters: QueryParameters = {
    take: 25,
    skip: 0,
    alls: true,
  };

  return forkJoin([staffTypeService.getAllStaffTypesFromDb(requestParameters)]).pipe(
    map(([staffTypes]) => ({
      staffTypes: staffTypes.body,
    }))
  );
};

// Resolver para la creación de un tipo de staff
// Resolver for staff type creation
export const initialDataStaffTypeAddResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
  return null;
};

// Resolver para la edición de un tipo de staff
// Resolver for staff type editing
export const initialDataStaffTypeEditResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
  const staffTypeService = inject(StaffTypeService);
  const requestParameters: QueryParameters = {
    id: Number(route.paramMap.get('id')),
  };
  return staffTypeService.getStaffTypeById(requestParameters).pipe(
    map((staffType) => ({
      staffType: staffType.body,
    }))
  );
};
