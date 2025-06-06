import { ChangeDetectorRef, Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { HouseholdMemberService } from 'app/shared/services/household-member.service';
import { CommonModule } from '@angular/common';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CustomRouterService } from 'app/shared/services/custom-router.service';
import { GenericHeaderComponent } from 'app/shared/components/generic-header/generic-header.component';
import { GenericHeaderConfig, OnGenericHeaderHandlers } from 'app/shared/components/generic-header/generic-header.interface';

@Component({
    selector: 'app-add-household-member',
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
        GenericHeaderComponent,
        TranslocoModule
    ]
})
export class AddHouseholdMemberComponent implements OnInit, OnGenericHeaderHandlers {
  private _formBuilder = inject(UntypedFormBuilder);
  private _householdMemberService = inject(HouseholdMemberService);
  private _cdr = inject(ChangeDetectorRef);
  private _transloco = inject(TranslocoService);
  private _snackBar = inject(MatSnackBar);
  private _customRouterService = inject(CustomRouterService);

  headerConfig: GenericHeaderConfig = {
    title: 'household-member.add.title',
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

  ngOnInit(): void {}

  onSave() {
    if (this.headerConfig.formGroup.valid) {
      const newMember = this.headerConfig.formGroup.value;
      this._householdMemberService.insertHouseholdMember(newMember, {}).subscribe(() => {
        this._snackBar.open('Miembro del hogar creado correctamente', 'Cerrar', { duration: 3000 });
        this._customRouterService.navigate(['household-member']);
      });
    } else {
      this.headerConfig.formGroup.markAllAsTouched();
    }
  }

  onCancel() {
    this._customRouterService.navigate(['household-member']);
  }
}
