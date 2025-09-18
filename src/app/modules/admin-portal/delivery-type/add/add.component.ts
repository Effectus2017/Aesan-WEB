import { ChangeDetectorRef, Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { DeliveryTypeService } from 'app/shared/services/delivery-type.service';
import { CommonModule } from '@angular/common';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DeliveryType } from 'app/shared/models/DeliveryType';
import { MatSelectModule } from '@angular/material/select';
import { GenericHeaderComponent } from 'app/shared/components/generic-header/generic-header.component';
import { GenericHeaderConfig, OnGenericHeaderHandlers } from 'app/shared/components/generic-header/generic-header.interface';
import { CustomRouterService } from 'app/shared/services/custom-router.service';

@Component({
  selector: 'app-add-delivery-type',
  templateUrl: './add.component.html',
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
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    GenericHeaderComponent,
    TranslocoModule
  ],
})
export class AddDeliveryTypeComponent implements OnInit, OnGenericHeaderHandlers {
  private _formBuilder = inject(UntypedFormBuilder);
  private _deliveryTypeService = inject(DeliveryTypeService);
  private _cdr = inject(ChangeDetectorRef);
  private _transloco = inject(TranslocoService);
  private _snackBar = inject(MatSnackBar);
  private _customRouterService = inject(CustomRouterService);

  deliveryTypes: DeliveryType[] = [];
  positionOptions: { label: string; value: number }[] = [];

  headerConfig: GenericHeaderConfig = {
    title: 'delivery-type.add.title',
    formGroup: this._formBuilder.group({
      name: [null, Validators.required],
      nameEN: [null, Validators.required],
      isActive: [true],
      position: [1, Validators.required],
      selectionNotification: [false],
    }),
    saveButtonShow: true,
    saveButtonText: 'global.buttons.save',
    cancelButtonShow: true,
    cancelButtonText: 'global.buttons.cancel',
    goToAddButtonShow: false,
  };

  ngOnInit(): void {
    this._deliveryTypeService.getAll(1000, 0, '', true).subscribe((result: any) => {
      this.deliveryTypes = (result.data || []).sort((a, b) => a.displayOrder - b.displayOrder);
      this.positionOptions = this.deliveryTypes.map((_, idx) => ({
        label: `Posición ${idx + 1}`,
        value: idx + 1,
      }));
      this.positionOptions.push({ label: `Posición ${this.deliveryTypes.length + 1} (Último)`, value: this.deliveryTypes.length + 1 });
      this.headerConfig.formGroup.get('position').setValue(this.positionOptions.length);
      this._cdr.markForCheck();
    });
  }

  onSave() {
    if (this.headerConfig.formGroup.invalid) {
      this._snackBar.open('El formulario es inválido. Por favor, complete todos los campos requeridos.', 'Cerrar', { duration: 5000 });
      this.headerConfig.formGroup.markAllAsTouched();
      return;
    }
    const pos = this.headerConfig.formGroup.get('position').value;
    let displayOrder = 1;
    if (this.deliveryTypes.length === 0 || pos > this.deliveryTypes.length) {
      displayOrder = this.deliveryTypes.length > 0 ? Math.max(...this.deliveryTypes.map(s => s.displayOrder)) + 10 : 10;
    } else if (pos === 1) {
      displayOrder = this.deliveryTypes[0].displayOrder / 2;
    } else {
      const prev = this.deliveryTypes[pos - 2].displayOrder;
      const next = this.deliveryTypes[pos - 1]?.displayOrder;
      displayOrder = next ? (prev + next) / 2 : prev + 10;
    }
    const newType = {
      name: this.headerConfig.formGroup.get('name').value,
      nameEN: this.headerConfig.formGroup.get('nameEN').value,
      isActive: this.headerConfig.formGroup.get('isActive').value,
      displayOrder,
      selectionNotification: this.headerConfig.formGroup.get('selectionNotification').value,
    };
    this._deliveryTypeService.create(newType).subscribe({
      next: () => {
        this._snackBar.open('Tipo de entrega creado correctamente', 'Cerrar', { duration: 3000 });
        this._customRouterService.navigate(['delivery-type']);
      },
      error: () => {
        this._snackBar.open('Error al crear el tipo de entrega', 'Cerrar', { duration: 5000 });
      },
    });
  }

  onCancel() {
    this._customRouterService.navigate(['delivery-type']);
  }
}
