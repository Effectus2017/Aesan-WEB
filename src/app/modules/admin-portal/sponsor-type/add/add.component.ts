import { ChangeDetectorRef, Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SponsorTypeService } from 'app/shared/services/sponsor-type.service';
import { CommonModule } from '@angular/common';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { SponsorTypeRequest } from 'app/shared/models/request/SponsorTypeRequest';
import { SponsorType } from 'app/shared/models/catalog/SponsorType';
import { MatSelectModule } from '@angular/material/select';
import { GenericHeaderComponent } from 'app/shared/components/generic-header/generic-header.component';
import { GenericHeaderConfig, OnGenericHeaderHandlers } from 'app/shared/components/generic-header/generic-header.interface';
import { CustomRouterService } from 'app/shared/services/custom-router.service';
import { QueryParameters } from 'app/shared/models/common/QueryParameters';

@Component({
    selector: 'app-add-sponsor-type',
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
export class AddSponsorTypeComponent implements OnInit, OnGenericHeaderHandlers {
  private _formBuilder = inject(UntypedFormBuilder);
  private _sponsorTypeService = inject(SponsorTypeService);
  private _cdr = inject(ChangeDetectorRef);
  private _transloco = inject(TranslocoService);
  private _snackBar = inject(MatSnackBar);
  private _customRouterService = inject(CustomRouterService);

  currentLang: string;
  sponsorTypes: SponsorType[] = [];
  positionOptions: { label: string; value: number }[] = [];

  headerConfig: GenericHeaderConfig = {
    title: 'sponsor-type.add.title',
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
  }

  onSave() {
    if (this.headerConfig.formGroup.invalid) return;
    const sponsorType: SponsorTypeRequest = {
      name: this.headerConfig.formGroup.value.name,
      nameEN: this.headerConfig.formGroup.value.nameEN,
      isActive: this.headerConfig.formGroup.value.isActive,
      displayOrder: this.headerConfig.formGroup.value.position,
    };
    this._sponsorTypeService.insertSponsorType(sponsorType, {}).subscribe({
      next: () => {
        this._snackBar.open('Tipo de auspiciador creado correctamente', 'Cerrar', { duration: 3000 });
        this._customRouterService.navigate(['sponsor-type/list']);
      },
      error: (err) => {
        this._snackBar.open('Error al crear el tipo de auspiciador: ' + (err?.error?.message || err), 'Cerrar', { duration: 5000 });
      }
    });
  }

  onCancel() {
    this._customRouterService.navigate(['sponsor-type/list']);
  }
}
