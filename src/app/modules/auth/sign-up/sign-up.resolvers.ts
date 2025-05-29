import { inject } from '@angular/core';
import { AuthService } from 'app/core/auth/auth.service';
import { QueryParameters } from 'app/shared/models/QueryParameters';
import { AgencyService } from 'app/shared/services/agency.service';
import { GeoService } from 'app/shared/services/geo.service';
import { OptionSelectionService } from 'app/shared/services/option-selection.service';
import { ProgramService } from 'app/shared/services/program.service';
import { UserService } from 'app/shared/services/user.service';
import { forkJoin } from 'rxjs';

export const initialSignUpResolver = () => {
  const _agencyService: AgencyService = inject(AgencyService);
  const _geoService: GeoService = inject(GeoService);
  const _userService: UserService = inject(UserService);
  const _authService: AuthService = inject(AuthService);
  const _programService: ProgramService = inject(ProgramService);
  const _optionSelectionService: OptionSelectionService = inject(OptionSelectionService);
  const userId = _authService.getUserId();


  return forkJoin([
    _geoService.getCitiesFromDb({
      alls: true,
    }),
    _programService.getAllProgramsFromDb({
        alls: false,
        names: 'PDAM,PSAV,PACNA',
      }),
      _optionSelectionService.getOptionSelectionByOptionKey({
        optionKey: 'yesNo,exceptionStatus,taxExemptionType,typeOfEntity,typeOfApplicant,publicAllianceContract'
      })
  ]);
};
