import { ChangeDetectorRef, Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, UntypedFormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ActivatedRoute } from '@angular/router';
import { DeliveryTypeService } from 'app/shared/services/delivery-type.service';
import { CommonModule } from '@angular/common';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DeliveryType } from 'app/shared/models/catalog/DeliveryType';
import { GenericHeaderComponent } from 'app/shared/components/generic-header/generic-header.component';
import { GenericHeaderConfig, OnGenericHeaderHandlers } from 'app/shared/components/generic-header/generic-header.interface';
import { CustomRouterService } from 'app/shared/services/custom-router.service';
import { showErrorDialog, showSuccessDialog } from 'app/shared/utils';

@Component({
  selector: 'app-edit-delivery-type',
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
export class EditDeliveryTypeComponent implements OnInit, OnGenericHeaderHandlers {
  private _formBuilder = inject(UntypedFormBuilder);
  private _deliveryTypeService = inject(DeliveryTypeService);
  private _route = inject(ActivatedRoute);
  private _cdr = inject(ChangeDetectorRef);
  private _transloco = inject(TranslocoService);
  private _snackBar = inject(MatSnackBar);
  private _customRouterService = inject(CustomRouterService);

  deliveryTypeId: number;
  deliveryTypes: DeliveryType[] = [];
  positionOptions: { label: string; value: number }[] = [];

  headerConfig: GenericHeaderConfig = {
    title: 'delivery-type.edit.title',
    formGroup: this._formBuilder.group({
      name: [null, Validators.required],
      nameEN: [null, Validators.required],
      isActive: [true],
      position: [1, Validators.required],
    }),
    saveButtonShow: true,
    saveButtonText: 'global.buttons.save',
    cancelButtonShow: true,
    cancelButtonText: 'global.buttons.cancel',
    goToAddButtonShow: false,
  };

  currentLang: string;

  ngOnInit(): void {
    // Transloco
    this.currentLang = this._transloco.getActiveLang();

    this.deliveryTypeId = +this._route.snapshot.paramMap.get('id');

    this._deliveryTypeService.deliveryType$.subscribe((result: any) => {
      this.deliveryTypeId = result.body.id;
      this.onSetForm(result.body);
    });
  }

  onSetForm(param: DeliveryType) {
    this.headerConfig.formGroup.patchValue({
      name: param.name,
      nameEN: param.nameEN,
      isActive: param.isActive,
      position: param.displayOrder,
    });
  }

  onSave() {
    if (this.headerConfig.formGroup.invalid) {
      this._snackBar.open('El formulario es inválido. Por favor, complete todos los campos requeridos.', 'Cerrar', { duration: 5000 });
      this.headerConfig.formGroup.markAllAsTouched();
      return;
    }

    const formValues = this.headerConfig.formGroup.getRawValue();

    const deliveryTypeRequest: DeliveryType = {
      id: this.deliveryTypeId,
      name: formValues.name,
      nameEN: formValues.nameEN,
      isActive: formValues.isActive,
      displayOrder: formValues.position,
    };

    this._deliveryTypeService.updateDeliveryType(deliveryTypeRequest, {}).subscribe({
      next: (result: any) => {
        switch (result.body) {
          case true:
            showSuccessDialog();
            break;
          default:
            showErrorDialog();
            break;
        }
      },
      error: (error) => {
        showErrorDialog();
      },
      complete: () => {
        this._customRouterService.navigate(['delivery-type']);
      },
    });
  }

  onCancel() {
    this._customRouterService.navigate(['delivery-type']);
  }
}
