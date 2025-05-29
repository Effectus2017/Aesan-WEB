import { ChangeDetectorRef, Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, UntypedFormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { HouseholdService } from 'app/shared/services/household.service';
import { CommonModule } from '@angular/common';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { GenericHeaderComponent } from 'app/shared/components/generic-header/generic-header.component';
import { GenericHeaderConfig, OnGenericHeaderHandlers } from 'app/shared/components/generic-header/generic-header.interface';
import { CustomRouterService } from 'app/shared/services/custom-router.service';

@Component({
  selector: 'agency-portal-household-edit',
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
    TranslocoModule
  ],
})
export class HouseholdEditComponent implements OnInit, OnGenericHeaderHandlers {
  private _formBuilder = inject(UntypedFormBuilder);
  private _householdService = inject(HouseholdService);
  private _cdr = inject(ChangeDetectorRef);
  private _transloco = inject(TranslocoService);
  private _snackBar = inject(MatSnackBar);
  private _customRouterService = inject(CustomRouterService);
  private _route = inject(ActivatedRoute);

  householdId: number;

  headerConfig: GenericHeaderConfig = {
    title: 'households.edit.title',
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

  ngOnInit(): void {
    const resolverData = this._route.snapshot.data['data'];
    if (resolverData && resolverData.body) {
      this.householdId = resolverData.body.id;
      this.headerConfig.formGroup.patchValue({
        street: resolverData.body.street,
        apartment: resolverData.body.apartment,
        city: resolverData.body.city,
        region: resolverData.body.region,
        zipcode: resolverData.body.zipcode,
        phone: resolverData.body.phone,
        email: resolverData.body.email,
        completedBy: resolverData.body.completedBy,
        completedDate: resolverData.body.completedDate,
        isActive: resolverData.body.isActive,
      });
      this._cdr.markForCheck();
    }
  }

  onSave() {
    if (this.headerConfig.formGroup.valid) {
      const updatedHousehold = {
        ...this.headerConfig.formGroup.value,
        id: this.householdId
      };
      this._householdService.update(this.householdId, updatedHousehold).subscribe(() => {
        this._snackBar.open('Hogar actualizado correctamente', 'Cerrar', { duration: 3000 });
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
