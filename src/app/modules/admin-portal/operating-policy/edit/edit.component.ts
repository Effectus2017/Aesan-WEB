import { ChangeDetectorRef, Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, UntypedFormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ActivatedRoute, Router } from '@angular/router';
import { OperatingPolicyService } from 'app/shared/services/operating-policy.service';
import { CommonModule } from '@angular/common';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { OperatingPolicy } from 'app/shared/models/OperatingPolicy';
import { GenericHeaderComponent } from 'app/shared/components/generic-header/generic-header.component';
import { GenericHeaderConfig, OnGenericHeaderHandlers } from 'app/shared/components/generic-header/generic-header.interface';
import { CustomRouterService } from 'app/shared/services/custom-router.service';
import { showSuccessDialog, showErrorDialog } from 'app/shared/utils';

@Component({
  selector: 'app-edit-operating-policy',
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
export class EditOperatingPolicyComponent implements OnInit, OnGenericHeaderHandlers {
  private _formBuilder = inject(UntypedFormBuilder);
  private _operatingPolicyService = inject(OperatingPolicyService);
  private _transloco = inject(TranslocoService);
  private _snackBar = inject(MatSnackBar);
  private _customRouterService = inject(CustomRouterService);

  operatingPolicyId: number;
  currentLang: string;
  operatingPolicy: OperatingPolicy;

  headerConfig: GenericHeaderConfig = {
    title: 'operating-policy.edit.title',
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
    this._operatingPolicyService.operatingPolicy$.subscribe((result: any) => {
      this.operatingPolicyId = result.body.id;
      this.onSetForm(result.body);
    });
  }

  onSetForm(data: OperatingPolicy) {
    this.headerConfig.formGroup.patchValue({
      id: data.id,
      name: data.name,
      nameEN: data.nameEN,
      isActive: data.isActive,
      displayOrder: data.displayOrder,
    });
  }

  onSave() {
    if (this.headerConfig.formGroup.invalid) {
        this._snackBar.open('El formulario es inválido. Por favor, complete todos los campos requeridos.', 'Cerrar', { duration: 5000 });
        this.headerConfig.formGroup.markAllAsTouched();
        return;
    }

    const formValues = this.headerConfig.formGroup.getRawValue();

    const operatingPolicy: OperatingPolicy = {
      id: this.operatingPolicyId,
      name: formValues.name,
      nameEN: formValues.nameEN,
      isActive: formValues.isActive,
      displayOrder: formValues.displayOrder,
    };

    this._operatingPolicyService.updateOperatingPolicy(operatingPolicy, {}).subscribe({
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
      error: (err) => {
        showErrorDialog();
      },
      complete: () => {
        this._customRouterService.navigate(['operating-policy/list']);
      }
    });
  }

  onCancel() {
    this._customRouterService.navigate(['operating-policy/list']);
  }
}
