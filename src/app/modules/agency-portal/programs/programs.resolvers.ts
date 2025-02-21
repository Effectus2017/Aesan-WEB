import { inject } from '@angular/core';
import { AuthService } from 'app/core/auth/auth.service';
import { QueryParameters } from 'app/shared/models/QueryParameters';
import { AgencyService } from 'app/shared/services/agency.service';
import { GeoService } from 'app/shared/services/geo.service';
import { ProgramService } from 'app/shared/services/program.service';
import { UserService } from 'app/shared/services/user.service';
import { forkJoin } from 'rxjs';

export const initialAgencyProgramRequestsResolver = () => {
  return forkJoin();
};
