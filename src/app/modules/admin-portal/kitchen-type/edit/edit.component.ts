import { ChangeDetectorRef, Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, UntypedFormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ActivatedRoute, Router } from '@angular/router';
import { KitchenTypeService } from 'app/shared/services/kitchen-type.service';
import { CommonModule } from '@angular/common';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { KitchenType } from 'app/shared/models/KitchenType';
import { GenericHeaderComponent } from 'app/shared/components/generic-header/generic-header.component';
import { GenericHeaderConfig, OnGenericHeaderHandlers } from 'app/shared/components/generic-header/generic-header.interface';
import { CustomRouterService } from 'app/shared/services/custom-router.service';
import { FuseConfirmationService } from '@fuse/services/confirmation';

@Component({
  selector: 'app-edit-kitchen-type',
  templateUrl: './edit.component.html',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    CommonModule,
    MatSnackBarModule,
    GenericHeaderComponent,
    TranslocoModule,
  ],
})
export class EditKitchenTypeComponent implements OnInit, OnGenericHeaderHandlers {
  private _formBuilder = inject(UntypedFormBuilder);
  private _kitchenTypeService = inject(KitchenTypeService);
  private _route = inject(ActivatedRoute);
  private _cdr = inject(ChangeDetectorRef);
  private _transloco = inject(TranslocoService);
  private _snackBar = inject(MatSnackBar);
  private _customRouterService = inject(CustomRouterService);
  private _fuseConfirmationService = inject(FuseConfirmationService);
  private _translocoService = inject(TranslocoService);

  kitchenTypeId: number;
  currentLang: string;

  headerConfig: GenericHeaderConfig = {
    title: 'kitchen-type.edit.title',
    formGroup: this._formBuilder.group({
      name: [null, Validators.required],
      nameEN: [null, Validators.required],
      isActive: [true],
      displayOrder: [0, Validators.required],
    }),
    saveButtonShow: true,
    saveButtonText: 'global.buttons.save',
    cancelButtonShow: true,
    cancelButtonText: 'global.buttons.cancel',
    goToAddButtonShow: false,
  };

  constructor() {}

  ngOnInit(): void {
    this.currentLang = this._transloco.getActiveLang();

    this._kitchenTypeService.kitchenType$.subscribe((result: any) => {
      this.kitchenTypeId = result.body.id;
      this.onSetForm(result.body);
    });
  }

  onSetForm(param: KitchenType) {
    console.log(param);
    this.headerConfig.formGroup.patchValue({
      name: param.name,
      nameEN: param.nameEN,
      isActive: param.isActive,
      displayOrder: param.displayOrder,
    });
  }

  onSave() {
    if (this.headerConfig.formGroup.invalid) {
      this._snackBar.open('El formulario es inválido. Por favor, complete todos los campos requeridos.', 'Cerrar', { duration: 5000 });
      this.headerConfig.formGroup.markAllAsTouched();
      return;
    }

    const formValues = this.headerConfig.formGroup.getRawValue();

    const kitchenTypeRequest: KitchenType = {
      id: this.kitchenTypeId,
      name: formValues.name,
      nameEN: formValues.nameEN,
      isActive: formValues.isActive,
      displayOrder: formValues.displayOrder,
    };

    this._kitchenTypeService.updateKitchenType(kitchenTypeRequest, {}).subscribe({
      next: (result: any) => {
        switch (result.body) {
          case true:
            this._fuseConfirmationService.open({
              title: this._translocoService.translate('dialog.success.title'),
              icon: {
                show: true,
                name: 'heroicons_outline:check-circle',
                color: 'success',
              },
              message: this._translocoService.translate('dialog.success.message'),
              actions: {
                confirm: {
                  label: this._translocoService.translate('dialog.success.confirm'),
                },
              },
            });
            break;
          default:
            this.showErrorDialog();
            break;
        }
      },
      error: (error) => {
        this._fuseConfirmationService.open({
          title: this._translocoService.translate('dialog.error.title'),
          icon: {
            show: true,
            name: 'heroicons_outline:x-circle',
            color: 'error',
          },
          message: this._translocoService.translate('dialog.error.message'),
          actions: {
            confirm: {
              label: this._translocoService.translate('dialog.error.confirm'),
            },
          },
        });
      },
      complete: () => {
        this._customRouterService.navigate(['kitchen-type']);
      },
    });
  }

  showErrorDialog() {
    this._fuseConfirmationService.open({
      title: this._translocoService.translate('dialog.error.title'),
      icon: {
        show: true,
        name: 'heroicons_outline:x-circle',
        color: 'error',
      },
      message: this._translocoService.translate('dialog.error.message'),
      actions: {
        confirm: {
          label: this._translocoService.translate('dialog.error.confirm'),
        },
      },
    });
  }
}
