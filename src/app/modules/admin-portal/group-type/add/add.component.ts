import { ChangeDetectorRef, Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { GroupTypeService } from 'app/shared/services/group-type.service';
import { CommonModule } from '@angular/common';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { GroupTypeRequest } from 'app/shared/models/request/GroupTypeRequest';
import { GroupType } from 'app/shared/models/catalog/GroupType';
import { MatSelectModule } from '@angular/material/select';
import { GenericHeaderComponent } from 'app/shared/components/generic-header/generic-header.component';
import { GenericHeaderConfig, OnGenericHeaderHandlers } from 'app/shared/components/generic-header/generic-header.interface';
import { CustomRouterService } from 'app/shared/services/custom-router.service';
import { QueryParameters } from 'app/shared/models/common/QueryParameters';

@Component({
    selector: 'app-add-group-type',
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
export class AddGroupTypeComponent implements OnInit, OnGenericHeaderHandlers {
  private _formBuilder = inject(UntypedFormBuilder);
  private _groupTypeService = inject(GroupTypeService);
  private _cdr = inject(ChangeDetectorRef);
  private _transloco = inject(TranslocoService);
  private _snackBar = inject(MatSnackBar);
  private _customRouterService = inject(CustomRouterService);

  currentLang: string;
  groupTypes: GroupType[] = [];
  positionOptions: { label: string; value: number }[] = [];

  headerConfig: GenericHeaderConfig = {
    title: 'group-type.add.title',
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
    this._groupTypeService.getAllGroupTypesFromDb({ take: 1000, skip: 0, alls: true }).subscribe((result: any) => {
      this.groupTypes = (result.body?.data || []).sort((a, b) => a.displayOrder - b.displayOrder);
      this.positionOptions = this.groupTypes.map((_, idx) => ({
        label: `Posición ${idx + 1}`,
        value: idx + 1,
      }));
      this.positionOptions.push({ label: `Posición ${this.groupTypes.length + 1} (Último)`, value: this.groupTypes.length + 1 });
      this.headerConfig.formGroup.get('position').setValue(this.positionOptions.length);
      this._cdr.markForCheck();
    });
  }

  onSave() {
    if (this.headerConfig.formGroup.valid) {
      const pos = this.headerConfig.formGroup.get('position').value;
      let displayOrder = 1;

      if (this.groupTypes.length === 0 || pos > this.groupTypes.length) {
        displayOrder = this.groupTypes.length > 0 ? Math.max(...this.groupTypes.map(s => s.displayOrder)) + 10 : 10;
      } else if (pos === 1) {
        displayOrder = this.groupTypes[0].displayOrder / 2;
      } else {
        const prev = this.groupTypes[pos - 2].displayOrder;
        const next = this.groupTypes[pos - 1]?.displayOrder;
        displayOrder = next ? (prev + next) / 2 : prev + 10;
      }

      const newType: GroupTypeRequest = {
        name: this.headerConfig.formGroup.get('name').value,
        nameEN: this.headerConfig.formGroup.get('nameEN').value,
        isActive: this.headerConfig.formGroup.get('isActive').value,
        displayOrder,
      };

      const groupTypeRequest: QueryParameters = {};
      this._groupTypeService.insertGroupType(newType, groupTypeRequest).subscribe(() => {
        this._snackBar.open('Tipo de grupo creado correctamente', 'Cerrar', { duration: 3000 });
        this._customRouterService.navigate([`group-type`]);
      });
    }
  }

  onCancel() {
    this._customRouterService.navigate([`group-type`]);
  }
}
