import { ChangeDetectorRef, Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { StaffTypeService } from 'app/shared/services/staff-type.service';
import { CommonModule } from '@angular/common';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';
import { StaffTypeRequest } from 'app/shared/models/request/StaffTypeRequest';
import { StaffType } from 'app/shared/models/staff/StaffType';
import { MatSelectModule } from '@angular/material/select';
import { GenericHeaderComponent } from 'app/shared/components/generic-header/generic-header.component';
import { GenericHeaderConfig, OnGenericHeaderHandlers } from 'app/shared/components/generic-header/generic-header.interface';
import { CustomRouterService } from 'app/shared/services/custom-router.service';
import { QueryParameters } from 'app/shared/models/common/QueryParameters';

@Component({
    selector: 'app-edit-staff-type',
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
export class EditStaffTypeComponent implements OnInit, OnGenericHeaderHandlers {
  private _formBuilder = inject(UntypedFormBuilder);
  private _staffTypeService = inject(StaffTypeService);
  private _cdr = inject(ChangeDetectorRef);
  private _transloco = inject(TranslocoService);
  private _snackBar = inject(MatSnackBar);
  private _customRouterService = inject(CustomRouterService);
  private _route = inject(ActivatedRoute);

  currentLang: string;
  staffTypeId: number = 0;
  staffTypes: StaffType[] = [];
  positionOptions: { label: string; value: number }[] = [];

  headerConfig: GenericHeaderConfig = {
    title: 'staffType.edit.title',
    formGroup: this._formBuilder.group({
      id: [null],
      name: [null, Validators.required],
      nameEn: [null, Validators.required],
      optionKey: ['staffType', Validators.required],
      sortOrder: [0, Validators.required],
      isActive: [true],
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
      const staffType = resolvedData.staffType;
      this.staffTypeId = staffType.id;
      this.headerConfig.formGroup.patchValue({
        id: staffType.id,
        name: staffType.name,
        nameEn: staffType.nameEn,
        optionKey: staffType.optionKey,
        sortOrder: staffType.sortOrder,
        isActive: staffType.isActive,
      });
    }
  }

  loadStaffType() {
    const queryParams: QueryParameters = {
      id: this.staffTypeId
    };

    this._staffTypeService.getStaffTypeById(queryParams).subscribe({
      next: (response) => {
        if (response && response.body) {
          const staffType = response.body;
          this.headerConfig.formGroup.patchValue({
            id: staffType.id,
            name: staffType.name,
            nameEn: staffType.nameEn,
            optionKey: staffType.optionKey,
            sortOrder: staffType.sortOrder,
            isActive: staffType.isActive,
          });
        }
      },
      error: (err) => {
        this._snackBar.open('Error al cargar el tipo de staff: ' + (err?.error?.message || err), 'Cerrar', { duration: 5000 });
        this._customRouterService.navigate(['staff-type/list']);
      }
    });
  }

  onSave() {
    if (this.headerConfig.formGroup.invalid) { return; }

    const formValues = this.headerConfig.formGroup.getRawValue();

    const staffType: StaffTypeRequest = {
      id: formValues.id,
      name: formValues.name,
      nameEn: formValues.nameEn,
      optionKey: formValues.optionKey,
      sortOrder: formValues.sortOrder,
      isActive: formValues.isActive,
    };

    this._staffTypeService.updateStaffType(staffType, {}).subscribe({
      next: () => {
        this._snackBar.open('Tipo de staff actualizado correctamente', 'Cerrar', { duration: 3000 });
        this._customRouterService.navigate(['staff-type/list']);
      },
      error: (err) => {
        this._snackBar.open('Error al actualizar el tipo de staff: ' + (err?.error?.message || err), 'Cerrar', { duration: 5000 });
      }
    });
  }

  onCancel() {
    this._customRouterService.navigate(['staff-type/list']);
  }
}
