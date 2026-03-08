import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { map } from 'rxjs';
import { AgencyStatusHistoryService } from 'app/shared/services/agency-status-history.service';
import { QueryParameters } from 'app/shared/models/common/QueryParameters';

/**
 * Resolver para obtener los datos iniciales del listado de historial de estados.
 */
export const initialDataAgencyStatusHistoryListResolver: ResolveFn<any> = () => {
  const agencyStatusHistoryService = inject(AgencyStatusHistoryService);

  const requestParameters: QueryParameters = {
    take: 25,
    skip: 0,
  };

  return agencyStatusHistoryService.getAgencyStatusHistory(requestParameters).pipe(
    map((response) => ({
      history: response,
    }))
  );
};
