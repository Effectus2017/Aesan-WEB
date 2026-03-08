import { ChangeDetectorRef, Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CenterTypeService } from 'app/shared/services/center-type.service';
import { CommonModule } from '@angular/common';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CenterType } from 'app/shared/models/catalog/CenterType';
import { MatSelectModule } from '@angular/material/select';
import { GenericHeaderComponent } from 'app/shared/components/generic-header/generic-header.component';
import { GenericHeaderConfig, OnGenericHeaderHandlers } from 'app/shared/components/generic-header/generic-header.interface';
import { CustomRouterService } from 'app/shared/services/custom-router.service';
import { QueryParameters } from 'app/shared/models/common/QueryParameters';
import { showSuccessDialog, showErrorDialog } from 'app/shared/utils';

@Component({
    selector: 'app-add-center-type',
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
export class AddCenterTypeComponent implements OnInit, OnGenericHeaderHandlers {
  private _formBuilder = inject(UntypedFormBuilder);
  private _centerTypeService = inject(CenterTypeService);
  private _cdr = inject(ChangeDetectorRef);
  private _transloco = inject(TranslocoService);
  private _snackBar = inject(MatSnackBar);
  private _customRouterService = inject(CustomRouterService);

  currentLang: string;
  centerTypes: CenterType[] = [];
  positionOptions: { label: string; value: number }[] = [];

  headerConfig: GenericHeaderConfig = {
    title: 'center-type.add.title',
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
    this._centerTypeService.getAllCenterTypesFromDb({ take: 1000, skip: 0, alls: true }).subscribe((result: any) => {
      this.centerTypes = (result.body?.data || []).sort((a, b) => a.displayOrder - b.displayOrder);
      this.positionOptions = this.centerTypes.map((_, idx) => ({
        label: `Posición ${idx + 1}`,
        value: idx + 1,
      }));
      this.positionOptions.push({ label: `Posición ${this.centerTypes.length + 1} (Último)`, value: this.centerTypes.length + 1 });
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

      if (this.centerTypes.length === 0 || pos > this.centerTypes.length) {
        displayOrder = this.centerTypes.length > 0 ? Math.max(...this.centerTypes.map(s => s.displayOrder)) + 10 : 10;
      } else if (pos === 1) {
        displayOrder = this.centerTypes[0].displayOrder / 2;
      } else {
        const prev = this.centerTypes[pos - 2].displayOrder;
        const next = this.centerTypes[pos - 1]?.displayOrder;
        displayOrder = (prev + next) / 2;
      }

      const newType: CenterType = {
        ...this.headerConfig.formGroup.value,
        displayOrder,
      };

      const centerTypeRequest: QueryParameters = {};
      this._centerTypeService.insertCenterType(newType, centerTypeRequest).subscribe({
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
          this._customRouterService.navigate([`center-type`]);
        },
      });
  }

  onCancel() {
    this._customRouterService.navigate([`center-type`]);
  }
}
