import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { AgencyService } from 'app/shared/services/agency.service';
import { forkJoin, map } from 'rxjs';

export const initialDataAgencyStatusHistoryListResolver: ResolveFn<any> = () => {
  const agencyService = inject(AgencyService);
  return forkJoin([
    agencyService.getAllAgenciesFromDb({ take: 10000, skip: 0, alls: true, isList: true, isPropietary: false }),
  ]).pipe(
    map(([agenciesRes]) => {
      const res = agenciesRes as { data?: unknown[]; count?: number };
      const agencies = res?.data ?? [];
      return { agencies };
    })
  );
};
