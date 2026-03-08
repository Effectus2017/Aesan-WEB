import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { QueryParameters } from 'app/shared/models/common/QueryParameters';
import { OptionSelectionService } from 'app/shared/services/option-selection.service';
import { forkJoin, map } from 'rxjs';

export const initialDataOptionSelectionListResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
  const optionSelectionService = inject(OptionSelectionService);

  const requestParameters: QueryParameters = {
    take: 25,
    skip: 0,
    alls: true,
  };

  return forkJoin([optionSelectionService.getAllOptionSelections(requestParameters)]).pipe(
    map(([optionSelections]) => ({
      optionSelections: optionSelections.body,
    }))
  );
};

export const initialDataOptionSelectionEditResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
  const optionSelectionService = inject(OptionSelectionService);
  const requestParameters: QueryParameters = {
    id: Number(route.paramMap.get('id')),
  };
  return optionSelectionService.getOptionSelectionById(requestParameters).pipe(
    map((optionSelection) => ({
      optionSelection: optionSelection.body,
    }))
  );
};
