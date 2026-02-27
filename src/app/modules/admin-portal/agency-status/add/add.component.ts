import { ChangeDetectorRef, Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ActivatedRoute } from '@angular/router';
import { AgencyStatusService } from 'app/shared/services/agency-status.service';
import { CommonModule } from '@angular/common';
import { TranslocoService } from '@ngneat/transloco';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AgencyStatusRequest } from 'app/shared/models/Request/AgencyStatusRequest';
import { AgencyStatusResponse } from 'app/shared/models/Response/AgencyStatusResponse';
import { OptionSelection } from 'app/shared/models/OptionSelection';
import { MatSelectModule } from '@angular/material/select';
import { GenericHeaderComponent } from 'app/shared/components/generic-header/generic-header.component';
import { GenericHeaderConfig, OnGenericHeaderHandlers } from 'app/shared/components/generic-header/generic-header.interface';
import { CustomRouterService } from 'app/shared/services/custom-router.service';
import { TranslocoModule } from '@ngneat/transloco';

@Component({
    selector: 'app-add-agency-status',
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
        TranslocoModule,
    ]
})
export class AddAgencyStatusComponent implements OnInit, OnGenericHeaderHandlers {
  private _formBuilder = inject(UntypedFormBuilder);
  private _agencyStatusService = inject(AgencyStatusService);
  private _cdr = inject(ChangeDetectorRef);
  private _transloco = inject(TranslocoService);
  private _snackBar = inject(MatSnackBar);
  private _customRouterService = inject(CustomRouterService);
  private _route = inject(ActivatedRoute);

  currentLang: string;
  agencyStatuses: AgencyStatusResponse[] = [];
  positionOptions: { label: string; value: number }[] = [];
  listIsActive: OptionSelection[] = [];

  headerConfig: GenericHeaderConfig = {
    title: 'agency-status.add.title',
    formGroup: this._formBuilder.group({
      name: [null, Validators.required],
      nameEN: [null, Validators.required],
      isActive: [null],
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

    // Obtener datos del resolver en lugar de suscribirse
    const resolvedData = this._route.snapshot.data['data'];

    if (resolvedData) {
      this.agencyStatuses = (resolvedData.agencyStatuses?.data || []).sort((a, b) => a.displayOrder - b.displayOrder);
      this.positionOptions = this.agencyStatuses.map((_, idx) => ({
        label: this._transloco.translate('agency-status.add.position.option', { value: idx + 1 }),
        value: idx + 1,
      }));
      this.positionOptions.push({
        label: this._transloco.translate('agency-status.add.position.last', { value: this.agencyStatuses.length + 1 }),
        value: this.agencyStatuses.length + 1
      });
      this.headerConfig.formGroup.get('position').setValue(this.positionOptions.length);

      // Filtrar opciones de isActive
      this.listIsActive = resolvedData.isActiveOptions?.data || [];

      // Establecer valor por defecto buscando la opción con booleanValue === true
      const defaultIsActive = this.listIsActive.find(opt => opt.booleanValue === true);
      if (defaultIsActive) {
        this.headerConfig.formGroup.patchValue({ isActive: defaultIsActive });
      }

      this._cdr.markForCheck();
    }
  }

  compareById = (option1: OptionSelection, option2: OptionSelection): boolean => {
    return option1?.id === option2?.id;
  };

  onSave() {

    if (this.headerConfig.formGroup.valid) {

        const pos = this.headerConfig.formGroup.get('position').value;
      let displayOrder = 1;


      if (this.agencyStatuses.length === 0 || pos > this.agencyStatuses.length) {
        displayOrder = this.agencyStatuses.length > 0 ? Math.max(...this.agencyStatuses.map(s => s.displayOrder)) + 10 : 10;
      } else if (pos === 1) {
        displayOrder = this.agencyStatuses[0].displayOrder / 2;
      } else {
        const prev = this.agencyStatuses[pos - 2].displayOrder;
        const next = this.agencyStatuses[pos - 1]?.displayOrder;
        displayOrder = next ? (prev + next) / 2 : prev + 10;
      }


      // Mapear el objeto OptionSelection seleccionado al valor booleano
      const selectedIsActive = this.headerConfig.formGroup.get('isActive').value;
      const isActiveValue = selectedIsActive?.booleanValue ?? true;

      const newStatus: AgencyStatusRequest = {
        name: this.headerConfig.formGroup.get('name').value,
        nameEN: this.headerConfig.formGroup.get('nameEN').value,
        isActive: isActiveValue,
        displayOrder,
      };


      this._agencyStatusService.insertAgencyStatus(newStatus, {}).subscribe(() => {
        const message = this._transloco.translate('agency-status.add.success.message');
        const closeButton = this._transloco.translate('agency-status.add.success.close');
        this._snackBar.open(message, closeButton, { duration: 3000 });
        this._customRouterService.navigate([`agency-status/list`]);
      });
    }
  }

  onCancel() {
    this._customRouterService.navigate([`agency-status/list`]);
  }
}
