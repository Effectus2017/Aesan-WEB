import { Injectable } from '@angular/core';
import { FuseNavigationItem } from '@fuse/components/navigation';
import { FuseMockApiService } from '@fuse/lib/mock-api';
import { adminNavigation } from './navigation.admin';
import { agencyNavigation } from './navigation.agency';
import { monitorNavigation } from './navigation.monitor';
import { sharedNavigation } from './navigation.shared';
import { cloneDeep } from 'lodash-es';

@Injectable({ providedIn: 'root' })
export class NavigationMockApi {
  private readonly _adminNavigation: FuseNavigationItem[] = adminNavigation;
  private readonly _agencyNavigation: FuseNavigationItem[] = agencyNavigation;
  private readonly _monitorNavigation: FuseNavigationItem[] = monitorNavigation;
  private readonly _sharedNavigation: FuseNavigationItem[] = sharedNavigation;

  /**
   * Constructor
   */
  constructor(private _fuseMockApiService: FuseMockApiService) {
    // Register Mock API handlers
    this.registerHandlers();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Register Mock API handlers
   */
  registerHandlers(): void {
    // -----------------------------------------------------------------------------------------------------
    // @ Navigation - GET
    // -----------------------------------------------------------------------------------------------------
    this._fuseMockApiService.onGet('api/common/navigation').reply(() => {
      return [
        200,
        {
          admin: cloneDeep(this._adminNavigation),
          agency: cloneDeep(this._agencyNavigation),
          monitor: cloneDeep(this._monitorNavigation),
          shared: cloneDeep(this._sharedNavigation),
        },
      ];
    });
  }
}
