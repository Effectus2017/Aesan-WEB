import { ChangeDetectorRef, Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { OptionSelectionService } from 'app/shared/services/option-selection.service';
import { CommonModule } from '@angular/common';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { OptionSelection } from 'app/shared/models/OptionSelection';
import { MatSelectModule } from '@angular/material/select';
import { GenericHeaderComponent } from 'app/shared/components/generic-header/generic-header.component';
import { GenericHeaderConfig, OnGenericHeaderHandlers } from 'app/shared/components/generic-header/generic-header.interface';
import { CustomRouterService } from 'app/shared/services/custom-router.service';

@Component({
    selector: 'app-add-option-selection',
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
export class AddOptionSelectionComponent implements OnInit, OnGenericHeaderHandlers {
  private _formBuilder = inject(UntypedFormBuilder);
  private _optionSelectionService = inject(OptionSelectionService);
  private _cdr = inject(ChangeDetectorRef);
  private _transloco = inject(TranslocoService);
  private _snackBar = inject(MatSnackBar);
  private _customRouterService = inject(CustomRouterService);

  optionSelections: OptionSelection[] = [];
  positionOptions: { label: string; value: number }[] = [];

  headerConfig: GenericHeaderConfig = {
    title: 'option-selection.add.title',
    formGroup: this._formBuilder.group({
      name: [null, Validators.required],
      nameEN: [null, Validators.required],
      optionKey: [null, Validators.required],
      isActive: [true],
      isDefaultValue: [false],
      position: [1, Validators.required],
    }),
    saveButtonShow: true,
    saveButtonText: 'global.buttons.save',
    cancelButtonShow: true,
    cancelButtonText: 'global.buttons.cancel',
  };

  constructor() {}

  ngOnInit(): void {
    this._optionSelectionService.getAllOptionSelections({ take: 1000, skip: 0, alls: true }).subscribe((result: any) => {
      this.optionSelections = (result.body?.data || []).sort((a, b) => a.displayOrder - b.displayOrder);
      this.positionOptions = this.optionSelections.map((_, idx) => ({
        label: `Posición ${idx + 1}`,
        value: idx + 1,
      }));
      this.positionOptions.push({ label: `Posición ${this.optionSelections.length + 1} (Último)`, value: this.optionSelections.length + 1 });
      this.headerConfig.formGroup.get('position').setValue(this.positionOptions.length);
      this._cdr.markForCheck();
    });
  }

  onSave() {
    if (this.headerConfig.formGroup.valid) {
      const pos = this.headerConfig.formGroup.get('position').value;

      let displayOrder = 1;

      const formValues = this.headerConfig.formGroup.getRawValue();

      if (this.optionSelections.length === 0 || pos > this.optionSelections.length) {
        displayOrder = this.optionSelections.length > 0 ? Math.max(...this.optionSelections.map(s => s.displayOrder)) + 10 : 10;
      } else if (pos === 1) {
        displayOrder = this.optionSelections[0].displayOrder / 2;
      } else {
        const prev = this.optionSelections[pos - 2].displayOrder;
        const next = this.optionSelections[pos - 1]?.displayOrder;
        displayOrder = next ? (prev + next) / 2 : prev + 10;
      }

      const newOption: OptionSelection = {
        id: 0,
        name: formValues.name,
        nameEN: formValues.nameEN,
        optionKey: formValues.optionKey,
        booleanValue: formValues.booleanValue,
        isActive: formValues.isActive,
        isDefaultValue: formValues.isDefaultValue || false,
        displayOrder,
      };

      this._optionSelectionService.insertOptionSelection(newOption, {}).subscribe(() => {
        this._snackBar.open('Opción de selección creada correctamente', 'Cerrar', { duration: 3000 });
        this._customRouterService.navigate([`option-selection`]);
      });
    }
  }

  onCancel() {
    this._customRouterService.navigate([`option-selection`]);
  }
}
