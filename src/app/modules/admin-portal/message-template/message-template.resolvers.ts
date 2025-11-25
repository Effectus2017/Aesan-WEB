import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { QueryParameters } from 'app/shared/models/QueryParameters';
import { MessageTemplateService } from 'app/shared/services/message-template.service';
import { forkJoin, map, of } from 'rxjs';

export const initialDataMessageTemplateListResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
  const messageTemplateService = inject(MessageTemplateService);

  const requestParameters: QueryParameters = {
    take: 25,
    skip: 0,
    alls: true,
  };

  return forkJoin([messageTemplateService.getAllMessageTemplates(requestParameters)]).pipe(
    map(([messageTemplates]) => ({
      messageTemplates: messageTemplates.body,
    }))
  );
};

export const initialDataMessageTemplateAddResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
  // No se necesitan datos previos para agregar un nuevo template
  return of({});
};

export const initialDataMessageTemplateEditResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
  const messageTemplateService = inject(MessageTemplateService);
  const requestParameters: QueryParameters = {
    id: Number(route.paramMap.get('id')),
  };
  return messageTemplateService.getMessageTemplateById(requestParameters).pipe(
    map((messageTemplate) => ({
      messageTemplate: messageTemplate.body,
    }))
  );
};

