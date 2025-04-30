import { inject } from '@angular/core';
import { forkJoin } from 'rxjs';
import { AgencyService } from 'app/shared/services/agency.service';
import { AuthService } from 'app/core/auth/auth.service';
import { QueryParameters } from 'app/shared/models/QueryParameters';

export const initialPDAMAgencyFormsRequestsResolver = () => {
  const _agencyService = inject(AgencyService);
  const _authService = inject(AuthService);
  const agencyId = _authService.getAgencyId();

  const requestParameters: QueryParameters = {
    agencyId: agencyId,
  };

  return forkJoin([_agencyService.getAgencyById(requestParameters)]);
};
