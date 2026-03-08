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
import { Router } from '@angular/router';
import { StaffTypeRequest } from 'app/shared/models/request/StaffTypeRequest';
import { StaffType } from 'app/shared/models/staff/StaffType';
import { MatSelectModule } from '@angular/material/select';
import { GenericHeaderComponent } from 'app/shared/components/generic-header/generic-header.component';
import { GenericHeaderConfig, OnGenericHeaderHandlers } from 'app/shared/components/generic-header/generic-header.interface';
import { CustomRouterService } from 'app/shared/services/custom-router.service';
import { QueryParameters } from 'app/shared/models/common/QueryParameters';

@Component({
    selector: 'app-add-staff-type',
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
export class AddStaffTypeComponent implements OnInit, OnGenericHeaderHandlers {
  private _formBuilder = inject(UntypedFormBuilder);
  private _staffTypeService = inject(StaffTypeService);
  private _cdr = inject(ChangeDetectorRef);
  private _transloco = inject(TranslocoService);
  private _snackBar = inject(MatSnackBar);
  private _customRouterService = inject(CustomRouterService);

  currentLang: string;
  staffTypes: StaffType[] = [];
  positionOptions: { label: string; value: number }[] = [];

  headerConfig: GenericHeaderConfig = {
    title: 'staffType.add.title',
    formGroup: this._formBuilder.group({
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
  }

  onSave() {
    if (this.headerConfig.formGroup.invalid) return;
    const staffType: StaffTypeRequest = {
      name: this.headerConfig.formGroup.value.name,
      nameEn: this.headerConfig.formGroup.value.nameEn,
      optionKey: this.headerConfig.formGroup.value.optionKey,
      sortOrder: this.headerConfig.formGroup.value.sortOrder,
      isActive: this.headerConfig.formGroup.value.isActive,
    };
    this._staffTypeService.insertStaffType(staffType, {}).subscribe({
      next: () => {
        this._snackBar.open('Tipo de staff creado correctamente', 'Cerrar', { duration: 3000 });
        this._customRouterService.navigate(['staff-type/list']);
      },
      error: (err) => {
        this._snackBar.open('Error al crear el tipo de staff: ' + (err?.error?.message || err), 'Cerrar', { duration: 5000 });
      }
    });
  }

  onCancel() {
    this._customRouterService.navigate(['staff-type/list']);
  }
}
