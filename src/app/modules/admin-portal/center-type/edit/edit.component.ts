import { ChangeDetectorRef, Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
    selector: 'app-edit-center-type',
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
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        GenericHeaderComponent,
        TranslocoModule
    ]
})
export class EditCenterTypeComponent implements OnInit, OnGenericHeaderHandlers {
  private _formBuilder = inject(UntypedFormBuilder);
  private _centerTypeService = inject(CenterTypeService);
  private _cdr = inject(ChangeDetectorRef);
  private _transloco = inject(TranslocoService);
  private _snackBar = inject(MatSnackBar);
  private _customRouterService = inject(CustomRouterService);
  private _route = inject(ActivatedRoute);

  currentLang: string;
  centerType: CenterType;
  centerTypes: CenterType[] = [];

  headerConfig: GenericHeaderConfig = {
    title: 'residential-type.edit.title',
    formGroup: this._formBuilder.group({
      id: [null],
      name: [null, Validators.required],
      nameEN: [null, Validators.required],
      isActive: [true],
      displayOrder: [1, Validators.required],
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
    // Obtener datos del resolver en lugar de suscribirse
    const resolvedData = this._route.snapshot.data['data'];

    if (resolvedData) {
      this.centerType = resolvedData.centerType;
      if (this.centerType) {
        this.headerConfig.formGroup.patchValue(this.centerType);
      }
      this._cdr.markForCheck();
    }
  }

  onSave() {
    if (this.headerConfig.formGroup.invalid) {
      this._snackBar.open('El formulario es inválido. Por favor, complete todos los campos requeridos.', 'Cerrar', { duration: 5000 });
      this.headerConfig.formGroup.markAllAsTouched();
      return;
    }

    const updatedType: CenterType = {
      ...this.headerConfig.formGroup.value,
    };

    const centerTypeRequest: QueryParameters = {};
    this._centerTypeService.updateCenterType(updatedType, centerTypeRequest).subscribe({
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
        this._customRouterService.navigate([`residential-type`]);
      },
    });
  }

  onCancel() {
    this._customRouterService.navigate([`residential-type`]);
  }
}
