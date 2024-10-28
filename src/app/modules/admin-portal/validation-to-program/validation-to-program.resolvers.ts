import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { QueryParameters } from 'app/shared/models/QueryParameters';
import { ProgramsService } from 'app/shared/services/program.service';
import { forkJoin, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ValidationToProgramResolver implements Resolve<any> {
  /**
   * Constructor
   */
  constructor(private _programsService: ProgramsService) {}

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Resolver
   *
   * @param route
   * @param state
   */
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    const requestParameters: QueryParameters = {
      take: 15,
      skip: 0,
      alls: true
    };

    return forkJoin([this._programsService.getPrograms()]);
  }
}


