import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Permission } from 'app/shared/models/Permission';
import { GenericHeaderConfig, OnGenericHeaderHandlers } from 'app/shared/components/generic-header/generic-header.interface';
import { QueryParameters } from 'app/shared/models/QueryParameters';
import { GenericHeaderComponent } from 'app/shared/components/generic-header/generic-header.component';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-edit-permission',
  templateUrl: './edit.component.html',
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations,
  imports: [ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatCheckboxModule, MatSnackBarModule, TranslocoModule, GenericHeaderComponent, NgIf],
})
export class EditPermissionComponent implements OnInit, OnDestroy, OnGenericHeaderHandlers {
  form: FormGroup;
  private _permissionService = inject(PermissionService);
  private _customRouterService = inject(CustomRouterService);
  private _formBuilder = inject(FormBuilder);
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _route = inject(ActivatedRoute);
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  private _fuseConfirmationService = inject(FuseConfirmationService);
  private _translocoService = inject(TranslocoService);
  private _snackBar = inject(MatSnackBar);

  headerConfig: GenericHeaderConfig = {
    title: 'permissions.edit.title',
    formGroup: this._formBuilder.group({
      valueKey: [{ value: '', disabled: true }, [Validators.required, Validators.maxLength(50)]],
      name: ['', [Validators.required, Validators.maxLength(100)]],
      nameEn: ['', [Validators.maxLength(100)]],
      isActive: [true],
    }),
    saveButtonShow: true,
    saveButtonText: 'global.buttons.save',
    cancelButtonShow: true,
    cancelButtonText: 'global.buttons.cancel',
  };

  param: Permission;

  ngOnInit(): void {
    // Obtener datos del resolver en lugar de suscribirse
    const resolvedData = this._route.snapshot.data['data'];

    if (resolvedData) {
      this.onSetForm(resolvedData.permission);
      this._changeDetectorRef.markForCheck();
    }
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  onSetForm(param: Permission) {
    this.param = param;
    this.headerConfig.formGroup.patchValue({
      valueKey: param.valueKey || null,
      name: param.name || null,
      nameEn: param.nameEn || null,
      isActive: param.isActive,
    });
  }

  onSave(): void {
    if (this.headerConfig.formGroup.invalid || this.param === null) {
      this.headerConfig.formGroup.markAllAsTouched();
      return;
    }

    const permission: Permission = {
      id: this.param.id,
      valueKey: this.headerConfig.formGroup.value.valueKey,
      name: this.headerConfig.formGroup.value.name,
      nameEn: this.headerConfig.formGroup.value.nameEn,
      isActive: this.headerConfig.formGroup.value.isActive,
    };

    const queryParams: QueryParameters = {};
    this._permissionService
      .updatePermission(permission, queryParams)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: (response) => {
          if (response.status === 200) {
            this._snackBar.open(this._translocoService.translate('permissions.edit.messages.success') || 'Permiso actualizado correctamente', 'Cerrar', { duration: 3000 });
            this._customRouterService.navigate(['permissions']);
          } else {
            this._snackBar.open(this._translocoService.translate('permissions.edit.messages.error') || 'Error al actualizar el permiso', 'Cerrar', { duration: 5000 });
          }
        },
        error: (error) => {
          console.error('Error updating permission:', error);
          this._snackBar.open(this._translocoService.translate('permissions.edit.messages.error') || 'Error al actualizar el permiso', 'Cerrar', { duration: 5000 });
        },
      });
  }

  onCancel(): void {
    this._customRouterService.navigate(['permissions']);
  }
}
