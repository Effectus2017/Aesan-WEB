import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { forkJoin, map, of, switchMap } from 'rxjs';
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
    alls: false,
    excludeRelated: false,
    staffTypeId: 2,
    agencyId: null,
    isList: false,
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
    alls: false,
    excludeRelated: false,
    staffTypeId: 1,
    agencyId: null,
    isList: false,
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
      optionKey: 'administrativePosition,tenureDurationUnit,yesNo,salaryOrigin',
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

// export const initialDataStaffEditResolver: ResolveFn<any> = (route) => {
//   const staffService = inject(StaffService);
//   const geoService = inject(GeoService);
//   const optionSelectionService = inject(OptionSelectionService);
//   const staffTypeService = inject(StaffTypeService);
//   const staffClassificationService = inject(StaffClassificationService);
//   const staffRelationshipService = inject(StaffRelationshipService);

//   const staffId = route.paramMap.get('id');

//   return forkJoin([
//     staffService.getStaffById({ staffId: Number(staffId), isList: false, isActive: false }),
//     geoService.getCitiesFromDb({ take: 25, skip: 0, alls: true, isList: true }),
//     geoService.getRegionsFromDb({ take: 25, skip: 0, alls: true, isList: true }),
//     optionSelectionService.getOptionSelectionByOptionKey({
//       optionKey: 'administrativePosition',
//       names: 'Administrador,Director,Coordinador(a) del Programa',
//     }),
//     staffTypeService.getAllStaffTypesFromDb({ take: 25, skip: 0, alls: true, isList: true }),
//     staffClassificationService.getAllStaffClassificationsFromDb({ take: 25, skip: 0, alls: true, isList: true }),
//     staffRelationshipService.getRelationshipsByStaffId({ staffId: Number(staffId) }),
//   ]).pipe(
//     map(([staff, cities, regions, options, staffTypes, staffClassifications, relationships]) => ({
//       staff: staff.body,
//       cities: cities.body,
//       regions: regions.body,
//       options: options.body,
//       staffTypes: staffTypes.body,
//       staffClassifications: staffClassifications.body,
//       relationships: relationships.body
//     }))
//   );
// };


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
              optionKey: 'administrativePosition,operationalPosition,boardMemberTitle,isActive,tenureDurationUnit,yesNo,salaryOrigin',
              names: null,
            }),
            // Staff types service
            staffTypeService.getAllStaffTypesFromDb(requestParameters),
            // Staff classification service
            staffClassificationService.getAllStaffClassificationsFromDb(requestParameters),
            // NO cargar relaciones para empleados
            of(null),
          ]).pipe(
            map(([staff, cities, regions, options, staffTypes, staffClassifications, relationships]) => ({
              staff: staff.body,
              cities: cities.body,
              regions: regions.body,
              options: options.body,
              staffTypes: staffTypes.body,
              staffClassifications: staffClassifications.body,
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
              optionKey: 'administrativePosition,operationalPosition,boardMemberTitle,isActive,tenureDurationUnit,yesNo,salaryOrigin',
              names: null,
            }),
            // Staff types service
            staffTypeService.getAllStaffTypesFromDb(requestParameters),
            // Staff classification service
            staffClassificationService.getAllStaffClassificationsFromDb(requestParameters),
            // Staff relationships service (solo para no empleados)
            staffRelationshipService.getRelationshipsByStaffId(requestParametersId),
          ]).pipe(
            map(([staff, cities, regions, options, staffTypes, staffClassifications, relationships]) => ({
              staff: staff.body,
              cities: cities.body,
              regions: regions.body,
              options: options.body,
              staffTypes: staffTypes.body,
              staffClassifications: staffClassifications.body,
              relationships: relationships.body,
            }))
          );
        }
      })
    );
  };
