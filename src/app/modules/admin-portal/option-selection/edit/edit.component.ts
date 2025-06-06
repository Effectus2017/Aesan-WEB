import { ChangeDetectorRef, Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, UntypedFormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ActivatedRoute } from '@angular/router';
import { OptionSelectionService } from 'app/shared/services/option-selection.service';
import { CommonModule } from '@angular/common';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { OptionSelection } from 'app/shared/models/OptionSelection';
import { GenericHeaderComponent } from 'app/shared/components/generic-header/generic-header.component';
import { GenericHeaderConfig, OnGenericHeaderHandlers } from 'app/shared/components/generic-header/generic-header.interface';
import { CustomRouterService } from 'app/shared/services/custom-router.service';
import { MatSelectModule } from '@angular/material/select';
import { FuseConfirmationService } from '@fuse/services/confirmation';

@Component({
    selector: 'app-edit-option-selection',
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
        MatSelectModule,
    ]
})
export class EditOptionSelectionComponent implements OnInit, OnGenericHeaderHandlers {
  private _formBuilder = inject(UntypedFormBuilder);
  private _optionSelectionService = inject(OptionSelectionService);
  private _route = inject(ActivatedRoute);
  private _cdr = inject(ChangeDetectorRef);
  private _transloco = inject(TranslocoService);
  private _snackBar = inject(MatSnackBar);
  private _customRouterService = inject(CustomRouterService);
  private _fuseConfirmationService = inject(FuseConfirmationService);

  optionSelectionId: number;
  optionSelections: OptionSelection[] = [];
  positionOptions: { label: string; value: number }[] = [];

  headerConfig: GenericHeaderConfig = {
    title: 'option-selection.edit.title',
    formGroup: this._formBuilder.group({
      name: [null, Validators.required],
      nameEN: [null, Validators.required],
      optionKey: [null, Validators.required],
      booleanValue: [null, Validators.required],
      isActive: [true],
      displayOrder: [0, Validators.required],
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
    this._route.params.subscribe(params => {
      this.optionSelectionId = +params['id'];
      this.loadOptionSelection();
    });
    this._optionSelectionService.getAllOptionSelections({ take: 1000, skip: 0, alls: true }).subscribe((result: any) => {
      this.optionSelections = (result.body?.data || []).sort((a, b) => a.displayOrder - b.displayOrder);
      this.positionOptions = this.optionSelections.map((_, idx) => ({
        label: `Posición ${idx + 1}`,
        value: idx + 1,
      }));
      this.positionOptions.push({ label: `Posición ${this.optionSelections.length + 1} (Último)`, value: this.optionSelections.length + 1 });
      this._cdr.markForCheck();
    });
  }

  loadOptionSelection() {
    this._optionSelectionService.getOptionSelectionById({ id: this.optionSelectionId }).subscribe((res: any) => {
      const data = res.body || res;

      this.headerConfig.formGroup.patchValue({
        name: data.name,
        nameEN: data.nameEN,
        optionKey: data.optionKey,
        booleanValue: data.booleanValue,
        isActive: data.isActive,
        displayOrder: data.displayOrder,
      });

      // Calcular la posición actual
      const idx = this.optionSelections.findIndex(o => o.id === data.id);
      this.headerConfig.formGroup.get('position').setValue(idx >= 0 ? idx + 1 : this.positionOptions.length);
      this._cdr.markForCheck();
    });
  }

  onSave() {
    if (this.headerConfig.formGroup.invalid) {
      this._snackBar.open('El formulario es inválido. Por favor, complete todos los campos requeridos.', 'Cerrar', { duration: 5000 });
      this.headerConfig.formGroup.markAllAsTouched();
      return;
    }

    const formValues = this.headerConfig.formGroup.getRawValue();
    const pos = formValues.position;
    let displayOrder = 1;
    if (this.optionSelections.length === 0 || pos > this.optionSelections.length) {
      displayOrder = this.optionSelections.length > 0 ? Math.max(...this.optionSelections.map(s => s.displayOrder)) + 10 : 10;
    } else if (pos === 1) {
      displayOrder = this.optionSelections[0].displayOrder / 2;
    } else {
      const prev = this.optionSelections[pos - 2].displayOrder;
      const next = this.optionSelections[pos - 1]?.displayOrder;
      displayOrder = next ? (prev + next) / 2 : prev + 10;
    }

    const optionSelectionRequest: OptionSelection = {
      id: this.optionSelectionId,
      name: formValues.name,
      nameEN: formValues.nameEN,
      optionKey: formValues.optionKey,
      booleanValue: formValues.booleanValue,
      isActive: formValues.isActive,
      displayOrder,
    };

    this._optionSelectionService.updateOptionSelection(optionSelectionRequest, {}).subscribe({
      next: (result: any) => {
        switch (result.body) {
          case true:
            this._fuseConfirmationService.open({
              title: this._transloco.translate('dialog.success.title'),
              icon: {
                show: true,
                name: 'heroicons_outline:check-circle',
                color: 'success',
              },
              message: this._transloco.translate('dialog.success.message'),
              actions: {
                confirm: {
                  label: this._transloco.translate('dialog.success.confirm'),
                },
              },
            });
            break;
          default:
            this.showErrorDialog();
            break;
        }
      },
      error: (error) => {
        this._fuseConfirmationService.open({
          title: this._transloco.translate('dialog.error.title'),
          icon: {
            show: true,
            name: 'heroicons_outline:x-circle',
            color: 'error',
          },
          message: this._transloco.translate('dialog.error.message'),
          actions: {
            confirm: {
              label: this._transloco.translate('dialog.error.confirm'),
            },
          },
        });
      },
      complete: () => {
        this._customRouterService.navigate(['option-selection']);
      },
    });
  }

  showErrorDialog() {
    this._fuseConfirmationService.open({
      title: this._transloco.translate('dialog.error.title'),
      icon: {
        show: true,
        name: 'heroicons_outline:x-circle',
        color: 'error',
      },
      message: this._transloco.translate('dialog.error.message'),
      actions: {
        confirm: {
          label: this._transloco.translate('dialog.error.confirm'),
        },
      },
    });
  }

  onCancel() {
    this._customRouterService.navigate(['option-selection']);
  }
}
