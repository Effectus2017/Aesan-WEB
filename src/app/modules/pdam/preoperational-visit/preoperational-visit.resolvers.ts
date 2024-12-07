import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';
import { QueryParameters } from 'app/shared/models/QueryParameters';
import { AgencyService } from 'app/shared/services/agency.service';
import { GeoService } from 'app/shared/services/geo.service';
import { UserService } from 'app/shared/services/user.service';
import { resolve } from 'cypress/types/bluebird';
import { forkJoin, Observable } from 'rxjs';

export const initialMonitorPreoperationalVisitResolver = () => {
  const _agencyService: AgencyService = inject(AgencyService);
  const _geoService: GeoService = inject(GeoService);
  const _userService: UserService = inject(UserService);
  const _authService: AuthService = inject(AuthService);

  const userId = _authService.getUserId();

  const requestParameters: QueryParameters = {
    take: 25,
    skip: 0,
    userId: userId,
  };

  return forkJoin([
    _agencyService.getAllAgenciesFromDb(requestParameters),
    _geoService.getCitiesFromDb(requestParameters),
    _userService.getAllProgramsFromDb(requestParameters),
  ]);
};

@Injectable({
  providedIn: 'root',
})
export class editMonitorPreoperationalVisitResolver implements Resolve<any> {
  private _agencyService: AgencyService = inject(AgencyService);
  private _geoService: GeoService = inject(GeoService);
  private _userService: UserService = inject(UserService);
  private _authService: AuthService = inject(AuthService);

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    const id = route.paramMap.get('id');

    const userId = this._authService.getUserId();

    const requestParameters: QueryParameters = {
      agencyId: Number(id),
      userId: userId,
    };
    return forkJoin([
      this._agencyService.getAgencyByIdAndUserId(requestParameters),
      this._agencyService.getAllAgenciesFromDb({ take: 25, skip: 0, agencyId: Number(id), userId: 'abcdef12-3456-7890-abcd-ef1234567890' }),
      this._agencyService.getAllAgencyStatusFromDb({ take: 25, skip: 0, alls: true }),
      this._geoService.getCitiesFromDb({ take: 25, skip: 0, alls: true }),
      this._geoService.getRegionsFromDb({ take: 25, skip: 0, alls: true }),
      this._userService.getAllProgramsFromDb({ take: 25, skip: 0, alls: true }),
    ]);
  }
}
