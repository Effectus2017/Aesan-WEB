import { inject } from '@angular/core';
import { AuthService } from 'app/core/auth/auth.service';
import { QueryParameters } from 'app/shared/models/common/QueryParameters';
import { AesanDashboardService } from 'app/shared/services/aesan-dashboard.service';
import { map } from 'rxjs';

export const aesanDashboardResolver = () => {
  const _aesanDashboardService: AesanDashboardService = inject(AesanDashboardService);
  const _authService: AuthService = inject(AuthService);

  const userId = _authService.getUserId();

  const requestParameters: QueryParameters = {
    userId: userId,
  };

  return _aesanDashboardService.getDashboardMetrics(requestParameters).pipe(
    map((response) => response.body)
  );
};
