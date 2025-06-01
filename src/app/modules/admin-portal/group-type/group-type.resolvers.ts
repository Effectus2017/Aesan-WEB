import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { QueryParameters } from 'app/shared/models/QueryParameters';
import { GroupTypeService } from 'app/shared/services/group-type.service';

export const initialDataGroupTypeListResolver: ResolveFn<any> = () => {
  const groupTypeService = inject(GroupTypeService);
  const queryParameters: QueryParameters = { take: 25, skip: 0, name: '', alls: true };
  return groupTypeService.getAllGroupTypesFromDb(queryParameters);
};

export const initialDataGroupTypeEditResolver: ResolveFn<any> = (route) => {
  const id = Number(route.paramMap.get('id'));
  const queryParameters: QueryParameters = { id };
  return inject(GroupTypeService).getGroupTypeById(queryParameters);
};
