import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { GeoService } from 'app/shared/services/geo.service';
import { OptionSelectionService } from 'app/shared/services/option-selection.service';
import { ProgramService } from 'app/shared/services/program.service';
import { forkJoin, map } from 'rxjs';

export const initialSignUpResolver: ResolveFn<any> = () => {
  const geoService: GeoService = inject(GeoService);
  const programService: ProgramService = inject(ProgramService);
  const optionSelectionService: OptionSelectionService = inject(OptionSelectionService);

  return forkJoin([
    geoService.getCitiesFromDb({
      alls: true,
      isList: true,
    }),
    programService.getAllProgramsFromDb({
      alls: false,
      names: 'PDAM,PSAV,PACNA',
      isList: true,
    }),
    optionSelectionService.getOptionSelectionByOptionKey({
      optionKey: 'yesNo,exceptionStatus,taxExemptionType,typeOfEntity,typeOfApplicant,publicAllianceContract,isDayCareHome,headStartProgram,boardExecutiveAuthority',
      isList: true,
    }),
    optionSelectionService.getOptionSelectionByOptionKey({
      optionKey: 'administrativePosition',
      names: 'Administrador,Director,Coordinador(a) del Programa',
      isList: true,
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
