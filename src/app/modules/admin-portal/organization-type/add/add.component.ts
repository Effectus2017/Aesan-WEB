import { ChangeDetectorRef, Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { OrganizationTypeService } from 'app/shared/services/organization-type.service';
import { CommonModule } from '@angular/common';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { OrganizationType } from 'app/shared/models/OrganizationType';
import { MatSelectModule } from '@angular/material/select';
import { GenericHeaderComponent } from 'app/shared/components/generic-header/generic-header.component';
import { GenericHeaderConfig, OnGenericHeaderHandlers } from 'app/shared/components/generic-header/generic-header.interface';
import { CustomRouterService } from 'app/shared/services/custom-router.service';

@Component({
    selector: 'app-organization-type-add',
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
export class OrganizationTypeAddComponent implements OnInit, OnGenericHeaderHandlers {
  private _formBuilder = inject(UntypedFormBuilder);
  private _organizationTypeService = inject(OrganizationTypeService);
  private _cdr = inject(ChangeDetectorRef);
  private _transloco = inject(TranslocoService);
  private _snackBar = inject(MatSnackBar);
  private _customRouterService = inject(CustomRouterService);

  organizationTypes: OrganizationType[] = [];
  positionOptions: { label: string; value: number }[] = [];

  headerConfig: GenericHeaderConfig = {
    title: 'organization-type.add.title',
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

  ngOnInit(): void {
    this._organizationTypeService.getAllOrganizationTypesFromDb({ take: 1000, skip: 0, alls: true }).subscribe((result: any) => {
      this.organizationTypes = (result.data || []).sort((a, b) => a.displayOrder - b.displayOrder);
      this.positionOptions = this.organizationTypes.map((_, idx) => ({
        label: `Posición ${idx + 1}`,
        value: idx + 1,
      }));
      this.positionOptions.push({ label: `Posición ${this.organizationTypes.length + 1} (Último)`, value: this.organizationTypes.length + 1 });
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
    if (this.organizationTypes.length === 0 || pos > this.organizationTypes.length) {
      displayOrder = this.organizationTypes.length > 0 ? Math.max(...this.organizationTypes.map(s => s.displayOrder)) + 10 : 10;
    } else if (pos === 1) {
      displayOrder = this.organizationTypes[0].displayOrder / 2;
    } else {
      const prev = this.organizationTypes[pos - 2].displayOrder;
      const next = this.organizationTypes[pos - 1]?.displayOrder;
      displayOrder = next ? (prev + next) / 2 : prev + 10;
    }
    const newType = {
      name: this.headerConfig.formGroup.get('name').value,
      nameEN: this.headerConfig.formGroup.get('nameEN').value,
      isActive: this.headerConfig.formGroup.get('isActive').value,
      displayOrder,
    };
    this._organizationTypeService.insertOrganizationType(newType, {}).subscribe({
      next: () => {
        this._snackBar.open('Tipo de organización creado correctamente', 'Cerrar', { duration: 3000 });
        this._customRouterService.navigate(['organization-type']);
      },
      error: () => {
        this._snackBar.open('Error al crear el tipo de organización', 'Cerrar', { duration: 5000 });
      },
    });
  }

  onCancel() {
    this._customRouterService.navigate(['organization-type']);
  }
}
