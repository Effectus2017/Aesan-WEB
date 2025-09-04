import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { QueryParameters } from 'app/shared/models/QueryParameters';
import { KitchenTypeService } from 'app/shared/services/kitchen-type.service';
import { forkJoin, map } from 'rxjs';

export const initialDataKitchenTypeListResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
  const kitchenTypeService = inject(KitchenTypeService);

  const requestParameters: QueryParameters = {
    take: 25,
    skip: 0,
    alls: true,
  };

  return forkJoin([kitchenTypeService.getAllKitchenTypesFromDb(requestParameters)]).pipe(
    map(([kitchenTypes]) => ({
      kitchenTypes: kitchenTypes.body,
    }))
  );
};

export const initialDataKitchenTypeEditResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
  const kitchenTypeService = inject(KitchenTypeService);

  const requestParameters: QueryParameters = {
    id: Number(route.paramMap.get('id')),
  };

  return kitchenTypeService.getKitchenTypeById(requestParameters).pipe(
    map((kitchenType) => ({
      kitchenType: kitchenType.body,
    }))
  );
};
