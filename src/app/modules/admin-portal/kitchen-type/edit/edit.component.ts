import { ChangeDetectorRef, Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ActivatedRoute } from '@angular/router';
import { KitchenTypeService } from 'app/shared/services/kitchen-type.service';
import { CommonModule } from '@angular/common';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { KitchenType } from 'app/shared/models/KitchenType';
import { GenericHeaderComponent } from 'app/shared/components/generic-header/generic-header.component';
import { GenericHeaderConfig, OnGenericHeaderHandlers } from 'app/shared/components/generic-header/generic-header.interface';
import { CustomRouterService } from 'app/shared/services/custom-router.service';
import { NotificationService } from 'app/shared/services/notification.service';

@Component({
    selector: 'app-edit-kitchen-type',
    templateUrl: './edit.component.html',
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
    ]
})
export class EditKitchenTypeComponent implements OnInit, OnGenericHeaderHandlers {
  private _formBuilder = inject(UntypedFormBuilder);
  private _kitchenTypeService = inject(KitchenTypeService);
  private _route = inject(ActivatedRoute);
  private _cdr = inject(ChangeDetectorRef);
  private _transloco = inject(TranslocoService);
  private _notificationService = inject(NotificationService);
  private _customRouterService = inject(CustomRouterService);

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
    this.headerConfig.formGroup.patchValue({
      name: param.name,
      nameEN: param.nameEN,
      isActive: param.isActive,
      displayOrder: param.displayOrder,
    });
  }

  onSave() {
    if (this.headerConfig.formGroup.invalid) {
      this._notificationService.showError('El formulario es inválido. Por favor, complete todos los campos requeridos.');
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
            this._notificationService.showSuccessDialog();
            break;
          default:
            this._notificationService.showErrorDialog();
            break;
        }
      },
      error: (error) => {
        this._notificationService.showErrorDialog();
      },
      complete: () => {
        this._customRouterService.navigate(['kitchen-type']);
      },
    });
  }

  onCancel() {
    this._customRouterService.navigate(['kitchen-type']);
  }
}
