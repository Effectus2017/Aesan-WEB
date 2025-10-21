import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';
import { QueryParameters } from 'app/shared/models/QueryParameters';
import { AgencyStatusService } from 'app/shared/services/agency-status.service';
import { AgencyService } from 'app/shared/services/agency.service';
import { GeoService } from 'app/shared/services/geo.service';
import { ProgramService } from 'app/shared/services/program.service';
import { forkJoin, Observable, map } from 'rxjs';

export const initialAesanSponsorEvaluationResolver = () => {
  const _agencyService: AgencyService = inject(AgencyService);
  const _geoService: GeoService = inject(GeoService);
  const _authService: AuthService = inject(AuthService);
  const _programService: ProgramService = inject(ProgramService);
  const userId = _authService.getUserId();

  const requestParameters: QueryParameters = {
    take: 25,
    skip: 0,
    name: null,
    regionId: null,
    cityId: null,
    programId: null,
    statusId: null,
    isPropietary: null,
    userId: userId,
    alls: false,
  };

  return forkJoin([
    //_programService.getAllProgramInscriptions(requestParameters),
    _agencyService.getAllAgenciesFromDb(requestParameters),
  ]).pipe(
    map(([agencies]) => ({
      agencies: agencies.body,
    }))
  );
};

@Injectable({
  providedIn: 'root',
})
export class editAesanSponsorEvaluationResolver implements Resolve<any> {
  private _agencyService: AgencyService = inject(AgencyService);
  private _agencyStatusService: AgencyStatusService = inject(AgencyStatusService);
  private _geoService: GeoService = inject(GeoService);
  private _authService: AuthService = inject(AuthService);
  private _programService: ProgramService = inject(ProgramService);

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    const id = route.paramMap.get('id');

    const userId = this._authService.getUserId();

    const requestParameters: QueryParameters = {
      agencyId: Number(id),
      userId: userId,
    };
    return forkJoin([
      this._agencyService.getAgencyByIdAndUserId(requestParameters),
      this._agencyStatusService.getAllAgencyStatusFromDb({ take: 25, skip: 0, alls: true, isList: true }),
      this._geoService.getCitiesFromDb({ take: 25, skip: 0, alls: true, isList: true }),
      this._geoService.getRegionsFromDb({ take: 25, skip: 0, alls: true, isList: true }),
      this._programService.getAllProgramsFromDb({ take: 25, skip: 0, names: 'PDAM,PSAV,PACNA', alls: false, isList: true }),
    ]).pipe(
      map(([agency, agencyStatuses, cities, regions, programs]) => ({
        agency: agency.body,
        agencyStatuses: agencyStatuses.body,
        cities: cities.body,
        regions: regions.body,
        programs: programs.body,
      }))
    );
  }
}
