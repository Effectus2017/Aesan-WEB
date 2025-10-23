import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';
import { QueryParameters } from 'app/shared/models/QueryParameters';
import { AgencyStatusService } from 'app/shared/services/agency-status.service';
import { AgencyService } from 'app/shared/services/agency.service';
import { GeoService } from 'app/shared/services/geo.service';
import { ProgramService } from 'app/shared/services/program.service';
import { UsersService } from 'app/shared/services/users.service';
import { OptionSelectionService } from 'app/shared/services/option-selection.service';
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
  private _usersService: UsersService = inject(UsersService);
  private _optionSelectionService: OptionSelectionService = inject(OptionSelectionService);

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
      this._usersService.getAllUsersFromDbWithSP({ take: 25, skip: 0, alls: false, isList: true, roles: ['Monitor'] }),
      this._optionSelectionService.getOptionSelectionByOptionKey({ optionKey: 'yesNo,exceptionStatus,taxExemptionType,typeOfEntity,typeOfApplicant,publicAllianceContract' }),
    ]).pipe(
      map(([agency, agencyStatuses, cities, regions, programs, users, allOptions]) => {
        // Filtrar las opciones por optionKey como en sign-up
        // Las opciones están en allOptions.body.data, no directamente en body
        const optionsData = allOptions.body.data || allOptions.body;
        const yesNoOptions = optionsData.filter((option: any) => option.optionKey === 'yesNo');
        const exceptionStatusOptions = optionsData.filter((option: any) => option.optionKey === 'exceptionStatus');
        const taxExemptionTypeOptions = optionsData.filter((option: any) => option.optionKey === 'taxExemptionType');
        const typeOfEntityOptions = optionsData.filter((option: any) => option.optionKey === 'typeOfEntity');
        const typeOfApplicantOptions = optionsData.filter((option: any) => option.optionKey === 'typeOfApplicant');
        const publicAllianceContractOptions = optionsData.filter((option: any) => option.optionKey === 'publicAllianceContract');

        return {
          agency: agency.body,
          agencyStatuses: agencyStatuses.body,
          cities: cities.body,
          regions: regions.body,
          programs: programs.body,
          users: users.body,
          yesNoOptions: yesNoOptions,
          exceptionStatusOptions: exceptionStatusOptions,
          taxExemptionTypeOptions: taxExemptionTypeOptions,
          typeOfEntityOptions: typeOfEntityOptions,
          typeOfApplicantOptions: typeOfApplicantOptions,
          publicAllianceContractOptions: publicAllianceContractOptions,
        };
      })
    );
  }
}
