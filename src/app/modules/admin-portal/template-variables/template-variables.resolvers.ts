import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { TemplateVariableService } from 'app/shared/services/template-variable.service';
import { map } from 'rxjs';

export const initialDataTemplateVariablesResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
  const templateVariableService = inject(TemplateVariableService);
  
  return templateVariableService.getAllTemplateVariables().pipe(
    map((variables) => ({
      variables: variables,
    }))
  );
};

