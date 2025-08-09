import { inject } from '@angular/core';
import { AuthService } from 'app/core/auth/auth.service';
import { QueryParameters } from 'app/shared/models/QueryParameters';
import { AgencyService } from 'app/shared/services/agency.service';
import { GeoService } from 'app/shared/services/geo.service';
import { ProgramService } from 'app/shared/services/program.service';
import { UserService } from 'app/shared/services/user.service';
import { forkJoin } from 'rxjs';

export const initialAgencyProgramRequestsResolver = () => {
  const _agencyService: AgencyService = inject(AgencyService);
  const _geoService: GeoService = inject(GeoService);
  const _userService: UserService = inject(UserService);
  const _authService: AuthService = inject(AuthService);
  const _programService: ProgramService = inject(ProgramService);
  const userId = _authService.getUserId();
  const agencyId = _authService.getAgencyId();

  const requestParameters: QueryParameters = {
    take: 25,
    skip: 0,
    agencyId: agencyId,
    alls: true,
  };

  return forkJoin([
    _programService.getAllProgramInscriptions(requestParameters)
  ]);
};
