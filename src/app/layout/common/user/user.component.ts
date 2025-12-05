import { BooleanInput } from '@angular/cdk/coercion';
import { NgClass, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, Input, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { FuseConfigService } from '@fuse/services/config';
import { ThemeToggleComponent } from 'app/shared/components/theme-toggle/theme-toggle.component';
import { TokenResponse } from 'app/shared/models/user.types';
import { UserService } from 'app/shared/services/user.service';
import { Subject, takeUntil } from 'rxjs';
import { LazyImgDirective } from 'app/shared/directives/lazy-img.directive';
import { OptimizeImagePipe } from 'app/shared/pipes/optimize-image.pipe';
import { CustomRouterService } from 'app/shared/services/custom-router.service';
import { TranslocoModule } from '@ngneat/transloco';

@Component({
    selector: 'user',
    templateUrl: './user.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs: 'user',
    imports: [
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
        NgIf,
        LazyImgDirective,
        OptimizeImagePipe,
        MatDividerModule,
        MatTooltipModule,
        ThemeToggleComponent,
        NgClass,
        TranslocoModule
    ]
})
export class UserComponent implements OnInit, OnDestroy {
  /* eslint-disable @typescript-eslint/naming-convention */
  static ngAcceptInputType_showAvatar: BooleanInput;
  /* eslint-enable @typescript-eslint/naming-convention */

  @Input() showAvatar: boolean = true;
  user: TokenResponse;

  private _unsubscribeAll: Subject<any> = new Subject<any>();
  private _fuseConfigService: FuseConfigService = inject(FuseConfigService);

  isDarkMode: boolean;
  private _customRouterService: CustomRouterService = inject(CustomRouterService);

  /**
   * Constructor
   */
  constructor(private _changeDetectorRef: ChangeDetectorRef, private _router: Router, private _userService: UserService) {}

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {
    // Subscribe to user changes
    this._userService.user$.pipe(takeUntil(this._unsubscribeAll)).subscribe((user: TokenResponse) => {
      this.user = user;

      // Mark for check
      this._changeDetectorRef.markForCheck();
    });

    this._fuseConfigService.config$.pipe(takeUntil(this._unsubscribeAll)).subscribe((config) => {
        this.isDarkMode = config.scheme === 'dark';
        // Guardar el tema en localStorage
        localStorage.setItem('theme', config.scheme);
      });
  }

  /**
   * On destroy
   */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Update the user status
   *
   * @param status
   */
  updateUserStatus(status: string): void {
    // Return if user is not available
    if (!this.user) {
      return;
    }

    // Update the user
    // this._userService
    //   .update({
    //     ...this.user,
    //     status,
    //   })
    //   .subscribe();
  }

  /**
   * Sign out
   */
  signOut(): void {
    this._router.navigate(['/sign-out']);
  }

  /**
   * Navigate to user profile
   */
  navigateToProfile(): void {
    this._customRouterService.navigate(['users/profile']);
  }

}
