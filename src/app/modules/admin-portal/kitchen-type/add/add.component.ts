import { ChangeDetectorRef, Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { KitchenTypeService } from 'app/shared/services/kitchen-type.service';
import { CommonModule } from '@angular/common';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { KitchenTypeRequest } from 'app/shared/models/Request/KitchenTypeRequest';
import { KitchenType } from 'app/shared/models/KitchenType';
import { MatSelectModule } from '@angular/material/select';
import { GenericHeaderComponent } from 'app/shared/components/generic-header/generic-header.component';
import { GenericHeaderConfig, OnGenericHeaderHandlers } from 'app/shared/components/generic-header/generic-header.interface';
import { CustomRouterService } from 'app/shared/services/custom-router.service';
import { QueryParameters } from 'app/shared/models/QueryParameters';
import { showSuccessDialog, showErrorDialog } from 'app/shared/utils';

@Component({
    selector: 'app-add-kitchen-type',
    templateUrl: './add.component.html',
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
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        GenericHeaderComponent,
        TranslocoModule
    ]
})
export class AddKitchenTypeComponent implements OnInit, OnGenericHeaderHandlers {
  private _formBuilder = inject(UntypedFormBuilder);
  private _kitchenTypeService = inject(KitchenTypeService);
  private _cdr = inject(ChangeDetectorRef);
  private _transloco = inject(TranslocoService);
  private _snackBar = inject(MatSnackBar);
  private _customRouterService = inject(CustomRouterService);

  currentLang: string;
  kitchenTypes: KitchenType[] = [];
  positionOptions: { label: string; value: number }[] = [];

  headerConfig: GenericHeaderConfig = {
    title: 'kitchen-type.add.title',
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

  constructor() {}

  ngOnInit(): void {
    this.currentLang = this._transloco.getActiveLang();
    this._kitchenTypeService.getAllKitchenTypesFromDb({ take: 1000, skip: 0, alls: true }).subscribe((result: any) => {
      this.kitchenTypes = (result.body?.data || []).sort((a, b) => a.displayOrder - b.displayOrder);
      this.positionOptions = this.kitchenTypes.map((_, idx) => ({
        label: `Posición ${idx + 1}`,
        value: idx + 1,
      }));
      this.positionOptions.push({ label: `Posición ${this.kitchenTypes.length + 1} (Último)`, value: this.kitchenTypes.length + 1 });
      this.headerConfig.formGroup.get('position').setValue(this.positionOptions.length);
      this._cdr.markForCheck();
    });
  }

  /**
   * Guarda el tipo de cocina
   */
  onSave() {
    if (this.headerConfig.formGroup.invalid) {
      this._snackBar.open('El formulario es inválido. Por favor, complete todos los campos requeridos.', 'Cerrar', { duration: 5000 });
      this.headerConfig.formGroup.markAllAsTouched();
      return;
    }

      const pos = this.headerConfig.formGroup.get('position').value;
      let displayOrder = 1;

      if (this.kitchenTypes.length === 0 || pos > this.kitchenTypes.length) {
        displayOrder = this.kitchenTypes.length > 0 ? Math.max(...this.kitchenTypes.map(s => s.displayOrder)) + 10 : 10;
      } else if (pos === 1) {
        displayOrder = this.kitchenTypes[0].displayOrder / 2;
      } else {
        const prev = this.kitchenTypes[pos - 2].displayOrder;
        const next = this.kitchenTypes[pos - 1]?.displayOrder;
        displayOrder = next ? (prev + next) / 2 : prev + 10;
      }

      const newType: KitchenTypeRequest = {
        name: this.headerConfig.formGroup.get('name').value,
        nameEN: this.headerConfig.formGroup.get('nameEN').value,
        isActive: this.headerConfig.formGroup.get('isActive').value,
        displayOrder,
      };

      const kitchenTypeRequest: QueryParameters = {};
      this._kitchenTypeService.insertKitchenType(newType, kitchenTypeRequest).subscribe({
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
          this._customRouterService.navigate([`kitchen-type`]);
        },
      });
  }

  /**
   * Cancela la creación del tipo de cocina
   */
  onCancel() {
    this._customRouterService.navigate([`kitchen-type`]);
  }
}
