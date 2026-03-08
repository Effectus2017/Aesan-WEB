import { NgIf } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoModule } from '@ngneat/transloco';
import { UserService } from 'app/shared/services/user.service';
import { TokenResponse } from 'app/shared/models/user/user.types';
import { Subject, takeUntil } from 'rxjs';
import { RequestRoleExtensionModalComponent, RequestRoleExtensionModalData } from '../request-role-extension-modal/request-role-extension-modal.component';

@Component({
  selector: 'role-validity-banner',
  templateUrl: './role-validity-banner.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [MatButtonModule, MatIconModule, TranslocoModule],
})
export class RoleValidityBannerComponent implements OnInit, OnDestroy {
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _userService = inject(UserService);
  private _dialog = inject(MatDialog);
  private _unsubscribeAll = new Subject<void>();

  user: TokenResponse | null = null;
  showBanner = false;
  roleValidToFormatted = '';

  ngOnInit(): void {
    this._userService.user$.pipe(takeUntil(this._unsubscribeAll)).subscribe((u: TokenResponse | null) => {
      this.user = u;
      this.showBanner = !!(u?.roleValidTo);
      if (u?.roleValidTo) {
        try {
          const d = new Date(u.roleValidTo);
          this.roleValidToFormatted = d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
        } catch {
          this.roleValidToFormatted = u.roleValidTo;
        }
      } else {
        this.roleValidToFormatted = '';
      }
      this._changeDetectorRef.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  openRequestExtensionModal(): void {
    if (!this.user?.role || !this.user?.roleValidTo) return;
    const data: RequestRoleExtensionModalData = {
      roleName: this.user.role,
      roleValidTo: this.user.roleValidTo,
    };
    this._dialog.open(RequestRoleExtensionModalComponent, {
      width: '480px',
      maxWidth: '95vw',
      data,
    });
  }
}
