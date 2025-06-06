import { Component, inject, Inject } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TranslocoModule } from '@ngneat/transloco';
import { TextFieldModule } from '@angular/cdk/text-field';
import { MatNativeDateModule, MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { DarkModeTextDirective } from 'app/shared/directives/dark-mode-text.directive';
import { optionSelectionData } from 'app/shared/common-data';
import { mapBooleanToYesNoOptionId, mapYesNoOptionIdToBoolean } from 'app/shared/utils';

export interface HouseholdMemberDialogData {
  id: number;
  name?: string;
  lastName?: string;
  age?: number;
  isStudent?: boolean;
  grade?: number;
  idDiningRoom?: number;
  isFoster?: boolean;
  isMigrant?: boolean;
}

@Component({
    selector: 'app-add-household-member-dialog',
    templateUrl: './add-household-member-dialog.component.html',
    imports: [
        MatIconModule,
        ReactiveFormsModule,
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        TextFieldModule,
        TranslocoModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatButtonModule,
        MatSelectModule,
        DarkModeTextDirective,
        NgIf,
        NgFor,
        MatOptionModule,
    ]
})
export class AddHouseholdMemberDialogComponent {
  householdMemberForm: UntypedFormGroup;

  private _formBuilder = inject(UntypedFormBuilder);
  public matDialogRef = inject(MatDialogRef<AddHouseholdMemberDialogComponent>);

  isYesNoOptions = optionSelectionData.filter(option => option.optionKey === 'yesNo');

  constructor(@Inject(MAT_DIALOG_DATA) public data: HouseholdMemberDialogData) {
    this.householdMemberForm = this._formBuilder.group({
      id: [data?.id || 0],
      name: [data?.name || '', [Validators.required, Validators.maxLength(100)]],
      lastName: [data?.lastName || '', [Validators.required, Validators.maxLength(100)]],
      age: [data?.age || '', [Validators.required, Validators.min(0)]],
      isStudent: [typeof data?.isStudent === 'boolean' ? mapBooleanToYesNoOptionId(data?.isStudent, this.isYesNoOptions) : data?.isStudent ?? '', [Validators.required]],
      grade: [data?.grade || '', [Validators.required]],
      idDiningRoom: [data?.idDiningRoom || '', [Validators.required]],
      isFoster: [typeof data?.isFoster === 'boolean' ? mapBooleanToYesNoOptionId(data?.isFoster, this.isYesNoOptions) : data?.isFoster ?? '', [Validators.required]],
      isMigrant: [typeof data?.isMigrant === 'boolean' ? mapBooleanToYesNoOptionId(data?.isMigrant, this.isYesNoOptions) : data?.isMigrant ?? '', [Validators.required]],
    });
  }

  /**
   * Cierra el diálogo sin guardar cambios
   */
  onCancel(): void {
    this.matDialogRef.close();
  }

  /**
   * Save changes and close dialog. Maps catalog id to boolean before returning value.
   */
  onSubmit(): void {
    if (this.householdMemberForm.valid) {
      const raw = this.householdMemberForm.value;
      const result = {
        ...raw,
        isStudent: mapYesNoOptionIdToBoolean(raw.isStudent, this.isYesNoOptions),
        isFoster: mapYesNoOptionIdToBoolean(raw.isFoster, this.isYesNoOptions),
        isMigrant: mapYesNoOptionIdToBoolean(raw.isMigrant, this.isYesNoOptions),
      };
      this.matDialogRef.close(result);
    }
  }
}
