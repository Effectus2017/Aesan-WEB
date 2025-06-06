import { Component, Inject } from '@angular/core';
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

export interface IncomeSourceDialogData {
  id: number;
  source?: string;
  amount?: number;
  year?: string;
  isTemporary?: boolean;
}

@Component({
    selector: 'app-add-income-source-dialog',
    templateUrl: './add-income-source-dialog.component.html',
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
export class AddIncomeSourceDialogComponent {
  incomeSourceForm: UntypedFormGroup;

  constructor(
    private _formBuilder: UntypedFormBuilder,
    public matDialogRef: MatDialogRef<AddIncomeSourceDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IncomeSourceDialogData
  ) {
    this.incomeSourceForm = this._formBuilder.group({
      id: [data?.id || 0],
      source: [data?.source || '', [Validators.required, Validators.maxLength(100)]],
      amount: [data?.amount || 0, [Validators.required, Validators.min(0)]],
      year: [data?.year || '', [Validators.required]],
      isTemporary: [data?.isTemporary || true],
    });
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
    if (this.incomeSourceForm.valid) {
      this.matDialogRef.close(this.incomeSourceForm.value);
    }
  }
}
