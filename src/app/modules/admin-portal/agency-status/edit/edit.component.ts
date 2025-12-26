import { ChangeDetectorRef, Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import { AgencyStatusService } from 'app/shared/services/agency-status.service';
import { CommonModule } from '@angular/common';
import { TranslocoService } from '@ngneat/transloco';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AgencyStatus } from 'app/shared/models/AgencyStatus';
import { OptionSelection } from 'app/shared/models/OptionSelection';
import { GenericHeaderComponent } from 'app/shared/components/generic-header/generic-header.component';
import { GenericHeaderConfig, OnGenericHeaderHandlers } from 'app/shared/components/generic-header/generic-header.interface';
import { TranslocoModule } from '@ngneat/transloco';
import { CustomRouterService } from 'app/shared/services/custom-router.service';

@Component({
  selector: 'app-edit-agency-status',
  templateUrl: './edit.component.html',
  encapsulation: ViewEncapsulation.None,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatSelectModule,
    CommonModule,
    MatSnackBarModule,
    GenericHeaderComponent,
    TranslocoModule,
  ],
})
export class EditAgencyStatusComponent implements OnInit, OnGenericHeaderHandlers {
  form: FormGroup;
  headerConfig: GenericHeaderConfig;
  agencyStatusId: number;
  private _agencyStatusService = inject(AgencyStatusService);
  private _route = inject(ActivatedRoute);
  private _cdr = inject(ChangeDetectorRef);
  private _transloco = inject(TranslocoService);
  private _snackBar = inject(MatSnackBar);
  private _router = inject(Router);
  private _customRouterService = inject(CustomRouterService);
  currentLang: string;
  listIsActive: OptionSelection[] = [];

  constructor() {
    this.form = new FormGroup({
      name: new FormControl('', [Validators.required]),
      nameEN: new FormControl('', [Validators.required]),
      isActive: new FormControl(null),
      displayOrder: new FormControl(0, [Validators.required]),
    });
    this.headerConfig = {
      title: 'agency-status.edit.title',
      formGroup: this.form,
      saveButtonShow: true,
      saveButtonText: 'global.buttons.save',
      cancelButtonShow: true,
      cancelButtonText: 'global.buttons.cancel',
      submitButtonShow: false,
      goToAddButtonShow: false,
    };
  }

  ngOnInit(): void {
    this.currentLang = this._transloco.getActiveLang();
    // Obtener datos del resolver en lugar de suscribirse
    const resolvedData = this._route.snapshot.data['data'];

    if (resolvedData) {
      this.agencyStatusId = resolvedData.agencyStatus.id;
      
      // Filtrar opciones de isActive
      this.listIsActive = resolvedData.isActiveOptions?.data || [];
      
      // Mapear el valor booleano del resolver al objeto OptionSelection
      const isActiveOption = this.listIsActive.find(opt => opt.booleanValue === resolvedData.agencyStatus.isActive);
      
      this.form.patchValue({
        name: resolvedData.agencyStatus.name,
        nameEN: resolvedData.agencyStatus.nameEN,
        displayOrder: resolvedData.agencyStatus.displayOrder,
      });
      
      if (isActiveOption) {
        this.form.patchValue({ isActive: isActiveOption });
      }
      
      this._cdr.markForCheck();
    }
  }

  compareById = (option1: OptionSelection, option2: OptionSelection): boolean => {
    return option1?.id === option2?.id;
  };

  onSave() {
    if (this.form.valid) {
      // Mapear el objeto OptionSelection seleccionado al valor booleano
      const selectedIsActive = this.form.get('isActive').value;
      const isActiveValue = selectedIsActive?.booleanValue ?? true;

      const updated: AgencyStatus = {
        id: this.agencyStatusId,
        name: this.form.get('name').value,
        nameEN: this.form.get('nameEN').value,
        isActive: isActiveValue,
        displayOrder: this.form.get('displayOrder').value,
      };
      this._agencyStatusService.updateAgencyStatus(updated, {}).subscribe(() => {
        const message = this._transloco.translate('agency-status.edit.success.message');
        const closeButton = this._transloco.translate('agency-status.edit.success.close');
        this._snackBar.open(message, closeButton, { duration: 3000 });
        this._customRouterService.navigate(['agency-status/list']);
      });
    }
  }

  onCancel() {
    this._customRouterService.navigate(['agency-status/list']);
  }
}
