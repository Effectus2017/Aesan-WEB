import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { QueryParameters } from 'app/shared/models/QueryParameters';
import { OptionSelectionService } from 'app/shared/services/option-selection.service';
import { forkJoin } from 'rxjs';

export const initialDataOptionSelectionListResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
  const optionSelectionService = inject(OptionSelectionService);

  const requestParameters: QueryParameters = {
    take: 25,
    skip: 0,
    alls: true,
  };

  return forkJoin([
    optionSelectionService.getAllOptionSelections(requestParameters)
  ]);
};

export const initialDataOptionSelectionEditResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
  const optionSelectionService = inject(OptionSelectionService);
  const requestParameters: QueryParameters = {
    id: Number(route.paramMap.get('id')),
  };
  return optionSelectionService.getOptionSelectionById(requestParameters);
};
