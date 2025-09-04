import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { forkJoin, map } from 'rxjs';
import { QueryParameters } from 'app/shared/models/QueryParameters';
import { StaffService } from 'app/shared/services/staff.service';
import { GeoService } from 'app/shared/services/geo.service';
import { OptionSelectionService } from 'app/shared/services/option-selection.service';
import { StaffTypeService } from 'app/shared/services/staff-type.service';
import { StaffClassificationService } from 'app/shared/services/staff-classification.service';
import { StaffRelationshipService } from 'app/shared/services/staff-relationship.service';

export const initialDataStaffBoardMembersListResolver: ResolveFn<any> = () => {
  const staffService = inject(StaffService);
  const requestParameters: QueryParameters = {
    take: 25,
    skip: 0,
  };

  return forkJoin([staffService.getAllStaffFromDb(requestParameters)]).pipe(
    map(([staff]) => ({
      staff: staff.body
    }))
  );
};

export const initialDataStaffEmployeesListResolver: ResolveFn<any> = () => {
  const staffService = inject(StaffService);
  const requestParameters: QueryParameters = {
    take: 25,
    skip: 0,
  };

  return forkJoin([staffService.getAllStaffFromDb(requestParameters)]).pipe(
    map(([staff]) => ({
      staff: staff.body
    }))
  );
};

export const initialDataStaffAddResolver: ResolveFn<any> = () => {
  const geoService = inject(GeoService);
  const optionSelectionService = inject(OptionSelectionService);
  const staffTypeService = inject(StaffTypeService);
  const staffClassificationService = inject(StaffClassificationService);

  return forkJoin([
    geoService.getCitiesFromDb({ take: 25, skip: 0, alls: true, isList: true }),
    geoService.getRegionsFromDb({ take: 25, skip: 0, alls: true, isList: true }),
    optionSelectionService.getOptionSelectionByOptionKey({
      optionKey: 'administrativePosition',
      names: 'Administrador,Director,Coordinador(a) del Programa',
    }),
    staffTypeService.getAllStaffTypesFromDb({ take: 25, skip: 0, alls: true, isList: true }),
    staffClassificationService.getAllStaffClassificationsFromDb({ take: 25, skip: 0, alls: true, isList: true }),
  ]).pipe(
    map(([cities, regions, options, staffTypes, staffClassifications]) => ({
      cities: cities.body,
      regions: regions.body,
      options: options.body,
      staffTypes: staffTypes.body,
      staffClassifications: staffClassifications.body
    }))
  );
};

export const initialDataStaffEditResolver: ResolveFn<any> = (route) => {
  const staffService = inject(StaffService);
  const geoService = inject(GeoService);
  const optionSelectionService = inject(OptionSelectionService);
  const staffTypeService = inject(StaffTypeService);
  const staffClassificationService = inject(StaffClassificationService);
  const staffRelationshipService = inject(StaffRelationshipService);

  const staffId = route.paramMap.get('id');

  return forkJoin([
    staffService.getStaffById({ staffId: Number(staffId) }),
    geoService.getCitiesFromDb({ take: 25, skip: 0, alls: true, isList: true }),
    geoService.getRegionsFromDb({ take: 25, skip: 0, alls: true, isList: true }),
    optionSelectionService.getOptionSelectionByOptionKey({
      optionKey: 'administrativePosition',
      names: 'Administrador,Director,Coordinador(a) del Programa',
    }),
    staffTypeService.getAllStaffTypesFromDb({ take: 25, skip: 0, alls: true, isList: true }),
    staffClassificationService.getAllStaffClassificationsFromDb({ take: 25, skip: 0, alls: true, isList: true }),
    staffRelationshipService.getRelationshipsByStaffId({ staffId: Number(staffId) }),
  ]).pipe(
    map(([staff, cities, regions, options, staffTypes, staffClassifications, relationships]) => ({
      staff: staff.body,
      cities: cities.body,
      regions: regions.body,
      options: options.body,
      staffTypes: staffTypes.body,
      staffClassifications: staffClassifications.body,
      relationships: relationships.body
    }))
  );
};
