import { ChangeDetectorRef, Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, UntypedFormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ActivatedRoute } from '@angular/router';
import { HouseholdMemberService } from 'app/shared/services/household-member.service';
import { CommonModule } from '@angular/common';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { GenericHeaderComponent } from 'app/shared/components/generic-header/generic-header.component';
import { GenericHeaderConfig, OnGenericHeaderHandlers } from 'app/shared/components/generic-header/generic-header.interface';
import { CustomRouterService } from 'app/shared/services/custom-router.service';
import { FuseConfirmationService } from '@fuse/services/confirmation';

@Component({
  selector: 'app-edit-household-member',
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
    TranslocoModule,
  ],
})
export class EditHouseholdMemberComponent implements OnInit, OnGenericHeaderHandlers {
  private _formBuilder = inject(UntypedFormBuilder);
  private _householdMemberService = inject(HouseholdMemberService);
  private _route = inject(ActivatedRoute);
  private _cdr = inject(ChangeDetectorRef);
  private _transloco = inject(TranslocoService);
  private _snackBar = inject(MatSnackBar);
  private _customRouterService = inject(CustomRouterService);
  private _fuseConfirmationService = inject(FuseConfirmationService);
  private _translocoService = inject(TranslocoService);

  householdMemberId: number;

  headerConfig: GenericHeaderConfig = {
    title: 'household-member.edit.title',
    formGroup: this._formBuilder.group({
      applicationId: [null, Validators.required],
      firstName: [null, Validators.required],
      middleName: [null],
      fatherLastName: [null, Validators.required],
      motherLastName: [null, Validators.required],
      isStudent: [false],
      schoolId: [null],
      grade: [null],
      isFoster: [false],
      isMigrant: [false],
      isHomeless: [false],
      isRunaway: [false],
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
    this._householdMemberService.householdMember$.subscribe((result: any) => {
      this.householdMemberId = result.body.id;
      this.onSetForm(result.body);
    });
  }

  onSetForm(param: any) {
    this.headerConfig.formGroup.patchValue({
      applicationId: param.applicationId,
      firstName: param.firstName,
      middleName: param.middleName,
      fatherLastName: param.fatherLastName,
      motherLastName: param.motherLastName,
      isStudent: param.isStudent,
      schoolId: param.schoolId,
      grade: param.grade,
      isFoster: param.isFoster,
      isMigrant: param.isMigrant,
      isHomeless: param.isHomeless,
      isRunaway: param.isRunaway,
      isActive: param.isActive,
    });
  }

  onSave() {
    if (this.headerConfig.formGroup.invalid) {
      this._snackBar.open('El formulario es inválido. Por favor, complete todos los campos requeridos.', 'Cerrar', { duration: 5000 });
      this.headerConfig.formGroup.markAllAsTouched();
      return;
    }

    const formValues = this.headerConfig.formGroup.getRawValue();
    const householdMemberRequest = {
      id: this.householdMemberId,
      ...formValues,
    };

    this._householdMemberService.updateHouseholdMember(householdMemberRequest, {}).subscribe({
      next: (result: any) => {
        switch (result.body) {
          case true:
            this._fuseConfirmationService.open({
              title: this._translocoService.translate('dialog.success.title'),
              icon: {
                show: true,
                name: 'heroicons_outline:check-circle',
                color: 'success',
              },
              message: this._translocoService.translate('dialog.success.message'),
              actions: {
                confirm: {
                  label: this._translocoService.translate('dialog.success.confirm'),
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
          title: this._translocoService.translate('dialog.error.title'),
          icon: {
            show: true,
            name: 'heroicons_outline:x-circle',
            color: 'error',
          },
          message: this._translocoService.translate('dialog.error.message'),
          actions: {
            confirm: {
              label: this._translocoService.translate('dialog.error.confirm'),
            },
          },
        });
      },
      complete: () => {
        this._customRouterService.navigate(['household-member']);
      },
    });
  }

  showErrorDialog() {
    this._fuseConfirmationService.open({
      title: this._translocoService.translate('dialog.error.title'),
      icon: {
        show: true,
        name: 'heroicons_outline:x-circle',
        color: 'error',
      },
      message: this._translocoService.translate('dialog.error.message'),
      actions: {
        confirm: {
          label: this._translocoService.translate('dialog.error.confirm'),
        },
      },
    });
  }
}
