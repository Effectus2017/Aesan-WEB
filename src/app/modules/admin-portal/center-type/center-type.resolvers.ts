import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { CenterTypeService } from 'app/shared/services/center-type.service';
import { QueryParameters } from 'app/shared/models/QueryParameters';
import { map } from 'rxjs';

export const initialDataCenterTypeListResolver: ResolveFn<any> = () => {
    const service = inject(CenterTypeService);
    const params: QueryParameters = { take: 100, skip: 0, alls: true };
    return service.getAllCenterTypesFromDb(params).pipe(
        map((centerTypes) => ({
            centerTypes: centerTypes.body,
        }))
    );
};

export const initialDataCenterTypeEditResolver: ResolveFn<any> = (route) => {
    const service = inject(CenterTypeService);
    const id = route.paramMap.get('id');
    const params: QueryParameters = { id: Number(id) };
    return service.getCenterTypeById(params).pipe(
        map((centerType) => ({
            centerType: centerType.body,
        }))
    );
};
