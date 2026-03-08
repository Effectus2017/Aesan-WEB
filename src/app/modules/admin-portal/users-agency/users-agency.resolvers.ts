import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { forkJoin, map } from 'rxjs';
import { QueryParameters } from 'app/shared/models/common/QueryParameters';
import { UsersService } from 'app/shared/services/users.service';
import { AgencyService } from 'app/shared/services/agency.service';
import { ProgramService } from 'app/shared/services/program.service';
import { GeoService } from 'app/shared/services/geo.service';

/**
 * Resolver para el listado de usuarios de agencias (auspiciadores). Filtra por isPropietary: false.
 */
export const usersAgencyListResolver: ResolveFn<unknown> = () => {
  const usersService = inject(UsersService);
  const requestParameters: QueryParameters = {
    take: 25,
    skip: 0,
    isPropietary: false,
  };
  return usersService.getAllUsersFromDbWithSP(requestParameters).pipe(
    map((response) => ({ users: response?.body ?? { data: [], count: 0 } }))
  );
};

/**
 * Resolver para agregar usuario de auspiciador: agencias, roles, programas, ciudades y regiones.
 */
export const usersAgencyAddResolver: ResolveFn<unknown> = () => {
  const agencyService = inject(AgencyService);
  const usersService = inject(UsersService);
  const programService = inject(ProgramService);
  const geoService = inject(GeoService);

  return forkJoin([
    agencyService.getAllAgenciesFromDb({ alls: true, isList: true, isPropietary: false }),
    usersService.getAllRolesFromDb({ aesanOnly: true }),
    programService.getAllProgramsFromDb({ alls: true, isList: true }),
    geoService.getCitiesFromDb({ take: 25, skip: 0, alls: true, isList: true }),
    geoService.getRegionsFromDb({ take: 25, skip: 0, alls: true, isList: true }),
  ]).pipe(
    map(([agencies, roles, programs, cities, regions]) => ({
      agencies: { data: Array.isArray(agencies) ? agencies : (agencies as { data: unknown[] })?.data ?? [] },
      roles: roles.body,
      programs: { data: programs.body },
      cities: cities?.body ?? [],
      regions: regions?.body ?? [],
    }))
  );
};
