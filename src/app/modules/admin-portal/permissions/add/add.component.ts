import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnDestroy, OnInit, Query, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { PermissionService } from 'app/shared/services/permission.service';
import { CustomRouterService } from 'app/shared/services/custom-router.service';
import { fuseAnimations } from '@fuse/animations';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Subject, takeUntil } from 'rxjs';
import { PermissionRequest } from 'app/shared/models/Request/PermissionRequest';
import { QueryParameters } from 'app/shared/models/QueryParameters';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { MatIconModule } from '@angular/material/icon';
import { GenericHeaderComponent } from 'app/shared/components/generic-header/generic-header.component';
import { GenericHeaderConfig } from 'app/shared/components/generic-header/generic-header.interface';
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
        TranslocoModule,
        MatIconModule,
        GenericHeaderComponent,
        NgIf
    ]
})
export class AddPermissionComponent implements OnInit, OnDestroy {
  form: FormGroup;
  private _permissionService = inject(PermissionService);
  private _customRouterService = inject(CustomRouterService);
  private _formBuilder = inject(FormBuilder);
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  private _fuseConfirmationService = inject(FuseConfirmationService);
  private _translocoService = inject(TranslocoService);

  headerConfig: GenericHeaderConfig = {
    title: 'permissions.add.title',
    formGroup: this._formBuilder.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.maxLength(255)]],
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
    if (this.form.invalid) return;

    const permissionRequest: PermissionRequest = {
      name: this.form.value.name,
      description: this.form.value.description,
    };

    const queryParams: QueryParameters = {};

    this._permissionService.insertPermission(permissionRequest, queryParams).pipe(takeUntil(this._unsubscribeAll)).subscribe({
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
      }
    });
  }

  onCancel(): void {
    this._customRouterService.navigate(['permissions']);
  }
}
