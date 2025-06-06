import { ChangeDetectorRef, Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { AgencyStatusService } from 'app/shared/services/agency-status.service';
import { CommonModule } from '@angular/common';
import { TranslocoService } from '@ngneat/transloco';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AgencyStatusRequest } from 'app/shared/models/Request/AgencyStatusRequest';
import { AgencyStatus } from 'app/shared/models/AgencyStatus';
import { MatSelectModule } from '@angular/material/select';
import { GenericHeaderComponent } from 'app/shared/components/generic-header/generic-header.component';
import { GenericHeaderConfig, OnGenericHeaderHandlers } from 'app/shared/components/generic-header/generic-header.interface';
import { CustomRouterService } from 'app/shared/services/custom-router.service';

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
    ]
})
export class AddAgencyStatusComponent implements OnInit, OnGenericHeaderHandlers {
  private _formBuilder = inject(UntypedFormBuilder);
  private _agencyStatusService = inject(AgencyStatusService);
  private _cdr = inject(ChangeDetectorRef);
  private _transloco = inject(TranslocoService);
  private _snackBar = inject(MatSnackBar);
  private _customRouterService = inject(CustomRouterService);

  currentLang: string;
  agencyStatuses: AgencyStatus[] = [];
  positionOptions: { label: string; value: number }[] = [];

  headerConfig: GenericHeaderConfig = {
    title: 'agency-status.add.title',
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
    this._agencyStatusService.getAllAgencyStatusFromDb({ take: 1000, skip: 0, alls: true }).subscribe((result: any) => {
      this.agencyStatuses = (result.body?.data || []).sort((a, b) => a.displayOrder - b.displayOrder);
      this.positionOptions = this.agencyStatuses.map((_, idx) => ({
        label: `Posición ${idx + 1}`,
        value: idx + 1,
      }));
      this.positionOptions.push({ label: `Posición ${this.agencyStatuses.length + 1} (Último)`, value: this.agencyStatuses.length + 1 });
      this.headerConfig.formGroup.get('position').setValue(this.positionOptions.length);
      this._cdr.markForCheck();
    });
  }

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


      const newStatus: AgencyStatusRequest = {
        name: this.headerConfig.formGroup.get('name').value,
        nameEN: this.headerConfig.formGroup.get('nameEN').value,
        isActive: this.headerConfig.formGroup.get('isActive').value,
        displayOrder,
      };


      this._agencyStatusService.insertAgencyStatus(newStatus, {}).subscribe(() => {
        this._snackBar.open('Estado creado correctamente', 'Cerrar', { duration: 3000 });
        this._customRouterService.navigate([`agency-status/list`]);
      });
    }
  }

  onCancel() {
    this._customRouterService.navigate([`agency-status/list`]);
  }
}
