import { ChangeDetectorRef, Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ActivatedRoute, Router } from '@angular/router';
import { AgencyStatusService } from 'app/shared/services/agency-status.service';
import { CommonModule } from '@angular/common';
import { TranslocoService } from '@ngneat/transloco';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AgencyStatus } from 'app/shared/models/AgencyStatus';
import { GenericHeaderComponent } from 'app/shared/components/generic-header/generic-header.component';
import { GenericHeaderConfig, OnGenericHeaderHandlers } from 'app/shared/components/generic-header/generic-header.interface';

@Component({
  selector: 'app-edit-agency-status',
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
  currentLang: string;

  constructor() {
    this.form = new FormGroup({
      name: new FormControl('', [Validators.required]),
      nameEN: new FormControl('', [Validators.required]),
      isActive: new FormControl(true),
      displayOrder: new FormControl(0, [Validators.required]),
    });
    this.headerConfig = {
      title: 'agency-status.edit.title',
      formGroup: this.form,
      saveButtonShow: false,
      submitButtonShow: false,
      goToAddButtonShow: false,
    };
  }

  ngOnInit(): void {
    this.currentLang = this._transloco.getActiveLang();
    this._route.params.subscribe(params => {
      this.agencyStatusId = +params['id'];
      this.loadAgencyStatus();
    });
  }

  loadAgencyStatus() {
    this._agencyStatusService.getAgencyStatusById({ id: this.agencyStatusId }).subscribe((res: any) => {
      const data = res.body || res;
      this.form.patchValue({
        name: data.name,
        nameEN: data.nameEN,
        isActive: data.isActive,
        displayOrder: data.displayOrder,
      });
      this._cdr.markForCheck();
    });
  }

  onSave() {
    if (this.form.valid) {
      const updated: AgencyStatus = {
        id: this.agencyStatusId,
        name: this.form.get('name').value,
        nameEN: this.form.get('nameEN').value,
        isActive: this.form.get('isActive').value,
        displayOrder: this.form.get('displayOrder').value,
      };
      this._agencyStatusService.updateAgencyStatus(updated, {}).subscribe(() => {
        this._snackBar.open('Estado actualizado correctamente', 'Cerrar', { duration: 3000 });
        this._router.navigate(['../'], { relativeTo: this._route });
      });
    }
  }
}
