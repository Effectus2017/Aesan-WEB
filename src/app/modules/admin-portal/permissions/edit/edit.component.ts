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
import { Subject, takeUntil } from 'rxjs';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { isNullOrUndefinedEmptyStringNullArray } from 'app/shared/utils';
import { Permission } from 'app/shared/models/Permission';
import { GenericHeaderConfig } from 'app/shared/components/generic-header/generic-header.interface';
import { QueryParameters } from 'app/shared/models/QueryParameters';
import { GenericHeaderComponent } from 'app/shared/components/generic-header/generic-header.component';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-edit-permission',
  templateUrl: './edit.component.html',
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations,
  imports: [ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, TranslocoModule, GenericHeaderComponent, NgIf],
})
export class EditPermissionComponent implements OnInit, OnDestroy {
  form: FormGroup;
  private _permissionService = inject(PermissionService);
  private _customRouterService = inject(CustomRouterService);
  private _formBuilder = inject(FormBuilder);
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _route = inject(ActivatedRoute);
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  private _fuseConfirmationService = inject(FuseConfirmationService);
  private _translocoService = inject(TranslocoService);

  headerConfig: GenericHeaderConfig = {
    title: 'permissions.edit.title',
    formGroup: this._formBuilder.group({
      name: [{ value: '', disabled: true }, [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.maxLength(255)]],
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
      name: param.name || null,
      description: param.description || null,
    });
  }

  onSave(): void {
    if (this.headerConfig.formGroup.invalid || this.param === null) return;

    const permission: Permission = {
      id: this.param.id,
      name: this.headerConfig.formGroup.value.name,
      description: this.headerConfig.formGroup.value.description,
    };

    const queryParams: QueryParameters = {};
    this._permissionService
      .updatePermission(permission, queryParams)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: (response) => {
          switch (response.status) {
            case 200:
              this._fuseConfirmationService.open({
                title: this._translocoService.translate('dialog.success.title'),
                icon: {
                  show: true,
                  name: 'heroicons_outline:check-circle',
                  color: 'success',
                },
              });
              break;
            case 400:
              this._fuseConfirmationService.open({
                title: this._translocoService.translate('dialog.error.title'),
                icon: {
                  show: true,
                  name: 'heroicons_outline:exclamation-triangle',
                  color: 'error',
                },
              });
              break;
            default:
              this._fuseConfirmationService.open({
                title: this._translocoService.translate('dialog.error.title'),
                icon: {
                  show: true,
                  name: 'heroicons_outline:exclamation-triangle',
                  color: 'error',
                },
              });
              break;
          }
        },
      });
  }

  onCancel(): void {
    this._customRouterService.navigate(['permissions']);
  }
}
