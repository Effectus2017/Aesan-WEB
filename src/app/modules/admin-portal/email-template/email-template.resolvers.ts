import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { QueryParameters } from 'app/shared/models/common/QueryParameters';
import { EmailTemplateService } from 'app/shared/services/email-template.service';
import { forkJoin, map } from 'rxjs';

export const initialDataEmailTemplateListResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
  const emailTemplateService = inject(EmailTemplateService);

  const requestParameters: QueryParameters = {
    take: 25,
    skip: 0,
    alls: true,
  };

  return forkJoin([emailTemplateService.getAllEmailTemplates(requestParameters)]).pipe(
    map(([emailTemplates]) => ({
      emailTemplates: emailTemplates.body,
    }))
  );
};

export const initialDataEmailTemplateEditResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
  const emailTemplateService = inject(EmailTemplateService);
  const requestParameters: QueryParameters = {
    id: Number(route.paramMap.get('id')),
  };
  return emailTemplateService.getEmailTemplateById(requestParameters).pipe(
    map((emailTemplate) => ({
      emailTemplate: emailTemplate.body,
    }))
  );
};

