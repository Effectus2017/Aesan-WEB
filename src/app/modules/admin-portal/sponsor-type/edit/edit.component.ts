import { ChangeDetectorRef, Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, UntypedFormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ActivatedRoute, Router } from '@angular/router';
import { SponsorTypeService } from 'app/shared/services/sponsor-type.service';
import { CommonModule } from '@angular/common';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { SponsorType } from 'app/shared/models/SponsorType';
import { GenericHeaderComponent } from 'app/shared/components/generic-header/generic-header.component';
import { GenericHeaderConfig, OnGenericHeaderHandlers } from 'app/shared/components/generic-header/generic-header.interface';
import { CustomRouterService } from 'app/shared/services/custom-router.service';
import { FuseConfirmationService } from '@fuse/services/confirmation';

@Component({
    selector: 'app-edit-sponsor-type',
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
export class EditSponsorTypeComponent implements OnInit, OnGenericHeaderHandlers {
  private _formBuilder = inject(UntypedFormBuilder);
  private _sponsorTypeService = inject(SponsorTypeService);
  private _cdr = inject(ChangeDetectorRef);
  private _transloco = inject(TranslocoService);
  private _snackBar = inject(MatSnackBar);
  private _customRouterService = inject(CustomRouterService);
  private _route = inject(ActivatedRoute);
  private _confirmationService = inject(FuseConfirmationService);

  sponsorTypeId: number;
  currentLang: string;
  sponsorType: SponsorType;

  headerConfig: GenericHeaderConfig = {
    title: 'sponsor-type.edit.title',
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
      this.onSetForm(resolvedData.sponsorType);
    }
  }

  onSetForm(data: SponsorType) {

    this.sponsorTypeId = data.id;

    this.headerConfig.formGroup.patchValue({
      id: data.id,
      name: data.name,
      nameEN: data.nameEN,
      isActive: data.isActive,
      displayOrder: data.displayOrder,
    });
  }

  onSave() {
    if (this.headerConfig.formGroup.invalid) return;
    const sponsorType: SponsorType = this.headerConfig.formGroup.value;
    this._sponsorTypeService.updateSponsorType(sponsorType, {}).subscribe({
      next: () => {
        this._snackBar.open('Tipo de auspiciador actualizado correctamente', 'Cerrar', { duration: 3000 });
        this._customRouterService.navigate(['sponsor-type/list']);
      },
      error: (err) => {
        this._snackBar.open('Error al actualizar el tipo de auspiciador: ' + (err?.error?.message || err), 'Cerrar', { duration: 5000 });
      }
    });
  }

  onCancel() {
    this._customRouterService.navigate(['sponsor-type/list']);
  }
}
