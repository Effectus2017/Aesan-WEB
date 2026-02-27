import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { forkJoin, map } from 'rxjs';
import { QueryParameters } from 'app/shared/models/QueryParameters';
import { AgencyService } from 'app/shared/services/agency.service';
import { GeoService } from 'app/shared/services/geo.service';
import { ProgramService } from 'app/shared/services/program.service';
import { AgencyStatusService } from 'app/shared/services/agency-status.service';
import { UsersService } from 'app/shared/services/users.service';
import { OptionSelectionService } from 'app/shared/services/option-selection.service';

/**
 * Resolver para obtener los datos iniciales de la lista de programas de validación
 */
export const initialDataValidationToProgramListResolver: ResolveFn<any> = () => {

  const agencyService = inject(AgencyService);
  const geoService = inject(GeoService);
  const programService = inject(ProgramService);

  const requestParameters: QueryParameters = {
    take: 25,
    skip: 0,
    alls: true,
    isPropietary: false,
  };

  return forkJoin([
    agencyService.getAllAgenciesFromDb(requestParameters),
    geoService.getCitiesFromDb(requestParameters),
    programService.getAllProgramsFromDb(requestParameters)
  ]).pipe(
    map(([agencies, cities, programs]) => ({
      agencies: agencies.body,
      cities: cities.body,
      programs: programs.body
    }))
  );
};

/**
 * Resolver para obtener los datos iniciales de la edición de un programa de validación
 */
export const initialDataValidationToProgramEditResolver: ResolveFn<any> = (route) => {
  const agencyService = inject(AgencyService);
  const agencyStatusService = inject(AgencyStatusService);
  const geoService = inject(GeoService);
  const programService = inject(ProgramService);
  const usersService = inject(UsersService);
  const optionSelectionService = inject(OptionSelectionService);

  const agencyId = route.paramMap.get('id');

  return forkJoin([
    agencyService.getAgencyById({ agencyId: Number(agencyId) }),
    agencyStatusService.getAllAgencyStatusFromDb({ take: 25, skip: 0, alls: true, isList: true }),
    geoService.getCitiesFromDb({ take: 25, skip: 0, alls: true, isList: true }),
    geoService.getRegionsFromDb({ take: 25, skip: 0, alls: true, isList: true }),
    programService.getAllProgramsFromDb({ take: 25, skip: 0, alls: true, isList: true }),
    usersService.getAllUsersFromDbWithSP({ take: 25, skip: 0, alls: false, isList: true, excludeAdministrators: true }),
    optionSelectionService.getOptionSelectionByOptionKey({
      optionKey: 'administrativePosition',
      names: 'Administrador,Director,Coordinador(a) del Programa',
      isList: true,
    })
  ]).pipe(
    map(([agency, agencyStatuses, cities, regions, programs, users, options]) => ({
      agency: agency.body,
      agencyStatuses: agencyStatuses.body,
      cities: cities.body,
      regions: regions.body,
      programs: programs.body,
      users: users.body,
      options: options.body
    }))
  );
};
