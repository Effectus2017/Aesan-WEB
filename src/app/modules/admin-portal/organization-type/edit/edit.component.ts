import { ChangeDetectorRef, Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, UntypedFormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ActivatedRoute } from '@angular/router';
import { OrganizationTypeService } from 'app/shared/services/organization-type.service';
import { CommonModule } from '@angular/common';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { OrganizationType } from 'app/shared/models/OrganizationType';
import { GenericHeaderComponent } from 'app/shared/components/generic-header/generic-header.component';
import { GenericHeaderConfig, OnGenericHeaderHandlers } from 'app/shared/components/generic-header/generic-header.interface';
import { CustomRouterService } from 'app/shared/services/custom-router.service';

@Component({
    selector: 'app-organization-type-edit',
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
export class OrganizationTypeEditComponent implements OnInit, OnGenericHeaderHandlers {
  private _formBuilder = inject(UntypedFormBuilder);
  private _organizationTypeService = inject(OrganizationTypeService);
  private _route = inject(ActivatedRoute);
  private _cdr = inject(ChangeDetectorRef);
  private _transloco = inject(TranslocoService);
  private _snackBar = inject(MatSnackBar);
  private _customRouterService = inject(CustomRouterService);

  organizationTypeId: number;
  currentLang: string;

  headerConfig: GenericHeaderConfig = {
    title: 'organization-type.edit.title',
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

  ngOnInit(): void {
    this.currentLang = this._transloco.getActiveLang();
    // Obtener datos del resolver en lugar de suscribirse
    const resolvedData = this._route.snapshot.data['data'];

    if (resolvedData) {
      this.organizationTypeId = resolvedData.organizationType.id;
      this.onSetForm(resolvedData.organizationType);
    }
  }

  onSetForm(param: OrganizationType) {
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
    const organizationTypeRequest: OrganizationType = {
      id: this.organizationTypeId,
      name: formValues.name,
      nameEN: formValues.nameEN,
      isActive: formValues.isActive,
      displayOrder: formValues.displayOrder,
    };
    this._organizationTypeService.updateOrganizationType(organizationTypeRequest, {}).subscribe({
      next: () => {
        this._snackBar.open('Tipo de organización actualizado correctamente', 'Cerrar', { duration: 3000 });
        this._customRouterService.navigate(['organization-type']);
      },
      error: () => {
        this._snackBar.open('Error al actualizar el tipo de organización', 'Cerrar', { duration: 5000 });
      },
    });
  }

  onCancel() {
    this._customRouterService.navigate(['organization-type']);
  }
}
