import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';
import { QueryParameters } from 'app/shared/models/QueryParameters';
import { AgencyService } from 'app/shared/services/agency.service';
import { GeoService } from 'app/shared/services/geo.service';
import { OptionSelectionService } from 'app/shared/services/option-selection.service';
import { ProgramService } from 'app/shared/services/program.service';
import { UserService } from 'app/shared/services/user.service';
import { forkJoin, map } from 'rxjs';

export const initialSignUpResolver: ResolveFn<any> = () => {
  const agencyService: AgencyService = inject(AgencyService);
  const geoService: GeoService = inject(GeoService);
  const userService: UserService = inject(UserService);
  const authService: AuthService = inject(AuthService);
  const programService: ProgramService = inject(ProgramService);
  const optionSelectionService: OptionSelectionService = inject(OptionSelectionService);
  const userId = authService.getUserId();

  return forkJoin([
    geoService.getCitiesFromDb({
      alls: true,
      isList: true,
    }),
    programService.getAllProgramsFromDb({
      alls: false,
      names: 'PDAM,PSAV,PACNA',
    }),
    optionSelectionService.getOptionSelectionByOptionKey({
      optionKey: 'yesNo,exceptionStatus,taxExemptionType,typeOfEntity,typeOfApplicant,publicAllianceContract,isDayCareHome,headStartProgram',
    }),
    optionSelectionService.getOptionSelectionByOptionKey({
      optionKey: 'administrativePosition',
      names: 'Administrador,Director,Coordinador(a) del Programa',
    }),
  ]).pipe(
    map(([cities, programs, options1, options2]) => ({
      cities: cities.body,
      programs: programs.body,
      options1: options1.body,
      options2: options2.body,
    }))
  );
};
