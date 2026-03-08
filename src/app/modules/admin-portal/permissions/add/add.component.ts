import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { PermissionService } from 'app/shared/services/permission.service';
import { CustomRouterService } from 'app/shared/services/custom-router.service';
import { fuseAnimations } from '@fuse/animations';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Subject, takeUntil } from 'rxjs';
import { PermissionRequest } from 'app/shared/models/request/PermissionRequest';
import { QueryParameters } from 'app/shared/models/common/QueryParameters';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { GenericHeaderComponent } from 'app/shared/components/generic-header/generic-header.component';
import { GenericHeaderConfig, OnGenericHeaderHandlers } from 'app/shared/components/generic-header/generic-header.interface';
import { NgIf } from '@angular/common';

@Component({
    selector: 'app-add-permission',
    templateUrl: './add.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations,
    imports: [
        ReactiveFormsModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatCheckboxModule,
        MatSnackBarModule,
        TranslocoModule,
        MatIconModule,
        GenericHeaderComponent,
        NgIf
    ]
})
export class AddPermissionComponent implements OnInit, OnDestroy, OnGenericHeaderHandlers {
  form: FormGroup;
  private _permissionService = inject(PermissionService);
  private _customRouterService = inject(CustomRouterService);
  private _formBuilder = inject(FormBuilder);
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  private _fuseConfirmationService = inject(FuseConfirmationService);
  private _translocoService = inject(TranslocoService);
  private _snackBar = inject(MatSnackBar);

  headerConfig: GenericHeaderConfig = {
    title: 'permissions.add.title',
    formGroup: this._formBuilder.group({
      valueKey: ['', [Validators.required, Validators.maxLength(50)]],
      name: ['', [Validators.required, Validators.maxLength(100)]],
      nameEn: ['', [Validators.maxLength(100)]],
      isActive: [true],
    }),
    saveButtonShow: true,
    saveButtonText: 'global.buttons.save',
    cancelButtonShow: true,
    cancelButtonText: 'global.buttons.cancel',
  };

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  onSave(): void {
    if (this.headerConfig.formGroup.invalid) {
      this.headerConfig.formGroup.markAllAsTouched();
      return;
    }

    const permissionRequest: PermissionRequest = {
      valueKey: this.headerConfig.formGroup.value.valueKey,
      name: this.headerConfig.formGroup.value.name,
      nameEn: this.headerConfig.formGroup.value.nameEn,
      isActive: this.headerConfig.formGroup.value.isActive,
    };

    const queryParams: QueryParameters = {};

    this._permissionService.insertPermission(permissionRequest, queryParams)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: (response) => {
          if (response.status === 200) {
            this._snackBar.open(
              this._translocoService.translate('permissions.add.messages.success') || 'Permiso creado correctamente',
              'Cerrar',
              { duration: 3000 }
            );
            this._customRouterService.navigate(['permissions']);
          } else {
            this._snackBar.open(
              this._translocoService.translate('permissions.add.messages.error') || 'Error al crear el permiso',
              'Cerrar',
              { duration: 5000 }
            );
          }
        },
        error: (error) => {
          console.error('Error creating permission:', error);
          this._snackBar.open(
            this._translocoService.translate('permissions.add.messages.error') || 'Error al crear el permiso',
            'Cerrar',
            { duration: 5000 }
          );
        }
      });
  }

  onCancel(): void {
    this._customRouterService.navigate(['permissions']);
  }
}
