import { Component, Inject, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslocoModule } from '@ngneat/transloco';
import { Subject } from 'rxjs';

import { PermissionService } from 'app/shared/services/permission.service';
import { NotificationService } from 'app/shared/services/notification.service';
import { TranslocoService } from '@ngneat/transloco';
import { Permission } from 'app/shared/models/Permission';
import { QueryParameters } from 'app/shared/models/QueryParameters';

@Component({
  selector: 'app-delete-permission-modal',
  templateUrl: './delete-permission-modal.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    TranslocoModule,
  ],
})
export class DeletePermissionModalComponent implements OnInit, OnDestroy {
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _notificationService = inject(NotificationService);
  private _translocoService = inject(TranslocoService);
  private _permissionService = inject(PermissionService);

  // Loading
  isLoading: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<DeletePermissionModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      userId: string;
      userName: string;
      permission: Permission;
    },
  ) {}

  ngOnInit(): void {
    // No necesitamos cargar datos adicionales para eliminar
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  /**
   * Maneja la eliminación del permiso
   */
  onDelete(): void {
    this.isLoading = true;

    const requestParameters: QueryParameters = {
      userId: this.data.userId,
      permissionId: this.data.permission.id,
    };

    this._permissionService.removePermissionFromUser(requestParameters).subscribe({
      next: (result: any) => {
        if (result.status === 200) {
          this._notificationService.showSuccessDialog(this._translocoService.translate('users.permission.modal.success.deleted'));
          this.dialogRef.close({ success: true, permission: this.data.permission });
        } else {
          this._notificationService.showErrorDialog(this._translocoService.translate('users.permission.modal.error.delete'));
        }
      },
      error: (error) => {
        this._notificationService.showErrorDialog(this._translocoService.translate('users.permission.modal.error.delete'));
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  /**
   * Cierra el modal sin eliminar
   */
  onCancel(): void {
    this.dialogRef.close();
  }
}
