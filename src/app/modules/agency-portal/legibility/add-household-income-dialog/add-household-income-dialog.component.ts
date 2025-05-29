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

export interface HouseholdIncomeDialogData {
  id: number;
  name?: string;
  lastName?: string;
  incomeOne?: number;
  incomeFrequencyOne?: string;
  incomeTwo?: number;
  incomeFrequencyTwo?: string;
  incomeThree?: number;
  incomeFrequencyThree?: string;
  isChild?: boolean;
}

@Component({
  selector: 'app-add-household-income-dialog',
  templateUrl: './add-household-income-dialog.component.html',
  standalone: true,
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
  ],
})
export class AddHouseholdIncomeDialogComponent {
  householdIncomeForm: UntypedFormGroup;

  private _formBuilder = inject(UntypedFormBuilder);
  public matDialogRef = inject(MatDialogRef<AddHouseholdIncomeDialogComponent>);

  isIncomeFrequencyOptions = optionSelectionData.filter((option) => option.optionKey === 'incomeFrequency');

  isChild: boolean = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: HouseholdIncomeDialogData) {
    this.householdIncomeForm = this._formBuilder.group({
      id: [data?.id || 0],
      name: [data?.name || '', [Validators.required, Validators.maxLength(100)]],
      lastName: [data?.lastName || '', [Validators.required, Validators.maxLength(100)]],
      incomeOne: [data?.incomeOne || '', [Validators.required]],
      incomeFrequencyOne: [data?.incomeFrequencyOne || '', [Validators.required]],
      incomeTwo: [data?.incomeTwo || '', [Validators.required]],
      incomeFrequencyTwo: [data?.incomeFrequencyTwo || '', [Validators.required]],
      incomeThree: [data?.incomeThree || '', [Validators.required]],
      incomeFrequencyThree: [data?.incomeFrequencyThree || '', [Validators.required]],
    });

    this.isChild = data?.isChild || false;
  }

  /**
   * Cierra el diálogo sin guardar cambios
   */
  onCancel(): void {
    this.matDialogRef.close();
  }

  /**
   * Guarda los cambios y cierra el diálogo
   */
  onSubmit(): void {
    if (this.householdIncomeForm.valid) {
      this.matDialogRef.close(this.householdIncomeForm.value);
    }
  }
}
