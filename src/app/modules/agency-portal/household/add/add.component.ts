import { ChangeDetectorRef, Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, UntypedFormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { HouseholdService } from 'app/shared/services/household.service';
import { CommonModule } from '@angular/common';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { GenericHeaderComponent } from 'app/shared/components/generic-header/generic-header.component';
import { GenericHeaderConfig, OnGenericHeaderHandlers } from 'app/shared/components/generic-header/generic-header.interface';
import { CustomRouterService } from 'app/shared/services/custom-router.service';

@Component({
    selector: 'agency-portal-household-add',
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
        GenericHeaderComponent,
        TranslocoModule
    ]
})
export class HouseholdAddComponent implements OnInit, OnGenericHeaderHandlers {
  private _formBuilder = inject(UntypedFormBuilder);
  private _householdService = inject(HouseholdService);
  private _cdr = inject(ChangeDetectorRef);
  private _transloco = inject(TranslocoService);
  private _snackBar = inject(MatSnackBar);
  private _customRouterService = inject(CustomRouterService);

  headerConfig: GenericHeaderConfig = {
    title: 'households.add.title',
    formGroup: this._formBuilder.group({
      street: [null, Validators.required],
      apartment: [null],
      city: [null, Validators.required],
      region: [null, Validators.required],
      zipcode: [null, Validators.required],
      phone: [null],
      email: [null],
      completedBy: [null, Validators.required],
      completedDate: [null, Validators.required],
      isActive: [true],
    }),
    saveButtonShow: true,
    saveButtonText: 'global.buttons.save',
    cancelButtonShow: true,
    cancelButtonText: 'global.buttons.cancel',
    goToAddButtonShow: false,
  };

  constructor() {}

  ngOnInit(): void {}

  onSave() {
    if (this.headerConfig.formGroup.valid) {
      const newHousehold = this.headerConfig.formGroup.value;
      this._householdService.add(newHousehold).subscribe(() => {
        this._snackBar.open('Hogar creado correctamente', 'Cerrar', { duration: 3000 });
        this._customRouterService.navigate(['agency-portal/household/list']);
      });
    } else {
      this.headerConfig.formGroup.markAllAsTouched();
    }
  }

  onCancel() {
    this._customRouterService.navigate(['agency-portal/household/list']);
  }
}
