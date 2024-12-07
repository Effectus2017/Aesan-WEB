import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { QueryParameters } from 'app/shared/models/QueryParameters';
import { AgencyService } from 'app/shared/services/agency.service';
import { GeoService } from 'app/shared/services/geo.service';
import { UserService } from 'app/shared/services/user.service';
import { forkJoin, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ValidationToProgramListResolver implements Resolve<any> {
  private _agencyService: AgencyService = inject(AgencyService);
  private _geoService: GeoService = inject(GeoService);
  private _userService: UserService = inject(UserService);

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    const requestParameters: QueryParameters = {
      take: 15,
      skip: 0,
      alls: true,
    };

    return forkJoin([
      this._agencyService.getAllAgenciesFromDb(requestParameters),
      this._geoService.getCitiesFromDb(requestParameters),
      this._userService.getAllProgramsFromDb(requestParameters),
    ]);
  }
}

@Injectable({
  providedIn: 'root',
})
export class ValidationToProgramEditResolver implements Resolve<any> {
  private _agencyService: AgencyService = inject(AgencyService);
  private _geoService: GeoService = inject(GeoService);
  private _userService: UserService = inject(UserService);
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    const id = route.params['id'];
    const requestParameters: QueryParameters = {
      agencyId: Number(id),
    };
    return forkJoin([
      this._agencyService.getAgencyById(requestParameters),
      this._agencyService.getAllAgenciesFromDb({ take: 25, skip: 0, alls: true }),
      this._agencyService.getAllAgencyStatusFromDb({ take: 25, skip: 0, alls: true }),
      this._geoService.getCitiesFromDb({ take: 25, skip: 0, alls: true }),
      this._geoService.getRegionsFromDb({ take: 25, skip: 0, alls: true }),
      this._userService.getAllProgramsFromDb({ take: 25, skip: 0, alls: true }),
    ]);
  }
}
