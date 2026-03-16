import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { forkJoin, map } from 'rxjs';
import { QueryParameters } from 'app/shared/models/common/QueryParameters';
import { LogsService } from 'app/shared/services/logs.service';

export const initialDataLogsListResolver: ResolveFn<any> = () => {
  const logsService = inject(LogsService);
  const defaultParams: QueryParameters = {
    logCategory: 'Email',
    page: 1,
    pageSize: 25,
  };

  return forkJoin([logsService.getLogsPaged(defaultParams)]).pipe(
    map(([logsResponse]) => ({
      logs: logsResponse
    }))
  );
};
