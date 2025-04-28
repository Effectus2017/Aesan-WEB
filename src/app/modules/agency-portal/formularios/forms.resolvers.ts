import { inject } from '@angular/core';
import { forkJoin } from 'rxjs';

export const initialAgencyFormsRequestsResolver = () => {
  return forkJoin();
};
